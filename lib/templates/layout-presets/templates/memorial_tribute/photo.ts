import { createLayoutPreset } from "../../shared";

export default createLayoutPreset({
  designKey: "photo",

  label: "Photo Timeline",
  description: "Chronological visual storytelling",
  // thumbnail: "/designs/design_baby_shower-playful.webp",

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
    text: "Gretchen Morrison",
    placement: { x: 1, y: 12.6, width: 12, height: 2, zIndex: 10 },
    style: {
      fontFamily: "Parisienne",
      fontSize: 160,
      align: "center",
      bold: true,
      color: "#9CA18D",
    },
  },
  
  subtitle: {
    text: "July 10, 1942 - October 16, 2024",
    placement: { x: 1, y: 14.8, width: 12, height: 3, zIndex: 11 },
    style: {
      fontFamily: "Marcellus",
      fontSize: 50,
      align: "center",
      bold: true,
      color: "#9CA18D",
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
  type: "gallery",
  placement: { x: 3.9, y: 1.9, width: 6.3, height: 9.5, zIndex: 9 },
  config: {
    grid: 3,
    positionX: 50, // 👈 ADD
    positionY: 50, // 👈 ADD
    images: [
      { url: "/designs/artifacts/memorial_gretchen_9.png" },
      { url: "/designs/artifacts/memorial_gretchen_2.png" },
      { url: "/designs/artifacts/memorial_gretchen_3.png" },
      { url: "/designs/artifacts/memorial_gretchen_4.png" },
      { url: "/designs/artifacts/memorial_gretchen_8.png" },
      { url: "/designs/artifacts/memorial_gretchen_5.png" },
      { url: "/designs/artifacts/memorial_gretchen_6.png" },
      { url: "/designs/artifacts/memorial_gretchen_7.png" },
      { url: "/designs/artifacts/memorial_gretchen_1.png" },
    ],
  },
},

{
  type: "image",
  placement: { x: 1, y: 1, width: 12, height: 12, zIndex: 10 },
  config: {
    src: "/designs/artifacts/memorial_photo_frame.png",
    fit: "cover",
    frame: "square",
    zoom: 1,
    rotation: 0,
    positionX: 50, // 👈 ADD
    positionY: 50, // 👈 ADD
  },
},

     {
      type: "image",
      placement: { x: 1, y: 1, width: 12, height: 12, zIndex: 10 },
      config: {
        src: "/designs/artifacts/memorial_photo_frame.png",
        fit: "cover",
        frame: "square",
        zoom: 1,
        rotation: 0,
      },
    }, 
    
/*      {
      type: "image",
      placement: { x: 1, y: 2.7, width: 12, height: 12, zIndex: 1 },
      config: {
        src: "/designs/artifacts/memorial_photo_frame.png",
        // use "contain" for clip, "fill" for stretch, or "cover" for zoom
        fit: "fill",
        frame: "square",
        zoom: 0.5,
        rotation: 0,
        positionX: 50,     // horizontal position
        positionY: 50,     // vertical position
      },
    }, 
 */
    /* -------------------------------------------------------
       DECORATIVE LINES
    ------------------------------------------------------- */

    {
      type: "shape",
      placement: { x: 4.5, y: 14, width: 5, height: 1, zIndex: 2 },
      config: {
        shapeType: "line",
        borderColor: "#9CA18D",
        borderWidth: 8,
      },
    },

    /* 
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
      placement: { x: 1, y: 11.8, width: 12, height: 1, zIndex: 16 },
      config: {
        label: "ILM Line",
        text: "In Loving Memory",
        style: {
          fontFamily: "Georgia",
          fontSize: 48,
          italic: true,
          align: "center",
          color: "#61605F",
        },
      },
    },
    
    
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
      type: "showcase",
      placement: { x: 1, y: 12, width: 12, height: 4, zIndex: 8 },
      config: {
        images: [
          { url: "/photos/photo1.png" },
          { url: "/photos/photo2.png" },
          { url: "/photos/photo3.png" },
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