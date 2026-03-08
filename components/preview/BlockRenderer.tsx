"use client";

import { getDesignPreset } from "@/lib/design-presets/designRegistry";
import type { MicrositeBlock } from "@/lib/templates/builder";

function getBlockStyles(designKey?: string) {
  const design = getDesignPreset(designKey);
  const theme = design.theme;

  const isElegant = design.key === "elegant";
  const isGallery = design.key === "gallery";
  const isMinimal = design.key === "minimal";
  const isModern = design.key === "modern";
  const isClassic = design.key === "classic";

  return {
    title: [
      theme.subheadingClassName,
      isModern ? "text-2xl" : "",
      isElegant || isClassic ? "text-center" : "",
    ]
      .filter(Boolean)
      .join(" "),
    announcementTitle: [
      theme.headingClassName,
      isMinimal ? "text-3xl" : "",
      isElegant || isClassic ? "text-center" : "",
    ]
      .filter(Boolean)
      .join(" "),
    body: theme.bodyClassName,
    muted: theme.mutedTextClassName,
    link: theme.linkClassName,
    input: theme.inputClassName,
    softCard: [theme.softSurfaceClassName, "px-4 py-4", isModern ? "shadow-sm" : ""]
      .filter(Boolean)
      .join(" "),
    ctaButton: theme.buttonClassName,
    galleryGrid:
      isGallery || isModern
        ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
        : "grid grid-cols-2 gap-3 sm:grid-cols-3",
    galleryImageHeight: isGallery || isModern ? "h-44" : "h-28",
    centeredHero: isElegant || isModern || isClassic,
    announcementWrap:
      isElegant || isModern || isClassic ? "space-y-3 text-center" : "space-y-3",
    richTextWrap:
      isMinimal
        ? "space-y-2"
        : isElegant || isClassic
          ? "space-y-3 text-center"
          : "space-y-3",
    faqItemClassName: [
      "rounded-xl border p-3",
      isElegant || isClassic
        ? "border-stone-200 bg-white/80"
        : isModern
          ? "border-slate-200 bg-slate-50/60"
          : "border-neutral-200 bg-white",
    ].join(" "),
    pollItemClassName: [
      "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm",
      isElegant || isClassic
        ? "border-stone-200 text-stone-800"
        : isModern
          ? "border-slate-200 text-slate-900"
          : "border-neutral-200 text-neutral-700",
    ].join(" "),
    galleryCardClassName: [
      "overflow-hidden border bg-neutral-100",
      theme.cardRadiusClassName,
      isElegant || isClassic
        ? "border-stone-200"
        : isModern
          ? "border-slate-200"
          : "border-neutral-200",
    ].join(" "),
    textareaClassName: ["min-h-[90px]", theme.inputClassName].join(" "),
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
      <h2 className={s.announcementTitle}>{data?.headline || "Announcement"}</h2>
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
        <div className={`space-y-1 text-sm ${s.body}`}>
          {data?.name ? <div>{data.name}</div> : <div className={s.muted}>Name</div>}
          {data?.email ? <div>{data.email}</div> : <div className={s.muted}>Email</div>}
          {data?.phone ? <div>{data.phone}</div> : <div className={s.muted}>Phone</div>}
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
            <div key={item.id || item.url} className={s.galleryCardClassName}>
              {item.url ? (
                <img
                  src={item.url}
                  alt={item.caption || "Gallery image"}
                  className={`${s.galleryImageHeight} w-full object-cover`}
                />
              ) : (
                <div
                  className={`flex ${s.galleryImageHeight} items-center justify-center text-xs ${s.muted}`}
                >
                  No image URL
                </div>
              )}
              {item.caption ? (
                <div className={`px-3 py-2 text-xs ${s.body}`}>{item.caption}</div>
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
            <label key={option.id || option.text} className={s.pollItemClassName}>
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
          className={s.textareaClassName}
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
            <div key={item.id || item.question} className={s.faqItemClassName}>
              <div className="text-sm font-semibold text-neutral-900">
                {item.question || "Question"}
              </div>
              <div className={`mt-1 text-sm ${s.body}`}>{item.answer || ""}</div>
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
        <div className={`mt-2 text-xs ${s.muted}`}>
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