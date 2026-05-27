"use client";

export default function MicrositeFooterBrand() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="relative flex min-h-[84px] items-center justify-between px-6 py-6">
        <div className="text-sm text-neutral-700">
          © 2026 Ko-Host. All rights reserved.
        </div>

        <a
          href="https://ko-host.com"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Built with Ko-Host"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 hover:opacity-90"
        >
          <img
            src="/BWK LOGO.png"
            alt="Built with Ko-Host"
            className="h-auto w-[140px] opacity-55"
          />
        </a>

        <div className="flex items-center gap-5 text-sm text-neutral-700">
          <a href="/terms" className="hover:underline">
            Terms
          </a>

          <a href="/privacy" className="hover:underline">
            Privacy
          </a>

          <a href="/about" className="hover:underline">
            About
          </a>

          <a href="/support" className="hover:underline">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
}


/* "use client";

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
} */