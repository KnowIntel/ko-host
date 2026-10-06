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
    name: "Summary",
    purpose: "Displays selected values from linked blocks in a clean summary list.",
    howToUse:
      "Use this to show visitors a review-style summary of their selected inputs and choices. Link Input Field and Option Button blocks in the inspector, then reorder how they appear.",
  },
  
  {
    name: "Visitor Counter",
    purpose: "Displays a public visitor or view count.",
    howToUse: "Use this to show how many people have visited or viewed the microsite. Choose a counter style, label, animation timing, and alignment.",
  },
  {
    name: "Progress Meter",
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
  name: "Tournament Display",
  purpose: "Displays tournament brackets, playoff matchups, standings, scores, championship results, and sports competition progress.",
  howToUse:
    "Use this for sports leagues, playoffs, tournaments, esports competitions, fantasy leagues, school athletics, and championship events. Add teams, seeds, records, scores, matchups, division labels, championship branding, and bracket progression to create a complete tournament experience.",
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

  {
  name: "Formula Board",
  purpose:
    "Displays formulas, mathematical references, or interactive arithmetic challenges.",
  howToUse:
    "Use this for lessons, study guides, formula references, tutoring, or math practice. Choose Reference mode to present formulas with descriptions, variables, examples, and diagrams, or choose a Skills Challenge to generate problems visitors can answer directly.",
},

{
  name: "Chart",
  purpose:
    "Creates professional data visualizations using editable chart data.",
  howToUse:
    "Drag the Chart tool onto the canvas, choose a Chart Type in the inspector, then add or edit the chart's categories, series, and values. The chart updates automatically as its data changes. Use the display and appearance controls to customize axes, grid lines, legends, labels, colors, spacing, and chart-specific styling.",
},

{
  name: "Interactive Hotspots",
  purpose:
    "Adds clickable information points to an image or visual canvas.",
  howToUse:
    "Use this for product features, diagrams, maps, tours, educational visuals, or interactive infographics. Add a background image, position hotspot markers over important areas, and configure the detail content visitors see when each marker is selected.",
},

{
  name: "Live Join",
  purpose:
    "Lets visitors join the Live experience as individual participants.",
  howToUse:
    "Use this as the entry point for a Live experience. Participants enter a display name and optional avatar to create their temporary participant session and access interactive Live activities.",
},

{
  name: "Live Trivia",
  purpose:
    "Runs live trivia questions for connected participants.",
  howToUse:
    "Use this for parties, classrooms, competitions, watch events, team activities, or audience games. Configure the trivia activity from the Live Manager, make it current when ready, and participants can answer questions while Ko-Host tracks responses and scores.",
},

{
  name: "Live Poll",
  purpose:
    "Lets connected participants vote in live audience polls.",
  howToUse:
    "Use this for audience voting, group decisions, predictions, feedback, competitions, or event interaction. Configure questions and choices in the Live Manager, then make the poll current so participants can vote and see live results.",
},

{
  name: "Player Card",
  purpose:
    "Displays the current participant's personal Live profile and progress.",
  howToUse:
    "Use this to give each participant a personalized view of their Live experience. The card can display their name, avatar, team, score, badges, and other participant information while everyone continues using the same microsite.",
},

{
  name: "Live Schedule",
  purpose:
    "Displays the shared event schedule and its current progress.",
  howToUse:
    "Use this for parties, conferences, classes, competitions, trips, or other live events. Manage schedule entries from Host Control and update them as Upcoming, Current, Completed, or Cancelled so participants can follow what is happening in real time.",
},

{
  name: "Song Request",
  purpose:
    "Lets participants submit songs to a shared live request queue.",
  howToUse:
    "Use this for parties, receptions, dances, reunions, or other music-based events. Participants submit song and artist requests while the host manages the queue and marks requests as Queued, Playing, Played, or Rejected.",
},

{
  name: "Live Spin Wheel",
  purpose:
    "Creates a shared Live activity where participants spin for a server-selected result.",
  howToUse:
    "Use this for challenges, prizes, party prompts, classroom activities, icebreakers, or random selections. Configure the wheel options and points in the Live Manager. Participants spin the animated wheel and Ko-Host securely determines and records the result.",
},

{
  name: "Scavenger Hunt",
  purpose:
    "Creates a live checklist of challenges or items participants can find and complete.",
  howToUse:
    "Use this for parties, schools, conferences, team building, tours, travel, or community events. Configure hunt items and point values in the Live Manager, then participants complete items during the experience while Ko-Host tracks their progress and scores.",
},

{
  name: "Lottery",
  purpose:
    "Lets participants enter a Live drawing and allows the host to select a winner.",
  howToUse:
    "Use this for giveaways, raffles, door prizes, drawings, or event promotions. Configure entry rules in the Live Manager, let participants submit their entries, then use Host Control to securely draw a winner.",
},

{
  name: "Leaderboard",
  purpose:
    "Displays participant rankings and scores during a Live experience.",
  howToUse:
    "Use this alongside scored Live activities such as Trivia, Spin Wheel, Scavenger Hunt, Lottery, or Mystery Drops. Rankings update from participant scores so everyone can follow the competition during the event.",
},

{
  name: "Mystery Drop",
  purpose:
    "Lets the host release hidden content, rewards, challenges, or surprises during a Live experience.",
  howToUse:
    "Use this for surprise prizes, secret challenges, bonus points, clues, reveals, promotions, or timed event moments. Configure drops in the Live Manager, release them from Host Control, and participants can reveal available drops from the microsite.",
},

{
  name: "Announcement",
  purpose:
    "Displays host-published Live announcements to connected participants.",
  howToUse:
    "Use this for event updates, instructions, reminders, schedule changes, winner announcements, alerts, or important messages. Prepare announcements for the experience and publish them from Host Control when participants need to see them.",
},

];