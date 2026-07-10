// ============================================================
// Firebase REST API helpers — alternative to firebase-admin SDK
// ============================================================
// WHY: firebase-admin uses Node.js native modules (@google-cloud/firestore,
// grpc, etc.) that crash Vercel production builds even with
// serverExternalPackages. This module uses ONLY Node.js built-in
// `crypto` + `fetch` to talk to Firebase REST APIs directly.
//
// Flow:
//   1. Sign JWT with service account private key (RS256)
//   2. Exchange JWT for OAuth2 access token
//   3. Use access token to call Firestore REST API
//
// No native dependencies. Works in any Node.js environment.
// ============================================================
import { createSign } from 'crypto';

const FIREBASE_AUTH_URL = 'https://identitytoolkit.googleapis.com/v1/accounts:lookup';
const FIRESTORE_BASE = 'https://firestore.googleapis.com/v1';
const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';

interface ServiceAccount {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

function getServiceAccount(): ServiceAccount {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY || '';
  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

  const missing: string[] = [];
  if (!projectId) missing.push('FIREBASE_ADMIN_PROJECT_ID');
  if (!clientEmail) missing.push('FIREBASE_ADMIN_CLIENT_EMAIL');
  if (!privateKey) missing.push('FIREBASE_ADMIN_PRIVATE_KEY');

  if (missing.length > 0) {
    throw new Error(`Firebase service account belum dikonfigurasi. Missing: ${missing.join(', ')}`);
  }

  if (!privateKey.includes('BEGIN PRIVATE KEY')) {
    throw new Error('FIREBASE_ADMIN_PRIVATE_KEY format tidak valid (missing BEGIN PRIVATE KEY marker)');
  }

  return { projectId: projectId!, clientEmail: clientEmail!, privateKey };
}

// ============================================================
// Base64URL encode (no padding)
// ============================================================
function base64UrlEncode(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input;
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// ============================================================
// Create signed JWT (RS256) for service account auth
// ============================================================
function createSignedJwt(sa: ServiceAccount): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: sa.clientEmail,
    scope: 'https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/firestore https://www.googleapis.com/auth/cloud-platform',
    aud: OAUTH_TOKEN_URL,
    iat: now,
    exp: now + 3600, // 1 hour
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsigned = `${encodedHeader}.${encodedPayload}`;

  const sign = createSign('RSA-SHA256');
  sign.update(unsigned);
  const signature = sign.sign(sa.privateKey);

  return `${unsigned}.${base64UrlEncode(signature)}`;
}

// ============================================================
// Get OAuth2 access token (cached for 50 minutes)
// ============================================================
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 10min buffer)
  if (cachedAccessToken && Date.now() < cachedAccessToken.expiresAt - 600000) {
    return cachedAccessToken.token;
  }

  const sa = getServiceAccount();
  const jwt = createSignedJwt(sa);

  const res = await fetch(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`OAuth token exchange failed: HTTP ${res.status} — ${errBody.substring(0, 300)}`);
  }

  const data = await res.json() as { access_token: string; expires_in: number };
  cachedAccessToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
  };
  return data.access_token;
}

// ============================================================
// Verify Firebase ID token via REST API
// ============================================================
// Returns: { uid, email } or throws
// ============================================================
export async function verifyIdToken(idToken: string): Promise<{ uid: string; email: string }> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) throw new Error('NEXT_PUBLIC_FIREBASE_API_KEY not set');

  const res = await fetch(`${FIREBASE_AUTH_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({})) as any;
    const message = errBody?.error?.message || `HTTP ${res.status}`;
    throw new Error(`Token verification failed: ${message}`);
  }

  const data = await res.json() as { users?: Array<{ localId: string; email: string }> };
  if (!data.users || data.users.length === 0) {
    throw new Error('Token verification failed: no user found');
  }

  return {
    uid: data.users[0].localId,
    email: data.users[0].email || '',
  };
}

// ============================================================
// Read Firestore document via REST API
// ============================================================
// GET /v1/projects/{project}/databases/(default)/documents/{collection}/{doc}
// ============================================================
export async function readFirestoreDoc(collection: string, docId: string): Promise<any | null> {
  const sa = getServiceAccount();
  const accessToken = await getAccessToken();

  const url = `${FIRESTORE_BASE}/projects/${sa.projectId}/databases/(default)/documents/${collection}/${docId}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Firestore read failed: HTTP ${res.status} — ${errBody.substring(0, 300)}`);
  }

  const data = await res.json() as any;
  // Convert Firestore REST API response format to plain object
  const fields = data.fields || {};
  const result: any = { id: docId };
  for (const [key, value] of Object.entries(fields)) {
    result[key] = unwrapFirestoreValue(value as any);
  }
  return result;
}

// ============================================================
// Query Firestore collection via REST API
// ============================================================
export async function queryFirestore(
  collection: string,
  filters: Array<{ field: string; op: string; value: any }> = [],
  limitCount: number = 100
): Promise<any[]> {
  const sa = getServiceAccount();
  const accessToken = await getAccessToken();

  const url = `${FIRESTORE_BASE}/projects/${sa.projectId}/databases/(default)/documents/${collection}:runQuery`;
  const body: any = {
    structuredQuery: {
      from: [{ collectionId: collection }],
      limit: limitCount,
    },
  };

  if (filters.length > 0) {
    body.structuredQuery.where = {
      compositeFilter: {
        op: 'AND',
        filters: filters.map((f) => ({
          fieldFilter: {
            field: { fieldPath: f.field },
            op: f.op,
            value: wrapFirestoreValue(f.value),
          },
        })),
      },
    };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Firestore query failed: HTTP ${res.status} — ${errBody.substring(0, 300)}`);
  }

  const data = await res.json() as Array<any>;
  const results: any[] = [];
  for (const item of data) {
    if (item.document) {
      const doc = item.document;
      const fields = doc.fields || {};
      const result: any = { id: doc.name.split('/').pop() };
      for (const [key, value] of Object.entries(fields)) {
        result[key] = unwrapFirestoreValue(value as any);
      }
      results.push(result);
    }
  }
  return results;
}

// ============================================================
// Firestore value (de)serialization
// ============================================================
function unwrapFirestoreValue(value: any): any {
  if (!value || typeof value !== 'object') return value;
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.integerValue !== undefined) return Number(value.integerValue);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.timestampValue !== undefined) return value.timestampValue;
  if (value.arrayValue?.values) return value.arrayValue.values.map((v: any) => unwrapFirestoreValue(v));
  if (value.mapValue?.fields) {
    const obj: any = {};
    for (const [k, v] of Object.entries(value.mapValue.fields)) {
      obj[k] = unwrapFirestoreValue(v as any);
    }
    return obj;
  }
  if (value.nullValue !== undefined) return null;
  return value;
}

function wrapFirestoreValue(value: any): any {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(wrapFirestoreValue) } };
  }
  if (typeof value === 'object') {
    const fields: any = {};
    for (const [k, v] of Object.entries(value)) {
      fields[k] = wrapFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(value) };
}
