import { createLayoutPreset } from "../../shared";

export default createLayoutPreset({
  designKey: "classic",

  label: "Elegant Classic",
  description: "Traditional refined visual style",
  thumbnail: "/designs/backgrounds/design_wedding-classic.png",

  recommended: true,

  /* =======================================================
     PAGE SETTINGS
  ======================================================= */

  // pageColor: "#ffffff",

  /* =======================================================
     PRIMARY TEXT BLOCKS
     Use the built-in page text slots first.
     For any extra text beyond these, use optionalBlocks with type: "label".
  ======================================================= */

  title: {
    text: "Lucy & Ricky",
    placement: { x: 0, y: 3.3, width: 14, height: 2, zIndex: 10 },
    style: {
      fontFamily: "Great Vibes",
      fontSize: 200,
      align: "center",
      bold: false,
      color: "#646462",
    },
  },

  subtitle: {
    text: "ARE GETTING MARRIED",
    placement: { x: 0, y: 5.6, width: 14, height: 1, zIndex: 11 },
    style: {
      fontFamily: "Cormorant Garamond",
      fontSize: 60,
      align: "center",
      color: "#374151",
    },
  },

  subtitleSecondary: {
    text: "November 30, 1940",
    placement: { x: 0, y: 6.6, width: 14, height: 1, zIndex: 12 },
    style: {
      fontFamily: "Cormorant Garamond",
      fontSize: 66,
      italic: true,
      bold: true,
      align: "center",
      color: "#374151",
    },
  },

  tagline: {
    text: "Kindly RSVP",
    placement: { x: 0, y: 7.9, width: 14, height: 1, zIndex: 13 },
    style: {
      fontFamily: "Great Vibes",
      fontSize: 110,
      align: "center",
      color: "#646462",
    },
  },

  taglineSecondary: {
    text: "We can't wait to celebrate with you!",
    placement: { x: 0, y: 14.8, width: 14, height: 2, zIndex: 14 },
    style: {
      fontFamily: "Great Vibes",
      fontSize: 94,
      align: "center",
      color: "#000000",
    },
  },

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
      placement: { x: 3, y: 9.4, width: 8, height: 1, zIndex: 1 },
      config: {
        src: "/designs/artifacts/champagne_plaques.png",
        fit: "cover",
        frame: "square",
        zoom: 1,
        rotation: 0,
      },
    },

    /* -------------------------------------------------------
       DECORATIVE LINES
    ------------------------------------------------------- */
    {
      type: "shape",
      placement: { x: 3, y: 5.6, width: 2, height: 1, zIndex: 2 },
      config: {
        shapeType: "line",
        borderColor: "#DDD8D2",
        borderWidth: 8,
      },
    },

    {
      type: "shape",
      placement: { x: 9, y: 5.6, width: 2, height: 1, zIndex: 2 },
      config: {
        shapeType: "line",
        borderColor: "#DDD8D2",
        borderWidth: 8,
      },
    },

    /* -------------------------------------------------------
       EXTRA TEXT LINES
       Use label blocks whenever you need more text than the
       built-in page text fields allow.
    ------------------------------------------------------- */
    {
      type: "label",
      placement: { x: 2.6, y: 9.5, width: 4, height: 1, zIndex: 15 },
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
      placement: { x: 7.25, y: 9.5, width: 4, height: 1, zIndex: 16 },
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

    
    {
      type: "label",
      placement: { x: 0, y: 10.9, width: 14, height: 1, zIndex: 16 },
      config: {
        label: "Logistics Info 1",
        text: "42 Lovebird Lane Heartwood Village, NY",
        style: {
          fontFamily: "Georgia",
          fontSize: 50,
          italic: true,
          align: "center",
          color: "#61605F",
        },
      },
    },
    
    {
      type: "label",
      placement: { x: 0, y: 11.9, width: 14, height: 1, zIndex: 16 },
      config: {
        label: "Logistics Info 2",
        text: "3:30 PM — Guest Arrival\n4:30 PM — Ceremony Begins\n5:15 PM — Cocktail Hour\n6:30 PM — Dinner Reception\n8:00 PM — Dancing",
        style: {
          fontFamily: "Georgia",
          fontSize: 40,
          italic: true,
          align: "center",
          color: "#61605F",
        },
      },
    },

    /* -------------------------------------------------------
       OTHER AVAILABLE TOOLS (COMMENTED OUT)
    ------------------------------------------------------- */

    /*
    {
      type: "shape",
      placement: { x: 2, y: 2, width: 2, height: 2, zIndex: 3 },
      config: {
        shapeType: "circle",
        backgroundColor: "#FDE68A",
      },
    },
    */

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

    /*
    {
      type: "cta",
      placement: { x: 5, y: 8, width: 3, height: 1, zIndex: 5 },
      config: {
        buttonText: "RSVP",
        buttonUrl: "#",
      },
    },
    */

    /*
    {
      type: "links",
      placement: { x: 1, y: 10, width: 4, height: 2, zIndex: 6 },
      config: {
        heading: "Quick Links",
        items: [
          { label: "Registry", url: "#" },
          { label: "Venue", url: "#" },
        ],
      },
    },
    */

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