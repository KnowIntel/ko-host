export type DesignPreset = {
  key: string;
  label: string;
};

export const PRESETS: DesignPreset[] = [
  { key: "blank", label: "Blank Design" },
  { key: "minimal", label: "Minimal Design" },
  { key: "elegant", label: "Elegant Design" },
  { key: "launch", label: "Startup Launch Design" },
  { key: "gallery", label: "Gallery Design" },
  { key: "portfolio", label: "Portfolio Design" },
];