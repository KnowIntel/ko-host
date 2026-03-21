"use client";

type InspectorPanelProps = {
  children?: React.ReactNode;
  inspectorCollapsed: boolean;
  onToggleCollapsed: () => void;
};

export default function InspectorPanel(props: InspectorPanelProps) {
  const { children, inspectorCollapsed, onToggleCollapsed } = props;

  return (
    <>
      <button
        type="button"
        className="fixed right-0 top-24 z-[65] flex h-16 w-7 items-center justify-center rounded-l-xl border border-r-0 border-neutral-300 bg-white text-neutral-600 shadow-sm transition hover:bg-neutral-50"
        onClick={onToggleCollapsed}
        title={inspectorCollapsed ? "Expand inspector" : "Collapse inspector"}
      >
        {inspectorCollapsed ? "◀" : "▶"}
      </button>

      {!inspectorCollapsed ? (
        <div className="h-[calc(100vh-185px)] overflow-y-auto pr-2">
          <div className="space-y-4">{children}</div>
        </div>
      ) : null}
    </>
  );
}