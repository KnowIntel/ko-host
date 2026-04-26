// drafts/birthday/grown.draft.ts

import type { BuilderDraft } from "@/lib/templates/builder";

type DraftWithPageExtras = BuilderDraft & {
  pageColor?: string;
  pageBackgroundImage?: string;
  pageBackgroundImageFit?: "clip" | "zoom" | "stretch";
  pageBlockAppearance?: Record<string, unknown>;
  pageLength?: string;
};

type DraftPage = DraftWithPageExtras & {
  id: string;
  slug: string;
  title: string;
  display_order: number;
};

type DraftWithPages = DraftWithPageExtras & {
  pages: DraftPage[];
};

const birthdayGrownHomePage = {
  ...({
  "slugSuggestion": "birthday",
  "title": "BIRTHDAY\nCELEBRATION",
  "subtitle": "Halo Edwards",
  "subtext": "",
  "description": "",
  "pageBackground": "",
  "blocks": [
    {
      "id": "image_jyhw8v0q",
      "type": "image",
      "label": "Image",
      "grid": {
        "colStart": 1,
        "rowStart": 1,
        "colSpan": 12,
        "rowSpan": 11.25,
        "zIndex": 1
      },
      "appearance": {
        "backgroundColor": "transparent",
        "borderColor": "#D1D5DB",
        "borderWidth": 0,
        "borderRadius": 16
      },
      "data": {
        "image": {
          "id": "img_vkkokaxq",
          "url": "https://koxykctwdpvmfwyzxgxt.supabase.co/storage/v1/object/public/uploads/1777174750343-fwedhhvtj6h.webp",
          "fitMode": "zoom",
          "frame": "square",
          "positionX": 50,
          "positionY": 50,
          "zoom": 1,
          "rotation": 0,
          "opacity": 1,
          "fade": {
            "top": false,
            "bottom": true,
            "left": false,
            "right": false,
            "size": 10
          }
        }
      }
    },
    {
      "id": "textfx_arm9kzj6",
      "type": "text_fx",
      "label": "TextFX",
      "grid": {
        "colStart": 1,
        "rowStart": 1.5,
        "colSpan": 12,
        "rowSpan": 3.75,
        "zIndex": 4
      },
      "data": {
        "text": "JOIN US FOR A",
        "style": {
          "fontFamily": "Georgia",
          "fontSize": 60,
          "bold": false,
          "italic": false,
          "underline": false,
          "strike": false,
          "align": "center",
          "color": "#fefafb"
        },
        "fx": {
          "mode": "circle",
          "intensity": 87,
          "rotation": -90,
          "opacity": 1
        }
      },
      "appearance": {
        "backgroundColor": "transparent",
        "borderColor": "#000000",
        "borderWidth": 0,
        "borderRadius": 0
      }
    },
    {
      "id": "label_2v6rdvfr",
      "type": "label",
      "label": "Label",
      "grid": {
        "colStart": 1,
        "rowStart": 5,
        "colSpan": 12,
        "rowSpan": 1,
        "zIndex": 5
      },
      "appearance": {
        "backgroundColor": "transparent",
        "borderColor": "#D1D5DB",
        "borderWidth": 0,
        "borderRadius": 16
      },
      "data": {
        "text": "DINNER FOR",
        "style": {
          "fontFamily": "Georgia",
          "fontSize": 50,
          "bold": false,
          "italic": false,
          "underline": false,
          "strike": false,
          "align": "center",
          "color": "#f9efef"
        }
      }
    },
    {
      "id": "cta_itutdvwu",
      "type": "cta",
      "label": "Button",
      "grid": {
        "colStart": 1,
        "rowStart": 7.5,
        "colSpan": 12,
        "rowSpan": 1.25,
        "zIndex": 7
      },
      "appearance": {
        "backgroundColor": "transparent",
        "borderColor": "#D1D5DB",
        "borderWidth": 10,
        "borderRadius": 100
      },
      "data": {
        "heading": "",
        "body": "",
        "buttonText": "  RSVP  ",
        "buttonUrl": "/s/preset/birthday/grown/rsvp",
        "style": {
          "fontFamily": "Inter",
          "fontSize": 40,
          "bold": false,
          "italic": false,
          "underline": false,
          "strike": false,
          "align": "center",
          "color": "#fef7f7"
        },
        "styleType": "soft"
      }
    },
    {
      "id": "label_7qdget4g",
      "type": "label",
      "label": "Label",
      "grid": {
        "colStart": 1,
        "rowStart": 9.25,
        "colSpan": 12,
        "rowSpan": 1.75,
        "zIndex": 8
      },
      "appearance": {
        "backgroundColor": "transparent",
        "borderColor": "#D1D5DB",
        "borderWidth": 0,
        "borderRadius": 16
      },
      "data": {
        "text": "SATURDAY, DECEMBER 6, 2025 @ 10:00 PM\nDASHIKI 'N' DENIM PALACE",
        "style": {
          "fontFamily": "Bodoni Moda",
          "fontSize": 50,
          "bold": false,
          "italic": false,
          "underline": false,
          "strike": false,
          "align": "center",
          "color": "#d5bcbe"
        }
      }
    }
  ],
  "pageElements": {
    "title": {
      "colStart": 1,
      "rowStart": 2.25,
      "colSpan": 12,
      "rowSpan": 3,
      "zIndex": 3
    },
    "subtitle": {
      "colStart": 1,
      "rowStart": 5.5,
      "colSpan": 12,
      "rowSpan": 2,
      "zIndex": 6
    },
    "subtext": {
      "colStart": 2,
      "rowStart": 4,
      "colSpan": 6,
      "rowSpan": 1,
      "zIndex": 3
    },
    "description": {
      "colStart": 2,
      "rowStart": 5,
      "colSpan": 8,
      "rowSpan": 2,
      "zIndex": 4
    }
  },
  "pageColor": "#000000",
  "pageVisibility": {
    "title": true,
    "subtitle": true
  },
  "titleStyle": {
    "fontFamily": "Marcellus",
    "fontSize": 120,
    "bold": false,
    "italic": false,
    "underline": false,
    "strike": false,
    "align": "center",
    "color": "#fefdfe"
  },
  "subtitleStyle": {
    "fontFamily": "Great Vibes",
    "fontSize": 160,
    "bold": false,
    "italic": false,
    "underline": false,
    "strike": false,
    "align": "center",
    "color": "#faf2f3"
  }
}),
  id: "home",
  slug: "home",
  title: "BIRTHDAY\nCELEBRATION",
  display_order: 0,
} satisfies DraftPage;

const birthdayGrownRsvpPage = {
  ...({
  "slugSuggestion": "birthday",
  "title": "rsvp",
  "subtitle": "",
  "subtext": "",
  "description": "",
  "pageBackground": "",
  "blocks": [
    {
      "id": "image_jyhw8v0q",
      "type": "image",
      "label": "Image",
      "grid": {
        "colStart": 1,
        "rowStart": 1,
        "colSpan": 12,
        "rowSpan": 9,
        "zIndex": 1
      },
      "appearance": {
        "backgroundColor": "transparent",
        "borderColor": "#D1D5DB",
        "borderWidth": 0,
        "borderRadius": 16
      },
      "data": {
        "image": {
          "id": "img_vkkokaxq",
          "url": "https://koxykctwdpvmfwyzxgxt.supabase.co/storage/v1/object/public/uploads/1777174750343-fwedhhvtj6h.webp",
          "fitMode": "zoom",
          "frame": "square",
          "positionX": 50,
          "positionY": 50,
          "zoom": 1,
          "rotation": 0,
          "opacity": 1,
          "fade": {
            "top": false,
            "bottom": true,
            "left": false,
            "right": false,
            "size": 10
          }
        }
      }
    },
    {
      "id": "rsvp_zf9j9qmz",
      "type": "rsvp",
      "label": "RSVP",
      "grid": {
        "colStart": 1,
        "rowStart": 1.75,
        "colSpan": 12,
        "rowSpan": 7.5,
        "zIndex": 2
      },
      "appearance": {
        "backgroundColor": "transparent",
        "borderColor": "#D1D5DB",
        "borderWidth": 0,
        "borderRadius": 16
      },
      "data": {
        "heading": "RSVP",
        "imageUrl": "",
        "imageFrameShape": "circle",
        "elementOrder": [
          "image",
          "heading",
          "nameLabel",
          "firstName",
          "lastName",
          "email",
          "address",
          "attending",
          "meal",
          "guestToggle",
          "guestCount",
          "guestName",
          "comments"
        ],
        "hiddenElements": [],
        "guestMin": 0,
        "guestMax": 1,
        "attendingLabel": "Are you attending?",
        "attendingOptions": [
          "Yes",
          "No"
        ],
        "attendingDisplay": true,
        "attendingDefaultValue": "Yes",
        "mealLabel": "Your meal selection:",
        "mealOptions": [
          "Chicken",
          "Salmon"
        ],
        "mealDisplay": true,
        "mealDefaultValue": "Chicken",
        "guestLabel": "Are you bringing a guest?",
        "guestOptions": [
          "Yes",
          "No"
        ],
        "guestDisplay": true,
        "guestDefaultValue": "No",
        "commentsLabel": "Additional comments",
        "commentsPlaceholder": "Additional comments",
        "commentsDisplay": true,
        "commentsDefaultValue": "",
        "submitButtonText": "Submit RSVP",
        "elementStyles": {
          "attending": {
            "textStyle": {
              "color": "#ffffff"
            }
          },
          "meal": {
            "textStyle": {
              "color": "#ffffff"
            }
          },
          "guestToggle": {
            "textStyle": {
              "color": "#ffffff"
            }
          },
          "guestCount": {
            "textStyle": {
              "color": "#ffffff"
            }
          },
          "comments": {
            "textStyle": {
              "color": "#ffffff"
            }
          },
          "heading": {
            "textStyle": {
              "color": "#ffffff",
              "fontSize": 68,
              "align": "center",
              "fontFamily": "Marcellus"
            }
          },
          "nameLabel": {
            "textStyle": {
              "color": "#ffffff"
            }
          }
        },
        "style": {
          "fontFamily": "inherit",
          "fontSize": 16,
          "bold": false,
          "italic": false,
          "underline": false,
          "strike": false,
          "align": "left",
          "color": "#111827"
        }
      }
    }
  ],
  "pageElements": {
    "title": {
      "colStart": 2,
      "rowStart": 1,
      "colSpan": 8,
      "rowSpan": 2,
      "zIndex": 1
    },
    "subtitle": {
      "colStart": 2,
      "rowStart": 3,
      "colSpan": 7,
      "rowSpan": 1,
      "zIndex": 2
    },
    "subtext": {
      "colStart": 2,
      "rowStart": 4,
      "colSpan": 6,
      "rowSpan": 1,
      "zIndex": 3
    },
    "description": {
      "colStart": 2,
      "rowStart": 5,
      "colSpan": 8,
      "rowSpan": 2,
      "zIndex": 4
    }
  },
  "pageColor": "#000000"
}),
  id: "page-rsvp",
  slug: "rsvp",
  title: "RSVP",
  display_order: 1,
} satisfies DraftPage;

export const birthdayGrownPages = [
  birthdayGrownHomePage,
  birthdayGrownRsvpPage,
];

const birthdayGrownDraft = {
  ...birthdayGrownHomePage,
  pages: birthdayGrownPages,
} satisfies DraftWithPages;

export default {
  ...birthdayGrownDraft,
  pages: birthdayGrownPages,
};
