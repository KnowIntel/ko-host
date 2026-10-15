"use client";

import type { ProgressTrackerBlock as ProgressTrackerBlockType } from "@/lib/templates/builder";

type Props = {
  block: ProgressTrackerBlockType;
};

export default function ProgressTrackerBlock({ block }: Props) {
  const { title, measurements, rows } = block.data;
  const visible = measurements.filter((m) => m.visible);

  return (
    <div className="w-full rounded-xl p-4">
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="p-2 text-left">SET</th>
              {visible.map((m) => (
                <th key={m.id} className="p-2 text-center">
                  {m.label}
                  {m.unit ? ` (${m.unit})` : ""}
                </th>
              ))}
              <th className="p-2 text-center">✓</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="p-2">{row.label}</td>

                {visible.map((m) => (
                  <td key={m.id} className="p-2 text-center">
                    {row.targets[m.id] ?? "—"}
                  </td>
                ))}

                <td className="p-2 text-center">
                  <input type="checkbox" disabled />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}