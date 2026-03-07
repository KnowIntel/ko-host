import type { MicrositeBlock } from "@/lib/templates/builder";
import Link from "next/link";

export default function BuilderBlocksRenderer({
  blocks,
}: {
  blocks: MicrositeBlock[];
}) {
  if (!blocks.length) return null;

  return (
    <div className="space-y-6">
      {blocks.map((block) => {
        if (block.type === "announcement") {
          return (
            <section key={block.id} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-neutral-900">
                {block.data.headline}
              </h2>
              {block.data.body ? (
                <p className="mt-3 whitespace-pre-wrap text-neutral-700">
                  {block.data.body}
                </p>
              ) : null}
            </section>
          );
        }

        if (block.type === "links") {
          return (
            <section key={block.id} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-neutral-900">
                {block.data.heading}
              </h3>
              <div className="mt-4 flex flex-col gap-3">
                {block.data.items.map((item) => (
                  <a
                    key={item.id}
                    href={item.url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-900 hover:border-neutral-900"
                  >
                    {item.label || item.url || "Untitled link"}
                  </a>
                ))}
              </div>
            </section>
          );
        }

        if (block.type === "contact") {
          return (
            <section key={block.id} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-neutral-900">
                {block.data.heading}
              </h3>
              <div className="mt-4 space-y-2 text-sm text-neutral-700">
                {block.data.name ? <div>Name: {block.data.name}</div> : null}
                {block.data.email ? <div>Email: {block.data.email}</div> : null}
                {block.data.phone ? <div>Phone: {block.data.phone}</div> : null}
              </div>
            </section>
          );
        }

        if (block.type === "gallery") {
          return (
            <section key={block.id} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-neutral-900">
                {block.data.heading}
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {block.data.items.map((item) => (
                  <div key={item.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
                    {item.url ? (
                      <img
                        src={item.url}
                        alt={item.caption || "Gallery image"}
                        className="h-56 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-56 items-center justify-center text-sm text-neutral-500">
                        No image URL
                      </div>
                    )}
                    {item.caption ? (
                      <div className="px-4 py-3 text-sm text-neutral-700">
                        {item.caption}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          );
        }

        if (block.type === "poll") {
          return (
            <section key={block.id} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-neutral-900">
                {block.data.question}
              </h3>
              <div className="mt-4 space-y-3">
                {block.data.options.map((option) => (
                  <div
                    key={option.id}
                    className="rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-800"
                  >
                    {option.text || "Untitled option"}
                  </div>
                ))}
              </div>
            </section>
          );
        }

        if (block.type === "rsvp") {
          return (
            <section key={block.id} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-neutral-900">
                {block.data.heading}
              </h3>
              <div className="mt-3 space-y-2 text-sm text-neutral-700">
                {block.data.eventDate ? <div>Event date: {block.data.eventDate}</div> : null}
                <div>Collect guest count: {block.data.collectGuestCount ? "Yes" : "No"}</div>
                <div>Collect meal choice: {block.data.collectMealChoice ? "Yes" : "No"}</div>
              </div>
            </section>
          );
        }

        if (block.type === "richText") {
          return (
            <section key={block.id} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-neutral-900">
                {block.data.heading}
              </h3>
              {block.data.body ? (
                <div className="mt-3 whitespace-pre-wrap text-neutral-700">
                  {block.data.body}
                </div>
              ) : null}
            </section>
          );
        }

        if (block.type === "faq") {
          return (
            <section key={block.id} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-neutral-900">
                {block.data.heading}
              </h3>
              <div className="mt-4 space-y-4">
                {block.data.items.map((item) => (
                  <div key={item.id} className="rounded-xl border border-neutral-200 p-4">
                    <div className="font-medium text-neutral-900">
                      {item.question || "Untitled question"}
                    </div>
                    <div className="mt-2 whitespace-pre-wrap text-sm text-neutral-700">
                      {item.answer}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        if (block.type === "countdown") {
          return (
            <section key={block.id} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-neutral-900">
                {block.data.heading}
              </h3>
              <div className="mt-3 text-sm text-neutral-700">
                Target: {block.data.targetIso || "Not set"}
              </div>
              <div className="mt-1 text-sm text-neutral-500">
                {block.data.completedMessage}
              </div>
            </section>
          );
        }

        if (block.type === "cta") {
          return (
            <section key={block.id} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-neutral-900">
                {block.data.heading}
              </h3>
              {block.data.body ? (
                <div className="mt-3 whitespace-pre-wrap text-neutral-700">
                  {block.data.body}
                </div>
              ) : null}
              <div className="mt-4">
                <a
                  href={block.data.buttonUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                >
                  {block.data.buttonText || "Learn more"}
                </a>
              </div>
            </section>
          );
        }

        return null;
      })}
    </div>
  );
}