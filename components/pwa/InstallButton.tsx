"use client";

import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function InstallButton(props: {
  className?: string;
  label?: string;
}) {
  const { className, label = "Install" } = props;

  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  const canInstall = useMemo(() => {
    return !!deferred && !installed;
  }, [deferred, installed]);

  useEffect(() => {
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)")?.matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setInstalled(true);
    }

    function onAppInstalled() {
      setInstalled(true);
      setDeferred(null);
    }

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("appinstalled", onAppInstalled);
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    return () => {
      window.removeEventListener("appinstalled", onAppInstalled);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    };
  }, []);

  async function doInstall() {
    if (!deferred) return;

    await deferred.prompt();

    try {
      const choice = await deferred.userChoice;

      if (choice.outcome === "accepted") {
        setInstalled(true);
      }
    } finally {
      setDeferred(null);
    }
  }

  if (!canInstall) return null;

  return (
    <button
      type="button"
      onClick={doInstall}
      className={
        className ??
        "inline-flex items-center justify-center rounded-xl bg-neutral-900 px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
      }
    >
      {label}
    </button>
  );
}