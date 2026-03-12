import type { BuilderDraft, MicrositeBlock } from "@/lib/templates/builder";

export type DesignPresetLayout =
  | "blank"
  | "modern"
  | "showcase"
  | "festive"
  | "elegant"
  | "business";

export type DraftVisualFields = {
  backgroundImageUrl?: string | null;
  pageColor?: string | null;
};

export type BuilderDraftWithVisuals = BuilderDraft & DraftVisualFields;

export type DesignPreset = {
  id: DesignPresetLayout;
  label: string;
  layout: "grid" | "free";
  defaultBlocks: MicrositeBlock[];
  styleTheme: {
    pageColor: string;
    backgroundImageUrl?: string | null;
  };
  gridRules: {
    gridStep: number;
    allowOverlap: boolean;
    allowHalfStep: boolean;
  };
};

export const designPresets: Record<DesignPresetLayout, DesignPreset> = {
  blank: {
    id: "blank",
    label: "Blank Design",
    layout: "grid",
    defaultBlocks: [],
    styleTheme: {
      pageColor: "#ffffff",
      backgroundImageUrl: null,
    },
    gridRules: {
      gridStep: 1,
      allowOverlap: false,
      allowHalfStep: false,
    },
  },

  modern: {
    id: "modern",
    label: "Modern Design",
    layout: "free",
    defaultBlocks: [],
    styleTheme: {
      pageColor: "#0f1115",
      backgroundImageUrl: null,
    },
    gridRules: {
      gridStep: 1,
      allowOverlap: true,
      allowHalfStep: true,
    },
  },

  showcase: {
    id: "showcase",
    label: "Showcase Design",
    layout: "grid",
    defaultBlocks: [],
    styleTheme: {
      pageColor: "#ffffff",
      backgroundImageUrl: null,
    },
    gridRules: {
      gridStep: 1,
      allowOverlap: false,
      allowHalfStep: false,
    },
  },

  festive: {
    id: "festive",
    label: "Festive Design",
    layout: "grid",
    defaultBlocks: [],
    styleTheme: {
      pageColor: "#fff6f6",
      backgroundImageUrl: null,
    },
    gridRules: {
      gridStep: 1,
      allowOverlap: false,
      allowHalfStep: false,
    },
  },

  elegant: {
    id: "elegant",
    label: "Elegant Design",
    layout: "grid",
    defaultBlocks: [],
    styleTheme: {
      pageColor: "#faf7f2",
      backgroundImageUrl: null,
    },
    gridRules: {
      gridStep: 1,
      allowOverlap: false,
      allowHalfStep: false,
    },
  },

  business: {
    id: "business",
    label: "Business Design",
    layout: "grid",
    defaultBlocks: [],
    styleTheme: {
      pageColor: "#ffffff",
      backgroundImageUrl: null,
    },
    gridRules: {
      gridStep: 1,
      allowOverlap: false,
      allowHalfStep: false,
    },
  },
};

export function createDraftFromPreset(
  preset: DesignPreset,
): BuilderDraftWithVisuals {
  return {
    title: "",
    subtitle: "",
    subtext: "",
    slugSuggestion: "",
    blocks: [...preset.defaultBlocks],
    backgroundImageUrl: preset.styleTheme.backgroundImageUrl ?? null,
    pageColor: preset.styleTheme.pageColor,
  };
}