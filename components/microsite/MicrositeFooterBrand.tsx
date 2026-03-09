"use client";

export default function MicrositeFooterBrand() {
  return (
    <footer className="mt-20 border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-center px-6 py-8">
        <a
          href="https://ko-host.com"
          target="_blank"
          rel="noreferrer"
          className="group relative"
        >
          <img
            src="/PB_KH_LOGO.png"
            alt="Ko-Host"
            className="h-10 w-auto opacity-90 transition group-hover:opacity-100"
          />

          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-neutral-900 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
            ko-host.com
          </span>
        </a>
      </div>
    </footer>
  );
}