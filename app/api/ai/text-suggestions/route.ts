// app\api\ai\text-suggestions\route.ts

import OpenAI from "openai";

export const runtime = "nodejs";

type SmartContentOption = {
  id: string;
  title: string;
  text: string;
};

type RequestPayload = {
  templateKey?: string;
  designKey?: string;
  targetLabel?: string;
  currentText?: string;

  blockType?: string;
  fieldKey?: string;
  existingText?: string;
  contentType?: string;
  subject?: string;
  details?: string;
  tone?: string;
  audience?: string;
  keywords?: string[];
  length?: string;
  creativity?: number;
  matchPageStyle?: boolean;
  currentTheme?: string;
  currentDesign?: string;
  surroundingContent?: string;
};

function buildFallbackOptions(payload: RequestPayload): SmartContentOption[] {
  const subject = payload.subject?.trim() || payload.targetLabel || "your update";
  const details = payload.details?.trim();
  const tone = payload.tone || "Friendly";
  const length = payload.length || "Short";
  const audience = payload.audience?.trim() || "your audience";
  const contentType = payload.contentType || "Description";

  const context = details
    ? `${subject}: ${details}`
    : `${subject}`;

  if (length === "Very Short") {
    return [
      { id: "option-1", title: `${tone} ${contentType}`, text: subject },
      { id: "option-2", title: "Simple", text: `Introducing ${subject}` },
      { id: "option-3", title: "Clear", text: `Explore ${subject}` },
      { id: "option-4", title: "Direct", text: `Discover ${subject}` },
      { id: "option-5", title: "Polished", text: `${subject}, made simple.` },
    ];
  }

  return [
    {
      id: "option-1",
      title: `${tone} ${contentType}`,
      text: details
        ? `Introducing ${subject}. ${details}`
        : `Introducing ${subject}, thoughtfully presented for ${audience}.`,
    },
    {
      id: "option-2",
      title: "Clear",
      text: details
        ? `${subject} includes the key details you need: ${details}`
        : `${subject} gives ${audience} a clear and helpful way to learn more.`,
    },
    {
      id: "option-3",
      title: "Polished",
      text: details
        ? `${context}. Designed to help ${audience} understand what matters most.`
        : `${subject} is designed to be clear, helpful, and easy for ${audience} to understand.`,
    },
    {
      id: "option-4",
      title: "Warm",
      text: details
        ? `Here’s what to know about ${subject}: ${details}`
        : `Welcome to ${subject}. Everything is organized to help ${audience} get the details quickly.`,
    },
    {
      id: "option-5",
      title: "Direct",
      text: details
        ? `${subject} — ${details}`
        : `Learn more about ${subject}.`,
    },
  ];
}

function normalizeOptions(options: SmartContentOption[]) {
  return options
    .filter((option) => option && typeof option.text === "string")
    .slice(0, 5)
    .map((option, index) => ({
      id: option.id || `option-${index + 1}`,
      title: option.title || `Option ${index + 1}`,
      text: option.text.trim(),
    }));
}

function buildPrompt(payload: RequestPayload) {
  const existingText = payload.existingText ?? payload.currentText ?? "";
  const fieldLabel = payload.targetLabel || payload.fieldKey || "text block";

  return `
You are the Smart Content Assistant for Ko-Host, a hosted microsite builder.

Create polished, production-ready microsite copy using the user's guidance.

Context:
Template: ${payload.templateKey || "unknown"}
Design: ${payload.designKey || payload.currentDesign || "unknown"}
Block type: ${payload.blockType || "unknown"}
Field: ${fieldLabel}
Content type: ${payload.contentType || "General microsite copy"}
Existing text: ${existingText || "none"}
Subject: ${payload.subject || "not provided"}
Raw user notes/details: ${payload.details || "not provided"}
Tone: ${payload.tone || "Friendly"}
Length: ${payload.length || "Short"} 
Length guidance:
- Very Short = 3 to 8 words
- Short = 1 short sentence
- Medium = 2 to 3 sentences
- Long = 1 short paragraph

Audience: ${payload.audience || "General audience"}
Keywords: ${
    Array.isArray(payload.keywords) && payload.keywords.length > 0
      ? payload.keywords.join(", ")
      : "none"
  }
Creativity level: ${
    typeof payload.creativity === "number" ? payload.creativity : 50
  } out of 100
Match page style: ${payload.matchPageStyle ? "yes" : "no"}
Current theme: ${payload.currentTheme || "unknown"}
Surrounding page content: ${payload.surroundingContent || "none"}

Return exactly 5 options as valid JSON only.

Required JSON shape:
{
  "options": [
    {
      "id": "option-1",
      "title": "Short label",
      "text": "Generated copy"
    }
  ]
}

Rules:
- Return JSON only
- No markdown
- No explanations
- No numbering inside the text
- Every option must strongly reflect the selected Tone: ${payload.tone || "Friendly"}
- Every option must follow the selected Length: ${payload.length || "Short"}
- Every option must be written for this Audience: ${payload.audience || "General audience"}
- Every option must match this Content Type: ${payload.contentType || "General microsite copy"}
- Make every option meaningfully different
- Keep copy appropriate for the requested length
- Avoid generic filler
- The output should feel like it was written by a skilled marketer, host, or brand copywriter, not like a form response
- Treat Raw user notes/details as rough input, not final wording
- Rewrite, remix, polish, and transform the user's notes into natural finished copy
- Do not simply repeat the user's notes line-by-line
- If the user provides keywords, fragments, bullets, or incomplete phrases, convert them into smooth sentences
- Preserve important facts, but improve wording, rhythm, punctuation, and flow
- If Subject is provided, every option must clearly reference or be directly about that subject
- If Raw user notes/details are provided, every option should use the meaning of those notes without copying the exact rough format
- Do not ignore dates, times, locations, prices, offers, names, or event-specific facts from the notes
- If details are limited, improve the existing text instead of inventing specific facts
- Avoid vague phrases like "something special", "unforgettable experience", or "moment worth sharing" unless the user specifically asks for vague teaser copy
- Titles should be short, like "Elegant Welcome" or "Bold Promotion"
`;
}

export async function POST(req: Request) {
  let body: RequestPayload = {};

  try {
    body = (await req.json()) as RequestPayload;

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
        options: buildFallbackOptions(body),
        suggestions: buildFallbackOptions(body).map((option) => option.text),
        },
        { status: 200 },
      );
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

const response = await client.responses.create({
  model: "gpt-5-mini",
  input: buildPrompt(body),
  text: {
    format: {
      type: "json_object",
    },
  },
});

    const raw = response.output_text?.trim() || "";
    const parsed = JSON.parse(raw) as {
      options?: SmartContentOption[];
      suggestions?: string[];
    };

    const options = Array.isArray(parsed.options)
      ? normalizeOptions(parsed.options)
      : Array.isArray(parsed.suggestions)
        ? parsed.suggestions.slice(0, 5).map((text, index) => ({
            id: `option-${index + 1}`,
            title: `Option ${index + 1}`,
            text,
          }))
        : [];

    return Response.json(
      {
        options,
        suggestions: options.map((option) => option.text),
      },
      { status: 200 },
    );
  } catch {
    return Response.json(
{
  options: buildFallbackOptions(body),
  suggestions: buildFallbackOptions(body).map(
    (option: SmartContentOption) => option.text,
  ),
},
      { status: 200 },
    );
  }
}