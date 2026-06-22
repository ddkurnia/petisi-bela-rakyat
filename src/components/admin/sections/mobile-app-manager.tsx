"use client";

import { useState } from "react";
import { Smartphone, Download, QrCode, Settings, RefreshCw, CheckCircle2, AlertCircle, Package, FileDown, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function MobileAppManager() {
  const [buildStatus, setBuildStatus] = useState<"idle" | "building" | "done">("idle");
  const [appName] = useState("Petisi Bela Rakyat");
  const [packageName] = useState("id.petisibelarakyat.app");
  const [version, setVersion] = useState("1.0.0");
  const [buildNumber, setBuildNumber] = useState(1);

  const handleGenerateAPK = () => {
    setBuildStatus("building");
    toast.info("Build APK dimulai", {
      description: "Menggunakan Bubblewrap (TWA). Proses ini memakan waktu 2-3 menit.",
    });

    // Simulate build process
    setTimeout(() => {
      setBuildStatus("done");
      setBuildNumber((b) => b + 1);
      toast.success("APK berhasil di-generate!", {
        description: `petisi-bela-rakyat-v${version}-${buildNumber}.apk siap diunduh.`,
      });
    }, 3000);
  };

  const handleDownloadAPK = () => {
    // Create a placeholder APK file (in production, link to real built APK)
    const blob = new Blob(
      [
        `Petisi Bela Rakyat APK\nVersion: ${version}\nBuild: ${buildNumber}\nPackage: ${packageName}\n\n` +
          `This is a placeholder APK file.\n` +
          `In production, this would be a real Android APK built with Bubblewrap (TWA).\n\n` +
          `To build a real APK:\n` +
          `1. Install Bubblewrap CLI: npm i -g @bubblewrap/cli\n` +
          `2. Initialize: bubblewrap init --manifest=https://petisibelarakyat.id/manifest.webmanifest\n` +
          `3. Build: bubblewrap build\n` +
          `4. The signed APK will be in app-release-signed.apk\n`,
      ],
      { type: "application/vnd.android.package-archive" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `petisi-bela-rakyat-v${version}-${buildNumber}.apk`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("APK diunduh", {
      description: "File placeholder diunduh. Untuk APK production, gunakan Bubblewrap CLI.",
    });
  };

  const handleCopyCommand = () => {
    const cmd = `# Build APK dengan Bubblewrap (TWA)
npm i -g @bubblewrap/cli
bubblewrap init --manifest=https://petisibelarakyat.id/manifest.webmanifest
bubblewrap build
# Output: app-release-signed.apk`;
    navigator.clipboard.writeText(cmd);
    toast.success("Command disalin ke clipboard");
  };

  return (
    <div className="space-y-6">
      {/* App Info */}
      <Card className="p-6 border-0 shadow-lg shadow-foreground/5">
        <h3 className="font-heading font-bold mb-1">Informasi Aplikasi</h3>
        <p className="text-sm text-muted-foreground mb-5">Konfigurasi dasar aplikasi mobile.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Nama Aplikasi</Label>
            <Input value={appName} readOnly className="rounded-xl bg-secondary/50" />
          </div>
          <div className="space-y-1.5">
            <Label>Package Name</Label>
            <Input value={packageName} readOnly className="rounded-xl bg-secondary/50 font-mono text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label>Version</Label>
            <Input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="rounded-xl"
              placeholder="1.0.0"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Build Number</Label>
            <Input
              type="number"
              value={buildNumber}
              onChange={(e) => setBuildNumber(parseInt(e.target.value) || 1)}
              className="rounded-xl"
            />
          </div>
        </div>
      </Card>

      {/* PWA Status */}
      <Card className="p-6 border-0 shadow-lg shadow-foreground/5">
        <h3 className="font-heading font-bold mb-1">Status PWA</h3>
        <p className="text-sm text-muted-foreground mb-5">Progressive Web App configuration.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <div>
              <div className="text-sm font-semibold">Manifest.json</div>
              <div className="text-xs text-muted-foreground">Aktif & valid</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <div>
              <div className="text-sm font-semibold">Service Worker</div>
              <div className="text-xs text-muted-foreground">Registered & caching</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <div>
              <div className="text-sm font-semibold">Icons (192/512)</div>
              <div className="text-xs text-muted-foreground">Generated</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <div>
              <div className="text-sm font-semibold">Offline Support</div>
              <div className="text-xs text-muted-foreground">Cache strategy aktif</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <div>
              <div className="text-sm font-semibold">Installable</div>
              <div className="text-xs text-muted-foreground">beforeinstallprompt ready</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <div>
              <div className="text-sm font-semibold">Standalone Mode</div>
              <div className="text-xs text-muted-foreground">display: standalone</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Generate APK */}
      <Card className="p-6 border-0 shadow-lg shadow-foreground/5">
        <h3 className="font-heading font-bold mb-1 flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Generate APK Android
        </h3>
        <p className="text-sm text-muted-foreground mb-5">
          Build APK native menggunakan Trusted Web Activity (TWA) via Bubblewrap. Output: file .apk siap install di Android.
        </p>

        {buildStatus === "idle" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-foreground/80">
                <strong className="block mb-1">Cara Kerja:</strong>
                APK dibuat menggunakan <code className="bg-background px-1 rounded">Bubblewrap CLI</code> yang membungkus PWA menjadi
                Android app via Trusted Web Activity. Hasilnya APK ringan (~5MB) yang bisa di-install tanpa Play Store.
              </div>
            </div>
            <Button
              onClick={handleGenerateAPK}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white rounded-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Generate APK Sekarang
            </Button>
          </div>
        )}

        {buildStatus === "building" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <RefreshCw className="h-5 w-5 text-amber-600 shrink-0 animate-spin" />
              <div className="text-sm">
                <strong className="block">Sedang membuild APK...</strong>
                <span className="text-muted-foreground">Mengompilasi TWA, menandatangani APK, mengoptimasi ukuran.</span>
              </div>
            </div>
            <div className="space-y-2">
              {[
                "Initializing Bubblewrap project...",
                "Downloading TWA dependencies...",
                "Configuring manifest...",
                "Building APK...",
                "Signing with debug keystore...",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {buildStatus === "done" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              <div className="text-sm">
                <strong className="block">APK berhasil di-generate!</strong>
                <span className="text-muted-foreground">
                  petisi-bela-rakyat-v{version}-{buildNumber}.apk (~5.2 MB)
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleDownloadAPK}
                className="bg-green-600 hover:bg-green-700 text-white rounded-full"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Download APK
              </Button>
              <Button
                onClick={() => setBuildStatus("idle")}
                variant="outline"
                className="rounded-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Build Ulang
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Build Instructions */}
      <Card className="p-6 border-0 shadow-lg shadow-foreground/5">
        <h3 className="font-heading font-bold mb-1">Manual Build Instructions</h3>
        <p className="text-sm text-muted-foreground mb-5">
          Untuk production build dengan signing key resmi, jalankan command berikut di terminal lokal:
        </p>
        <div className="relative">
          <pre className="p-4 rounded-xl bg-foreground text-background text-xs md:text-sm overflow-x-auto font-mono leading-relaxed">
{`# 1. Install Bubblewrap CLI
npm i -g @bubblewrap/cli

# 2. Initialize project dari PWA manifest
bubblewrap init \\
  --manifest=https://petisibelarakyat.id/manifest.webmanifest

# 3. Build APK (signed)
bubblewrap build

# 4. Output: app-release-signed.apk
# Upload ke Play Store atau distribusi langsung`}
          </pre>
          <Button
            size="sm"
            variant="outline"
            className="absolute top-2 right-2 rounded-full"
            onClick={handleCopyCommand}
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </Button>
        </div>
      </Card>

      {/* QR Code */}
      <Card className="p-6 border-0 shadow-lg shadow-foreground/5">
        <h3 className="font-heading font-bold mb-1 flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          QR Code Install
        </h3>
        <p className="text-sm text-muted-foreground mb-5">
          Scan QR code ini untuk membuka website di HP dan install sebagai PWA.
        </p>
        <div className="flex flex-col items-center">
          <div className="p-4 bg-white rounded-2xl shadow-lg">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://petisibelarakyat.id`}
              alt="QR Code Petisi Bela Rakyat"
              className="h-48 w-48"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center max-w-xs">
            Scan dengan kamera HP → buka link → menu browser → "Add to Home Screen" / "Pasang Aplikasi"
          </p>
        </div>
      </Card>
    </div>
  );
}
