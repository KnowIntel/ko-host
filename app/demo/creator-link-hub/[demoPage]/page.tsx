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

  collaboration: {
  title: "Demo Collaboration",
  eyebrow: "Creator Link Hub Demo",
  message:
    "You opened the collaboration page. In a real creator hub, this could include sponsorships, brand partnerships, media kits, inquiries, or someone asking if exposure counts as payment.",
},

shop: {
  title: "Demo Shop",
  eyebrow: "Creator Link Hub Demo",
  message:
    "You clicked the shop link. This is where creators could sell products, merch, downloads, presets, templates, or extremely expensive hoodies with minimal text on them.",
},

website: {
  title: "Demo Website",
  eyebrow: "Creator Link Hub Demo",
  message:
    "You reached the website destination. Normally this could lead to a portfolio, business site, booking platform, blog, or an aggressively modern landing page with floating gradients.",
},

donation: {
  title: "Demo Donation",
  eyebrow: "Creator Link Hub Demo",
  message:
    "You opened the donation page. In a real microsite, this could support creators, projects, causes, communities, coffee funds, or someone trying to justify buying another camera lens.",
},

"adopt-a-pet": {
  title: "Demo Adopt-a-Pet",
  eyebrow: "Pet Adoption Demo",
  message:
    "You opened the adopt-a-pet page. In a real microsite, this could feature lovable pets, adoption stories, happy tails, or a suspiciously photogenic golden retriever named Cooper.",
},

"how-to-adopt": {
  title: "Demo How-To-Adopt",
  eyebrow: "Pet Adoption Demo",
  message:
    "You clicked the adoption guide. Normally this could walk visitors through the process, answer common questions, and gently prepare them for becoming emotionally attached to animals they just met online.",
},

facebook: {
  title: "Demo Facebook",
  eyebrow: "Resume Profile Demo",
  message:
    "You opened the Facebook link. In a real profile site, this could connect visitors to updates, networking, career highlights, family photos, or debates nobody asked for in the comments section.",
},

twitter: {
  title: "Demo Twitter",
  eyebrow: "Resume Profile Demo",
  message:
    "You clicked the Twitter page. This is where someone could share thoughts, updates, industry insights, breaking opinions, or a perfectly reasonable 2am rant about user interface spacing.",
},
"free-tutorial": {
  title: "Demo Free Tutorial",
  eyebrow: "Guided Tutorial Demo",
  message:
    "You opened the free tutorial page. In a real microsite, this could unlock walkthroughs, beginner lessons, downloadable guides, training videos, or that one ‘quick tutorial’ that somehow turns into a 47-minute masterclass.",
},
trailer: {
  title: "Demo Trailer",
  eyebrow: "Guided Tutorial Demo",
  message:
    "You opened the trailer page. Normally this could preview a course, introduce a program, showcase highlights, or dramatically convince visitors their life is about to change after pressing play.",
},
about: {
  title: "Demo About",
  eyebrow: "Creator Link Hub Demo",
  message:
    "You opened the about page. In a real creator hub, this could introduce the creator, share their story, explain their brand, list accomplishments, or include a carefully written paragraph pretending they accidentally became successful.",
},

portfolio: {
  title: "Demo Portfolio",
  eyebrow: "Creator Link Hub Demo",
  message:
    "You clicked the portfolio page. Normally this could showcase projects, designs, photography, client work, creative experiments, or screenshots arranged with suspiciously high confidence.",
},

github: {
  title: "Demo GitHub",
  eyebrow: "Creator Link Hub Demo",
  message:
    "You opened the GitHub destination. In a real microsite, this could feature repositories, open-source projects, developer experiments, side projects, or code written at 1:14am with complete emotional commitment.",
},

linkedin: {
  title: "Demo LinkedIn",
  eyebrow: "Creator Link Hub Demo",
  message:
    "You clicked the LinkedIn page. This is where someone could share career experience, achievements, networking information, endorsements, or a motivational post about leadership and coffee.",
},
myblog: {
  title: "Demo Blog",
  eyebrow: "Creator Link Hub Demo",
  message:
    "You opened the blog page. Normally this could feature articles, updates, tutorials, opinions, creator insights, or a post titled ‘Things I Wish I Knew Earlier’ written at midnight.",
},

emailme: {
  title: "Demo Email",
  eyebrow: "Creator Link Hub Demo",
  message:
    "You opened the email destination. In a real creator microsite, this could launch a contact form, newsletter signup, collaboration inquiry, support request, or a surprisingly aggressive automated welcome sequence.",
},

aboutliveevent: {
  title: "Demo About",
  eyebrow: "Live Event Demo",
  message:
    "You opened the about page. In a real event microsite, this could share event details, featured attractions, guest appearances, venue information, and several convincing reasons why visitors should clear their calendar.",
},

schedule: {
  title: "Demo Schedule",
  eyebrow: "Live Event Demo",
  message:
    "You clicked the schedule page. Normally this could display event times, performances, speakers, activities, opening ceremonies, and the exact moment everyone realizes they should have arrived earlier.",
},

contact: {
  title: "Demo Contact",
  eyebrow: "Live Event Demo",
  message:
    "You opened the contact page. In a real microsite, this could provide organizer information, support details, venue assistance, FAQs, or a way to ask questions that were probably already answered on the schedule page.",
},

"get-tickets": {
  title: "Demo Get Tickets",
  eyebrow: "Live Event Demo",
  message:
    "You clicked the ticket page. Normally this could offer admission options, VIP packages, early access passes, group discounts, and a countdown reminding everyone that prices never seem to go down.",
},

"explore-more": {
  title: "Demo Explore More",
  eyebrow: "Live Event Demo",
  message:
    "You opened the explore more page. In a real event microsite, this could highlight attractions, vendors, activities, sponsors, special exhibits, and all the extra reasons visitors end up staying longer than planned.",
},





};



export default async function CreatorLinkHubDemoPage({
  params,
}: {
  params: Promise<{ demoPage: string }>;
}) {
  const { demoPage } = await params;
  const page = DEMO_PAGES[demoPage];

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