import { BuilderDraft } from "@/lib/templates/builder";

export function createHolidayShopDraft(): BuilderDraft {
  return {
    title: "Holiday Storefront",
    slugSuggestion: "",
    pageBackground: "none",
    blocks: [
      {
        id: "hero_sale",
        type: "announcement",
        label: "Hero Banner",
        data: {
          headline: "20% Off",
          body: "Any single clothing item. Shop now.",
        },
      },

      {
        id: "nav_links",
        type: "links",
        label: "Category Nav",
        data: {
          heading: "",
          items: [
            { id: "1", label: "Holiday gifts", url: "#" },
            { id: "2", label: "Wrapping gifts", url: "#" },
            { id: "3", label: "Decorating gifts", url: "#" },
            { id: "4", label: "Costume gifts", url: "#" },
            { id: "5", label: "Impression gifts", url: "#" },
          ],
        },
      },

      {
        id: "products",
        type: "gallery",
        label: "Products",
        data: {
          heading: "New products",
          items: Array.from({ length: 8 }).map((_, i) => ({
            id: `p${i}`,
            url: "/templates/placeholder.webp",
            caption: "Holiday item",
          })),
        },
      },

      {
        id: "footer",
        type: "richText",
        label: "Footer",
        data: {
          heading: "",
          body: `
Information
Specials
Site map
Advanced search

Customer Service
Contact us
Returns
Privacy

My Account
Orders
Addresses
Wish list
`,
        },
      },
    ],
  };
}