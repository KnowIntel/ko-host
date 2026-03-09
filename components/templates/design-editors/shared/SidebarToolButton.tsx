"use client";

type SidebarToolButtonProps = {
  label: string;
  icon: string;
  onClick: () => void;
};

export default function SidebarToolButton({
  label,
  icon,
  onClick,
}: SidebarToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left transition hover:border-neutral-300 hover:bg-neutral-50"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-lg">
        {icon}
      </div>

      <div className="min-w-0">
        <div className="text-sm font-semibold text-neutral-900">{label}</div>
      </div>
    </button>
  );
}