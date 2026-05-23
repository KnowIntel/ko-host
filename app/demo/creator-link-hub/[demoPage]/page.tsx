import Link from "next/link";
import { notFound } from "next/navigation";

const DEMO_PAGES: Record<
  string,
  {
    title: string;
    eyebrow: string;
    message: string;
  }
> = {
  blog: {
    title: "Demo Blog",
    eyebrow: "Creator Link Hub Demo",
    message:
      "You clicked the blog link. This is a friendly little demo page — no real blog posts, no rabbit holes, no accidentally subscribing to a newsletter from 2017.",
  },

  favorites: {
    title: "Demo Favorites",
    eyebrow: "Creator Link Hub Demo",
    message:
      "You found the favorites page. Relax. We’re not sending you into the internet wilderness. These are pretend favorites, carefully curated by the very serious Ko-Host Demo Department.",
  },

  services: {
    title: "Demo Services",
    eyebrow: "Creator Link Hub Demo",
    message:
      "You clicked services. A real creator would send you somewhere useful. We sent you here. This is where a creator could show bookings, packages, offers, or anything else they want visitors to take seriously.",
  },

  guide: {
    title: "Demo Guide",
    eyebrow: "Creator Link Hub Demo",
    message:
      "You opened the guide. Yes, the link works. No, we’re not losing traffic today. In a real microsite, this could be a resource, checklist, mini-course, starter kit, or beautifully disguised call-to-action.",
  },

  instagram: {
    title: "Demo Instagram",
    eyebrow: "Creator Link Hub Demo",
    message:
      "You tapped the Instagram link. In a real creator hub, this could lead to photos, reels, behind-the-scenes content, or at least one suspiciously aesthetic coffee picture.",
  },

  pinterest: {
    title: "Demo Pinterest",
    eyebrow: "Creator Link Hub Demo",
    message:
      "Welcome to the pretend Pinterest page — where every room is perfectly organized and every recipe somehow takes only 12 minutes.",
  },

  tiktok: {
    title: "Demo TikTok",
    eyebrow: "Creator Link Hub Demo",
    message:
      "You opened the TikTok link. In a real microsite, this could launch short-form content, creator clips, trends, tutorials, or chaotic energy at alarming speed.",
  },

  youtube: {
    title: "Demo YouTube",
    eyebrow: "Creator Link Hub Demo",
    message:
      "You clicked the YouTube section. This is where creators could feature videos, podcasts, livestreams, explainers, or a thumbnail with an unnecessarily dramatic facial expression.",
  },

  email: {
    title: "Demo Email",
    eyebrow: "Creator Link Hub Demo",
    message:
      "You opened the email destination. Normally this could launch a newsletter signup, contact page, business inquiry form, or a very ambitious automated funnel.",
  },
};

export default function CreatorLinkHubDemoPage({
  params,
}: {
  params: { demoPage: string };
}) {
  const page = DEMO_PAGES[params.demoPage];

  if (!page) notFound();

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-white/10 bg-black/40 px-6 py-5">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Ko-Host
          </Link>

          <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">
            Demo Page
          </span>
        </div>
      </header>

      <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-blue-300">
        {page.eyebrow}
        </div>

        <div className="mb-6 text-2xl font-black leading-tight tracking-tight text-white sm:text-4xl">
        Did you really think we’d steer you off the site?
        </div>

        <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
          {page.title}
        </h1>

        <p className="mt-6 text-lg leading-8 text-white/75">
          {page.message}
        </p>

        <Link
          href="/"
          className="mt-10 rounded-full bg-white px-6 py-3 text-sm font-bold text-neutral-950 hover:bg-white/90"
        >
          Back to Ko-Host
        </Link>
      </section>

      <footer className="border-t border-white/10 px-6 py-6 text-center text-sm text-white/45">
        This is a Ko-Host demo destination page. Nothing broke. Nothing exploded.
        The button did exactly what it was supposed to do.
      </footer>
    </main>
  );
}