import { Boldonse } from "next/font/google";
import { createLayoutPreset } from "../../shared";

export default createLayoutPreset({
  designKey: "warm",

  label: "Warm Classic",
  description: "Traditional inviting layout",
  thumbnail: "/designs/backgrounds/design_reunion-warm.png",

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
    text: "Bullock-Holmes Family",
    placement: { x: 1, y: 10.4, width: 12, height: 2, zIndex: 10 },
    style: {
      fontFamily: "Parisienne",
      fontSize: 140,
      align: "center",
      bold: false,
      color: "#B49344",
    },
  },
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
/*   subtitleSecondary: {
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
 */
  tagline: {
    text: "R E U N I O N",
    placement: { x: 1, y: 12.3, width: 12, height: 3, zIndex: 13 },
    style: {
      fontFamily: "Bodoni Moda",
      fontSize: 120,
      align: "center",
      color: "#646462",
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
      placement: { x: 1.2, y: 0.6, width: 11.56, height: 11.8, zIndex: 1 },
      config: {
        src: "/designs/artifacts/reunion_black_fam.png",
        // use "contain" for clip, "fill" for stretch, or "cover" for zoom
        fit: "fill",
        frame: "square",
        zoom: 1,
        rotation: 0,
        positionX: 50,
        positionY: 60,
      },
    },

    /* -------------------------------------------------------
       DECORATIVE LINES
    ------------------------------------------------------- */
{
  type: "shape",
  placement: { x: 1, y: 15.5, width: 4.5, height: 1, zIndex: 2 },
  config: {
    shapeType: "line",
    borderColor: "#B49344",
    borderWidth: 8,
    // rotation: 180, // 👈 ADD THIS (degrees)
  },
},
{
  type: "shape",
  placement: { x: 8.25, y: 15.5, width: 4.5, height: 1, zIndex: 2 },
  config: {
    shapeType: "line",
    borderColor: "#B49344",
    borderWidth: 8,
    // rotation: 180, // 👈 ADD THIS (degrees)
  },
},
{
  type: "shape",
  placement: { x: 11.24, y: 12.65, width: 2.9, height: 2, zIndex: 2 },
  config: {
    shapeType: "line",
    borderColor: "#B49344",
    borderWidth: 10,
    rotation: 90, // 👈 ADD THIS (degrees)
  },
},
{
  type: "shape",
  placement: { x: 11.25, y: 10.83, width: 1.5, height: 1, zIndex: 2 },
  config: {
    shapeType: "line",
    borderColor: "#B49344",
    borderWidth: 12,
    // rotation: 180, // 👈 ADD THIS (degrees)
  },
},
{
  type: "shape",
  placement: { x: -0.19, y: 13.05, width: 2.9, height: 1.2, zIndex: 2 },
  config: {
    shapeType: "line",
    borderColor: "#B49344",
    borderWidth: 12,
    rotation: 90, // 👈 ADD THIS (degrees)
  },
},
{
  type: "shape",
  placement: { x: 1.21, y: 10.83, width: 1.5, height: 1, zIndex: 2 },
  config: {
    shapeType: "line",
    borderColor: "#B49344",
    borderWidth: 12,
    // rotation: 180, // 👈 ADD THIS (degrees)
  },
},


 /*
    {
      type: "shape",
      placement: { x: 9, y: 4.2, width: 2, height: 1, zIndex: 2 },
      config: {
        shapeType: "line",
        borderColor: "#DDD8D2",
        borderWidth: 8,
      },
    }, */

    /* -------------------------------------------------------
       EXTRA TEXT LINES
       Use label blocks whenever you need more text than the
       built-in page text fields allow.
    ------------------------------------------------------- */
    /* {
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
    }, */

/*     
    {
      type: "label",
      placement: { x: 4, y: 8.8, width: 6, height: 1, zIndex: 16 },
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
    }, */
    
    {
      type: "label",
      placement: { x: 0.9, y: 14.7, width: 12, height: 4, zIndex: 16 },
      config: {
        label: "Logistics Info 2",
        text: "The Place You Can Always Call Home\n67 E. Cornerview Drive,\nSpringfield, IL",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 90,
          italic: false,
          align: "center",
          color: "#646462",
        },
      },
    },

    
/*     {
      type: "label",
      placement: { x: 0.9, y: 14.7, width: 12, height: 4, zIndex: 16 },
      config: {
        label: "Logistics Info 2",
        text: "78th Annual Family Reunion",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 110,
          italic: false,
          align: "center",
          color: "#646462",
        },
      },
    }, */
    
    {
      type: "label",
      placement: { x: 0.9, y: 13.9, width: 12, height: 4, zIndex: 16 },
      config: {
        label: "Logistics Info 2",
        text: "July 4th Weekend, 2025",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 90,
          italic: false,
          bold: false,
          align: "center",
          color: "#B49344",
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