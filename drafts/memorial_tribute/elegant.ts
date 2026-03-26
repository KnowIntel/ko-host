import { createLayoutPreset } from "../../shared";

export default createLayoutPreset({
  designKey: "elegant",

  label: "Elegant Tribute",
  description: "Respectful polished memorial design",
  thumbnail: "/designs/design_memorial-elegant.png",

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
    text: "Christina Pascal",
      placement: { x: 1, y: 5.7, width: 7, height: 2, zIndex: 15 },
    style: {
      fontFamily: "Great Vibes",
      fontSize: 160,
      align: "center",
      bold: false,
      color: "#E0C051",
    },
  },
  
/*   tagline: {
    text: "Please join us in welcoming a beautiful baby boy:",
    placement: { x: 1, y: 7.4, width: 12, height: 3, zIndex: 13 },
    style: {
      fontFamily: "Bodoni Moda",
      fontSize: 70,
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
      placement: { x: 8.15, y: 3.5, width: 3.5, height: 5.7, zIndex: 1 },
      config: {
        src: "/designs/artifacts/memorial_grandma.png",
        // use "contain" for clip, "fill" for stretch, or "cover" for zoom
        fit: "contain",
        frame: "circle",
        zoom: 1.65,
        rotation: 0,
        positionX: 47,     // horizontal position
        positionY: 87,     // vertical position
      },
    },

       {
      type: "image",
      placement: { x: 6.9, y: 1, width: 6, height: 10.5, zIndex: 1 },
      config: {
        src: "/designs/artifacts/memorial_floral_frame.png",
        // use "contain" for clip, "fill" for stretch, or "cover" for zoom
        fit: "contain",
        frame: "square",
        zoom: 0.78,
        rotation: 0,
        positionX: 54,     // horizontal position
        positionY: 53,     // vertical position
      },
    },

    
       {
      type: "image",
      placement: { x: 2.5, y: 7, width: 4.25, height: 1.5, zIndex: 1 },
      config: {
        src: "/designs/artifacts/memorial_divider_line.png",
        // use "contain" for clip, "fill" for stretch, or "cover" for zoom
        fit: "fill",
        frame: "square",
        zoom: 0.5,
        rotation: 0,
        positionX: 50,     // horizontal position
        positionY: 50,     // vertical position
      },
    },
    

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
 {
      type: "label",
      placement: { x: 1, y: 5.0, width: 7, height: 1, zIndex: 15 },
      config: {
        label: "Intro Line",
        text: "Tribute to the life of",
        style: {
          fontFamily: "Georgia",
          fontSize: 60,
          // italic: true,
          align: "center",
          color: "#E0C051",
        },
      },
    },

     {
      type: "label",
      placement: { x: 1, y: 8.4, width: 7, height: 3, zIndex: 16 },
      config: {
        label: "Description",
        text: "A beautiful angel whose warmth, wisdom, and gentle spirit\n touched everyone she met. Her kindness lives on in our hearts,\nguiding us with cherished memories and endless love.",
        style: {
          fontFamily: "Georgia",
          fontSize: 40,
          italic: true,
          align: "center",
          color: "#E0C051",
        },
      },
    },

   
    {
      type: "label",
      placement: { x: 5, y: 12.75, width: 8, height: 2, zIndex: 16 },
      config: {
        label: "Logistics Info",
        text: "Memorial Service at St. Maria Chapel | Saturday, October 18 at 11:00 AM\n1420 Garden Way Riverside, CA 92501",
        style: {
          fontFamily: "Georgia",
          fontSize: 30,
          italic: true,
          align: "center",
          color: "#FFFFFF",
        },
      },
    }, 
    
/*     {
      type: "label",
      placement: { x: 0.9, y: 10, width: 12, height: 4, zIndex: 16 },
      config: {
        label: "Description",
        text: "",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 50,
          italic: true,
          align: "center",
          color: "#A39F9A",
        },
      },
    }, */

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