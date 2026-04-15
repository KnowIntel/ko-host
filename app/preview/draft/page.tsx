"use client";

import { useEffect, useState } from "react";
import PlacedBlocksPreview from "@/components/preview/PlacedBlocksPreview";
import type { PreviewDraftPayload } from "@/lib/previewDraftStorage";

const PREVIEW_MESSAGE_TYPE = "ko-host-preview-draft";
const PREVIEW_READY_MESSAGE_TYPE = "ko-host-preview-ready";
const PREVIEW_RECEIVED_MESSAGE_TYPE = "ko-host-preview-received";
const PREVIEW_STORAGE_KEY = "ko-host-preview-last-payload";

export default function PreviewDraftPage() {
  const [payload, setPayload] = useState<PreviewDraftPayload | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    function safelySetPayload(nextPayload: PreviewDraftPayload) {
      setPayload(nextPayload);

      try {
        sessionStorage.setItem(
          PREVIEW_STORAGE_KEY,
          JSON.stringify(nextPayload),
        );
      } catch {
        // ignore storage failures
      }
    }

    function notifyOpenerReady() {
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(
            { type: PREVIEW_READY_MESSAGE_TYPE },
            window.location.origin,
          );
        }
      } catch {
        // ignore cross-window messaging failures
      }
    }

    function notifyOpenerReceived() {
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(
            { type: PREVIEW_RECEIVED_MESSAGE_TYPE },
            window.location.origin,
          );
        }
      } catch {
        // ignore cross-window messaging failures
      }
    }

    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;

      const data = event.data as
        | { type?: string; payload?: PreviewDraftPayload }
        | undefined;

      if (!data || data.type !== PREVIEW_MESSAGE_TYPE || !data.payload) return;

      safelySetPayload(data.payload);
      setIsReady(true);
      notifyOpenerReceived();
    }

    window.addEventListener("message", handleMessage);

    try {
      const stored = sessionStorage.getItem(PREVIEW_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PreviewDraftPayload;
        if (parsed?.draft) {
          setPayload(parsed);
        }
      }
    } catch {
      // ignore parse/storage failures
    }

    setIsReady(true);

    notifyOpenerReady();

    let readyAttempts = 0;
    const readyInterval = window.setInterval(() => {
      readyAttempts += 1;
      notifyOpenerReady();

      if (readyAttempts >= 20) {
        window.clearInterval(readyInterval);
      }
    }, 250);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.clearInterval(readyInterval);
    };
  }, []);

  if (!isReady) {
    return (
      <main className="min-h-screen bg-[#fcfbf8] px-4 py-4">
        <div className="w-full rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-neutral-900">
            Loading page...
          </div>
        </div>
      </main>
    );
  }

  if (!payload?.draft) {
    return (
      <main className="min-h-screen bg-[#fcfbf8] px-4 py-4">
        <div className="w-full rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-base font-semibold text-neutral-900">
            Waiting for preview...
          </div>
          <div className="mt-2 text-sm text-neutral-600">
            Open preview from the editor to load the current draft.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden overflow-y-auto">
      <PlacedBlocksPreview
        draft={payload.draft}
        designKey={payload.designLayout}
fixedScale={Math.max(
  0.25,
  Math.min(
    1.5,
    (((payload.draft as { pageScale?: number }).pageScale ?? 100) / 100) * 0.755555,
  ),
)}
        disableAutoScale={true}
        hideFrame={true}
      />
    </main>
  );
}