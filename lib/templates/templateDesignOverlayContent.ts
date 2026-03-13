import { normalizeTemplateName } from "@/lib/templates/normalizeTemplateName";

export type ShowcaseOverlayContent = {
  title: string;
  subtitle: string;
  description: string;
  buttonLabel: string;
  callout: string;
  linkLabel: string;
  image1?: string;
  image2?: string;
  image3?: string;
};

export type FestiveOverlayContent = {
  title: string;
  subtitle: string;
  description: string;
  buttonLabel: string;
  callout: string;
};

export type ModernOverlayContent = {
  title: string;
  description: string;
  buttonLabel: string;
  label1: string;
  label2: string;
  label3: string;
};

export type ElegantOverlayContent = {
  title: string;
  subtitle: string;
  description: string;
  buttonLabel: string;
  label1: string;
  label2: string;
  label3: string;
  label4: string;
};

export type BusinessOverlayContent = {
  title: string;
  description: string;
  buttonLabel: string;
  label1: string;
  label2: string;
  label3: string;
  contactButtonLabel: string;
};

export type BlankOverlayContent = {
  title?: string;
  subtitle?: string;
  description?: string;
};

export type TemplateDesignOverlayContent = {
  template: string;
  showcase: ShowcaseOverlayContent;
  festive: FestiveOverlayContent;
  modern: ModernOverlayContent;
  elegant: ElegantOverlayContent;
  business: BusinessOverlayContent;
  blank?: BlankOverlayContent;
};

export const TEMPLATE_DESIGN_OVERLAY_CONTENT: Record<
  string,
  TemplateDesignOverlayContent
> = {
  [normalizeTemplateName("Baby Shower")]: {
  template: "Baby Shower",
  showcase: {
    title: "Baby Harper on the Way",
    subtitle: "Shower for Emily & Mason",
    description:
      "Join us for brunch, sweet treats, and a joyful afternoon celebrating Baby Harper before her big arrival.",
    buttonLabel: "View Shower Details",
    callout: "Will you be joining us?",
    linkLabel: "RSVP Here",
  },
  festive: {
    title: "Oh Baby!",
    subtitle: "Emily's Baby Shower",
    description:
      "Come celebrate with games, brunch, and a peek at the nursery registry as we shower Emily with love.",
    buttonLabel: "Save My Seat",
    callout: "Shower Begins In:",
  },
  modern: {
    title: "A Sweet Afternoon for Baby Harper",
    description:
      "See the shower schedule, registry links, parking notes, and RSVP details all in one place.",
    buttonLabel: "View the Invitation",
    label1: "Registry",
    label2: "Event Info",
    label3: "RSVP",
  },
  elegant: {
    title: "A Beautiful Beginning",
    subtitle: "Baby Harper",
    description:
      "A soft, elegant invitation page for a meaningful gathering with family and close friends.",
    buttonLabel: "View Invitation",
    label1: "Date & Time",
    label2: "Registry",
    label3: "Location",
    label4: "RSVP",
  },
  business: {
    title: "Organize Baby Shower Details Beautifully",
    description:
      "Keep registry links, guest replies, directions, and schedule notes together in one polished page.",
    buttonLabel: "Launch Shower Page",
    label1: "Guest Replies",
    label2: "Registry Links",
    label3: "Event Notes",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Baby Shower",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Crowdfunding")]: {
  template: "Crowdfunding",
  showcase: {
    title: "Crowdfunding",
    subtitle: "Invitation & event details",
    description:
      "Join us for crowdfunding with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Crowdfunding",
    description:
      "We put together everything guests need for crowdfunding, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Crowdfunding",
    description:
      "See the timeline, location, and guest information for crowdfunding in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Crowdfunding",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for crowdfunding with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Crowdfunding Organized",
    description:
      "Share invitations, updates, and guest responses for crowdfunding in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Crowdfunding",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Reunion")]: {
  template: "Reunion",
  showcase: {
    title: "Reunion",
    subtitle: "Invitation & event details",
    description:
      "Join us for reunion with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Reunion",
    description:
      "We put together everything guests need for reunion, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Reunion",
    description:
      "See the timeline, location, and guest information for reunion in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Reunion",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for reunion with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Reunion Organized",
    description:
      "Share invitations, updates, and guest responses for reunion in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Reunion",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Memorial")]: {
  template: "Memorial",
  showcase: {
    title: "Memorial",
    subtitle: "Invitation & event details",
    description:
      "Join us for memorial with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Memorial",
    description:
      "We put together everything guests need for memorial, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Memorial",
    description:
      "See the timeline, location, and guest information for memorial in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Memorial",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for memorial with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Memorial Organized",
    description:
      "Share invitations, updates, and guest responses for memorial in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Memorial",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Open House")]: {
  template: "Open House",
  showcase: {
    title: "Open House at 118 Cedar Lane",
    subtitle: "Sunday · 1 PM to 4 PM",
    description:
      "Tour a freshly updated 3-bedroom home with vaulted ceilings, a chef's kitchen, and a private backyard patio.",
    buttonLabel: "View Details",
    callout: "Want to attend the open house?",
    linkLabel: "Get Directions",
  },
  festive: {
    title: "Tour This Home in Person",
    subtitle: "118 Cedar Lane",
    description:
      "Drop by this Sunday to see the open floor plan, new finishes, and quiet neighborhood for yourself.",
    buttonLabel: "Save the Time",
    callout: "Open House Starts In:",
  },
  modern: {
    title: "See 118 Cedar Lane Before It's Gone",
    description:
      "Browse photos, features, school info, and open-house directions for this move-in-ready home.",
    buttonLabel: "Explore the Property",
    label1: "Listing Photos",
    label2: "Home Features",
    label3: "Directions",
  },
  elegant: {
    title: "An Open House Worth Seeing",
    subtitle: "118 Cedar Lane",
    description:
      "A clean, polished home page for buyers who want beautiful details before stepping inside.",
    buttonLabel: "View the Home",
    label1: "Interior",
    label2: "Neighborhood",
    label3: "Schools",
    label4: "Schedule a Tour",
  },
  business: {
    title: "Promote Open Houses More Effectively",
    description:
      "Keep showing times, buyer interest, and listing details organized in one professional page.",
    buttonLabel: "Launch Open House Page",
    label1: "Showing Details",
    label2: "Buyer Leads",
    label3: "Property Info",
    contactButtonLabel: "Contact Agent",
  },
  blank: {
    title: "Open House",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Birthday")]: {
  template: "Birthday",
  showcase: {
    title: "Ava Turns 10 Years Old!",
    subtitle: "Saturday at 2:00 PM",
    description:
      "Join us for cupcakes, games, a backyard movie, and one very excited birthday girl.",
    buttonLabel: "View Party Details",
    callout: "Can you make it to the party?",
    linkLabel: "RSVP Now",
    image1: "/designs/design_image_placeholder.webp",
    image2: "/designs/design_image_placeholder_1536.webp",
    image3: "/designs/design_image_placeholder_1536.webp",
  },
  festive: {
    title: "You're Invited!",
    subtitle: "Ava's Birthday Party",
    description:
      "We're celebrating with pizza, a bounce house, and plenty of cake—come ready for fun.",
    buttonLabel: "Save My Spot",
    callout: "Party Starts In:",
  },
  modern: {
    title: "Let's Celebrate Ava on this Special Day",
    description:
      "See the party time, address, gift ideas, and RSVP details for Ava's big day.",
    buttonLabel: "See the Invitation",
    label1: "Party Details",
    label2: "What to Bring",
    label3: "RSVP",
  },
  elegant: {
    title: "A Special Birthday Celebration",
    subtitle: "Ava Turns 10",
    description:
      "A joyful birthday invitation page with everything guests need for an easy, fun afternoon.",
    buttonLabel: "View Celebration",
    label1: "Date & Time",
    label2: "Location",
    label3: "Gift Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Birthday Plans in One Place",
    description:
      "Share guest updates, directions, and party details in one polished birthday page.",
    buttonLabel: "Launch Party Page",
    label1: "Guest List",
    label2: "Party Schedule",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Birthday",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Product Launch")]: {
  template: "Product Launch",
  showcase: {
    title: "Introducing LedgerFlow",
    subtitle: "Smarter cash tracking for small teams",
    description:
      "Automate receipts, categorize expenses, and see where your money is going without the spreadsheet chaos.",
    buttonLabel: "See What's New",
    callout: "Want early access?",
    linkLabel: "Join the Waitlist",
  },
  festive: {
    title: "Now Launching",
    subtitle: "LedgerFlow 1.0",
    description:
      "Our new platform makes expense tracking faster, cleaner, and easier for growing teams.",
    buttonLabel: "Explore the Launch",
    callout: "Launch Begins In:",
  },
  modern: {
    title: "Meet LedgerFlow",
    description:
      "See key features, pricing, launch updates, and everything customers need before signing up.",
    buttonLabel: "View Features",
    label1: "Automation",
    label2: "Pricing",
    label3: "Launch Updates",
  },
  elegant: {
    title: "A Better Way to Track Spend",
    subtitle: "LedgerFlow",
    description:
      "A polished product page introducing clean workflows, powerful automation, and a simpler finance stack.",
    buttonLabel: "View Product",
    label1: "Features",
    label2: "Pricing",
    label3: "Who It's For",
    label4: "Get Access",
  },
  business: {
    title: "Run a Cleaner Product Launch",
    description:
      "Keep launch messaging, feature highlights, pricing, and signups organized in one launch page.",
    buttonLabel: "Launch Product Page",
    label1: "Feature Rollout",
    label2: "Customer Interest",
    label3: "Pricing",
    contactButtonLabel: "Contact Sales",
  },
  blank: {
    title: "Product Launch",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Waitlist")]: {
  template: "Waitlist",
  showcase: {
    title: "Join the Early Access List",
    subtitle: "First invites go out this summer",
    description:
      "Be the first to try our new platform, get launch updates, and lock in founder pricing before public release.",
    buttonLabel: "Join Waitlist",
    callout: "Want a spot before launch?",
    linkLabel: "Reserve My Spot",
  },
  festive: {
    title: "Early Access Is Almost Here",
    subtitle: "Private Waitlist",
    description:
      "We're opening a limited number of spots first—join now to get early product access and updates.",
    buttonLabel: "Get on the List",
    callout: "Invites Begin In:",
  },
  modern: {
    title: "Save Your Spot Early",
    description:
      "See what we're building, who's it for, and why early users are getting first access before launch.",
    buttonLabel: "Join Now",
    label1: "What to Expect",
    label2: "Launch Timing",
    label3: "Founder Perks",
  },
  elegant: {
    title: "Be First In Line",
    subtitle: "Limited Early Access",
    description:
      "A refined waitlist page designed to build anticipation and make joining easy.",
    buttonLabel: "Request Access",
    label1: "Launch Window",
    label2: "Early Perks",
    label3: "Product Preview",
    label4: "Join Waitlist",
  },
  business: {
    title: "Capture Waitlist Signups More Cleanly",
    description:
      "Keep launch interest, user demand, and follow-up communication organized in one page.",
    buttonLabel: "Launch Waitlist Page",
    label1: "Signup Flow",
    label2: "Interest Tracking",
    label3: "Launch Updates",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "Waitlist",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Property Listing")]: {
  template: "Property Listing",
  showcase: {
    title: "432 Oak Hollow Drive",
    subtitle: "4 bed · 3 bath · 2,480 sq ft",
    description:
      "Light-filled living spaces, a renovated kitchen, fenced backyard, and a quiet cul-de-sac location just minutes from downtown.",
    buttonLabel: "View Listing",
    callout: "Would you like to tour the home?",
    linkLabel: "Schedule a Showing",
  },
  festive: {
    title: "Open House This Saturday",
    subtitle: "432 Oak Hollow Drive",
    description:
      "Tour this move-in-ready home featuring hardwood floors, a spacious primary suite, and a beautifully landscaped yard.",
    buttonLabel: "See Property Details",
    callout: "Open House Starts In:",
  },
  modern: {
    title: "A Home That Checks Every Box",
    description:
      "Browse photos, room details, neighborhood highlights, and showing information for this updated family home.",
    buttonLabel: "Explore the Home",
    label1: "Photo Gallery",
    label2: "Home Features",
    label3: "Neighborhood",
  },
  elegant: {
    title: "Refined Living",
    subtitle: "432 Oak Hollow Drive",
    description:
      "A polished listing page designed to showcase elegant finishes, spacious interiors, and everyday comfort.",
    buttonLabel: "View Property",
    label1: "Interior",
    label2: "Floor Plan",
    label3: "Schools",
    label4: "Showing Request",
  },
  business: {
    title: "Present This Listing Like a Pro",
    description:
      "Keep photos, specs, open house details, and buyer inquiries organized in one polished listing page.",
    buttonLabel: "Launch Listing Page",
    label1: "Property Specs",
    label2: "Buyer Interest",
    label3: "Showing Requests",
    contactButtonLabel: "Contact Agent",
  },
  blank: {
    title: "Property Listing",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Rental Listing")]: {
  template: "Rental Listing",
  showcase: {
    title: "Riverfront Loft Available May 1",
    subtitle: "2 bed · 2 bath · Downtown",
    description:
      "Sunny corner unit with exposed brick, in-unit laundry, garage parking, and quick access to restaurants, transit, and the river trail.",
    buttonLabel: "View Rental",
    callout: "Interested in applying?",
    linkLabel: "Request Application",
  },
  festive: {
    title: "Now Leasing",
    subtitle: "Riverfront Loft",
    description:
      "See monthly rent, lease terms, pet policy, and everything prospective tenants need before scheduling a visit.",
    buttonLabel: "See Rental Details",
    callout: "Available In:",
  },
  modern: {
    title: "Downtown Living Made Easy",
    description:
      "Explore photos, amenities, lease details, and move-in requirements for this stylish riverfront apartment.",
    buttonLabel: "Browse the Listing",
    label1: "Amenities",
    label2: "Lease Terms",
    label3: "Application Info",
  },
  elegant: {
    title: "A Thoughtful Place to Call Home",
    subtitle: "Riverfront Loft",
    description:
      "An inviting rental page showcasing comfort, convenience, and clean modern design in the heart of the city.",
    buttonLabel: "View the Space",
    label1: "Photos",
    label2: "Building Perks",
    label3: "Lease Terms",
    label4: "Apply",
  },
  business: {
    title: "Lease This Unit More Efficiently",
    description:
      "Share rent, availability, application steps, and showing information in one renter-friendly page.",
    buttonLabel: "Launch Rental Page",
    label1: "Availability",
    label2: "Tenant Screening",
    label3: "Application Flow",
    contactButtonLabel: "Contact Landlord",
  },
  blank: {
    title: "Rental Listing",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Resume Profile")]: {
  template: "Resume Profile",
  showcase: {
    title: "Jordan Patel",
    subtitle: "Operations Manager · Richmond, VA",
    description:
      "Cross-functional operations leader with 8 years of experience improving workflows, reducing costs, and leading high-performing teams.",
    buttonLabel: "View Resume",
    callout: "Interested in my background?",
    linkLabel: "Contact Jordan",
  },
  festive: {
    title: "Now Open to New Opportunities",
    subtitle: "Jordan Patel",
    description:
      "Explore experience, measurable wins, and leadership strengths in one clean professional profile.",
    buttonLabel: "See Experience",
    callout: "Available To Start In:",
  },
  modern: {
    title: "Operations Leadership That Scales",
    description:
      "Review core experience, achievements, and the systems work behind stronger team performance.",
    buttonLabel: "Explore Profile",
    label1: "Experience",
    label2: "Key Wins",
    label3: "Skills",
  },
  elegant: {
    title: "A Professional Profile",
    subtitle: "Jordan Patel",
    description:
      "A polished resume page highlighting operational leadership, process improvement, and dependable execution.",
    buttonLabel: "View Profile",
    label1: "Work History",
    label2: "Highlights",
    label3: "Skills",
    label4: "Contact",
  },
  business: {
    title: "Present Your Resume Like a Personal Site",
    description:
      "Show achievements, credentials, and contact details in one structured profile page.",
    buttonLabel: "Launch Resume Page",
    label1: "Career Summary",
    label2: "Results",
    label3: "Credentials",
    contactButtonLabel: "Contact Me",
  },
  blank: {
    title: "Resume Profile",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Wedding")]: {
  template: "Wedding",
  showcase: {
    title: "Olivia & Daniel",
    subtitle: "September 21 · Willow Creek Vineyard",
    description:
      "Celebrate with us as we exchange vows, share dinner under the lights, and dance the night away with the people we love most.",
    buttonLabel: "View Wedding Details",
    callout: "Will you be celebrating with us?",
    linkLabel: "RSVP Here",
  },
  festive: {
    title: "We're Getting Married",
    subtitle: "Olivia & Daniel",
    description:
      "Find the ceremony time, venue address, hotel block, and everything guests need for a beautiful September weekend.",
    buttonLabel: "Save My Seat",
    callout: "Wedding Weekend Begins In:",
  },
  modern: {
    title: "Our Wedding Weekend",
    description:
      "See the schedule, travel notes, dress code, and RSVP details for our vineyard wedding celebration.",
    buttonLabel: "View the Schedule",
    label1: "Ceremony",
    label2: "Reception",
    label3: "Travel Info",
  },
  elegant: {
    title: "A Day to Remember",
    subtitle: "Olivia & Daniel",
    description:
      "A refined invitation page for our closest friends and family, with timeless details for a joyful celebration.",
    buttonLabel: "View Invitation",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Registry",
    label4: "RSVP",
  },
  business: {
    title: "Keep Wedding Details Beautifully Organized",
    description:
      "Share schedules, guest updates, accommodations, and RSVP tracking in one elegant wedding page.",
    buttonLabel: "Launch Wedding Page",
    label1: "Guest Updates",
    label2: "Weekend Schedule",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact the Couple",
  },
  blank: {
    title: "Wedding",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Beta Testing")]: {
  template: "Beta Testing",
  showcase: {
    title: "Beta Testing",
    subtitle: "What you'll learn",
    description:
      "Explore what this beta testing includes, who it's for, and how to join or get access.",
    buttonLabel: "View Details",
    callout: "Want to join in?",
    linkLabel: "Get Access",
  },
  festive: {
    title: "Learn Something New",
    subtitle: "Beta Testing",
    description:
      "Everything participants need for beta testing—format, timing, access, and key takeaways.",
    buttonLabel: "Join Now",
    callout: "Begins In:",
  },
  modern: {
    title: "Get Ready for Beta Testing",
    description:
      "Present the agenda, benefits, and access details for beta testing in one clean page.",
    buttonLabel: "Explore Program",
    label1: "Overview",
    label2: "What You'll Learn",
    label3: "Access",
  },
  elegant: {
    title: "Beta Testing",
    subtitle: "Thoughtfully presented",
    description:
      "A polished page that makes beta testing feel clear, premium, and easy to join.",
    buttonLabel: "View Program",
    label1: "Curriculum",
    label2: "Format",
    label3: "Benefits",
    label4: "Enrollment",
  },
  business: {
    title: "Organize Beta Testing Clearly",
    description:
      "Keep schedule, participant details, and registration information for beta testing in one page.",
    buttonLabel: "Launch Learning Page",
    label1: "Program Overview",
    label2: "Registration",
    label3: "Participant Info",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Beta Testing",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Business Card")]: {
  template: "Business Card",
  showcase: {
    title: "Business Card",
    subtitle: "Work, background, and highlights",
    description:
      "Explore experience, standout work, and the key strengths behind this business card.",
    buttonLabel: "View Profile",
    callout: "Want to connect?",
    linkLabel: "Get in Touch",
  },
  festive: {
    title: "A Personal Showcase",
    subtitle: "Business Card",
    description:
      "This page brings together the most important highlights, work samples, and contact details for this business card.",
    buttonLabel: "Explore Profile",
    callout: "Available Now:",
  },
  modern: {
    title: "A Better Business Card",
    description:
      "Present work samples, background, and accomplishments in a clean page built for credibility.",
    buttonLabel: "See Highlights",
    label1: "Work Samples",
    label2: "Experience",
    label3: "Contact",
  },
  elegant: {
    title: "Business Card",
    subtitle: "Distinctive and polished",
    description:
      "A refined page designed to present this business card with confidence and clarity.",
    buttonLabel: "View Portfolio",
    label1: "About",
    label2: "Highlights",
    label3: "Projects",
    label4: "Contact",
  },
  business: {
    title: "Present Business Card Professionally",
    description:
      "Show your value, proof of work, and contact options in one structured page.",
    buttonLabel: "Launch Profile",
    label1: "Overview",
    label2: "Experience",
    label3: "Proof of Work",
    contactButtonLabel: "Contact Me",
  },
  blank: {
    title: "Business Card",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Church Event")]: {
  template: "Church Event",
  showcase: {
    title: "Church Event",
    subtitle: "Invitation & event details",
    description:
      "Join us for church event with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Church Event",
    description:
      "We put together everything guests need for church event, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Church Event",
    description:
      "See the timeline, location, and guest information for church event in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Church Event",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for church event with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Church Event Organized",
    description:
      "Share invitations, updates, and guest responses for church event in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Church Event",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Commercial Leasing")]: {
  template: "Commercial Leasing",
  showcase: {
    title: "Commercial Leasing",
    subtitle: "Listing highlights",
    description:
      "See the photos, property details, and showing information for this commercial leasing.",
    buttonLabel: "View Listing",
    callout: "Interested in a closer look?",
    linkLabel: "Schedule a Visit",
  },
  festive: {
    title: "See the Property",
    subtitle: "Commercial Leasing",
    description:
      "Explore key specs, photos, pricing, and location details for this commercial leasing.",
    buttonLabel: "See Details",
    callout: "Showing Starts In:",
  },
  modern: {
    title: "Explore This Commercial Leasing",
    description:
      "Keep photos, specs, pricing, and neighborhood information organized in one modern property page.",
    buttonLabel: "Explore Property",
    label1: "Photos",
    label2: "Property Details",
    label3: "Location",
  },
  elegant: {
    title: "Commercial Leasing",
    subtitle: "Presented beautifully",
    description:
      "A polished property page designed to highlight the best parts of this commercial leasing.",
    buttonLabel: "View Property",
    label1: "Features",
    label2: "Gallery",
    label3: "Neighborhood",
    label4: "Tour Request",
  },
  business: {
    title: "Promote This Commercial Leasing Professionally",
    description:
      "Organize listing details, inquiries, and showing requests for this commercial leasing in one page.",
    buttonLabel: "Launch Listing Page",
    label1: "Property Specs",
    label2: "Buyer Interest",
    label3: "Tours",
    contactButtonLabel: "Contact Agent",
  },
  blank: {
    title: "Commercial Leasing",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Community Alert")]: {
  template: "Community Alert",
  showcase: {
    title: "Community Alert",
    subtitle: "Community update",
    description:
      "Share the most important details, timing, and next steps related to community alert in one page.",
    buttonLabel: "View Update",
    callout: "Need more information?",
    linkLabel: "Read More",
  },
  festive: {
    title: "Community Update",
    subtitle: "Community Alert",
    description:
      "Keep everyone informed about community alert with clear details, reminders, and updates.",
    buttonLabel: "See Details",
    callout: "Starts In:",
  },
  modern: {
    title: "Publish Community Alert Clearly",
    description:
      "Use one simple page to present announcements, details, and any important community information.",
    buttonLabel: "View Information",
    label1: "Overview",
    label2: "Updates",
    label3: "Resources",
  },
  elegant: {
    title: "Community Alert",
    subtitle: "Clear and thoughtful",
    description:
      "A polished community page designed to make community alert easy to understand and share.",
    buttonLabel: "View Page",
    label1: "Summary",
    label2: "Key Details",
    label3: "Resources",
    label4: "Contact",
  },
  business: {
    title: "Manage Community Alert Better",
    description:
      "Keep updates, schedules, and public information for community alert organized in one place.",
    buttonLabel: "Launch Information Page",
    label1: "Communication",
    label2: "Resources",
    label3: "Updates",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Community Alert",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Companion Service")]: {
  template: "Companion Service",
  showcase: {
    title: "Companion Service",
    subtitle: "Invitation & event details",
    description:
      "Join us for companion service with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Companion Service",
    description:
      "We put together everything guests need for companion service, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Companion Service",
    description:
      "See the timeline, location, and guest information for companion service in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Companion Service",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for companion service with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Companion Service Organized",
    description:
      "Share invitations, updates, and guest responses for companion service in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Companion Service",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Conference")]: {
  template: "Conference",
  showcase: {
    title: "Conference",
    subtitle: "Invitation & event details",
    description:
      "Join us for conference with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Conference",
    description:
      "We put together everything guests need for conference, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Conference",
    description:
      "See the timeline, location, and guest information for conference in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Conference",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for conference with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Conference Organized",
    description:
      "Share invitations, updates, and guest responses for conference in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Conference",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Contractor Portfolio")]: {
  template: "Contractor Portfolio",
  showcase: {
    title: "Contractor Portfolio",
    subtitle: "Work, background, and highlights",
    description:
      "Explore experience, standout work, and the key strengths behind this contractor portfolio.",
    buttonLabel: "View Profile",
    callout: "Want to connect?",
    linkLabel: "Get in Touch",
  },
  festive: {
    title: "A Personal Showcase",
    subtitle: "Contractor Portfolio",
    description:
      "This page brings together the most important highlights, work samples, and contact details for this contractor portfolio.",
    buttonLabel: "Explore Profile",
    callout: "Available Now:",
  },
  modern: {
    title: "A Better Contractor Portfolio",
    description:
      "Present work samples, background, and accomplishments in a clean page built for credibility.",
    buttonLabel: "See Highlights",
    label1: "Work Samples",
    label2: "Experience",
    label3: "Contact",
  },
  elegant: {
    title: "Contractor Portfolio",
    subtitle: "Distinctive and polished",
    description:
      "A refined page designed to present this contractor portfolio with confidence and clarity.",
    buttonLabel: "View Portfolio",
    label1: "About",
    label2: "Highlights",
    label3: "Projects",
    label4: "Contact",
  },
  business: {
    title: "Present Contractor Portfolio Professionally",
    description:
      "Show your value, proof of work, and contact options in one structured page.",
    buttonLabel: "Launch Profile",
    label1: "Overview",
    label2: "Experience",
    label3: "Proof of Work",
    contactButtonLabel: "Contact Me",
  },
  blank: {
    title: "Contractor Portfolio",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Creator Portfolio")]: {
  template: "Creator Portfolio",
  showcase: {
    title: "Creator Portfolio",
    subtitle: "Work, background, and highlights",
    description:
      "Explore experience, standout work, and the key strengths behind this creator portfolio.",
    buttonLabel: "View Profile",
    callout: "Want to connect?",
    linkLabel: "Get in Touch",
  },
  festive: {
    title: "A Personal Showcase",
    subtitle: "Creator Portfolio",
    description:
      "This page brings together the most important highlights, work samples, and contact details for this creator portfolio.",
    buttonLabel: "Explore Profile",
    callout: "Available Now:",
  },
  modern: {
    title: "A Better Creator Portfolio",
    description:
      "Present work samples, background, and accomplishments in a clean page built for credibility.",
    buttonLabel: "See Highlights",
    label1: "Work Samples",
    label2: "Experience",
    label3: "Contact",
  },
  elegant: {
    title: "Creator Portfolio",
    subtitle: "Distinctive and polished",
    description:
      "A refined page designed to present this creator portfolio with confidence and clarity.",
    buttonLabel: "View Portfolio",
    label1: "About",
    label2: "Highlights",
    label3: "Projects",
    label4: "Contact",
  },
  business: {
    title: "Present Creator Portfolio Professionally",
    description:
      "Show your value, proof of work, and contact options in one structured page.",
    buttonLabel: "Launch Profile",
    label1: "Overview",
    label2: "Experience",
    label3: "Proof of Work",
    contactButtonLabel: "Contact Me",
  },
  blank: {
    title: "Creator Portfolio",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Divorce Announcement")]: {
  template: "Divorce Announcement",
  showcase: {
    title: "Divorce Announcement",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this divorce announcement worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "Divorce Announcement",
    description:
      "Explore the offer, launch details, or campaign highlights behind this divorce announcement.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch Divorce Announcement Strong",
    description:
      "Highlight the value, timeline, and call to action for this divorce announcement in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "Divorce Announcement",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for divorce announcement designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger Divorce Announcement Page",
    description:
      "Keep messaging, conversion points, and campaign details for divorce announcement organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "Divorce Announcement",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Election Campaign")]: {
  template: "Election Campaign",
  showcase: {
    title: "Election Campaign",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this election campaign worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "Election Campaign",
    description:
      "Explore the offer, launch details, or campaign highlights behind this election campaign.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch Election Campaign Strong",
    description:
      "Highlight the value, timeline, and call to action for this election campaign in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "Election Campaign",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for election campaign designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger Election Campaign Page",
    description:
      "Keep messaging, conversion points, and campaign details for election campaign organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "Election Campaign",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Engagement")]: {
  template: "Engagement",
  showcase: {
    title: "Engagement",
    subtitle: "Invitation & event details",
    description:
      "Join us for engagement with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Engagement",
    description:
      "We put together everything guests need for engagement, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Engagement",
    description:
      "See the timeline, location, and guest information for engagement in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Engagement",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for engagement with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Engagement Organized",
    description:
      "Share invitations, updates, and guest responses for engagement in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Engagement",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Exploration Guide")]: {
  template: "Exploration Guide",
  showcase: {
    title: "Exploration Guide",
    subtitle: "Invitation & event details",
    description:
      "Join us for exploration guide with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Exploration Guide",
    description:
      "We put together everything guests need for exploration guide, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Exploration Guide",
    description:
      "See the timeline, location, and guest information for exploration guide in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Exploration Guide",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for exploration guide with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Exploration Guide Organized",
    description:
      "Share invitations, updates, and guest responses for exploration guide in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Exploration Guide",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("For Sale By Owner")]: {
  template: "For Sale By Owner",
  showcase: {
    title: "For Sale By Owner",
    subtitle: "Listing highlights",
    description:
      "See the photos, property details, and showing information for this for sale by owner.",
    buttonLabel: "View Listing",
    callout: "Interested in a closer look?",
    linkLabel: "Schedule a Visit",
  },
  festive: {
    title: "See the Property",
    subtitle: "For Sale By Owner",
    description:
      "Explore key specs, photos, pricing, and location details for this for sale by owner.",
    buttonLabel: "See Details",
    callout: "Showing Starts In:",
  },
  modern: {
    title: "Explore This For Sale By Owner",
    description:
      "Keep photos, specs, pricing, and neighborhood information organized in one modern property page.",
    buttonLabel: "Explore Property",
    label1: "Photos",
    label2: "Property Details",
    label3: "Location",
  },
  elegant: {
    title: "For Sale By Owner",
    subtitle: "Presented beautifully",
    description:
      "A polished property page designed to highlight the best parts of this for sale by owner.",
    buttonLabel: "View Property",
    label1: "Features",
    label2: "Gallery",
    label3: "Neighborhood",
    label4: "Tour Request",
  },
  business: {
    title: "Promote This For Sale By Owner Professionally",
    description:
      "Organize listing details, inquiries, and showing requests for this for sale by owner in one page.",
    buttonLabel: "Launch Listing Page",
    label1: "Property Specs",
    label2: "Buyer Interest",
    label3: "Tours",
    contactButtonLabel: "Contact Agent",
  },
  blank: {
    title: "For Sale By Owner",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("NFT Drop")]: {
  template: "NFT Drop",
  showcase: {
    title: "NFT Drop",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this nft drop worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "NFT Drop",
    description:
      "Explore the offer, launch details, or campaign highlights behind this nft drop.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch NFT Drop Strong",
    description:
      "Highlight the value, timeline, and call to action for this nft drop in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "NFT Drop",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for nft drop designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger NFT Drop Page",
    description:
      "Keep messaging, conversion points, and campaign details for nft drop organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "NFT Drop",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Gender Reveal")]: {
  template: "Gender Reveal",
  showcase: {
    title: "Gender Reveal",
    subtitle: "Invitation & event details",
    description:
      "Join us for gender reveal with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Gender Reveal",
    description:
      "We put together everything guests need for gender reveal, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Gender Reveal",
    description:
      "See the timeline, location, and guest information for gender reveal in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Gender Reveal",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for gender reveal with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Gender Reveal Organized",
    description:
      "Share invitations, updates, and guest responses for gender reveal in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Gender Reveal",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Graduation")]: {
  template: "Graduation",
  showcase: {
    title: "Graduation",
    subtitle: "Invitation & event details",
    description:
      "Join us for graduation with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Graduation",
    description:
      "We put together everything guests need for graduation, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Graduation",
    description:
      "See the timeline, location, and guest information for graduation in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Graduation",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for graduation with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Graduation Organized",
    description:
      "Share invitations, updates, and guest responses for graduation in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Graduation",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Group Travel")]: {
  template: "Group Travel",
  showcase: {
    title: "Group Travel",
    subtitle: "Invitation & event details",
    description:
      "Join us for group travel with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Group Travel",
    description:
      "We put together everything guests need for group travel, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Group Travel",
    description:
      "See the timeline, location, and guest information for group travel in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Group Travel",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for group travel with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Group Travel Organized",
    description:
      "Share invitations, updates, and guest responses for group travel in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Group Travel",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("HOA Announcement")]: {
  template: "HOA Announcement",
  showcase: {
    title: "HOA Announcement",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this hoa announcement worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "HOA Announcement",
    description:
      "Explore the offer, launch details, or campaign highlights behind this hoa announcement.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch HOA Announcement Strong",
    description:
      "Highlight the value, timeline, and call to action for this hoa announcement in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "HOA Announcement",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for hoa announcement designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger HOA Announcement Page",
    description:
      "Keep messaging, conversion points, and campaign details for hoa announcement organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "HOA Announcement",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Investor Pitch")]: {
  template: "Investor Pitch",
  showcase: {
    title: "Investor Pitch",
    subtitle: "Professional presentation",
    description:
      "Present the key ideas, credentials, or opportunities behind this investor pitch in one place.",
    buttonLabel: "View Details",
    callout: "Want more context?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "A Strong First Impression",
    subtitle: "Investor Pitch",
    description:
      "Bring together the essential points, materials, and follow-up information for this investor pitch.",
    buttonLabel: "Explore",
    callout: "Available In:",
  },
  modern: {
    title: "Strengthen Your Investor Pitch",
    description:
      "Use a clean page to present the core details and supporting materials for this investor pitch.",
    buttonLabel: "See Highlights",
    label1: "Overview",
    label2: "Key Points",
    label3: "Supporting Info",
  },
  elegant: {
    title: "Investor Pitch",
    subtitle: "Professional and polished",
    description:
      "A refined page designed to communicate the value and structure behind this investor pitch.",
    buttonLabel: "View Page",
    label1: "Summary",
    label2: "Highlights",
    label3: "Details",
    label4: "Contact",
  },
  business: {
    title: "Present Investor Pitch More Professionally",
    description:
      "Keep your materials, highlights, and next steps for this investor pitch in one organized page.",
    buttonLabel: "Launch Page",
    label1: "Overview",
    label2: "Resources",
    label3: "Details",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Investor Pitch",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Job Fair")]: {
  template: "Job Fair",
  showcase: {
    title: "Job Fair",
    subtitle: "Professional presentation",
    description:
      "Present the key ideas, credentials, or opportunities behind this job fair in one place.",
    buttonLabel: "View Details",
    callout: "Want more context?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "A Strong First Impression",
    subtitle: "Job Fair",
    description:
      "Bring together the essential points, materials, and follow-up information for this job fair.",
    buttonLabel: "Explore",
    callout: "Available In:",
  },
  modern: {
    title: "Strengthen Your Job Fair",
    description:
      "Use a clean page to present the core details and supporting materials for this job fair.",
    buttonLabel: "See Highlights",
    label1: "Overview",
    label2: "Key Points",
    label3: "Supporting Info",
  },
  elegant: {
    title: "Job Fair",
    subtitle: "Professional and polished",
    description:
      "A refined page designed to communicate the value and structure behind this job fair.",
    buttonLabel: "View Page",
    label1: "Summary",
    label2: "Highlights",
    label3: "Details",
    label4: "Contact",
  },
  business: {
    title: "Present Job Fair More Professionally",
    description:
      "Keep your materials, highlights, and next steps for this job fair in one organized page.",
    buttonLabel: "Launch Page",
    label1: "Overview",
    label2: "Resources",
    label3: "Details",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Job Fair",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Merchant Drop")]: {
  template: "Merchant Drop",
  showcase: {
    title: "Merchant Drop",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this merchant drop worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "Merchant Drop",
    description:
      "Explore the offer, launch details, or campaign highlights behind this merchant drop.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch Merchant Drop Strong",
    description:
      "Highlight the value, timeline, and call to action for this merchant drop in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "Merchant Drop",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for merchant drop designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger Merchant Drop Page",
    description:
      "Keep messaging, conversion points, and campaign details for merchant drop organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "Merchant Drop",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Pet Adoption")]: {
  template: "Pet Adoption",
  showcase: {
    title: "Pet Adoption",
    subtitle: "Invitation & event details",
    description:
      "Join us for pet adoption with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Pet Adoption",
    description:
      "We put together everything guests need for pet adoption, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Pet Adoption",
    description:
      "See the timeline, location, and guest information for pet adoption in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Pet Adoption",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for pet adoption with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Pet Adoption Organized",
    description:
      "Share invitations, updates, and guest responses for pet adoption in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Pet Adoption",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Private Discord")]: {
  template: "Private Discord",
  showcase: {
    title: "Private Discord",
    subtitle: "Invitation & event details",
    description:
      "Join us for private discord with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Private Discord",
    description:
      "We put together everything guests need for private discord, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Private Discord",
    description:
      "See the timeline, location, and guest information for private discord in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Private Discord",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for private discord with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Private Discord Organized",
    description:
      "Share invitations, updates, and guest responses for private discord in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Private Discord",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Relocation")]: {
  template: "Relocation",
  showcase: {
    title: "Relocation",
    subtitle: "Invitation & event details",
    description:
      "Join us for relocation with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Relocation",
    description:
      "We put together everything guests need for relocation, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Relocation",
    description:
      "See the timeline, location, and guest information for relocation in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Relocation",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for relocation with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Relocation Organized",
    description:
      "Share invitations, updates, and guest responses for relocation in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Relocation",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Service Promo")]: {
  template: "Service Promo",
  showcase: {
    title: "Service Promo",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this service promo worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "Service Promo",
    description:
      "Explore the offer, launch details, or campaign highlights behind this service promo.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch Service Promo Strong",
    description:
      "Highlight the value, timeline, and call to action for this service promo in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "Service Promo",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for service promo designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger Service Promo Page",
    description:
      "Keep messaging, conversion points, and campaign details for service promo organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "Service Promo",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Corporate Event")]: {
  template: "Corporate Event",
  showcase: {
    title: "Corporate Event",
    subtitle: "Invitation & event details",
    description:
      "Join us for corporate event with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Corporate Event",
    description:
      "We put together everything guests need for corporate event, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Corporate Event",
    description:
      "See the timeline, location, and guest information for corporate event in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Corporate Event",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for corporate event with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Corporate Event Organized",
    description:
      "Share invitations, updates, and guest responses for corporate event in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Corporate Event",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Deal Room")]: {
  template: "Deal Room",
  showcase: {
    title: "Deal Room",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this deal room worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "Deal Room",
    description:
      "Explore the offer, launch details, or campaign highlights behind this deal room.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch Deal Room Strong",
    description:
      "Highlight the value, timeline, and call to action for this deal room in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "Deal Room",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for deal room designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger Deal Room Page",
    description:
      "Keep messaging, conversion points, and campaign details for deal room organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "Deal Room",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Dedication")]: {
  template: "Dedication",
  showcase: {
    title: "Dedication",
    subtitle: "Invitation & event details",
    description:
      "Join us for dedication with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Dedication",
    description:
      "We put together everything guests need for dedication, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Dedication",
    description:
      "See the timeline, location, and guest information for dedication in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Dedication",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for dedication with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Dedication Organized",
    description:
      "Share invitations, updates, and guest responses for dedication in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Dedication",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Disaster Relief")]: {
  template: "Disaster Relief",
  showcase: {
    title: "Disaster Relief",
    subtitle: "Community update",
    description:
      "Share the most important details, timing, and next steps related to disaster relief in one page.",
    buttonLabel: "View Update",
    callout: "Need more information?",
    linkLabel: "Read More",
  },
  festive: {
    title: "Community Update",
    subtitle: "Disaster Relief",
    description:
      "Keep everyone informed about disaster relief with clear details, reminders, and updates.",
    buttonLabel: "See Details",
    callout: "Starts In:",
  },
  modern: {
    title: "Publish Disaster Relief Clearly",
    description:
      "Use one simple page to present announcements, details, and any important community information.",
    buttonLabel: "View Information",
    label1: "Overview",
    label2: "Updates",
    label3: "Resources",
  },
  elegant: {
    title: "Disaster Relief",
    subtitle: "Clear and thoughtful",
    description:
      "A polished community page designed to make disaster relief easy to understand and share.",
    buttonLabel: "View Page",
    label1: "Summary",
    label2: "Key Details",
    label3: "Resources",
    label4: "Contact",
  },
  business: {
    title: "Manage Disaster Relief Better",
    description:
      "Keep updates, schedules, and public information for disaster relief organized in one place.",
    buttonLabel: "Launch Information Page",
    label1: "Communication",
    label2: "Resources",
    label3: "Updates",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Disaster Relief",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Hackathon")]: {
  template: "Hackathon",
  showcase: {
    title: "Hackathon",
    subtitle: "Invitation & event details",
    description:
      "Join us for hackathon with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Hackathon",
    description:
      "We put together everything guests need for hackathon, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Hackathon",
    description:
      "See the timeline, location, and guest information for hackathon in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Hackathon",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for hackathon with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Hackathon Organized",
    description:
      "Share invitations, updates, and guest responses for hackathon in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Hackathon",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Landlord Property")]: {
  template: "Landlord Property",
  showcase: {
    title: "Landlord Property",
    subtitle: "Listing highlights",
    description:
      "See the photos, property details, and showing information for this landlord property.",
    buttonLabel: "View Listing",
    callout: "Interested in a closer look?",
    linkLabel: "Schedule a Visit",
  },
  festive: {
    title: "See the Property",
    subtitle: "Landlord Property",
    description:
      "Explore key specs, photos, pricing, and location details for this landlord property.",
    buttonLabel: "See Details",
    callout: "Showing Starts In:",
  },
  modern: {
    title: "Explore This Landlord Property",
    description:
      "Keep photos, specs, pricing, and neighborhood information organized in one modern property page.",
    buttonLabel: "Explore Property",
    label1: "Photos",
    label2: "Property Details",
    label3: "Location",
  },
  elegant: {
    title: "Landlord Property",
    subtitle: "Presented beautifully",
    description:
      "A polished property page designed to highlight the best parts of this landlord property.",
    buttonLabel: "View Property",
    label1: "Features",
    label2: "Gallery",
    label3: "Neighborhood",
    label4: "Tour Request",
  },
  business: {
    title: "Promote This Landlord Property Professionally",
    description:
      "Organize listing details, inquiries, and showing requests for this landlord property in one page.",
    buttonLabel: "Launch Listing Page",
    label1: "Property Specs",
    label2: "Buyer Interest",
    label3: "Tours",
    contactButtonLabel: "Contact Agent",
  },
  blank: {
    title: "Landlord Property",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Legal Defense")]: {
  template: "Legal Defense",
  showcase: {
    title: "Legal Defense",
    subtitle: "Important notice",
    description:
      "Review the essential details, timeline, and next steps related to legal defense in one clear page.",
    buttonLabel: "View Notice",
    callout: "Need to take action?",
    linkLabel: "See Full Details",
  },
  festive: {
    title: "Important Update",
    subtitle: "Legal Defense",
    description:
      "Keep the message around legal defense easy to read and easy to act on with one focused page.",
    buttonLabel: "View Details",
    callout: "Update Ends In:",
  },
  modern: {
    title: "Present Legal Defense Clearly",
    description:
      "Organize the facts, timing, and instructions related to legal defense in a clean layout.",
    buttonLabel: "Read More",
    label1: "Summary",
    label2: "Timeline",
    label3: "Next Steps",
  },
  elegant: {
    title: "Legal Defense",
    subtitle: "Clear and actionable",
    description:
      "A calm, polished page for sharing important information related to legal defense.",
    buttonLabel: "View Information",
    label1: "Overview",
    label2: "Timeline",
    label3: "Details",
    label4: "Contact",
  },
  business: {
    title: "Create a Better Legal Defense Page",
    description:
      "Keep updates, response instructions, and critical details for legal defense organized in one place.",
    buttonLabel: "Launch Notice Page",
    label1: "Overview",
    label2: "Updates",
    label3: "Response Info",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Legal Defense",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Live Entertainment")]: {
  template: "Live Entertainment",
  showcase: {
    title: "Live Entertainment",
    subtitle: "Invitation & event details",
    description:
      "Join us for live entertainment with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Live Entertainment",
    description:
      "We put together everything guests need for live entertainment, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Live Entertainment",
    description:
      "See the timeline, location, and guest information for live entertainment in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Live Entertainment",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for live entertainment with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Live Entertainment Organized",
    description:
      "Share invitations, updates, and guest responses for live entertainment in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Live Entertainment",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Masterclass")]: {
  template: "Masterclass",
  showcase: {
    title: "Masterclass",
    subtitle: "What you'll learn",
    description:
      "Explore what this masterclass includes, who it's for, and how to join or get access.",
    buttonLabel: "View Details",
    callout: "Want to join in?",
    linkLabel: "Get Access",
  },
  festive: {
    title: "Learn Something New",
    subtitle: "Masterclass",
    description:
      "Everything participants need for masterclass—format, timing, access, and key takeaways.",
    buttonLabel: "Join Now",
    callout: "Begins In:",
  },
  modern: {
    title: "Get Ready for Masterclass",
    description:
      "Present the agenda, benefits, and access details for masterclass in one clean page.",
    buttonLabel: "Explore Program",
    label1: "Overview",
    label2: "What You'll Learn",
    label3: "Access",
  },
  elegant: {
    title: "Masterclass",
    subtitle: "Thoughtfully presented",
    description:
      "A polished page that makes masterclass feel clear, premium, and easy to join.",
    buttonLabel: "View Program",
    label1: "Curriculum",
    label2: "Format",
    label3: "Benefits",
    label4: "Enrollment",
  },
  business: {
    title: "Organize Masterclass Clearly",
    description:
      "Keep schedule, participant details, and registration information for masterclass in one page.",
    buttonLabel: "Launch Learning Page",
    label1: "Program Overview",
    label2: "Registration",
    label3: "Participant Info",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Masterclass",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Meet & Greet")]: {
  template: "Meet & Greet",
  showcase: {
    title: "Meet & Greet",
    subtitle: "Invitation & event details",
    description:
      "Join us for meet & greet with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Meet & Greet",
    description:
      "We put together everything guests need for meet & greet, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Meet & Greet",
    description:
      "See the timeline, location, and guest information for meet & greet in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Meet & Greet",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for meet & greet with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Meet & Greet Organized",
    description:
      "Share invitations, updates, and guest responses for meet & greet in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Meet & Greet",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Members Only")]: {
  template: "Members Only",
  showcase: {
    title: "Members Only",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this members only worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "Members Only",
    description:
      "Explore the offer, launch details, or campaign highlights behind this members only.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch Members Only Strong",
    description:
      "Highlight the value, timeline, and call to action for this members only in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "Members Only",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for members only designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger Members Only Page",
    description:
      "Keep messaging, conversion points, and campaign details for members only organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "Members Only",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Missing Person")]: {
  template: "Missing Person",
  showcase: {
    title: "Help Us Find Marcus Reed",
    subtitle: "Last seen near Broad & 7th",
    description:
      "Marcus, age 17, was last seen Friday at 6:20 PM wearing a navy hoodie, black jeans, and white sneakers.",
    buttonLabel: "View Alert Details",
    callout: "Have you seen Marcus?",
    linkLabel: "Submit Information",
  },
  festive: {
    title: "Urgent Community Alert",
    subtitle: "Missing Person",
    description:
      "Please review the latest description, last known location, and contact information for this active missing-person case.",
    buttonLabel: "View Full Alert",
    callout: "Missing Since:",
  },
  modern: {
    title: "Active Missing Person Case",
    description:
      "Keep the public informed with the latest description, timeline, and confirmed contact channels for this case.",
    buttonLabel: "See Case Details",
    label1: "Description",
    label2: "Last Seen",
    label3: "Contact Info",
  },
  elegant: {
    title: "Please Help Bring Marcus Home",
    subtitle: "Missing Person Alert",
    description:
      "A calm, clear alert page designed to make critical details easy to read and share quickly.",
    buttonLabel: "View Alert",
    label1: "Description",
    label2: "Timeline",
    label3: "Area Map",
    label4: "Contact",
  },
  business: {
    title: "Publish a Clear Missing Person Alert",
    description:
      "Keep identifying details, updates, and reporting instructions organized in one accessible public page.",
    buttonLabel: "Launch Alert Page",
    label1: "Case Summary",
    label2: "Public Tips",
    label3: "Status Updates",
    contactButtonLabel: "Contact Authorities",
  },
  blank: {
    title: "Missing Person",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Online Course")]: {
  template: "Online Course",
  showcase: {
    title: "Online Course",
    subtitle: "What you'll learn",
    description:
      "Explore what this online course includes, who it's for, and how to join or get access.",
    buttonLabel: "View Details",
    callout: "Want to join in?",
    linkLabel: "Get Access",
  },
  festive: {
    title: "Learn Something New",
    subtitle: "Online Course",
    description:
      "Everything participants need for online course—format, timing, access, and key takeaways.",
    buttonLabel: "Join Now",
    callout: "Begins In:",
  },
  modern: {
    title: "Get Ready for Online Course",
    description:
      "Present the agenda, benefits, and access details for online course in one clean page.",
    buttonLabel: "Explore Program",
    label1: "Overview",
    label2: "What You'll Learn",
    label3: "Access",
  },
  elegant: {
    title: "Online Course",
    subtitle: "Thoughtfully presented",
    description:
      "A polished page that makes online course feel clear, premium, and easy to join.",
    buttonLabel: "View Program",
    label1: "Curriculum",
    label2: "Format",
    label3: "Benefits",
    label4: "Enrollment",
  },
  business: {
    title: "Organize Online Course Clearly",
    description:
      "Keep schedule, participant details, and registration information for online course in one page.",
    buttonLabel: "Launch Learning Page",
    label1: "Program Overview",
    label2: "Registration",
    label3: "Participant Info",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Online Course",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("School Fundraiser")]: {
  template: "School Fundraiser",
  showcase: {
    title: "School Fundraiser",
    subtitle: "Community update",
    description:
      "Share the most important details, timing, and next steps related to school fundraiser in one page.",
    buttonLabel: "View Update",
    callout: "Need more information?",
    linkLabel: "Read More",
  },
  festive: {
    title: "Community Update",
    subtitle: "School Fundraiser",
    description:
      "Keep everyone informed about school fundraiser with clear details, reminders, and updates.",
    buttonLabel: "See Details",
    callout: "Starts In:",
  },
  modern: {
    title: "Publish School Fundraiser Clearly",
    description:
      "Use one simple page to present announcements, details, and any important community information.",
    buttonLabel: "View Information",
    label1: "Overview",
    label2: "Updates",
    label3: "Resources",
  },
  elegant: {
    title: "School Fundraiser",
    subtitle: "Clear and thoughtful",
    description:
      "A polished community page designed to make school fundraiser easy to understand and share.",
    buttonLabel: "View Page",
    label1: "Summary",
    label2: "Key Details",
    label3: "Resources",
    label4: "Contact",
  },
  business: {
    title: "Manage School Fundraiser Better",
    description:
      "Keep updates, schedules, and public information for school fundraiser organized in one place.",
    buttonLabel: "Launch Information Page",
    label1: "Communication",
    label2: "Resources",
    label3: "Updates",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "School Fundraiser",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Secure Document")]: {
  template: "Secure Document",
  showcase: {
    title: "Secure Document",
    subtitle: "Important notice",
    description:
      "Review the essential details, timeline, and next steps related to secure document in one clear page.",
    buttonLabel: "View Notice",
    callout: "Need to take action?",
    linkLabel: "See Full Details",
  },
  festive: {
    title: "Important Update",
    subtitle: "Secure Document",
    description:
      "Keep the message around secure document easy to read and easy to act on with one focused page.",
    buttonLabel: "View Details",
    callout: "Update Ends In:",
  },
  modern: {
    title: "Present Secure Document Clearly",
    description:
      "Organize the facts, timing, and instructions related to secure document in a clean layout.",
    buttonLabel: "Read More",
    label1: "Summary",
    label2: "Timeline",
    label3: "Next Steps",
  },
  elegant: {
    title: "Secure Document",
    subtitle: "Clear and actionable",
    description:
      "A calm, polished page for sharing important information related to secure document.",
    buttonLabel: "View Information",
    label1: "Overview",
    label2: "Timeline",
    label3: "Details",
    label4: "Contact",
  },
  business: {
    title: "Create a Better Secure Document Page",
    description:
      "Keep updates, response instructions, and critical details for secure document organized in one place.",
    buttonLabel: "Launch Notice Page",
    label1: "Overview",
    label2: "Updates",
    label3: "Response Info",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Secure Document",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Service Ad")]: {
  template: "Service Ad",
  showcase: {
    title: "Service Ad",
    subtitle: "Invitation & event details",
    description:
      "Join us for service ad with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Service Ad",
    description:
      "We put together everything guests need for service ad, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Service Ad",
    description:
      "See the timeline, location, and guest information for service ad in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Service Ad",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for service ad with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Service Ad Organized",
    description:
      "Share invitations, updates, and guest responses for service ad in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Service Ad",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Settlement Info")]: {
  template: "Settlement Info",
  showcase: {
    title: "Settlement Info",
    subtitle: "Important notice",
    description:
      "Review the essential details, timeline, and next steps related to settlement info in one clear page.",
    buttonLabel: "View Notice",
    callout: "Need to take action?",
    linkLabel: "See Full Details",
  },
  festive: {
    title: "Important Update",
    subtitle: "Settlement Info",
    description:
      "Keep the message around settlement info easy to read and easy to act on with one focused page.",
    buttonLabel: "View Details",
    callout: "Update Ends In:",
  },
  modern: {
    title: "Present Settlement Info Clearly",
    description:
      "Organize the facts, timing, and instructions related to settlement info in a clean layout.",
    buttonLabel: "Read More",
    label1: "Summary",
    label2: "Timeline",
    label3: "Next Steps",
  },
  elegant: {
    title: "Settlement Info",
    subtitle: "Clear and actionable",
    description:
      "A calm, polished page for sharing important information related to settlement info.",
    buttonLabel: "View Information",
    label1: "Overview",
    label2: "Timeline",
    label3: "Details",
    label4: "Contact",
  },
  business: {
    title: "Create a Better Settlement Info Page",
    description:
      "Keep updates, response instructions, and critical details for settlement info organized in one place.",
    buttonLabel: "Launch Notice Page",
    label1: "Overview",
    label2: "Updates",
    label3: "Response Info",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Settlement Info",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Software Trial")]: {
  template: "Software Trial",
  showcase: {
    title: "Software Trial",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this software trial worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "Software Trial",
    description:
      "Explore the offer, launch details, or campaign highlights behind this software trial.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch Software Trial Strong",
    description:
      "Highlight the value, timeline, and call to action for this software trial in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "Software Trial",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for software trial designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger Software Trial Page",
    description:
      "Keep messaging, conversion points, and campaign details for software trial organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "Software Trial",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Stock Trade Thesis")]: {
  template: "Stock Trade Thesis",
  showcase: {
    title: "Stock Trade Thesis",
    subtitle: "Professional presentation",
    description:
      "Present the key ideas, credentials, or opportunities behind this stock trade thesis in one place.",
    buttonLabel: "View Details",
    callout: "Want more context?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "A Strong First Impression",
    subtitle: "Stock Trade Thesis",
    description:
      "Bring together the essential points, materials, and follow-up information for this stock trade thesis.",
    buttonLabel: "Explore",
    callout: "Available In:",
  },
  modern: {
    title: "Strengthen Your Stock Trade Thesis",
    description:
      "Use a clean page to present the core details and supporting materials for this stock trade thesis.",
    buttonLabel: "See Highlights",
    label1: "Overview",
    label2: "Key Points",
    label3: "Supporting Info",
  },
  elegant: {
    title: "Stock Trade Thesis",
    subtitle: "Professional and polished",
    description:
      "A refined page designed to communicate the value and structure behind this stock trade thesis.",
    buttonLabel: "View Page",
    label1: "Summary",
    label2: "Highlights",
    label3: "Details",
    label4: "Contact",
  },
  business: {
    title: "Present Stock Trade Thesis More Professionally",
    description:
      "Keep your materials, highlights, and next steps for this stock trade thesis in one organized page.",
    buttonLabel: "Launch Page",
    label1: "Overview",
    label2: "Resources",
    label3: "Details",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Stock Trade Thesis",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("VIP Access")]: {
  template: "VIP Access",
  showcase: {
    title: "VIP Access",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this vip access worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "VIP Access",
    description:
      "Explore the offer, launch details, or campaign highlights behind this vip access.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch VIP Access Strong",
    description:
      "Highlight the value, timeline, and call to action for this vip access in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "VIP Access",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for vip access designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger VIP Access Page",
    description:
      "Keep messaging, conversion points, and campaign details for vip access organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "VIP Access",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Webinar")]: {
  template: "Webinar",
  showcase: {
    title: "Webinar",
    subtitle: "What you'll learn",
    description:
      "Explore what this webinar includes, who it's for, and how to join or get access.",
    buttonLabel: "View Details",
    callout: "Want to join in?",
    linkLabel: "Get Access",
  },
  festive: {
    title: "Learn Something New",
    subtitle: "Webinar",
    description:
      "Everything participants need for webinar—format, timing, access, and key takeaways.",
    buttonLabel: "Join Now",
    callout: "Begins In:",
  },
  modern: {
    title: "Get Ready for Webinar",
    description:
      "Present the agenda, benefits, and access details for webinar in one clean page.",
    buttonLabel: "Explore Program",
    label1: "Overview",
    label2: "What You'll Learn",
    label3: "Access",
  },
  elegant: {
    title: "Webinar",
    subtitle: "Thoughtfully presented",
    description:
      "A polished page that makes webinar feel clear, premium, and easy to join.",
    buttonLabel: "View Program",
    label1: "Curriculum",
    label2: "Format",
    label3: "Benefits",
    label4: "Enrollment",
  },
  business: {
    title: "Organize Webinar Clearly",
    description:
      "Keep schedule, participant details, and registration information for webinar in one page.",
    buttonLabel: "Launch Learning Page",
    label1: "Program Overview",
    label2: "Registration",
    label3: "Participant Info",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Webinar",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Workshop")]: {
  template: "Workshop",
  showcase: {
    title: "Workshop",
    subtitle: "What you'll learn",
    description:
      "Explore what this workshop includes, who it's for, and how to join or get access.",
    buttonLabel: "View Details",
    callout: "Want to join in?",
    linkLabel: "Get Access",
  },
  festive: {
    title: "Learn Something New",
    subtitle: "Workshop",
    description:
      "Everything participants need for workshop—format, timing, access, and key takeaways.",
    buttonLabel: "Join Now",
    callout: "Begins In:",
  },
  modern: {
    title: "Get Ready for Workshop",
    description:
      "Present the agenda, benefits, and access details for workshop in one clean page.",
    buttonLabel: "Explore Program",
    label1: "Overview",
    label2: "What You'll Learn",
    label3: "Access",
  },
  elegant: {
    title: "Workshop",
    subtitle: "Thoughtfully presented",
    description:
      "A polished page that makes workshop feel clear, premium, and easy to join.",
    buttonLabel: "View Program",
    label1: "Curriculum",
    label2: "Format",
    label3: "Benefits",
    label4: "Enrollment",
  },
  business: {
    title: "Organize Workshop Clearly",
    description:
      "Keep schedule, participant details, and registration information for workshop in one page.",
    buttonLabel: "Launch Learning Page",
    label1: "Program Overview",
    label2: "Registration",
    label3: "Participant Info",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Workshop",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Photo Gallery")]: {
  template: "Photo Gallery",
  showcase: {
    title: "Photo Gallery",
    subtitle: "Invitation & event details",
    description:
      "Join us for photo gallery with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Photo Gallery",
    description:
      "We put together everything guests need for photo gallery, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Photo Gallery",
    description:
      "See the timeline, location, and guest information for photo gallery in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Photo Gallery",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for photo gallery with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Photo Gallery Organized",
    description:
      "Share invitations, updates, and guest responses for photo gallery in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Photo Gallery",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Block Party")]: {
  template: "Block Party",
  showcase: {
    title: "Block Party",
    subtitle: "Invitation & event details",
    description:
      "Join us for block party with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Block Party",
    description:
      "We put together everything guests need for block party, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Block Party",
    description:
      "See the timeline, location, and guest information for block party in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Block Party",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for block party with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Block Party Organized",
    description:
      "Share invitations, updates, and guest responses for block party in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Block Party",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Surprise Party")]: {
  template: "Surprise Party",
  showcase: {
    title: "Surprise Party",
    subtitle: "Invitation & event details",
    description:
      "Join us for surprise party with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Surprise Party",
    description:
      "We put together everything guests need for surprise party, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Surprise Party",
    description:
      "See the timeline, location, and guest information for surprise party in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Surprise Party",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for surprise party with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Surprise Party Organized",
    description:
      "Share invitations, updates, and guest responses for surprise party in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Surprise Party",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Celebration of Life")]: {
  template: "Celebration of Life",
  showcase: {
    title: "Celebration of Life",
    subtitle: "Invitation & event details",
    description:
      "Join us for celebration of life with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Celebration of Life",
    description:
      "We put together everything guests need for celebration of life, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Celebration of Life",
    description:
      "See the timeline, location, and guest information for celebration of life in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Celebration of Life",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for celebration of life with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Celebration of Life Organized",
    description:
      "Share invitations, updates, and guest responses for celebration of life in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Celebration of Life",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Retirement Party")]: {
  template: "Retirement Party",
  showcase: {
    title: "Retirement Party",
    subtitle: "Invitation & event details",
    description:
      "Join us for retirement party with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Retirement Party",
    description:
      "We put together everything guests need for retirement party, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Retirement Party",
    description:
      "See the timeline, location, and guest information for retirement party in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Retirement Party",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for retirement party with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Retirement Party Organized",
    description:
      "Share invitations, updates, and guest responses for retirement party in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Retirement Party",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Holiday Party")]: {
  template: "Holiday Party",
  showcase: {
    title: "Holiday Party",
    subtitle: "Invitation & event details",
    description:
      "Join us for holiday party with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Holiday Party",
    description:
      "We put together everything guests need for holiday party, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Holiday Party",
    description:
      "See the timeline, location, and guest information for holiday party in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Holiday Party",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for holiday party with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Holiday Party Organized",
    description:
      "Share invitations, updates, and guest responses for holiday party in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Holiday Party",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Friendsgiving Event")]: {
  template: "Friendsgiving Event",
  showcase: {
    title: "Friendsgiving Event",
    subtitle: "Invitation & event details",
    description:
      "Join us for friendsgiving event with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Friendsgiving Event",
    description:
      "We put together everything guests need for friendsgiving event, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Friendsgiving Event",
    description:
      "See the timeline, location, and guest information for friendsgiving event in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Friendsgiving Event",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for friendsgiving event with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Friendsgiving Event Organized",
    description:
      "Share invitations, updates, and guest responses for friendsgiving event in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Friendsgiving Event",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Housewarming Party")]: {
  template: "Housewarming Party",
  showcase: {
    title: "Housewarming Party",
    subtitle: "Invitation & event details",
    description:
      "Join us for housewarming party with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Housewarming Party",
    description:
      "We put together everything guests need for housewarming party, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Housewarming Party",
    description:
      "See the timeline, location, and guest information for housewarming party in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Housewarming Party",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for housewarming party with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Housewarming Party Organized",
    description:
      "Share invitations, updates, and guest responses for housewarming party in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Housewarming Party",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Bachelor Party")]: {
  template: "Bachelor Party",
  showcase: {
    title: "Bachelor Party",
    subtitle: "Invitation & event details",
    description:
      "Join us for bachelor party with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Bachelor Party",
    description:
      "We put together everything guests need for bachelor party, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Bachelor Party",
    description:
      "See the timeline, location, and guest information for bachelor party in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Bachelor Party",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for bachelor party with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Bachelor Party Organized",
    description:
      "Share invitations, updates, and guest responses for bachelor party in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Bachelor Party",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Bachelorette Party")]: {
  template: "Bachelorette Party",
  showcase: {
    title: "Bachelorette Party",
    subtitle: "Invitation & event details",
    description:
      "Join us for bachelorette party with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Bachelorette Party",
    description:
      "We put together everything guests need for bachelorette party, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Bachelorette Party",
    description:
      "See the timeline, location, and guest information for bachelorette party in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Bachelorette Party",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for bachelorette party with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Bachelorette Party Organized",
    description:
      "Share invitations, updates, and guest responses for bachelorette party in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Bachelorette Party",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Charity Gala Event")]: {
  template: "Charity Gala Event",
  showcase: {
    title: "Charity Gala Event",
    subtitle: "Invitation & event details",
    description:
      "Join us for charity gala event with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Charity Gala Event",
    description:
      "We put together everything guests need for charity gala event, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Charity Gala Event",
    description:
      "See the timeline, location, and guest information for charity gala event in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Charity Gala Event",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for charity gala event with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Charity Gala Event Organized",
    description:
      "Share invitations, updates, and guest responses for charity gala event in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Charity Gala Event",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Alumni Meetup")]: {
  template: "Alumni Meetup",
  showcase: {
    title: "Alumni Meetup",
    subtitle: "Invitation & event details",
    description:
      "Join us for alumni meetup with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Alumni Meetup",
    description:
      "We put together everything guests need for alumni meetup, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Alumni Meetup",
    description:
      "See the timeline, location, and guest information for alumni meetup in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Alumni Meetup",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for alumni meetup with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Alumni Meetup Organized",
    description:
      "Share invitations, updates, and guest responses for alumni meetup in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Alumni Meetup",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Neighborhood BBQ")]: {
  template: "Neighborhood BBQ",
  showcase: {
    title: "Neighborhood BBQ",
    subtitle: "Invitation & event details",
    description:
      "Join us for neighborhood bbq with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Neighborhood BBQ",
    description:
      "We put together everything guests need for neighborhood bbq, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Neighborhood BBQ",
    description:
      "See the timeline, location, and guest information for neighborhood bbq in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Neighborhood BBQ",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for neighborhood bbq with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Neighborhood BBQ Organized",
    description:
      "Share invitations, updates, and guest responses for neighborhood bbq in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Neighborhood BBQ",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Yard Sale")]: {
  template: "Yard Sale",
  showcase: {
    title: "Yard Sale",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this yard sale worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "Yard Sale",
    description:
      "Explore the offer, launch details, or campaign highlights behind this yard sale.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch Yard Sale Strong",
    description:
      "Highlight the value, timeline, and call to action for this yard sale in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "Yard Sale",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for yard sale designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger Yard Sale Page",
    description:
      "Keep messaging, conversion points, and campaign details for yard sale organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "Yard Sale",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Sports Team Party")]: {
  template: "Sports Team Party",
  showcase: {
    title: "Sports Team Party",
    subtitle: "Invitation & event details",
    description:
      "Join us for sports team party with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Sports Team Party",
    description:
      "We put together everything guests need for sports team party, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Sports Team Party",
    description:
      "See the timeline, location, and guest information for sports team party in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Sports Team Party",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for sports team party with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Sports Team Party Organized",
    description:
      "Share invitations, updates, and guest responses for sports team party in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Sports Team Party",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Bridal Shower")]: {
  template: "Bridal Shower",
  showcase: {
    title: "Bridal Shower",
    subtitle: "Invitation & event details",
    description:
      "Join us for bridal shower with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Bridal Shower",
    description:
      "We put together everything guests need for bridal shower, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Bridal Shower",
    description:
      "See the timeline, location, and guest information for bridal shower in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Bridal Shower",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for bridal shower with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Bridal Shower Organized",
    description:
      "Share invitations, updates, and guest responses for bridal shower in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Bridal Shower",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Baptism Event")]: {
  template: "Baptism Event",
  showcase: {
    title: "Baptism Event",
    subtitle: "Invitation & event details",
    description:
      "Join us for baptism event with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Baptism Event",
    description:
      "We put together everything guests need for baptism event, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Baptism Event",
    description:
      "See the timeline, location, and guest information for baptism event in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Baptism Event",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for baptism event with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Baptism Event Organized",
    description:
      "Share invitations, updates, and guest responses for baptism event in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Baptism Event",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Christening Event")]: {
  template: "Christening Event",
  showcase: {
    title: "Christening Event",
    subtitle: "Invitation & event details",
    description:
      "Join us for christening event with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Christening Event",
    description:
      "We put together everything guests need for christening event, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Christening Event",
    description:
      "See the timeline, location, and guest information for christening event in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Christening Event",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for christening event with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Christening Event Organized",
    description:
      "Share invitations, updates, and guest responses for christening event in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Christening Event",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Cultural Festival Invite")]: {
  template: "Cultural Festival Invite",
  showcase: {
    title: "Cultural Festival Invite",
    subtitle: "Invitation & event details",
    description:
      "Join us for cultural festival invite with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Cultural Festival Invite",
    description:
      "We put together everything guests need for cultural festival invite, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Cultural Festival Invite",
    description:
      "See the timeline, location, and guest information for cultural festival invite in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Cultural Festival Invite",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for cultural festival invite with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Cultural Festival Invite Organized",
    description:
      "Share invitations, updates, and guest responses for cultural festival invite in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Cultural Festival Invite",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Music Recital Invite")]: {
  template: "Music Recital Invite",
  showcase: {
    title: "An Evening of Music",
    subtitle: "Spring Student Recital",
    description:
      "Join us for an evening of piano, strings, and vocal performances by our 2026 recital students.",
    buttonLabel: "View Program",
    callout: "Interested in attending?",
    linkLabel: "Reserve Seat",
  },
  festive: {
    title: "Celebrate the Performance",
    subtitle: "Music Recital",
    description:
      "Enjoy a special evening of talented young musicians, favorite pieces, and proud families.",
    buttonLabel: "Save My Seat",
    callout: "Performance Begins In:",
  },
  modern: {
    title: "Showcase the Sound",
    description:
      "Highlight performers, repertoire, venue details, and RSVP information with a polished recital page.",
    buttonLabel: "Attend Recital",
    label1: "Featured Performers",
    label2: "Program Notes",
    label3: "Venue Details",
  },
  elegant: {
    title: "A Graceful Evening",
    subtitle: "of Music",
    description:
      "Present your recital with elegance, clarity, and a refined invitation experience.",
    buttonLabel: "View Invitation",
    label1: "Program",
    label2: "Performers",
    label3: "Venue",
    label4: "RSVP",
  },
  business: {
    title: "Promote Your Recital with Confidence",
    description:
      "Organize event details, performance highlights, and guest responses in one professional page.",
    buttonLabel: "View Event",
    label1: "Event Overview",
    label2: "Artist Lineup",
    label3: "Guest Access",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Music Recital Invite",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Limited Time Offer")]: {
  template: "Limited Time Offer",
  showcase: {
    title: "Limited Time Offer",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this limited time offer worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "Limited Time Offer",
    description:
      "Explore the offer, launch details, or campaign highlights behind this limited time offer.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch Limited Time Offer Strong",
    description:
      "Highlight the value, timeline, and call to action for this limited time offer in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "Limited Time Offer",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for limited time offer designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger Limited Time Offer Page",
    description:
      "Keep messaging, conversion points, and campaign details for limited time offer organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "Limited Time Offer",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Flash Sale")]: {
  template: "Flash Sale",
  showcase: {
    title: "Flash Sale",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this flash sale worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "Flash Sale",
    description:
      "Explore the offer, launch details, or campaign highlights behind this flash sale.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch Flash Sale Strong",
    description:
      "Highlight the value, timeline, and call to action for this flash sale in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "Flash Sale",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for flash sale designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger Flash Sale Page",
    description:
      "Keep messaging, conversion points, and campaign details for flash sale organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "Flash Sale",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Black Friday Promotion")]: {
  template: "Black Friday Promotion",
  showcase: {
    title: "Black Friday Promotion",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this black friday promotion worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "Black Friday Promotion",
    description:
      "Explore the offer, launch details, or campaign highlights behind this black friday promotion.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch Black Friday Promotion Strong",
    description:
      "Highlight the value, timeline, and call to action for this black friday promotion in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "Black Friday Promotion",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for black friday promotion designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger Black Friday Promotion Page",
    description:
      "Keep messaging, conversion points, and campaign details for black friday promotion organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "Black Friday Promotion",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("New Service Announcement")]: {
  template: "New Service Announcement",
  showcase: {
    title: "New Service Announcement",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this new service announcement worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "New Service Announcement",
    description:
      "Explore the offer, launch details, or campaign highlights behind this new service announcement.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch New Service Announcement Strong",
    description:
      "Highlight the value, timeline, and call to action for this new service announcement in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "New Service Announcement",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for new service announcement designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger New Service Announcement Page",
    description:
      "Keep messaging, conversion points, and campaign details for new service announcement organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "New Service Announcement",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Startup Demo Day")]: {
  template: "Startup Demo Day",
  showcase: {
    title: "Startup Demo Day",
    subtitle: "Invitation & event details",
    description:
      "Join us for startup demo day with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Startup Demo Day",
    description:
      "We put together everything guests need for startup demo day, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Startup Demo Day",
    description:
      "See the timeline, location, and guest information for startup demo day in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Startup Demo Day",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for startup demo day with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Startup Demo Day Organized",
    description:
      "Share invitations, updates, and guest responses for startup demo day in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Startup Demo Day",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Brand Collaboration")]: {
  template: "Brand Collaboration",
  showcase: {
    title: "Brand Collaboration",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this brand collaboration worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "Brand Collaboration",
    description:
      "Explore the offer, launch details, or campaign highlights behind this brand collaboration.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch Brand Collaboration Strong",
    description:
      "Highlight the value, timeline, and call to action for this brand collaboration in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "Brand Collaboration",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for brand collaboration designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger Brand Collaboration Page",
    description:
      "Keep messaging, conversion points, and campaign details for brand collaboration organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "Brand Collaboration",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Influencer Campaign")]: {
  template: "Influencer Campaign",
  showcase: {
    title: "Influencer Campaign",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this influencer campaign worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "Influencer Campaign",
    description:
      "Explore the offer, launch details, or campaign highlights behind this influencer campaign.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch Influencer Campaign Strong",
    description:
      "Highlight the value, timeline, and call to action for this influencer campaign in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "Influencer Campaign",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for influencer campaign designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger Influencer Campaign Page",
    description:
      "Keep messaging, conversion points, and campaign details for influencer campaign organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "Influencer Campaign",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Garage Sale")]: {
  template: "Garage Sale",
  showcase: {
    title: "Garage Sale",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this garage sale worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "Garage Sale",
    description:
      "Explore the offer, launch details, or campaign highlights behind this garage sale.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch Garage Sale Strong",
    description:
      "Highlight the value, timeline, and call to action for this garage sale in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "Garage Sale",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for garage sale designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger Garage Sale Page",
    description:
      "Keep messaging, conversion points, and campaign details for garage sale organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "Garage Sale",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Marketing Campaign")]: {
  template: "Marketing Campaign",
  showcase: {
    title: "Marketing Campaign",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this marketing campaign worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "Marketing Campaign",
    description:
      "Explore the offer, launch details, or campaign highlights behind this marketing campaign.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch Marketing Campaign Strong",
    description:
      "Highlight the value, timeline, and call to action for this marketing campaign in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "Marketing Campaign",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for marketing campaign designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger Marketing Campaign Page",
    description:
      "Keep messaging, conversion points, and campaign details for marketing campaign organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "Marketing Campaign",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("New Store Opening")]: {
  template: "New Store Opening",
  showcase: {
    title: "New Store Opening",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this new store opening worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "New Store Opening",
    description:
      "Explore the offer, launch details, or campaign highlights behind this new store opening.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch New Store Opening Strong",
    description:
      "Highlight the value, timeline, and call to action for this new store opening in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "New Store Opening",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for new store opening designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger New Store Opening Page",
    description:
      "Keep messaging, conversion points, and campaign details for new store opening organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "New Store Opening",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Seasonal Promotion")]: {
  template: "Seasonal Promotion",
  showcase: {
    title: "Seasonal Promotion",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this seasonal promotion worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "Seasonal Promotion",
    description:
      "Explore the offer, launch details, or campaign highlights behind this seasonal promotion.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch Seasonal Promotion Strong",
    description:
      "Highlight the value, timeline, and call to action for this seasonal promotion in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "Seasonal Promotion",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for seasonal promotion designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger Seasonal Promotion Page",
    description:
      "Keep messaging, conversion points, and campaign details for seasonal promotion organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "Seasonal Promotion",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Brand Giveaway")]: {
  template: "Brand Giveaway",
  showcase: {
    title: "Brand Giveaway",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this brand giveaway worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "Brand Giveaway",
    description:
      "Explore the offer, launch details, or campaign highlights behind this brand giveaway.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch Brand Giveaway Strong",
    description:
      "Highlight the value, timeline, and call to action for this brand giveaway in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "Brand Giveaway",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for brand giveaway designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger Brand Giveaway Page",
    description:
      "Keep messaging, conversion points, and campaign details for brand giveaway organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "Brand Giveaway",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Contest Entry")]: {
  template: "Contest Entry",
  showcase: {
    title: "Contest Entry",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this contest entry worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "Contest Entry",
    description:
      "Explore the offer, launch details, or campaign highlights behind this contest entry.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch Contest Entry Strong",
    description:
      "Highlight the value, timeline, and call to action for this contest entry in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "Contest Entry",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for contest entry designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger Contest Entry Page",
    description:
      "Keep messaging, conversion points, and campaign details for contest entry organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "Contest Entry",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Affiliate Campaign")]: {
  template: "Affiliate Campaign",
  showcase: {
    title: "Affiliate Campaign",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this affiliate campaign worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "Affiliate Campaign",
    description:
      "Explore the offer, launch details, or campaign highlights behind this affiliate campaign.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch Affiliate Campaign Strong",
    description:
      "Highlight the value, timeline, and call to action for this affiliate campaign in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "Affiliate Campaign",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for affiliate campaign designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger Affiliate Campaign Page",
    description:
      "Keep messaging, conversion points, and campaign details for affiliate campaign organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "Affiliate Campaign",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Referral Program")]: {
  template: "Referral Program",
  showcase: {
    title: "Referral Program",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this referral program worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "Referral Program",
    description:
      "Explore the offer, launch details, or campaign highlights behind this referral program.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch Referral Program Strong",
    description:
      "Highlight the value, timeline, and call to action for this referral program in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "Referral Program",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for referral program designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger Referral Program Page",
    description:
      "Keep messaging, conversion points, and campaign details for referral program organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "Referral Program",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Airbnb Vacation Rental")]: {
  template: "Airbnb Vacation Rental",
  showcase: {
    title: "Airbnb Vacation Rental",
    subtitle: "Listing highlights",
    description:
      "See the photos, property details, and showing information for this airbnb vacation rental.",
    buttonLabel: "View Listing",
    callout: "Interested in a closer look?",
    linkLabel: "Schedule a Visit",
  },
  festive: {
    title: "See the Property",
    subtitle: "Airbnb Vacation Rental",
    description:
      "Explore key specs, photos, pricing, and location details for this airbnb vacation rental.",
    buttonLabel: "See Details",
    callout: "Showing Starts In:",
  },
  modern: {
    title: "Explore This Airbnb Vacation Rental",
    description:
      "Keep photos, specs, pricing, and neighborhood information organized in one modern property page.",
    buttonLabel: "Explore Property",
    label1: "Photos",
    label2: "Property Details",
    label3: "Location",
  },
  elegant: {
    title: "Airbnb Vacation Rental",
    subtitle: "Presented beautifully",
    description:
      "A polished property page designed to highlight the best parts of this airbnb vacation rental.",
    buttonLabel: "View Property",
    label1: "Features",
    label2: "Gallery",
    label3: "Neighborhood",
    label4: "Tour Request",
  },
  business: {
    title: "Promote This Airbnb Vacation Rental Professionally",
    description:
      "Organize listing details, inquiries, and showing requests for this airbnb vacation rental in one page.",
    buttonLabel: "Launch Listing Page",
    label1: "Property Specs",
    label2: "Buyer Interest",
    label3: "Tours",
    contactButtonLabel: "Contact Agent",
  },
  blank: {
    title: "Airbnb Vacation Rental",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Land Sale Listing")]: {
  template: "Land Sale Listing",
  showcase: {
    title: "Land Sale Listing",
    subtitle: "Listing highlights",
    description:
      "See the photos, property details, and showing information for this land sale listing.",
    buttonLabel: "View Listing",
    callout: "Interested in a closer look?",
    linkLabel: "Schedule a Visit",
  },
  festive: {
    title: "See the Property",
    subtitle: "Land Sale Listing",
    description:
      "Explore key specs, photos, pricing, and location details for this land sale listing.",
    buttonLabel: "See Details",
    callout: "Showing Starts In:",
  },
  modern: {
    title: "Explore This Land Sale Listing",
    description:
      "Keep photos, specs, pricing, and neighborhood information organized in one modern property page.",
    buttonLabel: "Explore Property",
    label1: "Photos",
    label2: "Property Details",
    label3: "Location",
  },
  elegant: {
    title: "Land Sale Listing",
    subtitle: "Presented beautifully",
    description:
      "A polished property page designed to highlight the best parts of this land sale listing.",
    buttonLabel: "View Property",
    label1: "Features",
    label2: "Gallery",
    label3: "Neighborhood",
    label4: "Tour Request",
  },
  business: {
    title: "Promote This Land Sale Listing Professionally",
    description:
      "Organize listing details, inquiries, and showing requests for this land sale listing in one page.",
    buttonLabel: "Launch Listing Page",
    label1: "Property Specs",
    label2: "Buyer Interest",
    label3: "Tours",
    contactButtonLabel: "Contact Agent",
  },
  blank: {
    title: "Land Sale Listing",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Property Auction")]: {
  template: "Property Auction",
  showcase: {
    title: "Property Auction",
    subtitle: "Listing highlights",
    description:
      "See the photos, property details, and showing information for this property auction.",
    buttonLabel: "View Listing",
    callout: "Interested in a closer look?",
    linkLabel: "Schedule a Visit",
  },
  festive: {
    title: "See the Property",
    subtitle: "Property Auction",
    description:
      "Explore key specs, photos, pricing, and location details for this property auction.",
    buttonLabel: "See Details",
    callout: "Showing Starts In:",
  },
  modern: {
    title: "Explore This Property Auction",
    description:
      "Keep photos, specs, pricing, and neighborhood information organized in one modern property page.",
    buttonLabel: "Explore Property",
    label1: "Photos",
    label2: "Property Details",
    label3: "Location",
  },
  elegant: {
    title: "Property Auction",
    subtitle: "Presented beautifully",
    description:
      "A polished property page designed to highlight the best parts of this property auction.",
    buttonLabel: "View Property",
    label1: "Features",
    label2: "Gallery",
    label3: "Neighborhood",
    label4: "Tour Request",
  },
  business: {
    title: "Promote This Property Auction Professionally",
    description:
      "Organize listing details, inquiries, and showing requests for this property auction in one page.",
    buttonLabel: "Launch Listing Page",
    label1: "Property Specs",
    label2: "Buyer Interest",
    label3: "Tours",
    contactButtonLabel: "Contact Agent",
  },
  blank: {
    title: "Property Auction",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("New Development Preview")]: {
  template: "New Development Preview",
  showcase: {
    title: "New Development Preview",
    subtitle: "Listing highlights",
    description:
      "See the photos, property details, and showing information for this new development preview.",
    buttonLabel: "View Listing",
    callout: "Interested in a closer look?",
    linkLabel: "Schedule a Visit",
  },
  festive: {
    title: "See the Property",
    subtitle: "New Development Preview",
    description:
      "Explore key specs, photos, pricing, and location details for this new development preview.",
    buttonLabel: "See Details",
    callout: "Showing Starts In:",
  },
  modern: {
    title: "Explore This New Development Preview",
    description:
      "Keep photos, specs, pricing, and neighborhood information organized in one modern property page.",
    buttonLabel: "Explore Property",
    label1: "Photos",
    label2: "Property Details",
    label3: "Location",
  },
  elegant: {
    title: "New Development Preview",
    subtitle: "Presented beautifully",
    description:
      "A polished property page designed to highlight the best parts of this new development preview.",
    buttonLabel: "View Property",
    label1: "Features",
    label2: "Gallery",
    label3: "Neighborhood",
    label4: "Tour Request",
  },
  business: {
    title: "Promote This New Development Preview Professionally",
    description:
      "Organize listing details, inquiries, and showing requests for this new development preview in one page.",
    buttonLabel: "Launch Listing Page",
    label1: "Property Specs",
    label2: "Buyer Interest",
    label3: "Tours",
    contactButtonLabel: "Contact Agent",
  },
  blank: {
    title: "New Development Preview",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Freelancer Portfolio")]: {
  template: "Freelancer Portfolio",
  showcase: {
    title: "Freelancer Portfolio",
    subtitle: "Work, background, and highlights",
    description:
      "Explore experience, standout work, and the key strengths behind this freelancer portfolio.",
    buttonLabel: "View Profile",
    callout: "Want to connect?",
    linkLabel: "Get in Touch",
  },
  festive: {
    title: "A Personal Showcase",
    subtitle: "Freelancer Portfolio",
    description:
      "This page brings together the most important highlights, work samples, and contact details for this freelancer portfolio.",
    buttonLabel: "Explore Profile",
    callout: "Available Now:",
  },
  modern: {
    title: "A Better Freelancer Portfolio",
    description:
      "Present work samples, background, and accomplishments in a clean page built for credibility.",
    buttonLabel: "See Highlights",
    label1: "Work Samples",
    label2: "Experience",
    label3: "Contact",
  },
  elegant: {
    title: "Freelancer Portfolio",
    subtitle: "Distinctive and polished",
    description:
      "A refined page designed to present this freelancer portfolio with confidence and clarity.",
    buttonLabel: "View Portfolio",
    label1: "About",
    label2: "Highlights",
    label3: "Projects",
    label4: "Contact",
  },
  business: {
    title: "Present Freelancer Portfolio Professionally",
    description:
      "Show your value, proof of work, and contact options in one structured page.",
    buttonLabel: "Launch Profile",
    label1: "Overview",
    label2: "Experience",
    label3: "Proof of Work",
    contactButtonLabel: "Contact Me",
  },
  blank: {
    title: "Freelancer Portfolio",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Designer Portfolio")]: {
  template: "Designer Portfolio",
  showcase: {
    title: "Designer Portfolio",
    subtitle: "Work, background, and highlights",
    description:
      "Explore experience, standout work, and the key strengths behind this designer portfolio.",
    buttonLabel: "View Profile",
    callout: "Want to connect?",
    linkLabel: "Get in Touch",
  },
  festive: {
    title: "A Personal Showcase",
    subtitle: "Designer Portfolio",
    description:
      "This page brings together the most important highlights, work samples, and contact details for this designer portfolio.",
    buttonLabel: "Explore Profile",
    callout: "Available Now:",
  },
  modern: {
    title: "A Better Designer Portfolio",
    description:
      "Present work samples, background, and accomplishments in a clean page built for credibility.",
    buttonLabel: "See Highlights",
    label1: "Work Samples",
    label2: "Experience",
    label3: "Contact",
  },
  elegant: {
    title: "Designer Portfolio",
    subtitle: "Distinctive and polished",
    description:
      "A refined page designed to present this designer portfolio with confidence and clarity.",
    buttonLabel: "View Portfolio",
    label1: "About",
    label2: "Highlights",
    label3: "Projects",
    label4: "Contact",
  },
  business: {
    title: "Present Designer Portfolio Professionally",
    description:
      "Show your value, proof of work, and contact options in one structured page.",
    buttonLabel: "Launch Profile",
    label1: "Overview",
    label2: "Experience",
    label3: "Proof of Work",
    contactButtonLabel: "Contact Me",
  },
  blank: {
    title: "Designer Portfolio",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Developer Portfolio")]: {
  template: "Developer Portfolio",
  showcase: {
    title: "Developer Portfolio",
    subtitle: "Work, background, and highlights",
    description:
      "Explore experience, standout work, and the key strengths behind this developer portfolio.",
    buttonLabel: "View Profile",
    callout: "Want to connect?",
    linkLabel: "Get in Touch",
  },
  festive: {
    title: "A Personal Showcase",
    subtitle: "Developer Portfolio",
    description:
      "This page brings together the most important highlights, work samples, and contact details for this developer portfolio.",
    buttonLabel: "Explore Profile",
    callout: "Available Now:",
  },
  modern: {
    title: "A Better Developer Portfolio",
    description:
      "Present work samples, background, and accomplishments in a clean page built for credibility.",
    buttonLabel: "See Highlights",
    label1: "Work Samples",
    label2: "Experience",
    label3: "Contact",
  },
  elegant: {
    title: "Developer Portfolio",
    subtitle: "Distinctive and polished",
    description:
      "A refined page designed to present this developer portfolio with confidence and clarity.",
    buttonLabel: "View Portfolio",
    label1: "About",
    label2: "Highlights",
    label3: "Projects",
    label4: "Contact",
  },
  business: {
    title: "Present Developer Portfolio Professionally",
    description:
      "Show your value, proof of work, and contact options in one structured page.",
    buttonLabel: "Launch Profile",
    label1: "Overview",
    label2: "Experience",
    label3: "Proof of Work",
    contactButtonLabel: "Contact Me",
  },
  blank: {
    title: "Developer Portfolio",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Speaker Profile")]: {
  template: "Speaker Profile",
  showcase: {
    title: "Speaker Profile",
    subtitle: "Work, background, and highlights",
    description:
      "Explore experience, standout work, and the key strengths behind this speaker profile.",
    buttonLabel: "View Profile",
    callout: "Want to connect?",
    linkLabel: "Get in Touch",
  },
  festive: {
    title: "A Personal Showcase",
    subtitle: "Speaker Profile",
    description:
      "This page brings together the most important highlights, work samples, and contact details for this speaker profile.",
    buttonLabel: "Explore Profile",
    callout: "Available Now:",
  },
  modern: {
    title: "A Better Speaker Profile",
    description:
      "Present work samples, background, and accomplishments in a clean page built for credibility.",
    buttonLabel: "See Highlights",
    label1: "Work Samples",
    label2: "Experience",
    label3: "Contact",
  },
  elegant: {
    title: "Speaker Profile",
    subtitle: "Distinctive and polished",
    description:
      "A refined page designed to present this speaker profile with confidence and clarity.",
    buttonLabel: "View Portfolio",
    label1: "About",
    label2: "Highlights",
    label3: "Projects",
    label4: "Contact",
  },
  business: {
    title: "Present Speaker Profile Professionally",
    description:
      "Show your value, proof of work, and contact options in one structured page.",
    buttonLabel: "Launch Profile",
    label1: "Overview",
    label2: "Experience",
    label3: "Proof of Work",
    contactButtonLabel: "Contact Me",
  },
  blank: {
    title: "Speaker Profile",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Job Candidate Showcase")]: {
  template: "Job Candidate Showcase",
  showcase: {
    title: "Job Candidate Showcase",
    subtitle: "Work, background, and highlights",
    description:
      "Explore experience, standout work, and the key strengths behind this job candidate showcase.",
    buttonLabel: "View Profile",
    callout: "Want to connect?",
    linkLabel: "Get in Touch",
  },
  festive: {
    title: "A Personal Showcase",
    subtitle: "Job Candidate Showcase",
    description:
      "This page brings together the most important highlights, work samples, and contact details for this job candidate showcase.",
    buttonLabel: "Explore Profile",
    callout: "Available Now:",
  },
  modern: {
    title: "A Better Job Candidate Showcase",
    description:
      "Present work samples, background, and accomplishments in a clean page built for credibility.",
    buttonLabel: "See Highlights",
    label1: "Work Samples",
    label2: "Experience",
    label3: "Contact",
  },
  elegant: {
    title: "Job Candidate Showcase",
    subtitle: "Distinctive and polished",
    description:
      "A refined page designed to present this job candidate showcase with confidence and clarity.",
    buttonLabel: "View Portfolio",
    label1: "About",
    label2: "Highlights",
    label3: "Projects",
    label4: "Contact",
  },
  business: {
    title: "Present Job Candidate Showcase Professionally",
    description:
      "Show your value, proof of work, and contact options in one structured page.",
    buttonLabel: "Launch Profile",
    label1: "Overview",
    label2: "Experience",
    label3: "Proof of Work",
    contactButtonLabel: "Contact Me",
  },
  blank: {
    title: "Job Candidate Showcase",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Consultant Service")]: {
  template: "Consultant Service",
  showcase: {
    title: "Consultant Service",
    subtitle: "Work, background, and highlights",
    description:
      "Explore experience, standout work, and the key strengths behind this consultant service.",
    buttonLabel: "View Profile",
    callout: "Want to connect?",
    linkLabel: "Get in Touch",
  },
  festive: {
    title: "A Personal Showcase",
    subtitle: "Consultant Service",
    description:
      "This page brings together the most important highlights, work samples, and contact details for this consultant service.",
    buttonLabel: "Explore Profile",
    callout: "Available Now:",
  },
  modern: {
    title: "A Better Consultant Service",
    description:
      "Present work samples, background, and accomplishments in a clean page built for credibility.",
    buttonLabel: "See Highlights",
    label1: "Work Samples",
    label2: "Experience",
    label3: "Contact",
  },
  elegant: {
    title: "Consultant Service",
    subtitle: "Distinctive and polished",
    description:
      "A refined page designed to present this consultant service with confidence and clarity.",
    buttonLabel: "View Portfolio",
    label1: "About",
    label2: "Highlights",
    label3: "Projects",
    label4: "Contact",
  },
  business: {
    title: "Present Consultant Service Professionally",
    description:
      "Show your value, proof of work, and contact options in one structured page.",
    buttonLabel: "Launch Profile",
    label1: "Overview",
    label2: "Experience",
    label3: "Proof of Work",
    contactButtonLabel: "Contact Me",
  },
  blank: {
    title: "Consultant Service",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Temporary Work Portfolio")]: {
  template: "Temporary Work Portfolio",
  showcase: {
    title: "Temporary Work Portfolio",
    subtitle: "Work, background, and highlights",
    description:
      "Explore experience, standout work, and the key strengths behind this temporary work portfolio.",
    buttonLabel: "View Profile",
    callout: "Want to connect?",
    linkLabel: "Get in Touch",
  },
  festive: {
    title: "A Personal Showcase",
    subtitle: "Temporary Work Portfolio",
    description:
      "This page brings together the most important highlights, work samples, and contact details for this temporary work portfolio.",
    buttonLabel: "Explore Profile",
    callout: "Available Now:",
  },
  modern: {
    title: "A Better Temporary Work Portfolio",
    description:
      "Present work samples, background, and accomplishments in a clean page built for credibility.",
    buttonLabel: "See Highlights",
    label1: "Work Samples",
    label2: "Experience",
    label3: "Contact",
  },
  elegant: {
    title: "Temporary Work Portfolio",
    subtitle: "Distinctive and polished",
    description:
      "A refined page designed to present this temporary work portfolio with confidence and clarity.",
    buttonLabel: "View Portfolio",
    label1: "About",
    label2: "Highlights",
    label3: "Projects",
    label4: "Contact",
  },
  business: {
    title: "Present Temporary Work Portfolio Professionally",
    description:
      "Show your value, proof of work, and contact options in one structured page.",
    buttonLabel: "Launch Profile",
    label1: "Overview",
    label2: "Experience",
    label3: "Proof of Work",
    contactButtonLabel: "Contact Me",
  },
  blank: {
    title: "Temporary Work Portfolio",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Community Announcement")]: {
  template: "Community Announcement",
  showcase: {
    title: "Community Announcement",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this community announcement worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "Community Announcement",
    description:
      "Explore the offer, launch details, or campaign highlights behind this community announcement.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch Community Announcement Strong",
    description:
      "Highlight the value, timeline, and call to action for this community announcement in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "Community Announcement",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for community announcement designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger Community Announcement Page",
    description:
      "Keep messaging, conversion points, and campaign details for community announcement organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "Community Announcement",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Neighborhood Alert")]: {
  template: "Neighborhood Alert",
  showcase: {
    title: "Neighborhood Alert",
    subtitle: "Community update",
    description:
      "Share the most important details, timing, and next steps related to neighborhood alert in one page.",
    buttonLabel: "View Update",
    callout: "Need more information?",
    linkLabel: "Read More",
  },
  festive: {
    title: "Community Update",
    subtitle: "Neighborhood Alert",
    description:
      "Keep everyone informed about neighborhood alert with clear details, reminders, and updates.",
    buttonLabel: "See Details",
    callout: "Starts In:",
  },
  modern: {
    title: "Publish Neighborhood Alert Clearly",
    description:
      "Use one simple page to present announcements, details, and any important community information.",
    buttonLabel: "View Information",
    label1: "Overview",
    label2: "Updates",
    label3: "Resources",
  },
  elegant: {
    title: "Neighborhood Alert",
    subtitle: "Clear and thoughtful",
    description:
      "A polished community page designed to make neighborhood alert easy to understand and share.",
    buttonLabel: "View Page",
    label1: "Summary",
    label2: "Key Details",
    label3: "Resources",
    label4: "Contact",
  },
  business: {
    title: "Manage Neighborhood Alert Better",
    description:
      "Keep updates, schedules, and public information for neighborhood alert organized in one place.",
    buttonLabel: "Launch Information Page",
    label1: "Communication",
    label2: "Resources",
    label3: "Updates",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Neighborhood Alert",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Local Volunteer Signup")]: {
  template: "Local Volunteer Signup",
  showcase: {
    title: "Local Volunteer Signup",
    subtitle: "Community update",
    description:
      "Share the most important details, timing, and next steps related to local volunteer signup in one page.",
    buttonLabel: "View Update",
    callout: "Need more information?",
    linkLabel: "Read More",
  },
  festive: {
    title: "Community Update",
    subtitle: "Local Volunteer Signup",
    description:
      "Keep everyone informed about local volunteer signup with clear details, reminders, and updates.",
    buttonLabel: "See Details",
    callout: "Starts In:",
  },
  modern: {
    title: "Publish Local Volunteer Signup Clearly",
    description:
      "Use one simple page to present announcements, details, and any important community information.",
    buttonLabel: "View Information",
    label1: "Overview",
    label2: "Updates",
    label3: "Resources",
  },
  elegant: {
    title: "Local Volunteer Signup",
    subtitle: "Clear and thoughtful",
    description:
      "A polished community page designed to make local volunteer signup easy to understand and share.",
    buttonLabel: "View Page",
    label1: "Summary",
    label2: "Key Details",
    label3: "Resources",
    label4: "Contact",
  },
  business: {
    title: "Manage Local Volunteer Signup Better",
    description:
      "Keep updates, schedules, and public information for local volunteer signup organized in one place.",
    buttonLabel: "Launch Information Page",
    label1: "Communication",
    label2: "Resources",
    label3: "Updates",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Local Volunteer Signup",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Nonprofit Campaign")]: {
  template: "Nonprofit Campaign",
  showcase: {
    title: "Nonprofit Campaign",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this nonprofit campaign worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "Nonprofit Campaign",
    description:
      "Explore the offer, launch details, or campaign highlights behind this nonprofit campaign.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch Nonprofit Campaign Strong",
    description:
      "Highlight the value, timeline, and call to action for this nonprofit campaign in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "Nonprofit Campaign",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for nonprofit campaign designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger Nonprofit Campaign Page",
    description:
      "Keep messaging, conversion points, and campaign details for nonprofit campaign organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "Nonprofit Campaign",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("School Event")]: {
  template: "School Event",
  showcase: {
    title: "School Event",
    subtitle: "Invitation & event details",
    description:
      "Join us for school event with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "School Event",
    description:
      "We put together everything guests need for school event, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for School Event",
    description:
      "See the timeline, location, and guest information for school event in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "School Event",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for school event with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep School Event Organized",
    description:
      "Share invitations, updates, and guest responses for school event in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "School Event",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Local Sports League Signup")]: {
  template: "Local Sports League Signup",
  showcase: {
    title: "Local Sports League Signup",
    subtitle: "Community update",
    description:
      "Share the most important details, timing, and next steps related to local sports league signup in one page.",
    buttonLabel: "View Update",
    callout: "Need more information?",
    linkLabel: "Read More",
  },
  festive: {
    title: "Community Update",
    subtitle: "Local Sports League Signup",
    description:
      "Keep everyone informed about local sports league signup with clear details, reminders, and updates.",
    buttonLabel: "See Details",
    callout: "Starts In:",
  },
  modern: {
    title: "Publish Local Sports League Signup Clearly",
    description:
      "Use one simple page to present announcements, details, and any important community information.",
    buttonLabel: "View Information",
    label1: "Overview",
    label2: "Updates",
    label3: "Resources",
  },
  elegant: {
    title: "Local Sports League Signup",
    subtitle: "Clear and thoughtful",
    description:
      "A polished community page designed to make local sports league signup easy to understand and share.",
    buttonLabel: "View Page",
    label1: "Summary",
    label2: "Key Details",
    label3: "Resources",
    label4: "Contact",
  },
  business: {
    title: "Manage Local Sports League Signup Better",
    description:
      "Keep updates, schedules, and public information for local sports league signup organized in one place.",
    buttonLabel: "Launch Information Page",
    label1: "Communication",
    label2: "Resources",
    label3: "Updates",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Local Sports League Signup",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Community Poll")]: {
  template: "Community Poll",
  showcase: {
    title: "Community Poll",
    subtitle: "Community update",
    description:
      "Share the most important details, timing, and next steps related to community poll in one page.",
    buttonLabel: "View Update",
    callout: "Need more information?",
    linkLabel: "Read More",
  },
  festive: {
    title: "Community Update",
    subtitle: "Community Poll",
    description:
      "Keep everyone informed about community poll with clear details, reminders, and updates.",
    buttonLabel: "See Details",
    callout: "Starts In:",
  },
  modern: {
    title: "Publish Community Poll Clearly",
    description:
      "Use one simple page to present announcements, details, and any important community information.",
    buttonLabel: "View Information",
    label1: "Overview",
    label2: "Updates",
    label3: "Resources",
  },
  elegant: {
    title: "Community Poll",
    subtitle: "Clear and thoughtful",
    description:
      "A polished community page designed to make community poll easy to understand and share.",
    buttonLabel: "View Page",
    label1: "Summary",
    label2: "Key Details",
    label3: "Resources",
    label4: "Contact",
  },
  business: {
    title: "Manage Community Poll Better",
    description:
      "Keep updates, schedules, and public information for community poll organized in one place.",
    buttonLabel: "Launch Information Page",
    label1: "Communication",
    label2: "Resources",
    label3: "Updates",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Community Poll",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Public Feedback")]: {
  template: "Public Feedback",
  showcase: {
    title: "Public Feedback",
    subtitle: "Community update",
    description:
      "Share the most important details, timing, and next steps related to public feedback in one page.",
    buttonLabel: "View Update",
    callout: "Need more information?",
    linkLabel: "Read More",
  },
  festive: {
    title: "Community Update",
    subtitle: "Public Feedback",
    description:
      "Keep everyone informed about public feedback with clear details, reminders, and updates.",
    buttonLabel: "See Details",
    callout: "Starts In:",
  },
  modern: {
    title: "Publish Public Feedback Clearly",
    description:
      "Use one simple page to present announcements, details, and any important community information.",
    buttonLabel: "View Information",
    label1: "Overview",
    label2: "Updates",
    label3: "Resources",
  },
  elegant: {
    title: "Public Feedback",
    subtitle: "Clear and thoughtful",
    description:
      "A polished community page designed to make public feedback easy to understand and share.",
    buttonLabel: "View Page",
    label1: "Summary",
    label2: "Key Details",
    label3: "Resources",
    label4: "Contact",
  },
  business: {
    title: "Manage Public Feedback Better",
    description:
      "Keep updates, schedules, and public information for public feedback organized in one place.",
    buttonLabel: "Launch Information Page",
    label1: "Communication",
    label2: "Resources",
    label3: "Updates",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Public Feedback",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Town Hall Discussion")]: {
  template: "Town Hall Discussion",
  showcase: {
    title: "Town Hall Discussion",
    subtitle: "Community update",
    description:
      "Share the most important details, timing, and next steps related to town hall discussion in one page.",
    buttonLabel: "View Update",
    callout: "Need more information?",
    linkLabel: "Read More",
  },
  festive: {
    title: "Community Update",
    subtitle: "Town Hall Discussion",
    description:
      "Keep everyone informed about town hall discussion with clear details, reminders, and updates.",
    buttonLabel: "See Details",
    callout: "Starts In:",
  },
  modern: {
    title: "Publish Town Hall Discussion Clearly",
    description:
      "Use one simple page to present announcements, details, and any important community information.",
    buttonLabel: "View Information",
    label1: "Overview",
    label2: "Updates",
    label3: "Resources",
  },
  elegant: {
    title: "Town Hall Discussion",
    subtitle: "Clear and thoughtful",
    description:
      "A polished community page designed to make town hall discussion easy to understand and share.",
    buttonLabel: "View Page",
    label1: "Summary",
    label2: "Key Details",
    label3: "Resources",
    label4: "Contact",
  },
  business: {
    title: "Manage Town Hall Discussion Better",
    description:
      "Keep updates, schedules, and public information for town hall discussion organized in one place.",
    buttonLabel: "Launch Information Page",
    label1: "Communication",
    label2: "Resources",
    label3: "Updates",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Town Hall Discussion",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Podcast Episode")]: {
  template: "Podcast Episode",
  showcase: {
    title: "Podcast Episode",
    subtitle: "What you'll learn",
    description:
      "Explore what this podcast episode includes, who it's for, and how to join or get access.",
    buttonLabel: "View Details",
    callout: "Want to join in?",
    linkLabel: "Get Access",
  },
  festive: {
    title: "Learn Something New",
    subtitle: "Podcast Episode",
    description:
      "Everything participants need for podcast episode—format, timing, access, and key takeaways.",
    buttonLabel: "Join Now",
    callout: "Begins In:",
  },
  modern: {
    title: "Get Ready for Podcast Episode",
    description:
      "Present the agenda, benefits, and access details for podcast episode in one clean page.",
    buttonLabel: "Explore Program",
    label1: "Overview",
    label2: "What You'll Learn",
    label3: "Access",
  },
  elegant: {
    title: "Podcast Episode",
    subtitle: "Thoughtfully presented",
    description:
      "A polished page that makes podcast episode feel clear, premium, and easy to join.",
    buttonLabel: "View Program",
    label1: "Curriculum",
    label2: "Format",
    label3: "Benefits",
    label4: "Enrollment",
  },
  business: {
    title: "Organize Podcast Episode Clearly",
    description:
      "Keep schedule, participant details, and registration information for podcast episode in one page.",
    buttonLabel: "Launch Learning Page",
    label1: "Program Overview",
    label2: "Registration",
    label3: "Participant Info",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Podcast Episode",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("YouTube Video Launch")]: {
  template: "YouTube Video Launch",
  showcase: {
    title: "YouTube Video Launch",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this youtube video launch worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "YouTube Video Launch",
    description:
      "Explore the offer, launch details, or campaign highlights behind this youtube video launch.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch YouTube Video Launch Strong",
    description:
      "Highlight the value, timeline, and call to action for this youtube video launch in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "YouTube Video Launch",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for youtube video launch designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger YouTube Video Launch Page",
    description:
      "Keep messaging, conversion points, and campaign details for youtube video launch organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "YouTube Video Launch",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Creator Link Hub")]: {
  template: "Creator Link Hub",
  showcase: {
    title: "Creator Link Hub",
    subtitle: "Work, background, and highlights",
    description:
      "Explore experience, standout work, and the key strengths behind this creator link hub.",
    buttonLabel: "View Profile",
    callout: "Want to connect?",
    linkLabel: "Get in Touch",
  },
  festive: {
    title: "A Personal Showcase",
    subtitle: "Creator Link Hub",
    description:
      "This page brings together the most important highlights, work samples, and contact details for this creator link hub.",
    buttonLabel: "Explore Profile",
    callout: "Available Now:",
  },
  modern: {
    title: "A Better Creator Link Hub",
    description:
      "Present work samples, background, and accomplishments in a clean page built for credibility.",
    buttonLabel: "See Highlights",
    label1: "Work Samples",
    label2: "Experience",
    label3: "Contact",
  },
  elegant: {
    title: "Creator Link Hub",
    subtitle: "Distinctive and polished",
    description:
      "A refined page designed to present this creator link hub with confidence and clarity.",
    buttonLabel: "View Portfolio",
    label1: "About",
    label2: "Highlights",
    label3: "Projects",
    label4: "Contact",
  },
  business: {
    title: "Present Creator Link Hub Professionally",
    description:
      "Show your value, proof of work, and contact options in one structured page.",
    buttonLabel: "Launch Profile",
    label1: "Overview",
    label2: "Experience",
    label3: "Proof of Work",
    contactButtonLabel: "Contact Me",
  },
  blank: {
    title: "Creator Link Hub",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Patreon Campaign")]: {
  template: "Patreon Campaign",
  showcase: {
    title: "Patreon Campaign",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this patreon campaign worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "Patreon Campaign",
    description:
      "Explore the offer, launch details, or campaign highlights behind this patreon campaign.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch Patreon Campaign Strong",
    description:
      "Highlight the value, timeline, and call to action for this patreon campaign in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "Patreon Campaign",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for patreon campaign designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger Patreon Campaign Page",
    description:
      "Keep messaging, conversion points, and campaign details for patreon campaign organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "Patreon Campaign",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Course Enrollment")]: {
  template: "Course Enrollment",
  showcase: {
    title: "Course Enrollment",
    subtitle: "What you'll learn",
    description:
      "Explore what this course enrollment includes, who it's for, and how to join or get access.",
    buttonLabel: "View Details",
    callout: "Want to join in?",
    linkLabel: "Get Access",
  },
  festive: {
    title: "Learn Something New",
    subtitle: "Course Enrollment",
    description:
      "Everything participants need for course enrollment—format, timing, access, and key takeaways.",
    buttonLabel: "Join Now",
    callout: "Begins In:",
  },
  modern: {
    title: "Get Ready for Course Enrollment",
    description:
      "Present the agenda, benefits, and access details for course enrollment in one clean page.",
    buttonLabel: "Explore Program",
    label1: "Overview",
    label2: "What You'll Learn",
    label3: "Access",
  },
  elegant: {
    title: "Course Enrollment",
    subtitle: "Thoughtfully presented",
    description:
      "A polished page that makes course enrollment feel clear, premium, and easy to join.",
    buttonLabel: "View Program",
    label1: "Curriculum",
    label2: "Format",
    label3: "Benefits",
    label4: "Enrollment",
  },
  business: {
    title: "Organize Course Enrollment Clearly",
    description:
      "Keep schedule, participant details, and registration information for course enrollment in one page.",
    buttonLabel: "Launch Learning Page",
    label1: "Program Overview",
    label2: "Registration",
    label3: "Participant Info",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Course Enrollment",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Live Stream Event")]: {
  template: "Live Stream Event",
  showcase: {
    title: "Live Stream Event",
    subtitle: "What you'll learn",
    description:
      "Explore what this live stream event includes, who it's for, and how to join or get access.",
    buttonLabel: "View Details",
    callout: "Want to join in?",
    linkLabel: "Get Access",
  },
  festive: {
    title: "Learn Something New",
    subtitle: "Live Stream Event",
    description:
      "Everything participants need for live stream event—format, timing, access, and key takeaways.",
    buttonLabel: "Join Now",
    callout: "Begins In:",
  },
  modern: {
    title: "Get Ready for Live Stream Event",
    description:
      "Present the agenda, benefits, and access details for live stream event in one clean page.",
    buttonLabel: "Explore Program",
    label1: "Overview",
    label2: "What You'll Learn",
    label3: "Access",
  },
  elegant: {
    title: "Live Stream Event",
    subtitle: "Thoughtfully presented",
    description:
      "A polished page that makes live stream event feel clear, premium, and easy to join.",
    buttonLabel: "View Program",
    label1: "Curriculum",
    label2: "Format",
    label3: "Benefits",
    label4: "Enrollment",
  },
  business: {
    title: "Organize Live Stream Event Clearly",
    description:
      "Keep schedule, participant details, and registration information for live stream event in one page.",
    buttonLabel: "Launch Learning Page",
    label1: "Program Overview",
    label2: "Registration",
    label3: "Participant Info",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Live Stream Event",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Book Club")]: {
  template: "Book Club",
  showcase: {
    title: "Book Club",
    subtitle: "What you'll learn",
    description:
      "Explore what this book club includes, who it's for, and how to join or get access.",
    buttonLabel: "View Details",
    callout: "Want to join in?",
    linkLabel: "Get Access",
  },
  festive: {
    title: "Learn Something New",
    subtitle: "Book Club",
    description:
      "Everything participants need for book club—format, timing, access, and key takeaways.",
    buttonLabel: "Join Now",
    callout: "Begins In:",
  },
  modern: {
    title: "Get Ready for Book Club",
    description:
      "Present the agenda, benefits, and access details for book club in one clean page.",
    buttonLabel: "Explore Program",
    label1: "Overview",
    label2: "What You'll Learn",
    label3: "Access",
  },
  elegant: {
    title: "Book Club",
    subtitle: "Thoughtfully presented",
    description:
      "A polished page that makes book club feel clear, premium, and easy to join.",
    buttonLabel: "View Program",
    label1: "Curriculum",
    label2: "Format",
    label3: "Benefits",
    label4: "Enrollment",
  },
  business: {
    title: "Organize Book Club Clearly",
    description:
      "Keep schedule, participant details, and registration information for book club in one page.",
    buttonLabel: "Launch Learning Page",
    label1: "Program Overview",
    label2: "Registration",
    label3: "Participant Info",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Book Club",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Newsletter Signup")]: {
  template: "Newsletter Signup",
  showcase: {
    title: "Newsletter Signup",
    subtitle: "What you'll learn",
    description:
      "Explore what this newsletter signup includes, who it's for, and how to join or get access.",
    buttonLabel: "View Details",
    callout: "Want to join in?",
    linkLabel: "Get Access",
  },
  festive: {
    title: "Learn Something New",
    subtitle: "Newsletter Signup",
    description:
      "Everything participants need for newsletter signup—format, timing, access, and key takeaways.",
    buttonLabel: "Join Now",
    callout: "Begins In:",
  },
  modern: {
    title: "Get Ready for Newsletter Signup",
    description:
      "Present the agenda, benefits, and access details for newsletter signup in one clean page.",
    buttonLabel: "Explore Program",
    label1: "Overview",
    label2: "What You'll Learn",
    label3: "Access",
  },
  elegant: {
    title: "Newsletter Signup",
    subtitle: "Thoughtfully presented",
    description:
      "A polished page that makes newsletter signup feel clear, premium, and easy to join.",
    buttonLabel: "View Program",
    label1: "Curriculum",
    label2: "Format",
    label3: "Benefits",
    label4: "Enrollment",
  },
  business: {
    title: "Organize Newsletter Signup Clearly",
    description:
      "Keep schedule, participant details, and registration information for newsletter signup in one page.",
    buttonLabel: "Launch Learning Page",
    label1: "Program Overview",
    label2: "Registration",
    label3: "Participant Info",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Newsletter Signup",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Moving Sale")]: {
  template: "Moving Sale",
  showcase: {
    title: "Moving Sale",
    subtitle: "Launch, offer, or campaign details",
    description:
      "See what makes this moving sale worth checking out, plus the key details and next steps.",
    buttonLabel: "View Details",
    callout: "Ready to take the next step?",
    linkLabel: "Learn More",
  },
  festive: {
    title: "Something New Is Here",
    subtitle: "Moving Sale",
    description:
      "Explore the offer, launch details, or campaign highlights behind this moving sale.",
    buttonLabel: "Explore Now",
    callout: "Offer Ends In:",
  },
  modern: {
    title: "Launch Moving Sale Strong",
    description:
      "Highlight the value, timeline, and call to action for this moving sale in one conversion-focused page.",
    buttonLabel: "Explore Offer",
    label1: "Highlights",
    label2: "Why It Matters",
    label3: "Get Started",
  },
  elegant: {
    title: "Moving Sale",
    subtitle: "Presented with impact",
    description:
      "A polished promotional page for moving sale designed to build excitement and drive action.",
    buttonLabel: "View Promotion",
    label1: "Offer",
    label2: "Benefits",
    label3: "Details",
    label4: "Take Action",
  },
  business: {
    title: "Run a Stronger Moving Sale Page",
    description:
      "Keep messaging, conversion points, and campaign details for moving sale organized in one place.",
    buttonLabel: "Launch Promotion",
    label1: "Campaign Focus",
    label2: "Offer Details",
    label3: "Conversion Path",
    contactButtonLabel: "Contact Team",
  },
  blank: {
    title: "Moving Sale",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Estate Sale Listing")]: {
  template: "Estate Sale Listing",
  showcase: {
    title: "Estate Sale Listing",
    subtitle: "Listing highlights",
    description:
      "See the photos, property details, and showing information for this estate sale listing.",
    buttonLabel: "View Listing",
    callout: "Interested in a closer look?",
    linkLabel: "Schedule a Visit",
  },
  festive: {
    title: "See the Property",
    subtitle: "Estate Sale Listing",
    description:
      "Explore key specs, photos, pricing, and location details for this estate sale listing.",
    buttonLabel: "See Details",
    callout: "Showing Starts In:",
  },
  modern: {
    title: "Explore This Estate Sale Listing",
    description:
      "Keep photos, specs, pricing, and neighborhood information organized in one modern property page.",
    buttonLabel: "Explore Property",
    label1: "Photos",
    label2: "Property Details",
    label3: "Location",
  },
  elegant: {
    title: "Estate Sale Listing",
    subtitle: "Presented beautifully",
    description:
      "A polished property page designed to highlight the best parts of this estate sale listing.",
    buttonLabel: "View Property",
    label1: "Features",
    label2: "Gallery",
    label3: "Neighborhood",
    label4: "Tour Request",
  },
  business: {
    title: "Promote This Estate Sale Listing Professionally",
    description:
      "Organize listing details, inquiries, and showing requests for this estate sale listing in one page.",
    buttonLabel: "Launch Listing Page",
    label1: "Property Specs",
    label2: "Buyer Interest",
    label3: "Tours",
    contactButtonLabel: "Contact Agent",
  },
  blank: {
    title: "Estate Sale Listing",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Lost & Found Notice")]: {
  template: "Lost & Found Notice",
  showcase: {
    title: "Found: Set of Car Keys",
    subtitle: "Recovered near Riverside Trail",
    description:
      "A black key fob and two silver keys were found Sunday morning near the park entrance.",
    buttonLabel: "View Notice",
    callout: "Is this yours?",
    linkLabel: "Claim Item",
  },
  festive: {
    title: "Lost & Found Notice",
    subtitle: "Recovered Item",
    description:
      "Check the description, pickup instructions, and contact details to claim this item if it belongs to you.",
    buttonLabel: "See Item Details",
    callout: "Notice Expires In:",
  },
  modern: {
    title: "Recovered Item Information",
    description:
      "Share where the item was found, what it looks like, and how the owner can verify and collect it.",
    buttonLabel: "View Details",
    label1: "Item Description",
    label2: "Found Location",
    label3: "Pickup Info",
  },
  elegant: {
    title: "Lost & Found",
    subtitle: "Recovered Near Riverside Trail",
    description:
      "A simple, polished notice page for reconnecting found items with their owners.",
    buttonLabel: "View Notice",
    label1: "Item Details",
    label2: "Verification",
    label3: "Pickup Times",
    label4: "Contact",
  },
  business: {
    title: "Publish a Clear Lost & Found Page",
    description:
      "Keep item descriptions, claim instructions, and contact information organized in one easy notice page.",
    buttonLabel: "Launch Notice Page",
    label1: "Item Summary",
    label2: "Claim Process",
    label3: "Pickup Details",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Lost & Found Notice",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Pet Missing Alert")]: {
  template: "Pet Missing Alert",
  showcase: {
    title: "Missing Dog: Daisy",
    subtitle: "Last seen near Maple Grove Park",
    description:
      "Daisy is a tan 4-year-old beagle mix wearing a pink collar. She slipped out Tuesday evening and may be scared.",
    buttonLabel: "View Alert",
    callout: "Have you seen Daisy?",
    linkLabel: "Send a Sighting",
  },
  festive: {
    title: "Please Help Bring Daisy Home",
    subtitle: "Missing Pet Alert",
    description:
      "Share Daisy's photo, last known location, and contact information so neighbors can help look out for her.",
    buttonLabel: "See Alert Details",
    callout: "Missing Since:",
  },
  modern: {
    title: "Neighborhood Pet Alert",
    description:
      "Keep sightings, description details, and contact information organized in one easy-to-share page.",
    buttonLabel: "Report a Sighting",
    label1: "Pet Details",
    label2: "Last Seen",
    label3: "Reward Info",
  },
  elegant: {
    title: "Help Us Find Daisy",
    subtitle: "Missing Pet",
    description:
      "A gentle, clear alert page designed to make it easy for neighbors to recognize Daisy and share information.",
    buttonLabel: "View Details",
    label1: "Description",
    label2: "Map Area",
    label3: "Updates",
    label4: "Contact",
  },
  business: {
    title: "Publish a Better Missing Pet Alert",
    description:
      "Keep photos, sightings, and contact details together in one page that neighbors can share quickly.",
    buttonLabel: "Launch Alert Page",
    label1: "Pet Summary",
    label2: "Sighting Reports",
    label3: "Contact Info",
    contactButtonLabel: "Contact Owner",
  },
  blank: {
    title: "Pet Missing Alert",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Local Classified Ad")]: {
  template: "Local Classified Ad",
  showcase: {
    title: "Local Classified Ad",
    subtitle: "Invitation & event details",
    description:
      "Join us for local classified ad with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Local Classified Ad",
    description:
      "We put together everything guests need for local classified ad, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Local Classified Ad",
    description:
      "See the timeline, location, and guest information for local classified ad in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Local Classified Ad",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for local classified ad with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Local Classified Ad Organized",
    description:
      "Share invitations, updates, and guest responses for local classified ad in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Local Classified Ad",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Temporary Project")]: {
  template: "Temporary Project",
  showcase: {
    title: "Temporary Project",
    subtitle: "Invitation & event details",
    description:
      "Join us for temporary project with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Temporary Project",
    description:
      "We put together everything guests need for temporary project, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Temporary Project",
    description:
      "See the timeline, location, and guest information for temporary project in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Temporary Project",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for temporary project with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Temporary Project Organized",
    description:
      "Share invitations, updates, and guest responses for temporary project in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Temporary Project",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Focus Group")]: {
  template: "Focus Group",
  showcase: {
    title: "Focus Group",
    subtitle: "Important notice",
    description:
      "Review the essential details, timeline, and next steps related to focus group in one clear page.",
    buttonLabel: "View Notice",
    callout: "Need to take action?",
    linkLabel: "See Full Details",
  },
  festive: {
    title: "Important Update",
    subtitle: "Focus Group",
    description:
      "Keep the message around focus group easy to read and easy to act on with one focused page.",
    buttonLabel: "View Details",
    callout: "Update Ends In:",
  },
  modern: {
    title: "Present Focus Group Clearly",
    description:
      "Organize the facts, timing, and instructions related to focus group in a clean layout.",
    buttonLabel: "Read More",
    label1: "Summary",
    label2: "Timeline",
    label3: "Next Steps",
  },
  elegant: {
    title: "Focus Group",
    subtitle: "Clear and actionable",
    description:
      "A calm, polished page for sharing important information related to focus group.",
    buttonLabel: "View Information",
    label1: "Overview",
    label2: "Timeline",
    label3: "Details",
    label4: "Contact",
  },
  business: {
    title: "Create a Better Focus Group Page",
    description:
      "Keep updates, response instructions, and critical details for focus group organized in one place.",
    buttonLabel: "Launch Notice Page",
    label1: "Overview",
    label2: "Updates",
    label3: "Response Info",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Focus Group",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Obstacle Race")]: {
  template: "Obstacle Race",
  showcase: {
    title: "Obstacle Race",
    subtitle: "Invitation & event details",
    description:
      "Join us for obstacle race with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Obstacle Race",
    description:
      "We put together everything guests need for obstacle race, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Obstacle Race",
    description:
      "See the timeline, location, and guest information for obstacle race in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Obstacle Race",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for obstacle race with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Obstacle Race Organized",
    description:
      "Share invitations, updates, and guest responses for obstacle race in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Obstacle Race",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Memory Timeline")]: {
  template: "Memory Timeline",
  showcase: {
    title: "Memory Timeline",
    subtitle: "Invitation & event details",
    description:
      "Join us for memory timeline with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Memory Timeline",
    description:
      "We put together everything guests need for memory timeline, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Memory Timeline",
    description:
      "See the timeline, location, and guest information for memory timeline in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Memory Timeline",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for memory timeline with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Memory Timeline Organized",
    description:
      "Share invitations, updates, and guest responses for memory timeline in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Memory Timeline",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("After Grad")]: {
  template: "After Grad",
  showcase: {
    title: "After Grad",
    subtitle: "Invitation & event details",
    description:
      "Join us for after grad with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "After Grad",
    description:
      "We put together everything guests need for after grad, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for After Grad",
    description:
      "See the timeline, location, and guest information for after grad in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "After Grad",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for after grad with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep After Grad Organized",
    description:
      "Share invitations, updates, and guest responses for after grad in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "After Grad",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Cancer Journey")]: {
  template: "Cancer Journey",
  showcase: {
    title: "Cancer Journey",
    subtitle: "Invitation & event details",
    description:
      "Join us for cancer journey with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Cancer Journey",
    description:
      "We put together everything guests need for cancer journey, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Cancer Journey",
    description:
      "See the timeline, location, and guest information for cancer journey in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Cancer Journey",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for cancer journey with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Cancer Journey Organized",
    description:
      "Share invitations, updates, and guest responses for cancer journey in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Cancer Journey",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Bible Study")]: {
  template: "Bible Study",
  showcase: {
    title: "Bible Study",
    subtitle: "Community update",
    description:
      "Share the most important details, timing, and next steps related to bible study in one page.",
    buttonLabel: "View Update",
    callout: "Need more information?",
    linkLabel: "Read More",
  },
  festive: {
    title: "Community Update",
    subtitle: "Bible Study",
    description:
      "Keep everyone informed about bible study with clear details, reminders, and updates.",
    buttonLabel: "See Details",
    callout: "Starts In:",
  },
  modern: {
    title: "Publish Bible Study Clearly",
    description:
      "Use one simple page to present announcements, details, and any important community information.",
    buttonLabel: "View Information",
    label1: "Overview",
    label2: "Updates",
    label3: "Resources",
  },
  elegant: {
    title: "Bible Study",
    subtitle: "Clear and thoughtful",
    description:
      "A polished community page designed to make bible study easy to understand and share.",
    buttonLabel: "View Page",
    label1: "Summary",
    label2: "Key Details",
    label3: "Resources",
    label4: "Contact",
  },
  business: {
    title: "Manage Bible Study Better",
    description:
      "Keep updates, schedules, and public information for bible study organized in one place.",
    buttonLabel: "Launch Information Page",
    label1: "Communication",
    label2: "Resources",
    label3: "Updates",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Bible Study",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Chat Room")]: {
  template: "Chat Room",
  showcase: {
    title: "Chat Room",
    subtitle: "Community update",
    description:
      "Share the most important details, timing, and next steps related to chat room in one page.",
    buttonLabel: "View Update",
    callout: "Need more information?",
    linkLabel: "Read More",
  },
  festive: {
    title: "Community Update",
    subtitle: "Chat Room",
    description:
      "Keep everyone informed about chat room with clear details, reminders, and updates.",
    buttonLabel: "See Details",
    callout: "Starts In:",
  },
  modern: {
    title: "Publish Chat Room Clearly",
    description:
      "Use one simple page to present announcements, details, and any important community information.",
    buttonLabel: "View Information",
    label1: "Overview",
    label2: "Updates",
    label3: "Resources",
  },
  elegant: {
    title: "Chat Room",
    subtitle: "Clear and thoughtful",
    description:
      "A polished community page designed to make chat room easy to understand and share.",
    buttonLabel: "View Page",
    label1: "Summary",
    label2: "Key Details",
    label3: "Resources",
    label4: "Contact",
  },
  business: {
    title: "Manage Chat Room Better",
    description:
      "Keep updates, schedules, and public information for chat room organized in one place.",
    buttonLabel: "Launch Information Page",
    label1: "Communication",
    label2: "Resources",
    label3: "Updates",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Chat Room",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Speed Dating")]: {
  template: "Speed Dating",
  showcase: {
    title: "Speed Dating",
    subtitle: "Invitation & event details",
    description:
      "Join us for speed dating with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Speed Dating",
    description:
      "We put together everything guests need for speed dating, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Speed Dating",
    description:
      "See the timeline, location, and guest information for speed dating in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Speed Dating",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for speed dating with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Speed Dating Organized",
    description:
      "Share invitations, updates, and guest responses for speed dating in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Speed Dating",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Weight Loss Journey")]: {
  template: "Weight Loss Journey",
  showcase: {
    title: "Weight Loss Journey",
    subtitle: "Invitation & event details",
    description:
      "Join us for weight loss journey with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
  },
  festive: {
    title: "You're Invited",
    subtitle: "Weight Loss Journey",
    description:
      "We put together everything guests need for weight loss journey, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Weight Loss Journey",
    description:
      "See the timeline, location, and guest information for weight loss journey in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Weight Loss Journey",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for weight loss journey with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Weight Loss Journey Organized",
    description:
      "Share invitations, updates, and guest responses for weight loss journey in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Weight Loss Journey",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Guided Tutorial")]: {
  template: "Guided Tutorial",
  showcase: {
    title: "Guided Tutorial",
    subtitle: "What you'll learn",
    description:
      "Explore what this guided tutorial includes, who it's for, and how to join or get access.",
    buttonLabel: "View Details",
    callout: "Want to join in?",
    linkLabel: "Get Access",
  },
  festive: {
    title: "Learn Something New",
    subtitle: "Guided Tutorial",
    description:
      "Everything participants need for guided tutorial—format, timing, access, and key takeaways.",
    buttonLabel: "Join Now",
    callout: "Begins In:",
  },
  modern: {
    title: "Get Ready for Guided Tutorial",
    description:
      "Present the agenda, benefits, and access details for guided tutorial in one clean page.",
    buttonLabel: "Explore Program",
    label1: "Overview",
    label2: "What You'll Learn",
    label3: "Access",
  },
  elegant: {
    title: "Guided Tutorial",
    subtitle: "Thoughtfully presented",
    description:
      "A polished page that makes guided tutorial feel clear, premium, and easy to join.",
    buttonLabel: "View Program",
    label1: "Curriculum",
    label2: "Format",
    label3: "Benefits",
    label4: "Enrollment",
  },
  business: {
    title: "Organize Guided Tutorial Clearly",
    description:
      "Keep schedule, participant details, and registration information for guided tutorial in one page.",
    buttonLabel: "Launch Learning Page",
    label1: "Program Overview",
    label2: "Registration",
    label3: "Participant Info",
    contactButtonLabel: "Contact Organizer",
  },
  blank: {
    title: "Guided Tutorial",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},

[normalizeTemplateName("Custom Template")]: {
  template: "Custom Template",
  showcase: {
    title: "Custom Template",
    subtitle: "Invitation & event details",
    description:
      "Join us for custom template with the date, time, location, and RSVP details all in one place.",
    buttonLabel: "View Invitation",
    callout: "Will you be there?",
    linkLabel: "RSVP Now",
    
  },
  festive: {
    title: "You're Invited",
    subtitle: "Custom Template",
    description:
      "We put together everything guests need for custom template, including schedule notes, directions, and updates.",
    buttonLabel: "Save My Spot",
    callout: "Event Starts In:",
  },
  modern: {
    title: "Plan for Custom Template",
    description:
      "See the timeline, location, and guest information for custom template in a clean, easy-to-share page.",
    buttonLabel: "View Details",
    label1: "Schedule",
    label2: "Location",
    label3: "RSVP",
  },
  elegant: {
    title: "Custom Template",
    subtitle: "A special gathering",
    description:
      "A polished invitation page for custom template with meaningful details and a beautiful presentation.",
    buttonLabel: "View Event",
    label1: "Date & Time",
    label2: "Venue",
    label3: "Guest Notes",
    label4: "RSVP",
  },
  business: {
    title: "Keep Custom Template Organized",
    description:
      "Share invitations, updates, and guest responses for custom template in one streamlined page.",
    buttonLabel: "Launch Event Page",
    label1: "Guest Updates",
    label2: "Event Details",
    label3: "RSVP Tracking",
    contactButtonLabel: "Contact Host",
  },
  blank: {
    title: "Custom Template",
    subtitle: "Start with a blank page",
    description: "Build your own layout from scratch.",
  },
},
};

export function getTemplateDesignOverlayContent(templateNameOrKey: string) {
  return (
    TEMPLATE_DESIGN_OVERLAY_CONTENT[normalizeTemplateName(templateNameOrKey)] ??
    null
  );
}
[{
	"resource": "/c:/Users/MD/ko-host/lib/templates/createTemplateDraft.ts",
	"owner": "typescript",
	"code": "2339",
	"severity": 8,
	"message": "Property 'subtitle' does not exist on type 'ModernOverlayContent'.",
	"source": "ts",
	"startLineNumber": 43,
	"startColumn": 41,
	"endLineNumber": 43,
	"endColumn": 49,
	"modelVersionId": 4,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/MD/ko-host/lib/templates/createTemplateDraft.ts",
	"owner": "typescript",
	"code": "2339",
	"severity": 8,
	"message": "Property 'subtitle' does not exist on type 'BusinessOverlayContent'.",
	"source": "ts",
	"startLineNumber": 59,
	"startColumn": 43,
	"endLineNumber": 59,
	"endColumn": 51,
	"modelVersionId": 4,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/MD/ko-host/lib/templates/templateDesignOverlayContent.ts",
	"owner": "typescript",
	"code": "1184",
	"severity": 8,
	"message": "Modifiers cannot appear here.",
	"source": "ts",
	"startLineNumber": 7941,
	"startColumn": 3,
	"endLineNumber": 7941,
	"endColumn": 9,
	"modelVersionId": 4,
	"origin": "extHost1"
},{
	"resource": "/c:/Users/MD/ko-host/lib/templates/templateDesignOverlayContent.ts",
	"owner": "typescript",
	"code": "1184",
	"severity": 8,
	"message": "Modifiers cannot appear here.",
	"source": "ts",
	"startLineNumber": 7945,
	"startColumn": 3,
	"endLineNumber": 7945,
	"endColumn": 9,
	"modelVersionId": 4,
	"origin": "extHost1"
}]

export function getTemplatePresetOverlayContent(
  templateNameOrKey: string,
  designKey: string,
) {
  const entry = getTemplateDesignOverlayContent(templateNameOrKey);
  if (!entry) return null;

  switch (designKey) {
    case "minimal":
    case "showcase":
      return entry.showcase;

    case "gallery":
    case "festive":
      return entry.festive;

    case "classic":
    case "business":
      return entry.business;

    case "modern":
      return entry.modern;

    case "elegant":
      return entry.elegant;

    case "blank":
      return entry.blank ?? null;

    default:
      return null;
  }
}