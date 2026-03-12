"use client";

export default function FAQWidget({ block }: any) {
  const items = block.data?.items || [];

  return (
    <div className="space-y-4">
      {items.map((item: any, i: number) => (
        <details key={i} className="border rounded-lg p-3">
          <summary className="font-medium">{item.question}</summary>
          <div className="mt-2 text-sm text-neutral-600">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}