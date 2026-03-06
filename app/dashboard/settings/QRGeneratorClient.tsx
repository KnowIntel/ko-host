"use client";

import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

type Microsite = {
  id: string;
  slug: string;
  title: string | null;
};

type CardStyle = "qr_only" | "share_card" | "flyer_card";

export default function QRGeneratorClient({
  microsites,
}: {
  microsites: Microsite[];
}) {
  const [selected, setSelected] = useState<string>(microsites[0]?.slug ?? "");
  const [cardStyle, setCardStyle] = useState<CardStyle>("share_card");

  const selectedMicrosite = useMemo(() => {
    return microsites.find((m) => m.slug === selected) ?? null;
  }, [microsites, selected]);

  const url = selected ? `https://${selected}.ko-host.com` : "";

  const title = selectedMicrosite?.title?.trim() || selected || "Microsite";

  function downloadSvgById(id: string, filename: string) {
    const svg = document.getElementById(id);
    if (!svg) return;

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], {
      type: "image/svg+xml;charset=utf-8",
    });
    const urlBlob = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = urlBlob;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(urlBlob);
  }

  function downloadCurrent() {
    if (!selected) return;

    if (cardStyle === "qr_only") {
      downloadSvgById("qr-only-svg", `${selected}-qr.svg`);
      return;
    }

    if (cardStyle === "share_card") {
      downloadSvgById("share-card-svg", `${selected}-share-card.svg`);
      return;
    }

    downloadSvgById("flyer-card-svg", `${selected}-flyer-card.svg`);
  }

  if (microsites.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
        No microsites yet. Create one first, then come back here to generate a QR code.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Select microsite</label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
          >
            {microsites.map((m) => (
              <option key={m.id} value={m.slug}>
                {m.title || m.slug}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Card style</label>
          <select
            value={cardStyle}
            onChange={(e) => setCardStyle(e.target.value as CardStyle)}
            className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
          >
            <option value="qr_only">QR Only</option>
            <option value="share_card">Branded Share Card</option>
            <option value="flyer_card">Flyer Card</option>
          </select>
        </div>
      </div>

      {url ? (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="text-sm font-semibold text-neutral-900">Microsite URL</div>
              <div className="mt-2 break-all font-mono text-xs text-neutral-600">
                {url}
              </div>
            </div>

            <button
              type="button"
              onClick={downloadCurrent}
              className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Download
            </button>
          </div>

          <div className="flex items-start justify-center">
            {cardStyle === "qr_only" ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <QRCodeSVG
                  id="qr-only-svg"
                  value={url}
                  size={220}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  includeMargin
                />
              </div>
            ) : null}

            {cardStyle === "share_card" ? (
              <div className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
                <svg
                  id="share-card-svg"
                  xmlns="http://www.w3.org/2000/svg"
                  width="520"
                  height="320"
                  viewBox="0 0 520 320"
                  className="h-auto w-full max-w-[520px]"
                >
                  <rect x="0" y="0" width="520" height="320" rx="28" fill="#ffffff" />
                  <rect x="0" y="0" width="520" height="320" rx="28" fill="none" stroke="#e5e5e5" />
                  <text
                    x="36"
                    y="52"
                    fontSize="18"
                    fontWeight="600"
                    fill="#525252"
                    fontFamily="Arial, sans-serif"
                  >
                    Ko-Host
                  </text>
                  <text
                    x="36"
                    y="104"
                    fontSize="28"
                    fontWeight="700"
                    fill="#111827"
                    fontFamily="Arial, sans-serif"
                  >
                    {title}
                  </text>
                  <text
                    x="36"
                    y="136"
                    fontSize="15"
                    fill="#525252"
                    fontFamily="Arial, sans-serif"
                  >
                    Scan to open this microsite
                  </text>
                  <text
                    x="36"
                    y="276"
                    fontSize="13"
                    fill="#737373"
                    fontFamily="Arial, sans-serif"
                  >
                    {url}
                  </text>
                  <foreignObject x="330" y="46" width="150" height="150">
                    <div>
                        <QRCodeSVG
                        value={url}
                        size={150}
                        bgColor="#ffffff"
                        fgColor="#000000"
                        includeMargin
                        />
                    </div>
                    </foreignObject>
                </svg>
              </div>
            ) : null}

            {cardStyle === "flyer_card" ? (
              <div className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
                <svg
                  id="flyer-card-svg"
                  xmlns="http://www.w3.org/2000/svg"
                  width="600"
                  height="760"
                  viewBox="0 0 600 760"
                  className="h-auto w-full max-w-[420px]"
                >
                  <rect x="0" y="0" width="600" height="760" rx="28" fill="#ffffff" />
                  <rect x="0" y="0" width="600" height="760" rx="28" fill="none" stroke="#e5e5e5" />
                  <text
                    x="300"
                    y="90"
                    textAnchor="middle"
                    fontSize="22"
                    fontWeight="600"
                    fill="#525252"
                    fontFamily="Arial, sans-serif"
                  >
                    Ko-Host
                  </text>
                  <text
                    x="300"
                    y="160"
                    textAnchor="middle"
                    fontSize="34"
                    fontWeight="700"
                    fill="#111827"
                    fontFamily="Arial, sans-serif"
                  >
                    {title}
                  </text>
                  <text
                    x="300"
                    y="205"
                    textAnchor="middle"
                    fontSize="18"
                    fill="#525252"
                    fontFamily="Arial, sans-serif"
                  >
                    Scan the QR code below
                  </text>
                  <foreignObject x="170" y="250" width="260" height="260">
                    <div>
                        <QRCodeSVG
                        value={url}
                        size={260}
                        bgColor="#ffffff"
                        fgColor="#000000"
                        includeMargin
                        />
                    </div>
                    </foreignObject>
                  <text
                    x="300"
                    y="575"
                    textAnchor="middle"
                    fontSize="16"
                    fill="#525252"
                    fontFamily="Arial, sans-serif"
                  >
                    Open instantly on any device
                  </text>
                  <text
                    x="300"
                    y="640"
                    textAnchor="middle"
                    fontSize="14"
                    fill="#737373"
                    fontFamily="Arial, sans-serif"
                  >
                    {url}
                  </text>
                </svg>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}