"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm?: () => void;
  onCancel: () => void;
};

export default function AppModal({
  open,
  title,
  description,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel();
    }
  };

  window.addEventListener("keydown", handleKey);
  return () => window.removeEventListener("keydown", handleKey);
}, [onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl">
        <div className="text-lg font-semibold text-neutral-950">{title}</div>

        {description && (
          <p className="mt-2 text-sm font-semibold text-neutral-600">
            {description}
          </p>
        )}

        {children}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-xl border border-black bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-900"
            disabled={loading}
          >
            {cancelText}
          </button>

          {onConfirm ? (
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                danger ? "bg-red-600" : "bg-black"
              }`}
            >
              {loading ? "Processing..." : confirmText}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}