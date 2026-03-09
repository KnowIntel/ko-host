"use client";

type CountdownPreviewProps = {
  targetIso?: string;
};

export default function CountdownPreview({
  targetIso,
}: CountdownPreviewProps) {
  const fallback = {
    days: "19",
    hours: "16",
    minutes: "04",
    seconds: "32",
  };

  if (!targetIso) {
    return (
      <div className="grid grid-cols-4 gap-3">
        {[
          ["Days", fallback.days],
          ["Hours", fallback.hours],
          ["Minutes", fallback.minutes],
          ["Seconds", fallback.seconds],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-md bg-[#b85d4f] px-4 py-3 text-center text-white shadow-sm"
          >
            <div className="text-[34px] font-bold leading-none">{value}</div>
            <div className="mt-2 text-[13px]">{label}</div>
          </div>
        ))}
      </div>
    );
  }

  const now = new Date().getTime();
  const target = new Date(targetIso).getTime();

  if (Number.isNaN(target) || target <= now) {
    return (
      <div className="grid grid-cols-4 gap-3">
        {["00", "00", "00", "00"].map((value, index) => (
          <div
            key={index}
            className="rounded-md bg-[#b85d4f] px-4 py-3 text-center text-white shadow-sm"
          >
            <div className="text-[34px] font-bold leading-none">{value}</div>
            <div className="mt-2 text-[13px]">
              {["Days", "Hours", "Minutes", "Seconds"][index]}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const diff = target - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const cells = [
    ["Days", String(days).padStart(2, "0")],
    ["Hours", String(hours).padStart(2, "0")],
    ["Minutes", String(minutes).padStart(2, "0")],
    ["Seconds", String(seconds).padStart(2, "0")],
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {cells.map(([label, value]) => (
        <div
          key={label}
          className="rounded-md bg-[#b85d4f] px-4 py-3 text-center text-white shadow-sm"
        >
          <div className="text-[34px] font-bold leading-none">{value}</div>
          <div className="mt-2 text-[13px]">{label}</div>
        </div>
      ))}
    </div>
  );
}