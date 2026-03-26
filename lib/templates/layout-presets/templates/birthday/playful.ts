import { createLayoutPreset } from "../../shared";

export default createLayoutPreset({
  designKey: "playful",

  label: "Playful Celebration",
  description: "Bright energetic party design",
  thumbnail: "/designs/backgrounds/design_birthday-playful.png",

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
    text: "You're invited to",
    placement: { x: 3.1, y: 4.4, width: 8, height: 2, zIndex: 10 },
    style: {
      fontFamily: "Playball",
      fontSize: 140,
      align: "center",
      bold: false,
      color: "#D42A39",
    },
  },
  
  subtitle: {
    text: "Sandy Eggo's 21st Birthday Bash!",
    placement: { x: 2.9, y: 6.2, width: 8, height: 3, zIndex: 11 },
    style: {
      fontFamily: "Playball",
      fontSize: 160,
      align: "center",
      bold: true,
      color: "#000000",
    },
  },


  tagline: {
    text: "Must be 21+ (Sandy finally is)",
    placement: { x: 1, y: 10.2, width: 12, height: 1, zIndex: 13 },
    style: {
      fontFamily: "Playball",
      fontSize: 70,
      bold: true,
      align: "center",
      color: "#D42A39",
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
    
    /* {
      type: "image",
      placement: { x: 4.7, y: 2.7, width: 5, height: 10, zIndex: 1 },
      config: {
        src: "/designs/artifacts/bride_groom1.png",
        fit: "cover",
        frame: "square",
        zoom: 1,
        rotation: 0,
      },
    }, */

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
      placement: { x: 4.1, y: 15.8, width: 6, height: 3, zIndex: 15 },
      config: {
        label: "Logistics Line 1",
        text: "Saturday, July 21st at 7:21pm\nThe Salty Seagull Rooftop Bar\n2101 Pacific Breeze Blvd\nSan Diego, CA 92121\nContact: Randy (Sandy's brother) at (858) 555-DRNK",
        style: {
          fontFamily: "Poppins",
          fontSize: 60,
          italic: false,
          align: "center",
          color: "#000000",
        },
      },
    },

   /*  
    {
      type: "label",
      placement: { x: 5, y: 13, width: 4, height: 1, zIndex: 15 },
      config: {
        label: "Logistics Line 2",
        text: "The Salty Seagull Rooftop Bar",
        style: {
          fontFamily: "Poppins",
          fontSize: 40,
          italic: true,
          align: "center",
          color: "#000000",
        },
      },
    },
 
    {
      type: "label",
      placement: { x: 5, y: 13.5, width: 4, height: 1, zIndex: 15 },
      config: {
        label: "Logistics Line 3",
        text: "2101 Pacific Breeze Blvd\nSan Diego, CA 92121",
        style: {
          fontFamily: "Poppins",
          fontSize: 40,
          italic: true,
          align: "center",
          color: "#000000",
        },
      },
    },
    
    {
      type: "label",
      placement: { x: 5, y: 14, width: 4, height: 1, zIndex: 15 },
      config: {
        label: "RSVP Line",
        text: "Contact: Randy (Sandy's brother) at (858) 555-DRNK",
        style: {
          fontFamily: "Poppins",
          fontSize: 40,
          italic: true,
          align: "center",
          color: "#000000",
        },
      },
    }, */

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
    /* 
    {
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