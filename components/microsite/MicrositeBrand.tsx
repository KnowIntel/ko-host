"use client";

export default function MicrositeBrand() {
  return (
    <a
      href="https://ko-host.com"
      target="_blank"
      rel="noreferrer"
      className="group fixed bottom-6 right-6 z-50"
      aria-label="Visit ko-host.com"
    >
      <div className="pointer-events-none absolute -top-10 right-0 rounded-md bg-black px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100">
        ko-host.com
      </div>

      <img
        src="/PB_KH_LOGO.png"
        alt="Ko-Host"
        className="h-12 w-auto opacity-85 drop-shadow-md transition duration-200 group-hover:opacity-100"
      />
    </a>
  );
}