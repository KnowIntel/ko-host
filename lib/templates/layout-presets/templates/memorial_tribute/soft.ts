import { createLayoutPreset } from "../../shared";

export default createLayoutPreset({
  designKey: "soft",

  label: "Soft Dignified",
  description: "Floral serene memorial setting",

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

  title: {
    text: "Always Remembered",
    placement: { x: 0.96, y: 3.9, width: 12, height: 2, zIndex: 10 },
    style: {
      fontFamily: "Great Vibes",
      fontSize: 60,
      align: "center",
      bold: true,
      color: "#665642",
    },
  },
  
   subtitle: {
    text: "Forever Missed",
    placement: { x: 0.96, y: 12.6, width: 12, height: 2, zIndex: 10 },
    style: {
      fontFamily: "Great Vibes",
      fontSize: 70,
      align: "center",
      bold: false,
      color: "#FFFFFF",
    },
  },

/* 
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
      placement: { x: 0.8, y: 2.8, width: 4, height: 13.5, zIndex: 1 },
      config: {
        src: "/designs/artifacts/memorial_craig_3.png",
        fit: "cover",
        frame: "square",
        zoom: 1,
        rotation: 0,
        positionX: 70,     // horizontal position
        positionY: 50,     // vertical position
      },
    },
    
     {
      type: "image",
      placement: { x: 5.4, y: 3.1, width: 3.2, height: 12.6, zIndex: 1 },
      config: {
        src: "/designs/artifacts/memorial_craig_1.png",
        fit: "cover",
        frame: "square",
        zoom: 1,
        rotation: 0,
        positionX: 50,     // horizontal position
        positionY: 50,     // vertical position
      },
    },
    
     {
      type: "image",
      placement: { x: 9.3, y: 2.8, width: 4, height: 13.5, zIndex: 1 },
      config: {
        src: "/designs/artifacts/memorial_craig_2.png",
        fit: "cover",
        frame: "square",
        zoom: 1,
        rotation: 0,
        positionX: 30,     // horizontal position
        positionY: 50,     // vertical position
      },
    },

     {
      type: "image",
      placement: { x: 0, y: 1, width: 14, height: 16, zIndex: 1 },
      config: {
        src: "/designs/artifacts/memorial_triple_scenery.png",
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
  
    {
      type: "label",
    placement: { x: 0.96, y: 13.6, width: 12, height: 2, zIndex: 10 },
      config: {
        label: "ILM Line",
        text: "In Loving Memory of\nCraig Wilson\n1957-2025",
        style: {
          fontFamily: "Georgia",
          fontSize: 40,
          italic: true,
          align: "center",
          color: "#FFFFFF",
        },
      },
    },


    /* {
      type: "label",
      placement: { x: 5, y: 3.9, width: 4, height: 1, zIndex: 16 },
      config: {
        label: "",
        text: "Join us for a",
        style: {
          fontFamily: "Georgia",
          fontSize: 48,
          italic: true,
          align: "center",
          color: "#61605F",
        },
      },
    }, */
    
    /* {
      type: "label",
      placement: { x: 1.0, y: 6.0, width: 12, height: 1, zIndex: 16 },
      config: {
        label: "",
        text: "honoring",
        style: {
          fontFamily: "Cormorant Garamond",
          fontSize: 44,
          italic: true,
          align: "center",
          color: "#525536",
        },
      },
    }, */
    
/*     {
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
     */

    /* -------------------------------------------------------
       OTHER AVAILABLE TOOLS (COMMENTED OUT)
    ------------------------------------------------------- */

   /*  {
      type: "shape",
      placement: { x: -4.2, y: 10.5, width: 22.5, height: 30, zIndex: 3 },
      config: {
        shapeType: "circle",
        backgroundColor: "#F1EAE2",
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

    /* {
      type: "cta",
      placement: { x: 3.8, y: 8.6, width: 3, height: 1, zIndex: 5 },
      config: {
        buttonText: "I will be there",
        buttonUrl: "#",

        appearance: {
          backgroundColor: "#FDD487",
          borderRadius: 9999,
          // borderColor: "#000000",
          borderWidth: 2
        },

        style: {
          fontFamily: "Inter",
          fontSize: 44,
          bold: true,
          align: "center",
          color: "#FFFFFF"
        }
      }
    }, */
    
    /* {
      type: "cta",
      placement: { x: 7.2, y: 8.6, width: 3, height: 1, zIndex: 5 },
      config: {
        buttonText: "Sorry, can't make it",
        buttonUrl: "#",

        appearance: {
          backgroundColor: "#94CEF3",
          borderRadius: 9999,
          // borderColor: "#000000",
          borderWidth: 2
        },

        style: {
          fontFamily: "Inter",
          fontSize: 44,
          bold: true,
          align: "center",
          color: "#FFFFFF"
        }
      }
    }, */
/* 
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