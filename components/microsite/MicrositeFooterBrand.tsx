"use client";

export default function MicrositeFooterBrand() {
  const mainSiteUrl = "https://ko-host.com";

  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="relative flex min-h-[84px] items-center justify-between px-6 py-6">
        <div className="text-sm text-neutral-700">
          © 2026 Ko-Host. All rights reserved.
        </div>

        <a
          href={mainSiteUrl}
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
          <a
            href={`${mainSiteUrl}/terms`}
            target="_blank"
            rel="noreferrer noopener"
            className="hover:underline"
          >
            Terms
          </a>

          <a
            href={`${mainSiteUrl}/privacy`}
            target="_blank"
            rel="noreferrer noopener"
            className="hover:underline"
          >
            Privacy
          </a>

          <a
            href={`${mainSiteUrl}/about`}
            target="_blank"
            rel="noreferrer noopener"
            className="hover:underline"
          >
            About
          </a>

          <a
            href={`${mainSiteUrl}/support`}
            target="_blank"
            rel="noreferrer noopener"
            className="hover:underline"
          >
            Support
          </a>
        </div>
      </div>
    </footer>
  );
}