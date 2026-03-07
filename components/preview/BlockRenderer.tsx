"use client";

import { getDesignPreset, type DesignPresetKey } from "@/lib/design-presets/designRegistry";
import type { MicrositeBlock } from "@/lib/templates/builder";

function getBlockStyles(designKey?: string) {
  const design = getDesignPreset(designKey);

  const isElegant = design.key === "elegant";
  const isGallery = design.key === "gallery";
  const isStartup = design.key === "startup";
  const isPortfolio = design.key === "portfolio";
  const isEvent = design.key === "event";
  const isFundraiser = design.key === "fundraiser";
  const isCommunity = design.key === "community";
  const isProduct = design.key === "product";
  const isMinimal = design.key === "minimal";

  return {
    title: [
      "tracking-tight text-neutral-900",
      isElegant
        ? "text-2xl font-semibold text-stone-900 text-center"
        : isStartup || isProduct
          ? "text-2xl font-bold text-neutral-950"
          : isPortfolio
            ? "text-xl font-bold text-neutral-950"
            : isEvent
              ? "text-xl font-semibold text-neutral-950"
              : "text-lg font-semibold text-neutral-900",
    ].join(" "),
    body: [
      "text-sm leading-7",
      isElegant
        ? "text-stone-600"
        : isFundraiser
          ? "text-amber-900/75"
          : isCommunity
            ? "text-sky-900/75"
            : "text-neutral-600",
    ].join(" "),
    link: [
      "text-sm font-medium underline underline-offset-2",
      isElegant
        ? "text-stone-700"
        : isFundraiser
          ? "text-amber-700"
          : isCommunity
            ? "text-sky-700"
            : isProduct
              ? "text-rose-700"
              : isPortfolio
                ? "text-violet-700"
                : isStartup
                  ? "text-blue-700"
                  : "text-blue-600",
    ].join(" "),
    input:
      "rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700",
    softCard: [
      "rounded-2xl border px-4 py-4",
      isElegant
        ? "border-stone-200 bg-stone-50/70"
        : isFundraiser
          ? "border-amber-200 bg-amber-50/60"
          : isCommunity
            ? "border-sky-200 bg-sky-50/60"
            : "border-neutral-200 bg-neutral-50",
    ].join(" "),
    ctaButton: [
      "rounded-xl px-4 py-2 text-sm font-medium text-white",
      isElegant
        ? "bg-stone-800"
        : isFundraiser
          ? "bg-amber-700"
          : isCommunity
            ? "bg-sky-700"
            : isProduct
              ? "bg-rose-700"
              : isPortfolio
                ? "bg-violet-700"
                : isStartup
                  ? "bg-blue-700"
                  : "bg-neutral-900",
    ].join(" "),
    galleryGrid:
      isGallery || isProduct
        ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
        : "grid grid-cols-2 gap-3 sm:grid-cols-3",
    galleryImageHeight:
      isGallery || isProduct ? "h-44" : "h-28",
    centeredHero: isElegant || isEvent || isStartup || isProduct,
    announcementWrap:
      isElegant || isEvent || isStartup || isProduct
        ? "space-y-3 text-center"
        : "space-y-3",
    richTextWrap:
      isMinimal
        ? "space-y-2"
        : isElegant
          ? "space-y-3 text-center"
          : "space-y-3",
  };
}

function AnnouncementBlock({
  data,
  designKey,
}: {
  data: any;
  designKey?: string;
}) {
  const s = getBlockStyles(designKey);

  return (
    <section className={s.announcementWrap}>
      <h2 className={s.title}>{data?.headline || "Announcement"}</h2>
      <p className={s.body}>{data?.body || ""}</p>
    </section>
  );
}

function LinksBlock({
  data,
  designKey,
}: {
  data: any;
  designKey?: string;
}) {
  const s = getBlockStyles(designKey);

  return (
    <section className="space-y-3">
      <h3 className={s.title}>{data?.heading || "Links"}</h3>

      {(data?.items || []).length ? (
        <ul className="space-y-2">
          {(data?.items || []).map((item: any) => (
            <li key={item.id || `${item.label}-${item.url}`}>
              <a href={item.url || "#"} className={s.link}>
                {item.label || item.url || "Untitled Link"}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className={s.softCard}>
          <div className={s.body}>No links added yet.</div>
        </div>
      )}
    </section>
  );
}

function ContactBlock({
  data,
  designKey,
}: {
  data: any;
  designKey?: string;
}) {
  const s = getBlockStyles(designKey);

  return (
    <section className="space-y-3">
      <h3 className={s.title}>{data?.heading || "Contact"}</h3>
      <div className={s.softCard}>
        <div className="space-y-1 text-sm text-neutral-700">
          {data?.name ? <div>{data.name}</div> : <div className="text-neutral-400">Name</div>}
          {data?.email ? <div>{data.email}</div> : <div className="text-neutral-400">Email</div>}
          {data?.phone ? <div>{data.phone}</div> : <div className="text-neutral-400">Phone</div>}
        </div>
      </div>
    </section>
  );
}

function GalleryBlock({
  data,
  designKey,
}: {
  data: any;
  designKey?: string;
}) {
  const s = getBlockStyles(designKey);
  const items = data?.items || [];

  return (
    <section className="space-y-3">
      <h3 className={s.title}>{data?.heading || "Gallery"}</h3>

      {items.length ? (
        <div className={s.galleryGrid}>
          {items.map((item: any) => (
            <div
              key={item.id || item.url}
              className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100"
            >
              {item.url ? (
                <img
                  src={item.url}
                  alt={item.caption || "Gallery image"}
                  className={`${s.galleryImageHeight} w-full object-cover`}
                />
              ) : (
                <div className={`flex ${s.galleryImageHeight} items-center justify-center text-xs text-neutral-400`}>
                  No image URL
                </div>
              )}
              {item.caption ? (
                <div className="px-3 py-2 text-xs text-neutral-600">
                  {item.caption}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className={s.softCard}>
          <div className={s.body}>No gallery images yet.</div>
        </div>
      )}
    </section>
  );
}

function PollBlock({
  data,
  designKey,
}: {
  data: any;
  designKey?: string;
}) {
  const s = getBlockStyles(designKey);

  return (
    <section className="space-y-3">
      <h3 className={s.title}>{data?.question || "Poll"}</h3>

      <div className="space-y-2">
        {(data?.options || []).length ? (
          (data?.options || []).map((option: any) => (
            <label
              key={option.id || option.text}
              className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700"
            >
              <input type="checkbox" disabled />
              <span>{option.text || "Option"}</span>
            </label>
          ))
        ) : (
          <div className={s.softCard}>
            <div className={s.body}>No poll options yet.</div>
          </div>
        )}
      </div>
    </section>
  );
}

function RsvpBlock({
  data,
  designKey,
}: {
  data: any;
  designKey?: string;
}) {
  const s = getBlockStyles(designKey);

  return (
    <section className="space-y-3">
      <h3 className={s.title}>{data?.heading || "RSVP"}</h3>

      <div className="grid gap-3">
        <input disabled placeholder="Your name" className={s.input} />
        <input disabled placeholder="Email" className={s.input} />
        {data?.collectGuestCount ? (
          <input disabled placeholder="Guest count" className={s.input} />
        ) : null}
        {data?.collectMealChoice ? (
          <input disabled placeholder="Meal choice" className={s.input} />
        ) : null}
        <textarea
          disabled
          placeholder={data?.notesPlaceholder || "Notes"}
          className="min-h-[90px] rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700"
        />
        <button type="button" disabled className={`${s.ctaButton} opacity-85`}>
          Submit RSVP
        </button>
      </div>
    </section>
  );
}

function RichTextBlock({
  data,
  designKey,
}: {
  data: any;
  designKey?: string;
}) {
  const s = getBlockStyles(designKey);

  return (
    <section className={s.richTextWrap}>
      <h3 className={s.title}>{data?.heading || "Section"}</h3>
      <p className={`whitespace-pre-wrap ${s.body}`}>{data?.body || ""}</p>
    </section>
  );
}

function FaqBlock({
  data,
  designKey,
}: {
  data: any;
  designKey?: string;
}) {
  const s = getBlockStyles(designKey);

  return (
    <section className="space-y-3">
      <h3 className={s.title}>{data?.heading || "FAQ"}</h3>

      <div className="space-y-2">
        {(data?.items || []).length ? (
          (data?.items || []).map((item: any) => (
            <div
              key={item.id || item.question}
              className="rounded-xl border border-neutral-200 p-3"
            >
              <div className="text-sm font-semibold text-neutral-900">
                {item.question || "Question"}
              </div>
              <div className="mt-1 text-sm text-neutral-600">
                {item.answer || ""}
              </div>
            </div>
          ))
        ) : (
          <div className={s.softCard}>
            <div className={s.body}>No FAQ items yet.</div>
          </div>
        )}
      </div>
    </section>
  );
}

function CountdownBlock({
  data,
  designKey,
}: {
  data: any;
  designKey?: string;
}) {
  const s = getBlockStyles(designKey);

  return (
    <section className="space-y-3 text-center">
      <h3 className={s.title}>{data?.heading || "Countdown"}</h3>
      <div className={s.softCard}>
        <div className="text-2xl font-bold tracking-tight text-neutral-900">
          00 : 00 : 00
        </div>
        <div className="mt-2 text-xs text-neutral-500">
          {data?.targetIso || "No target date set"}
        </div>
      </div>
    </section>
  );
}

function CtaBlock({
  data,
  designKey,
}: {
  data: any;
  designKey?: string;
}) {
  const s = getBlockStyles(designKey);

  return (
    <section className={s.centeredHero ? "space-y-3 text-center" : "space-y-3"}>
      <h3 className={s.title}>{data?.heading || "Call To Action"}</h3>
      <p className={s.body}>{data?.body || ""}</p>
      <button type="button" className={s.ctaButton}>
        {data?.buttonText || "Learn More"}
      </button>
    </section>
  );
}

export default function BlockRenderer({
  block,
  designKey = "blank",
}: {
  block: MicrositeBlock;
  designKey?: string;
}) {
  switch (block.type) {
    case "announcement":
      return <AnnouncementBlock data={block.data} designKey={designKey} />;
    case "links":
      return <LinksBlock data={block.data} designKey={designKey} />;
    case "contact":
      return <ContactBlock data={block.data} designKey={designKey} />;
    case "gallery":
      return <GalleryBlock data={block.data} designKey={designKey} />;
    case "poll":
      return <PollBlock data={block.data} designKey={designKey} />;
    case "rsvp":
      return <RsvpBlock data={block.data} designKey={designKey} />;
    case "richText":
      return <RichTextBlock data={block.data} designKey={designKey} />;
    case "faq":
      return <FaqBlock data={block.data} designKey={designKey} />;
    case "countdown":
      return <CountdownBlock data={block.data} designKey={designKey} />;
    case "cta":
      return <CtaBlock data={block.data} designKey={designKey} />;
    default:
      return null;
  }
}