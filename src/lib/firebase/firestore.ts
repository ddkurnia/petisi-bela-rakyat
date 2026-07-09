// Firestore Service Layer - CRUD + realtime onSnapshot
// ============================================================
// All operations use the MAIN Firestore instance, which is
// authenticated via the main Firebase app's Auth. After login,
// the user's auth token is attached to all reads/writes
// automatically, satisfying Firestore security rules.
// ============================================================
import {
  getFirestore, collection, doc, getDocs, getDoc, addDoc, setDoc,
  updateDoc, deleteDoc, query, where, orderBy, limit, onSnapshot,
  increment, type DocumentData, type Unsubscribe, type QueryConstraint,
} from 'firebase/firestore';
import { app } from './firebase';
import { isFirebaseConfigured, assertFirebaseConfigured } from './config';

const db = isFirebaseConfigured && app ? getFirestore(app) : null;

const stripId = <T extends { id?: string }>(obj: T) => {
  const { id, ...rest } = obj;
  return rest;
};
const normalize = <T>(data: DocumentData, id: string): T => ({ id, ...data }) as T;
const requireDb = () => {
  if (!db) { assertFirebaseConfigured(); throw new Error('[PBR] Firestore unavailable'); }
  return db;
};

// ============================================================
// READ operations
// ============================================================
export async function getAll<T>(name: string, ...constraints: QueryConstraint[]): Promise<T[]> {
  const d = requireDb();
  const q = constraints.length ? query(collection(d, name), ...constraints) : collection(d, name);
  const snap = await getDocs(q as any);
  return snap.docs.map((doc) => normalize<T>(doc.data() as DocumentData, doc.id));
}

export async function getById<T>(name: string, id: string): Promise<T | null> {
  const d = requireDb();
  const snap = await getDoc(doc(d, name, id));
  return snap.exists() ? normalize<T>(snap.data() as DocumentData, snap.id) : null;
}

export async function getByField<T>(name: string, field: string, value: any, ...constraints: QueryConstraint[]): Promise<T[]> {
  const d = requireDb();
  const q = query(collection(d, name), where(field, '==', value), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((doc) => normalize<T>(doc.data() as DocumentData, doc.id));
}

export async function getFirstByField<T>(name: string, field: string, value: any): Promise<T | null> {
  const d = requireDb();
  const q = query(collection(d, name), where(field, '==', value), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return normalize<T>(doc.data(), doc.id);
}

// ============================================================
// WRITE operations — use main db (authenticated)
// ============================================================
export async function createItem<T extends { id?: string }>(name: string, data: T): Promise<string> {
  const d = requireDb();
  const ref = await addDoc(collection(d, name), {
    ...stripId(data),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function createItemWithId<T extends { id?: string }>(name: string, id: string, data: T): Promise<void> {
  const d = requireDb();
  await setDoc(doc(d, name, id), {
    ...stripId(data),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function updateItem<T>(name: string, id: string, data: Partial<T>): Promise<void> {
  const d = requireDb();
  await updateDoc(doc(d, name, id), {
    ...data,
    updatedAt: new Date().toISOString(),
  } as any);
}

// setDoc with merge — used for singleton docs (e.g. settings/main)
export async function setItemMerged<T extends { id?: string }>(name: string, id: string, data: T): Promise<void> {
  const d = requireDb();
  await setDoc(doc(d, name, id), {
    ...stripId(data),
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

export async function deleteItem(name: string, id: string): Promise<void> {
  const d = requireDb();
  await deleteDoc(doc(d, name, id));
}

export async function incrementField(name: string, id: string, field: string, by: number = 1): Promise<void> {
  const d = requireDb();
  await updateDoc(doc(d, name, id), {
    [field]: increment(by),
    updatedAt: new Date().toISOString(),
  } as any);
}

// ============================================================
// SUBSCRIBE operations — realtime via onSnapshot
// ============================================================
// Public users: use subscribeToCollectionPublished (filters by status=published)
// Admin users: use subscribeToCollection (no filter, sees all)
//
// This split is REQUIRED by Firestore rules:
//   allow read: if resource.data.status == 'published' || isAdmin();
// A query without the filter would be denied for public users because
// Firestore can't guarantee all returned docs have status=published.
// ============================================================
export function subscribeToCollection<T>(name: string, cb: (items: T[]) => void, ...constraints: QueryConstraint[]): Unsubscribe {
  const d = requireDb();
  const q = constraints.length ? query(collection(d, name), ...constraints) : collection(d, name);
  return onSnapshot(
    q as any,
    (snap) => cb(snap.docs.map((doc) => normalize<T>(doc.data(), doc.id))),
    (err) => console.error(`[firestore] subscribe(${name}) error:`, err?.code || err?.message),
  );
}

// Subscribe to a single document by ID (realtime)
export function subscribeToDoc<T>(name: string, id: string, cb: (item: T | null) => void): Unsubscribe {
  const d = requireDb();
  return onSnapshot(
    doc(d, name, id),
    (snap) => cb(snap.exists() ? normalize<T>(snap.data(), snap.id) : null),
    (err) => console.error(`[firestore] subscribeDoc(${name}/${id}) error:`, err?.code || err?.message),
  );
}

// Subscribe to the FIRST document in a collection (used for singleton settings)
export function subscribeToFirstDoc<T>(name: string, cb: (item: T | null) => void, ...constraints: QueryConstraint[]): Unsubscribe {
  const d = requireDb();
  const q = constraints.length
    ? query(collection(d, name), ...constraints, limit(1))
    : query(collection(d, name), limit(1));
  return onSnapshot(
    q,
    (snap) => {
      if (snap.empty) { cb(null); return; }
      const d0 = snap.docs[0];
      cb(normalize<T>(d0.data(), d0.id));
    },
    (err) => console.error(`[firestore] subscribeFirst(${name}) error:`, err?.code || err?.message),
  );
}

export { db, query, where, orderBy, limit, increment };
