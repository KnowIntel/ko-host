import { createLayoutPreset } from "../../shared";

export default createLayoutPreset({
  designKey: "grown",

  label: "Grown & Sexy",
  description: "Clean event information layout",
  thumbnail: "/designs/backgrounds/design_birthday-grown.png",

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
    text: "B I R T H D A Y",
    placement: { x: 1, y: 4.5, width: 12, height: 2, zIndex: 10 },
    style: {
      fontFamily: "Marcellus",
      fontSize: 120,
      align: "center",
      bold: true,
      color: "#F2DFDF",
    },
  },

  
  subtitle: {
    text: "C E L E B R A T I O N",
    placement: { x: 3, y: 5.8, width: 8, height: 2, zIndex: 11 },
    style: {
      fontFamily: "Marcellus",
      fontSize: 120,
      align: "center",
      bold: true,
      color: "#F2DFDF",
    },
  },

  
  tagline: {
    text: "Halo Edwards",
    placement: { x: 0.9, y: 8.6, width: 12, height: 3, zIndex: 13 },
    style: {
      fontFamily: "Great Vibes",
      fontSize: 160,
      bold: false,
      align: "center",
      color: "#F2DFDF",
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
      placement: { x: 3, y: 7.6, width: 8, height: 1, zIndex: 1 },
      config: {
        src: "/designs/artifacts/champagne_plaques.png",
        fit: "cover",
        frame: "square",
        zoom: 1,
        rotation: 0,
      },
    }, */

    /* -------------------------------------------------------
       DECORATIVE LINES
    ------------------------------------------------------- */
  /*   {
      type: "shape",
      placement: { x: 3, y: 4.2, width: 2, height: 1, zIndex: 2 },
      config: {
        shapeType: "line",
        borderColor: "#DDD8D2",
        borderWidth: 8,
      },
    },

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
/* 
   {
      type: "label",
      placement: { x: 4, y: 2.3, width: 6, height: 1, zIndex: 15 },
      config: {
        label: "Intro Line",
        text: "JOIN US FOR A",
        style: {
          fontFamily: "Georgia",
          fontSize: 60,
          italic: true,
          align: "center",
          color: "#FFFFFF",
        },
      },
    },
 */

   {
      type: "label",
      placement: { x: 4.1, y: 7.7, width: 6, height: 1, zIndex: 15 },
      config: {
        label: "Subject Line",
        text: "DINNER FOR",
        style: {
          fontFamily: "Georgia",
          fontSize: 50,
          italic: false,
          align: "center",
          color: "#F2DFDF",
        },
      },
    },

      /*
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
      placement: { x: 0.9, y: 12.8, width: 12, height: 4, zIndex: 16 },
      config: {
        label: "Logistics Info 2",
        text: "SATURDAY, DECEMBER 6, 2025 @ 10:00 PM\nDASHIKI 'N' DENIM PALACE",
        style: {
          fontFamily: "Bodoni Moda",
          fontSize: 50,
          italic: false,
          align: "center",
          color: "#F2DFDF",
        },
      },
    },

      /* -------------------------------------------------------
       TEXTFX EXAMPLES
       Includes straight, arch, dip, and circle modes plus
       rotation, opacity, intensity, and outline support.
    ------------------------------------------------------- */

 {
  type: "text_fx",
  placement: { x: 1, y: 3.5, width: 12, height: 7.5, zIndex: 20 },
  config: {
    text: "JOIN US FOR A",
    style: {
      fontFamily: "Georgia",
      fontSize: 40,
      bold: false,
      italic: false,
      align: "center",
      color: "#F2DFDF",
    },
    fx: {
      mode: "arch",
      intensity: 100,
      rotation: 0,
      opacity: 1,
      outline: {
        enabled: true,
        color: "#FFFFFF",
        width: 8,
      },
    },
  },
},

    /*
    {
      type: "text_fx",
      placement: { x: 2, y: 4, width: 8, height: 3, zIndex: 21 },
      config: {
        text: "Arch TextFX",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 64,
          bold: true,
          align: "center",
          color: "#A9A4A0",
        },
        fx: {
          mode: "arch",
          intensity: 55,
          rotation: 0,
          opacity: 1,
          outline: {
            enabled: false,
            color: "#000000",
            width: 2,
          },
        },
      },
    },
    */

    /*
    {
      type: "text_fx",
      placement: { x: 2, y: 7, width: 8, height: 3, zIndex: 22 },
      config: {
        text: "Dip TextFX",
        style: {
          fontFamily: "Bodoni Moda",
          fontSize: 64,
          bold: false,
          italic: false,
          align: "center",
          color: "#646462",
        },
        fx: {
          mode: "dip",
          intensity: 55,
          rotation: 0,
          opacity: 1,
          outline: {
            enabled: false,
            color: "#FFFFFF",
            width: 2,
          },
        },
      },
    },
    */

    /*
    {
      type: "text_fx",
      placement: { x: 3, y: 10, width: 6, height: 6, zIndex: 23 },
      config: {
        text: "Circle TextFX",
        style: {
          fontFamily: "Inter",
          fontSize: 34,
          bold: true,
          align: "center",
          color: "#8F8B85",
        },
        fx: {
          mode: "circle",
          intensity: 50,
          rotation: 0,
          opacity: 1,
          outline: {
            enabled: true,
            color: "#F5F5F4",
            width: 1,
          },
        },
      },
    },
    */

    /*
    {
      type: "text_fx",
      placement: { x: 2, y: 16, width: 8, height: 2, zIndex: 24 },
      config: {
        text: "Rotated Outlined TextFX",
        style: {
          fontFamily: "Anton",
          fontSize: 72,
          bold: false,
          italic: false,
          align: "center",
          color: "#A39F9A",
        },
        fx: {
          mode: "straight",
          intensity: 50,
          rotation: -8,
          opacity: 0.95,
          outline: {
            enabled: true,
            color: "#FFFFFF",
            width: 3,
          },
        },
      },
    },
    */

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

{
  type: "cta",
  placement: { x: 5.5, y: 10.9, width: 3, height: 1.55, zIndex: 5 },
  config: {
    heading: "",
    body: "",
    backgroundColor: "#000000",
    borderColor: "#F2DFDF",
    borderWidth: 8,
    borderRadius: 100,
    buttonText: "RSVP",
    buttonUrl: "#",
    styleType: "soft",
    style: {
      fontFamily: "Inter",
      fontSize: 30,
      bold: true,
      italic: false,
      underline: false,
      strike: false,
      align: "center",
      color: "#F2DFDF",
      zoom: 1.2, // 👈 ADD THIS
    },
  },
}

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