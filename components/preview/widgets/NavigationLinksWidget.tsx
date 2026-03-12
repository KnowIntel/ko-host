"use client";

export default function NavigationLinksWidget({ block }: any) {
  const items = block.data?.items || [];

  return (
    <div className="flex flex-wrap gap-4">
      {items.map((l: any) => (
        <a
          key={l.id}
          href={l.url}
          className="underline text-blue-600"
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}