import { createLayoutPreset } from "../../shared";

export default createLayoutPreset({
  designKey: "modern",

  label: "modern",
  description: "Sleek contemporary layout",
  thumbnail: "/designs/design_wedding-modern.webp",

  recommended: false,

  /* =======================================================
     PAGE SETTINGS
  ======================================================= */

  // pageColor: "#ffffff",

  /* =======================================================
     PRIMARY TEXT BLOCKS
     Use the built-in page text slots first.
     For any extra text beyond these, use optionalBlocks with type: "label".
  ======================================================= */
/* 
  title: {
    text: "Lucy & Ricky",
    placement: { x: 3, y: 2.6, width: 8, height: 2, zIndex: 10 },
    style: {
      fontFamily: "Great Vibes",
      fontSize: 200,
      align: "center",
      bold: false,
      color: "#646462",
    },
  },
 */
/* 
  subtitle: {
    text: "ARE GETTING MARRIED",
    placement: { x: 3, y: 4.3, width: 8, height: 1, zIndex: 11 },
    style: {
      fontFamily: "Cormorant Garamond",
      fontSize: 60,
      align: "center",
      color: "#374151",
    },
  },
 */
/* 
  subtitleSecondary: {
    text: "November 30, 1940",
    placement: { x: 3, y: 5, width: 8, height: 1, zIndex: 12 },
    style: {
      fontFamily: "Cormorant Garamond",
      fontSize: 106,
      italic: true,
      bold: true,
      align: "center",
      color: "#374151",
    },
  },

  tagline: {
    text: "Kindly RSVP",
    placement: { x: 4.4, y: 6.4, width: 5, height: 1, zIndex: 13 },
    style: {
      fontFamily: "Great Vibes",
      fontSize: 110,
      align: "center",
      color: "#646462",
    },
  }, */
/* 
  taglineSecondary: {
    text: "We can't wait to celebrate with you!",
    placement: { x: 2.9, y: 11.8, width: 8, height: 1, zIndex: 14 },
    style: {
      fontFamily: "Great Vibes",
      fontSize: 94,
      align: "center",
      color: "#000000",
    },
  },
 */
  /* =======================================================
     OPTIONAL BLOCKS
     Use these for extra text lines, shapes, images, etc.
  ======================================================= */

  optionalBlocks: [
    /* -------------------------------------------------------
       DECORATIVE IMAGE / PLAQUE
    ------------------------------------------------------- */
    
    {
      type: "image",
      placement: { x: 4.7, y: 2.7, width: 5, height: 10, zIndex: 1 },
      config: {
        src: "/designs/artifacts/bride_groom1.png",
        fit: "cover",
        frame: "square",
        zoom: 1,
        rotation: 0,
      },
    },

    /* -------------------------------------------------------
       DECORATIVE LINES
    ------------------------------------------------------- */
    /* 
    {
      type: "shape",
      placement: { x: 3, y: 4, width: 2, height: 1, zIndex: 2 },
      config: {
        shapeType: "line",
        borderColor: "#DDD8D2",
        borderWidth: 8,
      },
    },

    {
      type: "shape",
      placement: { x: 9, y: 4, width: 2, height: 1, zIndex: 2 },
      config: {
        shapeType: "line",
        borderColor: "#DDD8D2",
        borderWidth: 8,
      },
    },
 */
    /* -------------------------------------------------------
       EXTRA TEXT LINES
       Use label blocks whenever you need more text than the
       built-in page text fields allow.
    ------------------------------------------------------- */
    /* 
    {
      type: "label",
      placement: { x: 2.6, y: 7.8, width: 4, height: 1, zIndex: 15 },
      config: {
        label: "Accepts Line",
        text: "Accepts with Pleasure",
        style: {
          fontFamily: "Georgia",
          fontSize: 40,
          italic: true,
          align: "center",
          color: "#61605F",
        },
      },
    },

    {
      type: "label",
      placement: { x: 7.25, y: 7.8, width: 4, height: 1, zIndex: 16 },
      config: {
        label: "Declines Line",
        text: "Declines with Regret",
        style: {
          fontFamily: "Georgia",
          fontSize: 40,
          italic: true,
          align: "center",
          color: "#61605F",
        },
      },
    },
 */
    
    {
      type: "label",
      placement: { x: 1.0, y: 10.8, width: 12, height: 1, zIndex: 16 },
      config: {
        label: "Tagline 1",
        text: "JOIN US AS WE BEGIN\nOUR GREATEST ADVENTURE",
        style: {
          fontFamily: "Cormorant Garamond",
          fontSize: 84,
          italic: true,
          align: "center",
          color: "#525536",
        },
      },
    },
    
    {
      type: "label",
      placement: { x: 3, y: 12.4, width: 8, height: 1, zIndex: 16 },
      config: {
        label: "Tagline 2",
        text: "Two hearts, one day, a lifetime to follow",
        style: {
          fontFamily: "dancing script",
          fontSize: 54,
          italic: true,
          align: "center",
          color: "#000000",
        },
      },
    },
    

    /* -------------------------------------------------------
       OTHER AVAILABLE TOOLS (COMMENTED OUT)
    ------------------------------------------------------- */

    {
      type: "shape",
      placement: { x: -4.2, y: 10.5, width: 22.5, height: 30, zIndex: 3 },
      config: {
        shapeType: "circle",
        backgroundColor: "#F1EAE2",
      },
    },

    /*
    {
      type: "shape",
      placement: { x: 4, y: 2, width: 4, height: 2, zIndex: 4 },
      config: {
        shapeType: "rectangle",
        backgroundColor: "#E5E7EB",
        borderRadius: 16,
      },
    },
    */

    {
      type: "cta",
      placement: { x: 5.4, y: 9, width: 3, height: 1, zIndex: 5 },
      config: {
        buttonText: "RSVP",
        buttonUrl: "#",

        appearance: {
          backgroundColor: "#F1EAE2",
          borderRadius: 9999,
          borderColor: "#000000",
          borderWidth: 2
        },

        style: {
          fontFamily: "Inter",
          fontSize: 60,
          bold: true,
          align: "center",
          color: "#000000"
        }
      }
    },

    {
  type: "links",
  placement: { x: 1, y: 1.4, width: 12, height: 2, zIndex: 6 },
  config: {
    layout: "horizontal",
    heading: "",
    items: [
      { label: "        ABOUT        ", url: "#" },
      { label: "        REGISTRY        ", url: "#" },
      { label: "        SCHEDULE        ", url: "#" },
      { label: "        CONTACT        ", url: "#" },
    ],
    style: {
      fontFamily: "Playfair Display",
      fontSize: 60,
      bold: false,
      italic: false,
      underline: false,
      align: "center",
      color: "#111827",
    },
  },
},

    /*
    {
      type: "gallery",
      placement: { x: 6, y: 10, width: 6, height: 3, zIndex: 7 },
      config: {
        grid: 3,
        images: [
          { url: "/photos/photo1.jpg" },
          { url: "/photos/photo2.jpg" },
          { url: "/photos/photo3.jpg" },
        ],
      },
    },
    */

    /*
    {
      type: "showcase",
      placement: { x: 1, y: 12, width: 12, height: 4, zIndex: 8 },
      config: {
        images: [
          { url: "/photos/photo1.jpg" },
          { url: "/photos/photo2.jpg" },
          { url: "/photos/photo3.jpg" },
        ],
      },
    },
    */

    /*
    {
      type: "countdown",
      placement: { x: 4, y: 14, width: 4, height: 2, zIndex: 9 },
      config: {
        heading: "Wedding Day",
        targetIso: "2026-06-12T18:00:00Z",
      },
    },
    */

    /*
    {
      type: "poll",
      placement: { x: 1, y: 16, width: 5, height: 3, zIndex: 10 },
      config: {
        question: "Will you attend?",
        options: [{ text: "Yes" }, { text: "No" }],
      },
    },
    */

    /*
    {
      type: "rsvp",
      placement: { x: 6, y: 16, width: 5, height: 3, zIndex: 11 },
      config: {
        heading: "RSVP",
        collectName: true,
        collectEmail: true,
      },
    },
    */

    /*
    {
      type: "faq",
      placement: { x: 1, y: 20, width: 6, height: 3, zIndex: 12 },
      config: {
        items: [
          {
            question: "Dress code?",
            answer: "Formal attire",
          },
        ],
      },
    },
    */

    /*
    {
      type: "thread",
      placement: { x: 7, y: 20, width: 5, height: 3, zIndex: 13 },
      config: {
        subject: "Leave a message",
      },
    },
    */

    /*
    {
      type: "padding",
      placement: { x: 1, y: 25, width: 12, height: 1, zIndex: 14 },
      config: {
        height: 40,
      },
    },
    */
  ],
});