import type { IScannerControls } from "@zxing/browser";
import { ArrowLeft, ImageUp, QrCode } from "lucide-react";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";

type ScanScreenProps = {
  heading?: string;
  onBack: () => void;
  onScan: (rawText: string) => void;
};

export function ScanScreen({ heading = "Scan QR code", onBack, onScan }: ScanScreenProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const onScanRef = useRef(onScan);
  const [status, setStatus] = useState("Starting camera");
  const [error, setError] = useState("");
  const [isReadingFile, setIsReadingFile] = useState(false);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement) {
      return undefined;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("Camera unavailable");
      setError("Use a camera-enabled browser or upload a badge photo.");

      return undefined;
    }

    let activeControls: IScannerControls | null = null;
    let hasScanned = false;
    let isUnmounted = false;
    setStatus("Looking for QR code");
    setError("");

    import("@zxing/browser")
      .then(({ BrowserQRCodeReader }) => {
        if (isUnmounted) {
          return null;
        }

        const reader = new BrowserQRCodeReader(undefined, {
          delayBetweenScanAttempts: 250,
          delayBetweenScanSuccess: 250,
        });

        return reader.decodeFromVideoDevice(undefined, videoElement, (result, scanError, controls) => {
          if (result && !hasScanned) {
            hasScanned = true;
            controls.stop();
            onScanRef.current(result.getText());
            return;
          }

          if (scanError && scanError.name !== "NotFoundException") {
            setStatus("Still scanning");
          }
        });
      })
      .then((controls) => {
        if (!controls) {
          return;
        }

        if (isUnmounted || hasScanned) {
          controls.stop();
          return;
        }

        activeControls = controls;
      })
      .catch(() => {
        if (!isUnmounted) {
          setStatus("Camera unavailable");
          setError("Camera permission was blocked or no camera was found.");
        }
      });

    return () => {
      isUnmounted = true;
      activeControls?.stop();
    };
  }, []);

  async function handlePhotoUpload(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    setIsReadingFile(true);
    setError("");

    const url = URL.createObjectURL(file);

    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader();
      const result = await reader.decodeFromImageUrl(url);
      onScan(result.getText());
    } catch {
      setError("No QR code was found in that image.");
    } finally {
      URL.revokeObjectURL(url);
      setIsReadingFile(false);
      input.value = "";
    }
  }

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 py-5 sm:px-6">
        <header className="grid grid-cols-[44px_1fr_44px] items-center">
          <button
            aria-label="Back"
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm"
            onClick={onBack}
            type="button"
          >
            <ArrowLeft aria-hidden="true" className="h-5 w-5" strokeWidth={2.25} />
          </button>
          <h1 className="text-center text-lg font-semibold text-slate-950">{heading}</h1>
        </header>

        <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-slate-950 shadow-sm">
          <div className="relative aspect-[3/4] w-full">
            <video
              aria-label="QR camera preview"
              className="h-full w-full object-cover"
              muted
              playsInline
              ref={videoRef}
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-56 w-56 rounded-lg border-2 border-white/90 shadow-[0_0_0_999px_rgba(15,23,42,0.45)]" />
            </div>
          </div>
        </section>

        <div className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <QrCode aria-hidden="true" className="h-5 w-5 text-slate-500" strokeWidth={2.25} />
            <p className="text-sm font-medium text-slate-700">{status}</p>
          </div>
          {error ? <p className="mt-2 text-sm leading-6 text-red-600">{error}</p> : null}
        </div>

        <label className="mt-4 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-base font-semibold text-slate-700 shadow-sm">
          <ImageUp aria-hidden="true" className="h-5 w-5" strokeWidth={2.25} />
          {isReadingFile ? "Reading photo" : "Upload badge photo"}
          <input
            accept="image/*"
            className="sr-only"
            disabled={isReadingFile}
            onChange={handlePhotoUpload}
            type="file"
          />
        </label>
      </div>
    </main>
  );
}
