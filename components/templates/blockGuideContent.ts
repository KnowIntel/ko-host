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
      "Complete owner, host, and contestant guide for running a live social elimination game.",
    sections: [
      {
        title: "Overview",
        body:
          "Pop the Balloon is a live social elimination game where one featured contestant is presented to a lineup of participants. Contestants stay in by keeping their balloon or opt out by popping it. The host controls the flow, moderation, and final match selection.",
      },
      {
        title: "Objective",
        bullets: [
          "Create a fast, fun, social elimination experience.",
          "Encourage live interaction without requiring video or heavy infrastructure.",
          "Give event owners a lightweight way to host dating, networking, or social games.",
          "Make the experience feel like a live show while staying easy for guests to join.",
        ],
      },
      {
        title: "Host / Owner Need-to-Know",
        bullets: [
          "Enter host mode using the Host Passcode set in the inspector.",
          "Choose one featured contestant from the lineup.",
          "Start, end, or reset the round.",
          "Remove players when needed.",
          "Select the final match when the round is complete.",
          "Moderate the experience and keep the game moving.",
        ],
      },
      {
        title: "Contestant Need-to-Know",
        bullets: [
          "Join the lineup from the public microsite.",
          "Wait for the host to start the round.",
          "Keep your balloon if you are still interested.",
          "Pop your balloon if you want to opt out.",
          "The featured contestant does not pop a balloon.",
          "Leave the lineup if you no longer want to participate.",
        ],
      },
      {
        title: "Full Game Cycle",
        bullets: [
          "Users join the lineup.",
          "The host selects a featured contestant.",
          "The host starts the round.",
          "Lineup contestants keep or pop their balloons.",
          "The host selects a match or ends the round.",
          "The host resets the game.",
          "The process repeats with a new featured contestant.",
        ],
      },
      {
        title: "Current MVP Limitations",
        bullets: [
          "The host passcode is currently frontend-based.",
          "Advanced anti-spam protection is not fully implemented yet.",
          "Chat moderation is not included yet.",
          "Identity verification is not included yet.",
          "The current version is focused on lightweight live gameplay.",
        ],
      },
      {
        title: "Future Expansion Ideas",
        bullets: [
          "Audience voting.",
          "Profile photos.",
          "Live chat.",
          "Round timers.",
          "Private messaging after a match.",
          "Game analytics for owners.",
          "Stronger moderation and safety tools.",
        ],
      },
    ],
  },
};