"use client";

import { useRef, useState } from "react";

type QrCodeInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  uploadQrLogoToSelectedBlock: (file: File) => Promise<any>;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function QrCodeInspector({
  selectedBlock,
  updateSelectedBlock,
  uploadQrLogoToSelectedBlock,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: QrCodeInspectorProps) {
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState("");

  const updateQrData = (updates: Record<string, any>) => {
    updateSelectedBlock((block: any) =>
      block.type !== "qr_code"
        ? block
        : {
            ...block,
            data: {
              ...block.data,
              ...updates,
            },
          },
    );
  };

  const handleGenerate = () => {
    const url = selectedBlock.data.url?.trim();

    if (!url) return;

    updateQrData({
      url,
      generated: true,
    });
  };

  const handleLogoFileChange = async (
    fileList: FileList | null,
  ) => {
    const file = fileList?.[0];

    if (!file) return;

    try {
      setLogoUploading(true);
      setLogoUploadError("");

      await uploadQrLogoToSelectedBlock(file);
    } catch (error) {
      setLogoUploadError(
        error instanceof Error
          ? error.message
          : "QR logo upload failed. Please try again.",
      );
    } finally {
      setLogoUploading(false);

      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
    }
  };

  const removeLogo = () => {
    updateQrData({
      logoUrl: "",
      logoStoragePath: "",
      logoSizeBytes: 0,
      logoOriginalSizeBytes: 0,
      logoMimeType: "",
    });
  };

  return (
    <div className={inspectorCardClass()}>
      <div className={inspectorLabelClass()}>
        QR Code
      </div>

      {/* URL */}
      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          URL
        </div>

        <input
          type="text"
          value={selectedBlock.data.url ?? ""}
          placeholder="https://example.com"
          onChange={(e) =>
            updateQrData({
              url: e.target.value,
              generated: false,
            })
          }
          className={inspectorInputClass()}
        />
      </div>

      {/* Generate */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={!selectedBlock.data.url?.trim()}
        className="mt-3 flex h-10 w-full items-center justify-center rounded-xl bg-black px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {selectedBlock.data.generated
          ? "Regenerate QR Code"
          : "Generate QR Code"}
      </button>

      {/* QR Color */}
      <div className="mt-5">
        <div className={inspectorLabelClass()}>
          QR Color
        </div>

        <div className="mt-2 flex items-center gap-2">
          <input
            type="color"
            value={
              selectedBlock.data.foregroundColor ??
              "#000000"
            }
            onChange={(e) =>
              updateQrData({
                foregroundColor: e.target.value,
              })
            }
            className="h-10 w-12 cursor-pointer rounded border border-neutral-300 bg-transparent p-1"
          />

          <input
            type="text"
            value={
              selectedBlock.data.foregroundColor ??
              "#000000"
            }
            onChange={(e) =>
              updateQrData({
                foregroundColor: e.target.value,
              })
            }
            className={inspectorInputClass()}
          />
        </div>
      </div>

      {/* Background Color */}
      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Background Color
        </div>

        <div className="mt-2 flex items-center gap-2">
          <input
            type="color"
            value={
              selectedBlock.data.backgroundColor ??
              "#ffffff"
            }
            onChange={(e) =>
              updateQrData({
                backgroundColor: e.target.value,
              })
            }
            className="h-10 w-12 cursor-pointer rounded border border-neutral-300 bg-transparent p-1"
          />

          <input
            type="text"
            value={
              selectedBlock.data.backgroundColor ??
              "#ffffff"
            }
            onChange={(e) =>
              updateQrData({
                backgroundColor: e.target.value,
              })
            }
            className={inspectorInputClass()}
          />
        </div>
      </div>

      {/* Dot Shape */}
      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          QR Shape
        </div>

        <select
          value={
            selectedBlock.data.dotShape ?? "square"
          }
          onChange={(e) =>
            updateQrData({
              dotShape: e.target.value,
            })
          }
          className={inspectorInputClass()}
        >
          <option value="square">Square</option>
          <option value="rounded">Rounded</option>
          <option value="dots">Dots</option>
          <option value="classy">Classy</option>
        </select>
      </div>

      {/* Corner Shape */}
      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          Corner Shape
        </div>

        <select
          value={
            selectedBlock.data.cornerShape ?? "square"
          }
          onChange={(e) =>
            updateQrData({
              cornerShape: e.target.value,
            })
          }
          className={inspectorInputClass()}
        >
          <option value="square">Square</option>
          <option value="rounded">Rounded</option>
          <option value="dot">Dot</option>
        </select>
      </div>

      {/* Margin */}
      <div className="mt-4">
        <div className={inspectorLabelClass()}>
          QR Margin: {selectedBlock.data.margin ?? 10}
        </div>

        <input
          type="range"
          min={0}
          max={50}
          step={1}
          value={selectedBlock.data.margin ?? 10}
          onChange={(e) =>
            updateQrData({
              margin: Number(e.target.value),
            })
          }
          className="mt-2 w-full"
        />
      </div>

      {/* Center Logo */}
      <div className="mt-6 border-t border-neutral-200 pt-5">
        <div className={inspectorLabelClass()}>
          Center Logo
        </div>

        <div className="mt-2 text-xs text-neutral-500">
          Optional. Add a logo or image to the center
          of the QR code.
        </div>

        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) =>
            void handleLogoFileChange(e.target.files)
          }
        />

        {selectedBlock.data.logoUrl ? (
          <>
            <div className="mt-4 flex items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <img
                src={selectedBlock.data.logoUrl}
                alt="QR logo"
                className="h-20 w-20 object-contain"
              />
            </div>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={logoUploading}
                onClick={() =>
                  logoInputRef.current?.click()
                }
                className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
              >
                {logoUploading
                  ? "Uploading..."
                  : "Replace Logo"}
              </button>

              <button
                type="button"
                disabled={logoUploading}
                onClick={removeLogo}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
              >
                Remove Logo
              </button>
            </div>

<div className="mt-4">
  <div className={inspectorLabelClass()}>
    Logo Size:{" "}
    {Math.round(
      ((selectedBlock.data.logoSize ?? 20) / 20) * 100,
    )}
    %
  </div>

  <input
    type="range"
    min={2}
    max={20}
    step={1}
    value={Math.min(
      selectedBlock.data.logoSize ?? 20,
      20,
    )}
    onChange={(e) =>
      updateQrData({
        logoSize: Number(e.target.value),
      })
    }
    className="mt-2 w-full"
  />
</div>
          </>
        ) : (
          <button
            type="button"
            disabled={logoUploading}
            onClick={() =>
              logoInputRef.current?.click()
            }
            className="mt-3 inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
          >
            {logoUploading
              ? "Uploading..."
              : "Browse Logo"}
          </button>
        )}

        {logoUploadError ? (
          <div className="mt-2 text-xs text-red-600">
            {logoUploadError}
          </div>
        ) : null}
      </div>
    </div>
  );
}