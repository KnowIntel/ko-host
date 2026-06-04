import type { BuilderBlockType } from "@/lib/templates/builder";

export type BlockGuideSection = {
  title: string;
  body?: string;
  bullets?: string[];
};

export type BlockGuide = {
  title: string;
  subtitle: string;
  sections: BlockGuideSection[];
};

export const BLOCK_GUIDES: Partial<Record<BuilderBlockType, BlockGuide>> = {
  pop_balloon: {
    title: "Pop the Balloon",
    subtitle:
      "Complete owner, host, and contestant guide for running a live real-time social elimination game inside Ko-Host.",
    sections: [
      {
        title: "Overview",
        body:
          "Pop the Balloon is a live social game where one person is featured, a group forms a lineup, and each lineup participant decides whether they are interested by keeping their balloon or popping their balloon. At the end of the round, the featured contestant can be matched with one of the remaining players.",
      },
      {
        title: "Objective",
        body:
          "The goal is to create a fast, fun, social elimination experience that feels like a live event while staying lightweight enough to run without video, heavy infrastructure, or complicated setup.",
        bullets: [
          "Encourages quick interaction.",
          "Creates a spectator-friendly experience.",
          "Works for dating, networking, parties, icebreakers, and live social events.",
          "Lets the host control the flow like a game operator or moderator.",
        ],
      },
      {
        title: "Host / Owner Role",
        body:
          "The host is the game operator. The host controls who is featured, when rounds start and end, who gets removed, and when a final match is selected.",
        bullets: [
          "Choose the featured contestant.",
          "Start, end, and reset rounds.",
          "Remove bad actors or spam participants.",
          "Select the final match.",
          "Keep the event moving and organized.",
        ],
      },
      {
        title: "Entering Host Mode",
        body:
          "Host mode is unlocked by entering the Host Passcode that the site owner sets in the builder inspector.",
        bullets: [
          "Enter the host passcode on the public microsite.",
          "Press Enter or unlock host mode.",
          "Host controls stay available after refresh until the host exits.",
          "Host controls include Start Round, End Round, Reset Round, Feature Contestant, Remove, and Select Match.",
        ],
      },
      {
        title: "Host Game Flow",
        bullets: [
          "Step 1 - Build the lineup: wait for users to join. The max number of players is controlled by the Lineup Slots setting.",
          "Step 2 - Choose the featured contestant: click Feature Contestant to place one player center stage.",
          "Step 3 - Start the round: this locks in the active game state and enables interaction.",
          "Step 4 - Observe decisions: players either keep their balloon or pop their balloon.",
          "Step 5 - End round or select match: the host can choose a match from remaining players or allow the round to end without a match.",
          "Step 6 - Reset round: clears round statuses and prepares the game for the next featured contestant.",
        ],
      },
      {
        title: "Inspector Configuration Settings",
        body:
          "The owner controls the game setup from the Pop the Balloon inspector settings in the builder.",
        bullets: [
          "Lineup Slots - controls the maximum number of participants.",
          "Require Pop Reason - asks users to explain why they popped their balloon.",
          "Match Result Mode - controls whether match results are public or private.",
          "Audience Voting Enabled - reserved for future voting behavior.",
          "Anonymous Viewing Enabled - can hide or reduce visible identity details.",
          "Theme - controls the visual style of the block.",
          "Host Passcode - unlocks host controls on the public microsite.",
        ],
      },
      {
        title: "Moderation Responsibilities",
        body:
          "The current version gives the host manual moderation power. Automated safety and identity systems are not fully built yet.",
        bullets: [
          "Remove trolls, spam, or inappropriate users.",
          "Reset broken or messy rounds.",
          "Keep the game moving.",
          "Explain the rules to participants when needed.",
          "Use the host controls responsibly during live events.",
        ],
      },
      {
        title: "Contestant Role",
        body:
          "Contestants are lineup participants. They join the game, wait for the host to start the round, and then decide whether to stay interested or pop their balloon.",
        bullets: [
          "Join the lineup from the public microsite.",
          "Fill out the requested profile/introduction fields.",
          "Wait for the host to select a featured contestant and start the round.",
          "Keep your balloon if you are still interested.",
          "Pop your balloon if you are not interested.",
          "Leave the lineup if you no longer want to participate.",
        ],
      },
      {
        title: "Joining the Game",
        body:
          "A public user joins by clicking Join Lineup and submitting their basic profile details.",
        bullets: [
          "Name.",
          "Age, if enabled or requested.",
          "Short intro.",
          "What they are looking for.",
          "Fun fact or personality detail.",
          "Consent/acknowledgement before joining.",
        ],
      },
      {
        title: "During the Round",
        body:
          "When the round is live, lineup contestants make a simple choice: keep the balloon or pop the balloon.",
        bullets: [
          "Keep Balloon - stay in the game and signal interest.",
          "Pop Balloon - opt out of the round.",
          "If pop reasons are required, the contestant must explain why they popped.",
          "After popping, the contestant should not be able to continue acting in that round.",
        ],
      },
      {
        title: "Featured Contestant Rules",
        body:
          "The featured contestant is the person being presented to the lineup. They are center stage and do not pop a balloon.",
        bullets: [
          "Appears visually highlighted in the featured contestant area.",
          "Does not participate as a balloon-popping lineup player during that round.",
          "Observes who stays and who pops.",
          "Can be matched with one of the remaining contestants through the host’s final selection.",
        ],
      },
      {
        title: "End of Round Outcomes",
        bullets: [
          "Match Selected - the host chooses a remaining player as the match.",
          "No Match - everyone popped or the host ends without selecting a match.",
          "Private Outcome - result visibility depends on the Match Result Mode setting.",
        ],
      },
      {
        title: "Complete Game Cycle",
        bullets: [
          "Users join the lineup.",
          "Host selects the featured contestant.",
          "Host starts the round.",
          "Players keep or pop their balloons.",
          "Host selects a match or ends the round.",
          "Host resets the round.",
          "The process repeats with a new featured contestant.",
        ],
      },
      {
        title: "Design Principles",
        body:
          "This block is designed to be low-friction, high-engagement, and event-ready.",
        bullets: [
          "Low friction - guests can participate without a complicated onboarding flow.",
          "High engagement - binary decisions keep the game moving.",
          "Spectator-friendly - viewers can understand the action quickly.",
          "Event-ready - works for parties, dating events, networking sessions, game nights, and livestream interactions.",
        ],
      },
      {
        title: "Current MVP Limitations",
        body:
          "This version is functional, but it is still an MVP and should be treated as a lightweight live game system.",
        bullets: [
          "No full identity verification yet.",
          "No advanced anti-spam protection yet.",
          "Host passcode is currently frontend-based and should not be treated as strong security.",
          "No full chat moderation yet.",
          "No automated abuse prevention yet.",
          "The host is responsible for manual moderation during live use.",
        ],
      },
      {
        title: "Future Expansion Ideas",
        bullets: [
          "Audience voting.",
          "Live chat.",
          "Profile photos.",
          "Round timers.",
          "Queue system.",
          "Private messaging after a match.",
          "Analytics for engagement and match rates.",
          "Stronger moderation and safety controls.",
        ],
      },
      {
        title: "What This Block Really Is",
        body:
          "Pop the Balloon is more than a visual block. It is a reusable real-time social game engine inside Ko-Host.",
        bullets: [
          "Dating events.",
          "Icebreakers.",
          "Hiring or recruiting events.",
          "Game nights.",
          "Community meetups.",
          "Livestream audience interactions.",
        ],
      },
    ],
  },

  listing: {
  title: "Listing",
  subtitle:
    "Create individual products, services, or offerings that can optionally connect into a shared cart system.",
  sections: [
    {
      title: "Overview",
      body:
        "The Listing block represents a single item, product, or offering. It can exist as a standalone display or be connected to the Cart block when 'Add to Cart' is enabled.",
    },
    {
      title: "Objective",
      bullets: [
        "Display a product, service, or offering.",
        "Allow owners to assign pricing.",
        "Optionally connect the listing into a shared cart system.",
        "Serve as the building block for commerce on a microsite.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Title - name of the item.",
        "Description - details about the item.",
        "Price - cost of the item.",
        "Add to Cart - includes this item in the Cart block when enabled.",
        "Image - optional visual representation.",
        "Metadata - additional structured details.",
      ],
    },
    {
      title: "Add to Cart Behavior",
      body:
        "When 'Add to Cart' is enabled, the listing becomes part of the Cart system.",
      bullets: [
        "The Cart block automatically detects all listings with Add to Cart enabled.",
        "Each listing contributes its price to the cart subtotal.",
        "Listings are linked by their unique block ID.",
      ],
    },
    {
      title: "Standalone vs Cart Mode",
      bullets: [
        "Standalone - used for display only.",
        "Cart Mode - included in total calculations and checkout.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Selling physical products.",
        "Offering services or bookings.",
        "Event tickets.",
        "Bundles or packages.",
        "Menus or catalogs.",
      ],
    },
  ],
},

audio: {
  title: "Audio",
  subtitle:
    "Upload and play audio directly on the microsite with optional autoplay, looping, and player controls.",
  sections: [
    {
      title: "Overview",
      body:
        "The Audio block allows owners to upload audio content that visitors can listen to directly from the microsite. This can be used for music, podcasts, announcements, voice recordings, ambience, interviews, or any other audio experience.",
    },
    {
      title: "Objective",
      bullets: [
        "Provide an audio listening experience directly on the microsite.",
        "Support looping ambient or background audio.",
        "Allow optional autoplay behavior.",
        "Give visitors playback controls when enabled.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Browse Audio - upload or replace the audio file.",
        "Remove - removes the current audio file.",
        "Repeat - continuously loops the audio.",
        "Autoplay - attempts to automatically play audio when the page loads.",
        "Show Player Controls - toggles visibility of the playback controls.",
      ],
    },
    {
      title: "Playback Behavior",
      body:
        "Audio playback behavior depends partly on browser restrictions and visitor device settings.",
      bullets: [
        "Desktop browsers may allow autoplay depending on browser permissions.",
        "Mobile browsers often block autoplay until the visitor interacts with the page.",
        "Loop mode will continuously replay the audio when enabled.",
        "Player controls allow pause, seek, and volume adjustment.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Background music for event pages.",
        "Podcast or interview embeds.",
        "Voice greetings or announcements.",
        "Meditation or ambience experiences.",
        "Audio storytelling or guided experiences.",
        "Music previews or artist showcases.",
      ],
    },
  ],
},

frame: {
  title: "Frame",
  subtitle:
    "Create a visual capture boundary that can export everything positioned inside the frame area as an image.",
  sections: [
    {
      title: "Overview",
      body:
        "The Frame block acts as a capture zone or module boundary. Anything visually positioned inside the frame area can later be exported as a downloadable image snapshot.",
    },
    {
      title: "Objective",
      bullets: [
        "Group visual content into a defined capture area.",
        "Allow exporting portions of a microsite as an image.",
        "Create reusable visual modules or downloadable scenes.",
        "Provide clean layout boundaries during design.",
      ],
    },
    {
      title: "Canvas vs Public Behavior",
      bullets: [
        "On the builder canvas, the frame displays a visible dashed border to show capture bounds.",
        "On public and preview pages, the border is hidden.",
        "The public/preview version displays a Download button for exporting the framed content.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Frame Name - optional export filename label.",
        "Frame dimensions are controlled by resizing the block on the canvas.",
        "Position determines the capture region.",
      ],
    },
    {
      title: "Capture Behavior",
      body:
        "The Frame block is intended to export visual content positioned within its boundaries.",
      bullets: [
        "Exports as a downloadable PNG image.",
        "Can be used to create downloadable posters, cards, summaries, or shareable snapshots.",
        "Designed for modular microsite sections.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Downloadable invitations.",
        "Social share graphics.",
        "Photo booth or event snapshots.",
        "Achievement or certificate exports.",
        "Downloadable menus or cards.",
        "Visual section grouping during design.",
      ],
    },
  ],
},

puzzle: {
  title: "Puzzle",
  subtitle:
    "Turn any image into an interactive puzzle experience for your visitors.",
  sections: [
    {
      title: "Overview",
      body:
        "The Puzzle block lets you upload an image and transform it into a playable puzzle. Visitors will eventually be able to drag and place pieces to reconstruct the image.",
    },
    {
      title: "Objective",
      bullets: [
        "Create an engaging interactive experience.",
        "Encourage user participation.",
        "Add gamification to your microsite.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Image URL - the image used for the puzzle.",
        "Puzzle Piece Count - total number of pieces (10–1000).",
        "Puzzle Piece Cut - jigsaw or straight edges.",
        "Sort Level - controls how pieces are arranged.",
        "Reset - prepares puzzle data for generation.",
      ],
    },
    {
      title: "Difficulty Levels",
      bullets: [
        "Beginner - edge pieces grouped, easier layout.",
        "Intermediate - edges grouped, others mixed.",
        "Advanced - fully randomized placement.",
      ],
    },
    {
      title: "Future Interaction",
      body:
        "Puzzle pieces will support drag-and-drop, snapping, and completion tracking in future updates.",
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Event engagement",
        "Games and competitions",
        "Brand interaction",
        "Photo reveals",
        "Marketing experiences",
      ],
    },
  ],
},

spin_wheel: {
  title: "Spin Wheel",
  subtitle:
    "Create a fun, interactive prize wheel that visitors can spin for rewards, messages, or surprises.",
  sections: [
    {
      title: "Overview",
      body:
        "The Spin Wheel block allows you to create a spinning prize wheel experience. Visitors can click to spin and land on a random result such as a reward, discount, or message.",
    },
    {
      title: "Objective",
      bullets: [
        "Increase engagement with gamification.",
        "Reward visitors with prizes or messages.",
        "Encourage interaction and return visits.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Title - main heading shown above the wheel.",
        "Subtitle - supporting message below the title.",
        "Spin Wheel Items - each line becomes a wheel segment.",
        "Button Text - label for the spin button.",
        "Winner Message - shown when a winning item is selected.",
        "Loser Message - shown for non-winning results.",
        "Wheel Style - visual style of the wheel.",
        "Allow Multiple Spins - allow users to spin more than once.",
        "Show Confetti - celebratory effect on win.",
        "Show Sound - play sound during spin (future support).",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "Each line entered becomes a segment on the wheel.",
        "The wheel spins and randomly selects a result.",
        "The result is displayed to the user after the spin.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Giveaways and sweepstakes",
        "Discount or coupon promotions",
        "Event engagement games",
        "Lead generation incentives",
        "Interactive landing pages",
      ],
    },
  ],
},

cart: {
  title: "Cart",
  subtitle:
    "Aggregates all selected listings into a single checkout experience with totals, tax, and discounts.",
  sections: [
    {
      title: "Overview",
      body:
        "The Cart block collects all Listing blocks with 'Add to Cart' enabled and calculates a full order summary.",
    },
    {
      title: "Objective",
      bullets: [
        "Aggregate selected listing items.",
        "Calculate subtotal, tax, discount, and total.",
        "Provide a unified checkout experience.",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "Finds all Listing blocks with Add to Cart enabled.",
        "Pulls item data using block IDs.",
        "Calculates totals automatically.",
        "Displays items in a scrollable list.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Heading - title of the cart.",
        "Tax Rate - applied as a percentage (decimal).",
        "Discount - flat reduction from total.",
        "Button Text - checkout button label.",
      ],
    },
    {
      title: "Cart Calculations",
      bullets: [
        "Subtotal = sum of all listing prices.",
        "Tax = subtotal × tax rate.",
        "Total = subtotal + tax - discount.",
      ],
    },
    {
      title: "Checkout Behavior",
      bullets: [
        "Checkout button sends all items to Stripe.",
        "Requires a live microsite.",
        "Uses a single transaction for all items.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Multi-product checkout.",
        "Event bundles.",
        "Shopping-style microsites.",
        "Service packages.",
      ],
    },
    {
  title: "Payments & Stripe Setup",
  bullets: [
    "Cart checkout requires a connected Stripe account.",
    "Connect Stripe from Dashboard → Settings → Payments.",
    "All successful transactions are processed through Stripe Checkout.",
    "Orders and payments can be managed in your Stripe Dashboard.",
    "Ko-Host does not store payment details — Stripe handles all secure processing.",
  ],
},
  ],
},

checkout: {
  title: "Checkout",
  subtitle:
    "Simple single-item payment block for direct purchases without a cart.",
  sections: [
    {
      title: "Overview",
      body:
        "The Checkout block is used for single-item purchases and sends a direct payment to Stripe.",
    },
    {
      title: "Objective",
      bullets: [
        "Provide a simple one-click payment experience.",
        "Avoid the need for a cart system.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Product Name - name of the item.",
        "Description - optional details.",
        "Price - amount charged.",
        "Button Text - label for checkout button.",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "User clicks checkout button.",
        "Stripe session is created.",
        "User completes payment.",
      ],
    },
    {
      title: "Cart vs Checkout",
      bullets: [
        "Checkout = single item.",
        "Cart = multiple items.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Donations (simple).",
        "Single product sales.",
        "Access fees.",
      ],
    },
    {
  title: "Payments & Stripe Setup",
  bullets: [
    "Checkout requires a connected Stripe account.",
    "Connect Stripe from Dashboard → Settings → Payments.",
    "Each checkout action creates a Stripe payment session.",
    "All transactions are visible and managed in your Stripe Dashboard.",
    "Ko-Host securely redirects users to Stripe for payment processing.",
  ],
},
  ],
},

donation: {
  title: "Donation",
  subtitle:
    "Allow users to choose from predefined donation amounts using multiple checkout buttons.",
  sections: [
    {
      title: "Overview",
      body:
        "The Donation block provides multiple preset payment options instead of a single button.",
    },
    {
      title: "Objective",
      bullets: [
        "Allow flexible donation amounts.",
        "Simplify payment selection.",
        "Increase conversion through choice.",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "Owner defines multiple donation amounts.",
        "Each amount becomes its own checkout button.",
        "Each button creates its own Stripe checkout session.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Number of buttons.",
        "Amount per button.",
        "Optional labels.",
      ],
    },
    {
      title: "User Experience",
      bullets: [
        "User selects an amount.",
        "User is redirected to Stripe.",
        "Completes donation.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Fundraising.",
        "Tips or support.",
        "Charity events.",
        "Creator support.",
      ],
    },
    {
  title: "Payments & Stripe Setup",
  bullets: [
    "Donations require a connected Stripe account.",
    "Connect Stripe from Dashboard → Settings → Payments.",
    "Each donation button triggers a Stripe checkout for the selected amount.",
    "All donations are tracked in your Stripe Dashboard.",
    "You can manage payouts, refunds, and reports directly through Stripe.",
  ],
},
  ],
},

bookmark: {
  title: "Bookmark",
  subtitle:
    "Create invisible anchor points that allow buttons and links to scroll to specific sections of your page.",
  sections: [
    {
      title: "Overview",
      body:
        "The Bookmark block acts as a scroll anchor on your page. It is invisible to visitors but allows navigation to precise sections.",
    },
    {
      title: "Objective",
      bullets: [
        "Enable smooth navigation within a page.",
        "Create section-based linking.",
        "Improve user flow and usability.",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "Each bookmark generates a unique #slug.",
        "Buttons and Links can target that slug.",
        "Clicking the link scrolls the page to that location.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Bookmark Name (used for organization).",
        "Auto-generated URL slug.",
        "Copyable #link for navigation.",
      ],
    },
    {
      title: "User Experience",
      bullets: [
        "User clicks a button or link.",
        "Page smoothly scrolls to the bookmarked section.",
        "No visual element is shown for the bookmark itself.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Menu sections (Breakfast / Lunch / Dinner).",
        "Event agendas.",
        "Landing page navigation.",
        "Jump-to sections in long pages.",
      ],
    },
    {
      title: "Pro Tips",
      bullets: [
        "Place bookmarks slightly above the target content for better alignment.",
        "Use clear names so slugs are easy to recognize.",
        "Pair with Buttons for strong navigation UX.",
      ],
    },
  ],
},

registry: {
  title: "Registry",
  subtitle:
    "Create a curated list of desired items or contributions for events, gifting, or support.",
  sections: [
    {
      title: "Overview",
      body:
        "The Registry block allows owners to list requested items or contributions for others to view and fulfill.",
    },
    {
      title: "Objective",
      bullets: [
        "Organize desired items.",
        "Provide a structured wishlist.",
        "Enable gifting or contributions.",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "Owner creates registry entries.",
        "Each entry includes details and optional links.",
        "Users can view and fulfill items externally or through checkout.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Item title.",
        "Description.",
        "Optional link or price.",
        "Optional image.",
      ],
    },
    {
      title: "Registry Behavior",
      bullets: [
        "Acts as a structured wishlist.",
        "Can be informational or transactional.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Wedding registries.",
        "Baby showers.",
        "Event wishlists.",
        "Community support lists.",
      ],
    },
  ],
},

countdown: {
  title: "Countdown",
  subtitle:
    "Create a live timer that counts down to a specific date or event.",
  sections: [
    {
      title: "Overview",
      body:
        "The Countdown block displays a real-time timer counting down to a target date or time.",
    },
    {
      title: "Objective",
      bullets: [
        "Build urgency for an event or launch.",
        "Visually highlight important deadlines.",
        "Increase engagement through anticipation.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Target Date & Time.",
        "Time Zone.",
        "Display Format (days, hours, minutes, seconds).",
        "Optional label or message.",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "Timer updates in real time.",
        "Automatically reaches zero at the target time.",
        "Can optionally remain at zero or hide after completion.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Event countdowns.",
        "Product launches.",
        "Ticket sales deadlines.",
        "Limited-time offers.",
      ],
    },
  ],
},

checklist: {
  title: "Checklist",
  subtitle:
    "Create a structured list of tasks, items, or steps for users to follow.",
  sections: [
    {
      title: "Overview",
      body:
        "The Checklist block displays a list of items that can be used for tasks, requirements, or steps.",
    },
    {
      title: "Objective",
      bullets: [
        "Organize tasks or requirements.",
        "Provide step-by-step guidance.",
        "Create structured lists for users to follow.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Checklist items.",
        "Optional labels or categories.",
        "Item ordering.",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "Displays a list of items.",
        "Can represent tasks, requirements, or steps.",
        "Primarily informational (no persistent tracking yet).",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Event preparation lists.",
        "Onboarding steps.",
        "Requirements for participation.",
        "To-do lists.",
      ],
    },
  ],
},

schedule_agenda: {
  title: "Schedule / Agenda",
  subtitle:
    "Display a structured timeline of events, sessions, or activities.",
  sections: [
    {
      title: "Overview",
      body:
        "The Schedule / Agenda block organizes time-based events into a clear, structured timeline.",
    },
    {
      title: "Objective",
      bullets: [
        "Provide a clear timeline of events.",
        "Help users understand flow and timing.",
        "Organize sessions or activities.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Event title.",
        "Start time.",
        "End time.",
        "Description.",
        "Optional grouping or sections.",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "Displays events in chronological order.",
        "Each item includes time and details.",
        "Can represent a full-day or multi-day schedule.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Conferences.",
        "Event schedules.",
        "Workshops.",
        "Daily agendas.",
      ],
    },
  ],
},

calendar_event: {
  title: "Calendar Event",
  subtitle:
    "Display scheduled events inside an interactive calendar that visitors can browse by date.",

  sections: [
    {
      title: "What is it?",
      body:
        "The Calendar Event block allows you to organize events by date and present them in a professional calendar interface. Visitors can browse the calendar, select dates, and view event details.",
    },

    {
      title: "Best Uses",
      bullets: [
        "Community event schedules",
        "Club meetings",
        "Class calendars",
        "Workshops",
        "Tour schedules",
        "Campaign appearances",
        "Watch parties",
        "Webinars",
        "Conferences",
        "Multi-day events",
      ],
    },

    {
      title: "Style Variants",
      bullets: [
        "Standard — calendar on left, details on right",
        "Formal — calendar above details",
        "Simplified — event cards without full calendar",
      ],
    },

    {
      title: "Event Images",
      body:
        "Each event can include its own image. Images may appear on either the left or right side of the event details card.",
    },

    {
      title: "Virtual Meetings",
      body:
        "Events can include a virtual meeting URL. Visitors can open the meeting link or copy it directly from the event card.",
    },

    {
      title: "Add To Calendar",
      body:
        "Optionally provide a calendar link for each event. Visitors can add events to their preferred calendar service using your supplied URL.",
    },

    {
      title: "Professional Tips",
      bullets: [
        "Keep event titles short and recognizable",
        "Use category labels to organize event types",
        "Add images for featured activities",
        "Include locations whenever possible",
        "Provide Add To Calendar links for registrations and appointments",
      ],
    },
  ],
},

map_location: {
  title: "Map / Location",
  subtitle:
    "Provide a visual map and location details for a physical place.",
  sections: [
    {
      title: "Overview",
      body:
        "The Map / Location block displays a physical location using a map and address details.",
    },
    {
      title: "Objective",
      bullets: [
        "Help users find a location.",
        "Provide clear directions.",
        "Visually anchor a physical event or place.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Address.",
        "Latitude / Longitude (optional).",
        "Map zoom level.",
        "Label or location name.",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "Displays a map centered on the location.",
        "Shows a marker for the destination.",
        "Users can open directions in external map apps.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Event venues.",
        "Meetup locations.",
        "Storefronts.",
        "Conference locations.",
      ],
    },
    {
  title: "Dynamic Data Linking",
  bullets: [
    "Highlight blocks can be linked to live data from other blocks.",
    "Supported dynamic sources include:",
    "• RSVP count (total attendees)",
    "• Donation totals (total funds raised)",
    "• Poll results (votes or percentages)",
    "• Thread activity (top messages or engagement)",
    "When linked, the Highlight block updates automatically as data changes.",
  ],
},
  ],
},

highlight: {
  title: "Highlight",
  subtitle:
    "Draw attention to key information, announcements, or important messages.",
  sections: [
    {
      title: "Overview",
      body:
        "The Highlight block is used to emphasize important content with visual styling that stands out from the rest of the page.",
    },
    {
      title: "Objective",
      bullets: [
        "Call attention to critical information.",
        "Break visual monotony with standout sections.",
        "Guide user focus to key messages.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Text content.",
        "Background color or style.",
        "Text styling (font, size, alignment).",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "Displays styled text inside a visually distinct container.",
        "Can be placed anywhere in the layout.",
        "Acts as a visual anchor for important content.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Announcements.",
        "Important notices.",
        "Callouts or featured info.",
        "Key selling points.",
      ],
    },
  ],
},

progress_bar: {
  title: "Progress Bar",
  subtitle:
    "Visually represent progress toward a goal, target, or completion state.",
  sections: [
    {
      title: "Overview",
      body:
        "The Progress Bar block displays a visual indicator showing progress toward a defined value or goal.",
    },
    {
      title: "Objective",
      bullets: [
        "Show measurable progress.",
        "Encourage completion or participation.",
        "Provide visual feedback on goals.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Current value.",
        "Maximum/goal value.",
        "Optional label or description.",
        "Styling options (color, size).",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "Fills proportionally based on value vs. goal.",
        "Updates visually as values change.",
        "Can display percentage or raw numbers.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Fundraising progress.",
        "Task completion tracking.",
        "Goal tracking.",
        "Event participation metrics.",
      ],
    },
  ],
},

cta: {
  title: "Button",
  subtitle:
    "Create a call-to-action button that drives users to take action.",
  sections: [
    {
      title: "Overview",
      body:
        "The Button block (CTA) is used to trigger actions such as navigation, external links, or interactions.",
    },
    {
      title: "Objective",
      bullets: [
        "Drive user actions.",
        "Guide users toward key goals.",
        "Provide clear interaction points.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Button text.",
        "Link URL or action.",
        "Styling (color, size, alignment).",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "Users click the button to perform an action.",
        "Can navigate internally or externally.",
        "Acts as a primary interaction trigger.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Sign-ups.",
        "External links.",
        "Event registration.",
        "Navigation actions.",
      ],
    },
    {
  title: "Linking & Actions",
  bullets: [
    "Buttons can link to internal pages or external URLs.",
    "For internal pages, use the page slug as the link (example: /schedule or /about).",
    "Page names in the builder automatically generate slugs used for linking.",
    "Recommended naming: short, lowercase, hyphen-separated (example: event-details).",
    "Buttons can also trigger form submissions when paired with Input Fields.",
    "Use buttons to submit, navigate, or trigger actions.",
  ],
},
  ],
},

links: {
  title: "Links",
  subtitle:
    "Display a list of labeled links for navigation or external resources.",
  sections: [
    {
      title: "Overview",
      body:
        "The Links block provides a structured list of clickable links with labels.",
    },
    {
      title: "Objective",
      bullets: [
        "Organize multiple links in one place.",
        "Provide quick navigation options.",
        "Share external resources.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Link label.",
        "URL for each link.",
        "Add/remove/reorder links.",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "Each item renders as a clickable link.",
        "Users can navigate directly to URLs.",
        "Supports multiple entries in a list format.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Social links.",
        "Resource lists.",
        "Navigation hubs.",
        "External references.",
      ],
    },
    {
  title: "Adding URLs & Page Linking",
  bullets: [
    "Enter full URLs for external links (example: https://example.com).",
    "For internal pages, use relative paths (example: /rsvp or /gallery).",
    "Page names created in the builder define the URL slug.",
    "Recommended naming: lowercase with hyphens (example: event-info).",
    "Ensure URLs are valid to avoid broken links.",
  ],
},
  ],
},

link_hub: {
  title: "Link Hub",
  subtitle:
    "Create a centralized hub of links with enhanced presentation and structure.",
  sections: [
    {
      title: "Overview",
      body:
        "The Link Hub block expands on the Links block by providing a more structured and visually enhanced link directory.",
    },
    {
      title: "Objective",
      bullets: [
        "Centralize all important links.",
        "Create a branded link hub experience.",
        "Improve link discoverability.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Link titles and URLs.",
        "Optional descriptions.",
        "Visual styling and layout.",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "Displays links in a structured, visually enhanced format.",
        "Supports richer content than basic links.",
        "Designed for full-page or section-based link hubs.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Bio link pages.",
        "Creator link hubs.",
        "Business directories.",
        "Multi-resource landing pages.",
      ],
    },
    {
  title: "Adding External Links",
  bullets: [
    "Each item requires a full external URL (example: https://instagram.com/yourpage).",
    "Link Hub is designed primarily for external destinations.",
    "Ensure all URLs include https:// for proper linking.",
    "Use clear, recognizable labels for better user experience.",
  ],
},
  ],
},

enrollment_board: {
  title: "Enrollment Board",
  subtitle:
    "Let visitors publicly add themselves to a visible member, supporter, volunteer, or sign-up list.",
  sections: [
    {
      title: "Overview",
      body:
        "The Enrollment Board block creates a public form and running enrollment list. Visitors can add their name, optional quote, optional private email, and optional profile image. Public entries appear on the microsite while private email details are reserved for the owner dashboard.",
    },
    {
      title: "Objective",
      bullets: [
        "Collect public sign-ups.",
        "Display a live member or supporter board.",
        "Support clubs, petitions, waitlists, events, classes, and community pages.",
        "Keep private contact details hidden from public visitors.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Customize heading and subtitle text.",
        "Choose Classic Board, Member Wall, or Signature List layout.",
        "Show or hide quote, email, and profile image fields.",
        "Require optional fields when needed.",
        "Customize field labels and button text.",
        "Set quote character limit.",
        "Show or hide profile images, quotes, and enrollment count.",
        "Choose list sorting and avatar shape.",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "Visitors submit their enrollment from the public microsite.",
        "Name, quote, and profile image appear publicly.",
        "Email stays private and is not shown publicly.",
        "Each browser/device can enroll once.",
        "Visitors can remove their own enrollment from the same browser/device.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Club member lists.",
        "Watch club rosters.",
        "Supporter walls.",
        "Volunteer sign-up sheets.",
        "Petition-style signature lists.",
        "Event participation boards.",
        "Class rosters.",
        "Community member boards.",
        "Waitlists.",
      ],
    },
  ],
},


thread: {
  title: "Thread",
  subtitle:
    "Enable live conversations, replies, media posts, and community interaction directly on the microsite.",
  sections: [
    {
      title: "Overview",
      body:
        "The Thread block creates a public discussion area where visitors can post messages, upload media, react to comments, and participate in ongoing conversations. Threads can operate independently or be connected to Post Board announcements for deeper discussion.",
    },
    {
      title: "Objective",
      bullets: [
        "Enable public interaction.",
        "Create a shared discussion space.",
        "Collect feedback, reactions, and visitor participation.",
        "Extend conversations beyond announcements and updates.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Set the thread subject.",
        "Allow or prevent anonymous posting.",
        "Require names when anonymous posting is disabled.",
        "Choose how many messages are displayed.",
        "Adjust scroll height for the message area.",
        "Show or hide vote controls and vote counts.",
        "Customize composer placeholder text.",
        "Customize name placeholder text.",
        "Customize post button text.",
        "Use Style Target to independently style the form, composer, subject, name field, posted messages, and action button.",
      ],
    },
    {
      title: "Media Support",
      bullets: [
        "Visitors can attach GIFs and images.",
        "Visitors can attach videos.",
        "Visitors can attach audio clips and voice notes.",
        "Media appears directly inside the posted message.",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "Visitors enter a name unless anonymous posting is enabled.",
        "Visitors create a message and optionally attach media.",
        "Posts appear immediately inside the discussion feed.",
        "Visitors can vote on messages when voting is enabled.",
        "Multiple visitors can participate in the same conversation.",
      ],
    },
    {
      title: "Works Great With Post Board",
      bullets: [
        "Create official announcements in a Post Board block.",
        "Link each announcement to a dedicated Thread discussion.",
        "Allow visitors to discuss individual updates separately.",
        "Keep announcements organized while still encouraging engagement.",
        "Perfect for clubs, events, creators, communities, and organizations.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Event guestbooks.",
        "Community discussions.",
        "Live Q&A sessions.",
        "Testimonials and shoutouts.",
        "Photo and GIF reaction walls.",
        "Audio note responses.",
        "Episode discussions.",
        "Announcement discussions linked from Post Board posts.",
      ],
    },
  ],
},

post_board: {
  title: "Post Board",
  subtitle:
    "Publish announcements, updates, news, and featured posts in a structured feed layout.",
  sections: [
    {
      title: "Overview",
      body:
        "The Post Board block allows microsite owners to create a feed of announcements, updates, notices, articles, featured posts, and important information. Posts can include images, engagement counts, pinned content, and links to Thread discussions.",
    },
    {
      title: "Objective",
      bullets: [
        "Create a professional announcement feed.",
        "Highlight important updates.",
        "Organize information chronologically.",
        "Drive engagement through linked discussions.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Set the board heading and subtitle.",
        "Choose Standard, Compact, or Feature layout.",
        "Show or hide profile images.",
        "Show or hide timestamps.",
        "Enable pinned posts.",
        "Show or hide like counts.",
        "Show or hide message counts.",
        "Allow post images.",
        "Allow post videos.",
        "Configure maximum message length.",
        "Create, duplicate, edit, reorder, and remove posts.",
      ],
    },
    {
      title: "Styling Options",
      bullets: [
        "Style overall block text.",
        "Style individual post cards.",
        "Style post titles independently.",
        "Style post body content independently.",
        "Style Like and Message buttons independently.",
        "Customize card backgrounds, borders, and corner radius.",
      ],
    },
    {
      title: "Post Features",
      bullets: [
        "Upload featured images for individual posts.",
        "Display author names.",
        "Display timestamps.",
        "Pin important posts to the top.",
        "Show engagement counts.",
        "Display category labels and subtitles.",
        "Link posts to dedicated Thread discussions.",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "The owner creates and manages posts from the builder.",
        "Visitors view announcements in a feed layout.",
        "Pinned posts remain at the top.",
        "Newest posts automatically appear first.",
        "Posts can direct visitors into dedicated Thread discussions.",
      ],
    },
    {
      title: "Works Great With Thread",
      bullets: [
        "Use Post Board for official announcements.",
        "Use Thread blocks for visitor discussion.",
        "Assign a Thread ID to a post.",
        "Allow each announcement to have its own conversation area.",
        "Separate announcements from discussion clutter.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Club announcements.",
        "Watch club episode updates.",
        "Event updates.",
        "Conference news.",
        "Community bulletins.",
        "School notices.",
        "Creator updates.",
        "Business announcements.",
        "Release notes and changelogs.",
        "Featured news feeds.",
      ],
    },
  ],
},

file_share: {
  title: "File Share",
  subtitle:
    "Allow users to upload, share, and access files within the microsite.",
  sections: [
    {
      title: "Overview",
      body:
        "The File Share block provides a space for users to upload and access shared files.",
    },
    {
      title: "Objective",
      bullets: [
        "Enable file sharing between users.",
        "Centralize uploaded content.",
        "Support collaboration or resource distribution.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Optional heading.",
        "Upload permissions (if applicable).",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "Users upload files.",
        "Files are listed and accessible to others.",
        "Supports multiple file types.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Event document sharing.",
        "Photo uploads.",
        "Resource distribution.",
        "Collaboration hubs.",
      ],
    },
    {
  title: "Managing Uploaded Files",
  bullets: [
    "All uploaded files are stored and accessible in the dashboard.",
    "Go to Dashboard → Microsite → Media / Uploads to manage files.",
    "Owners can review, download, or remove uploaded content.",
    "File storage is tied to the microsite and persists while active.",
  ],
},
  ],
},

form_field: {
  title: "Input Field",
  subtitle:
    "Collect structured information from users through customizable fields.",
  sections: [
    {
      title: "Overview",
      body:
        "The Input Field block allows users to submit information such as text, emails, or other data.",
    },
    {
      title: "Objective",
      bullets: [
        "Collect user data.",
        "Enable structured input.",
        "Support forms and submissions.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Field label.",
        "Input type (text, email, etc.).",
        "Placeholder text.",
        "Required/optional setting.",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "Users enter information into the field.",
        "Data can be submitted and stored.",
        "Supports validation depending on type.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Contact forms.",
        "Registration fields.",
        "Data collection.",
        "Custom user input.",
      ],
    },
    {
    title: "Submitting & Managing Data",
    bullets: [
        "Input Fields must be paired with a Button to submit data.",
        "Set the Button action to submit form data from connected fields.",
        "Each Input Field automatically links to the nearest form submission context.",
        "All submitted entries are stored and accessible in Dashboard → Microsite → Form Submissions.",
        "Owners can view, export, or manage submitted data from the dashboard.",
    ],
    },
  ],
},

poll: {
  title: "Poll",
  subtitle:
    "Create interactive polls for users to vote and share opinions.",
  sections: [
    {
      title: "Overview",
      body:
        "The Poll block allows users to vote on predefined options and see results.",
    },
    {
      title: "Objective",
      bullets: [
        "Gather opinions from users.",
        "Encourage interaction.",
        "Display real-time voting results.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Poll question.",
        "Answer options.",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "Users select an option.",
        "Votes are recorded.",
        "Results can be displayed dynamically.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Event decisions.",
        "Audience engagement.",
        "Feedback collection.",
        "Interactive content.",
      ],
    },
  ],
},

rsvp: {
  title: "RSVP",
  subtitle:
    "Allow users to confirm attendance and respond to invitations.",
  sections: [
    {
      title: "Overview",
      body:
        "The RSVP block enables users to indicate whether they will attend an event.",
    },
    {
      title: "Objective",
      bullets: [
        "Track attendance.",
        "Collect guest responses.",
        "Organize event participation.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Event name or label.",
        "Response options (Yes/No/Maybe).",
        "Optional fields (name, contact info).",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "Users submit their response.",
        "Responses are recorded and stored.",
        "Owners can review attendance data.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Events.",
        "Parties.",
        "Weddings.",
        "Meetups.",
      ],
    },
  ],
},

faq: {
  title: "FAQ",
  subtitle:
    "Provide answers to frequently asked questions in a structured format.",
  sections: [
    {
      title: "Overview",
      body:
        "The FAQ block displays a list of questions and answers for users to browse.",
    },
    {
      title: "Objective",
      bullets: [
        "Answer common questions.",
        "Reduce confusion.",
        "Provide quick information access.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Questions.",
        "Answers.",
        "Add/remove/reorder entries.",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "Users expand or view answers.",
        "Content is organized in a list format.",
        "Improves clarity and usability.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Event information.",
        "Product FAQs.",
        "Support pages.",
        "General information sections.",
      ],
    },
  ],
},

image: {
  title: "Image",
  subtitle:
    "Display a single image to enhance visual presentation and content.",
  sections: [
    {
      title: "Overview",
      body:
        "The Image block allows you to upload and display a single image anywhere on your microsite.",
    },
    {
      title: "Objective",
      bullets: [
        "Add visual appeal.",
        "Showcase a product, person, or scene.",
        "Support branding and storytelling.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Upload image.",
        "Adjust fit and positioning.",
        "Optional styling.",
      ],
    },
    {
      title: "File Requirements",
      bullets: [
        "Recommended formats: JPG, PNG, WEBP.",
        "Max file size: 5MB.",
        "Recommended resolution: 1200px+ width for clarity.",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "Image renders within its grid placement.",
        "Automatically scales to fit container.",
        "Maintains aspect ratio.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Hero images.",
        "Product photos.",
        "Profile pictures.",
        "Event visuals.",
      ],
    },
  ],
},

video: {
  title: "Video",
  subtitle:
    "Embed and display video content for richer engagement.",
  sections: [
    {
      title: "Overview",
      body:
        "The Video block allows you to embed or upload video content directly into your microsite.",
    },
    {
      title: "Objective",
      bullets: [
        "Increase engagement with motion content.",
        "Explain concepts visually.",
        "Showcase media-rich experiences.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Upload video or provide video URL.",
        "Playback settings (if applicable).",
      ],
    },
    {
      title: "File Requirements",
      bullets: [
        "Supported formats: MP4 recommended.",
        "Max file size: 25MB.",
        "Recommended resolution: 720p–1080p.",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "Video is embedded and playable in place.",
        "Users can interact with playback controls.",
        "Auto-scales to fit container.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Product demos.",
        "Event highlights.",
        "Announcements.",
        "Promotional content.",
      ],
    },
  ],
},

gallery: {
  title: "Gallery",
  subtitle:
    "Display multiple images in a structured, scrollable or grid layout.",
  sections: [
    {
      title: "Overview",
      body:
        "The Gallery block allows you to showcase multiple images in a clean, organized format.",
    },
    {
      title: "Objective",
      bullets: [
        "Display collections of images.",
        "Create visual storytelling sections.",
        "Showcase multiple items or moments.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Upload multiple images.",
        "Arrange or reorder images.",
        "Layout styling options.",
      ],
    },
    {
      title: "File Requirements",
      bullets: [
        "Supported formats: JPG, PNG, WEBP.",
        "Max file size per image: 5MB.",
        "Recommended resolution: 1000px+ width.",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "Images render in a grid or structured layout.",
        "Users can scroll or view multiple images at once.",
        "Maintains consistent spacing and alignment.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Event photo collections.",
        "Portfolios.",
        "Product showcases.",
        "Memories or highlights.",
      ],
    },
  ],
},

image_carousel: {
  title: "Carousel",
  subtitle:
    "Display a rotating set of images that users can swipe or navigate through.",
  sections: [
    {
      title: "Overview",
      body:
        "The Carousel block presents images in a sliding format, allowing users to navigate through them one at a time.",
    },
    {
      title: "Objective",
      bullets: [
        "Highlight multiple images in a compact space.",
        "Create interactive visual experiences.",
        "Showcase featured content.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Upload multiple images.",
        "Arrange slide order.",
        "Optional display settings.",
      ],
    },
    {
      title: "File Requirements",
      bullets: [
        "Supported formats: JPG, PNG, WEBP.",
        "Max file size per image: 5MB.",
        "Recommended resolution: 1200px+ width.",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "Displays one image at a time.",
        "Users can navigate via swipe or controls.",
        "Transitions between images smoothly.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Featured image sets.",
        "Before/after comparisons.",
        "Product showcases.",
        "Story-driven visuals.",
      ],
    },
  ],
},

text_fx: {
  title: "Text FX",
  subtitle:
    "Create stylized, visually enhanced text that stands out from standard text elements.",
  sections: [
    {
      title: "Overview",
      body:
        "The Text FX block is designed for visually expressive text with enhanced styling and effects beyond standard text elements.",
    },
    {
      title: "Objective",
      bullets: [
        "Create visually striking text.",
        "Enhance branding and personality.",
        "Draw attention to key phrases or headlines.",
      ],
    },
    {
      title: "What Makes This Different",
      bullets: [
        "Unlike Title, Subtitle, and Label elements, Text FX is NOT tied to page structure.",
        "Provides enhanced styling options (fonts, effects, spacing, etc.).",
        "Designed for creative expression rather than basic content.",
        "Can be placed anywhere on the canvas freely.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Text content.",
        "Font family and size.",
        "Text styling (bold, italic, underline).",
        "Alignment and color.",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "Renders styled text based on selected properties.",
        "Acts as a flexible design element.",
        "Updates in real time as styles are applied.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Headlines.",
        "Callouts.",
        "Brand statements.",
        "Decorative typography.",
      ],
    },
  ],
},

content_panel: {
  title: "Content Panel",
  subtitle:
    "Organize multiple sections of content inside one block without creating real pages.",
  sections: [
    {
      title: "Overview",
      body:
        "The Content Panel block lets visitors switch between virtual panels while staying on the same microsite page.",
    },
    {
      title: "Objective",
      bullets: [
        "Organize large amounts of information.",
        "Keep everything on one true page.",
        "Let visitors switch sections without a refresh or route change.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Event information.",
        "Schedules.",
        "FAQs.",
        "Menus.",
        "Membership resources.",
        "Course lessons.",
        "Travel itineraries.",
      ],
    },
  ],
},

rich_text: {
  title: "Rich Text",
  subtitle:
    "Create formatted text with advanced editing, links, and structured content.",
  sections: [
    {
      title: "Overview",
      body:
        "The Rich Text block allows for fully formatted text including paragraphs, lists, links, and inline styling.",
    },
    {
      title: "Objective",
      bullets: [
        "Create structured written content.",
        "Support detailed descriptions and formatting.",
        "Enable links and multi-style text in one block.",
      ],
    },
    {
      title: "What Makes This Different",
      bullets: [
        "Unlike Title, Subtitle, and Label elements, Rich Text supports multi-line and structured content.",
        "Supports lists (bulleted and numbered).",
        "Supports inline links and mixed formatting.",
        "Designed for content-heavy sections rather than single-line text.",
      ],
    },
    {
      title: "Inspector Configuration",
      bullets: [
        "Inline text editing.",
        "Bold, italic, underline formatting.",
        "Text alignment.",
        "Lists and links.",
      ],
    },
    {
      title: "How It Works",
      bullets: [
        "Users type directly into the editor.",
        "Formatting is applied via toolbar or shortcuts.",
        "Content is stored as structured HTML.",
      ],
    },
    {
      title: "Best Use Cases",
      bullets: [
        "Descriptions.",
        "Articles or long-form text.",
        "Instructions or guides.",
        "Linked content sections.",
      ],
    },
  ],
},

};