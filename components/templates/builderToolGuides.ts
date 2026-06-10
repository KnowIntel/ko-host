export type BuilderToolGuide = {
  name: string;
  purpose: string;
  howToUse: string;
};

export const BUILDER_TOOL_GUIDES: BuilderToolGuide[] = [
  {
    name: "Title",
    purpose: "Adds the main headline/title text for the page.",
    howToUse: "Use this for the primary page heading, event name, announcement title, or main message. Add it to the canvas, then edit the wording, font, size, color, alignment, and position.",
  },
  {
    name: "Subtitle",
    purpose: "Adds supporting text beneath or near the main title.",
    howToUse: "Use this for a short tagline, date, location, description, or secondary headline. Add it near the title and style it from the toolbar or inspector.",
  },
  {
    name: "Label",
    purpose: "Adds a simple editable text block.",
    howToUse: "Use this for captions, notes, labels, short section headers, or small announcements. Add it, type your text, then adjust styling and placement.",
  },
  {
    name: "TextFX",
    purpose: "Adds stylized decorative text.",
    howToUse: "Use this for bold callouts, slogans, decorative words, or attention-grabbing text. Keep the wording short for best visual impact.",
  },
  {
  name: "Content Panel",
  purpose: "Creates multiple switchable content sections inside one block.",
  howToUse:
    "Use this for information hubs, menus, FAQs, schedules, guides, resources, or any content that should feel multi-page without creating actual microsite pages.",
},

  {
    name: "Rich Text",
    purpose: "Adds longer formatted text content.",
    howToUse: "Use this for paragraphs, descriptions, bios, instructions, lists, or linked text. Edit content directly and use formatting controls like bold, italic, underline, alignment, lists, and links.",
  },

  {
    name: "Image",
    purpose: "Adds a single image, photo, logo, or graphic.",
    howToUse: "Use this for photos, flyers, logos, product images, venue images, or decorative graphics. Add it, upload/select the image, then resize and position it.",
  },
  {
    name: "Video",
    purpose: "Adds a video to the microsite.",
    howToUse: "Use this for demos, announcements, trailers, walkthroughs, personal messages, or event clips. Upload a video or paste a video URL, then adjust playback settings.",
  },
  {
    name: "Gallery",
    purpose: "Displays multiple images together.",
    howToUse: "Use this for photo collections, portfolios, product images, event memories, or real estate photos. Add multiple images and customize the gallery display.",
  },
  {
    name: "Carousel",
    purpose: "Displays multiple images in a rotating/sliding format.",
    howToUse: "Use this when several images should share one compact space. Add images, titles, subtitles, or links depending on the carousel setup.",
  },

  {
    name: "Rectangle",
    purpose: "Adds a rectangular shape for layout or decoration.",
    howToUse: "Use this as a background panel, card, banner, button-like section, divider block, or decorative container. Adjust color, border, radius, size, and layer position.",
  },
  {
    name: "Circle",
    purpose: "Adds a circular shape for decoration or emphasis.",
    howToUse: "Use this for badges, bubbles, accents, profile-style backgrounds, or layered design elements. Adjust color, border, size, and position.",
  },
  {
    name: "Line",
    purpose: "Adds a line divider or visual separator.",
    howToUse: "Use this to separate sections, underline headings, create borders, or add simple structure to the page.",
  },
  {
    name: "Spacer",
    purpose: "Adds empty space for layout control.",
    howToUse: "Use this to create breathing room between sections, push content apart, or improve page flow without adding visible content.",
  },

  {
    name: "Input Field",
    purpose: "Collects a simple response from visitors.",
    howToUse: "Use this for names, short answers, comments, requests, or simple public submissions. Set the label, placeholder, required option, and submit text in the inspector.",
  },
  {
    name: "Poll",
    purpose: "Lets visitors vote on predefined options.",
    howToUse: "Use this for voting, preferences, decisions, surveys, or quick engagement. Add your question and options, then publish so visitors can vote.",
  },
  {
    name: "RSVP",
    purpose: "Collects structured event attendance responses.",
    howToUse: "Use this for invitations, events, meals, guest counts, guest names, comments, and attendance tracking. Customize labels/options and review submissions from Dashboard > Manage.",
  },
  {
    name: "FAQ",
    purpose: "Displays questions and answers.",
    howToUse: "Use this to answer common visitor questions about rules, parking, schedules, payments, event details, policies, or instructions. Add question/answer pairs in the inspector.",
  },

    {
    name: "Enrollment Board",
    purpose: "Creates a public sign-up board where visitors can add their name, optional quote, private email, and optional profile image.",
    howToUse: "Use this for clubs, petitions, supporter walls, volunteer lists, event participation lists, class rosters, watch clubs, waitlists, and community member boards. Public entries show name, quote, and profile image while email remains private for the owner.",
  },
  
  {
    name: "Thread",
    purpose: "Creates a public message/comment area with optional media replies.",
    howToUse: "Use this for guestbooks, shoutouts, testimonials, public questions, discussion, or event messages. Configure anonymous posting, approval, message count, composer settings, per-element styling, and visitor media uploads for GIFs, images, videos, or audio notes.",
  },

  {
  name: "Post Board",
  purpose: "Creates an owner-controlled announcement feed with short posts, pinned updates, likes, and discussion links.",
  howToUse:
    "Use this for announcements, creator updates, event notices, club posts, campaign updates, class notices, watch club episode updates, business bulletins, or pinned welcome posts. Add posts in the inspector, choose Standard, Compact, or Feature layout, upload post images, pin important updates, style cards/buttons, and connect each post to a related Thread block when you want visitors to continue the conversation.",
},

  {
    name: "File Share",
    purpose: "Allows visitors to upload files.",
    howToUse: "Use this to collect documents, photos, forms, resumes, proof files, or event media. Configure file types, size limit, access code, public upload, and contact collection options.",
  },

  {
    name: "Links",
    purpose: "Adds clickable links to external resources.",
    howToUse: "Use this for social links, ticket links, maps, registration pages, payment pages, documents, or websites. Add labels and URLs for each link.",
  },
  {
  name: "Puzzle",
  purpose: "Create an interactive image puzzle experience.",
  howToUse:
    "Add the Puzzle block, insert an image, choose piece count and difficulty. Press Reset to generate the puzzle layout.",
},
{
  name: "Spin Wheel",
  purpose: "Create an interactive prize wheel mini-game.",
  howToUse:
    "Add the Spin Wheel block, enter one prize or result per line, customize the messages, then publish so visitors can spin for a random result.",
},
  {
  name: "Bookmark",
  purpose: "Create scroll-to sections on your page",
  howToUse:
    "Place a bookmark where you want users to jump. Then use its #link in Buttons or Links to scroll to that section.",
},
  {
    name: "Link Hub",
    purpose: "Creates a structured collection of important links.",
    howToUse: "Use this like a link-in-bio section for socials, booking pages, registries, forms, product pages, downloads, or campaign links.",
  },

  {
    name: "Highlight",
    purpose: "Displays summarized live data from another block.",
    howToUse: "Use this to show top messages, RSVP counts, total funds, or poll results. Select the source block in the inspector and choose the highlight mode.",
  },
  {
    name: "Visitor Counter",
    purpose: "Displays a public visitor or view count.",
    howToUse: "Use this to show how many people have visited or viewed the microsite. Choose a counter style, label, animation timing, and alignment.",
  },
  {
    name: "Progress Bar",
    purpose: "Shows progress toward a goal.",
    howToUse: "Use this for fundraising, capacity, milestones, completion tracking, ticket goals, or campaign progress. Set the current value, max value, and percentage display.",
  },

  {
    name: "Countdown",
    purpose: "Counts down to a specific date or time.",
    howToUse: "Use this for events, launches, deadlines, sales, registrations, reveals, or limited-time offers. Set the target date/time and completed message.",
  },
  {
    name: "Checklist",
    purpose: "Displays a list of tasks or items.",
    howToUse: "Use this for packing lists, requirements, steps, reminders, rules, preparation tasks, or to-dos. Add checklist items and mark defaults if needed.",
  },
  {
    name: "Schedule / Agenda",
    purpose: "Displays a timeline or event agenda.",
    howToUse: "Use this for weddings, conferences, trips, parties, classes, meetings, or programs. Add times, titles, and descriptions for each agenda item.",
  },
  {
    name: "Map / Location",
    purpose: "Displays location details.",
    howToUse: "Use this for venues, addresses, meeting points, parking details, pickup spots, or directions. Add the location name, address, and optional map URL.",
  },

  {
    name: "Registry",
    purpose: "Displays gift, wishlist, or registry items.",
    howToUse: "Use this for weddings, showers, birthdays, wishlists, or gift lists. Add item names, URLs, stores, prices, notes, and images when available.",
  },
  {
    name: "Speed Dating",
    purpose: "Creates a speed-dating or timed interaction experience.",
    howToUse: "Use this for dating events, networking, mixers, introductions, or icebreakers. Configure the heading, timing, labels, and round sound options.",
  },
  {
    name: "Donation",
    purpose: "Displays donation amount options.",
    howToUse: "Use this for fundraisers, causes, gifts, support campaigns, memorials, or community contributions. Add donation button labels and amounts.",
  },
  {
    name: "Listing",
    purpose: "Displays an item, service, product, ticket, or offer.",
    howToUse: "Use this for products, services, rentals, tickets, sponsorship tiers, menu items, or packages. Add title, description, price, metadata, and enable Add to Cart if needed.",
  },
  {
    name: "Checkout",
    purpose: "Creates a direct payment block.",
    howToUse: "Use this for one product, ticket, service, deposit, booking, or fixed payment. Configure product name, description, price, quantity, and customer collection options.",
  },
  {
    name: "Cart",
    purpose: "Combines selected Listing items into one checkout.",
    howToUse: "Use this when visitors can choose multiple Listing items. Enable Add to Cart on Listing blocks, then add the Cart block to show items, quantities, totals, and checkout.",
  },
];