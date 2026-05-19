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
  const keywords =
    Array.isArray(payload.keywords) && payload.keywords.length > 0
      ? payload.keywords.join(", ")
      : "";

  const detailLine = details
    ? details
    : keywords
      ? `Featuring ${keywords}.`
      : "";

  const lengthNote =
    length === "Very Short"
      ? "Keep it quick:"
      : length === "Long"
        ? "Here’s the full message:"
        : "";

  return [
    {
      id: "option-1",
      title: `${tone} ${contentType}`,
      text:
        length === "Very Short"
          ? `${subject} is serving flavor.`
          : `${lengthNote} Welcome to ${subject}, where ${audience} can enjoy ${detailLine || "fresh flavor, good energy, and a reason to come hungry."}`.trim(),
    },
    {
      id: "option-2",
      title: "More Playful",
      text:
        length === "Very Short"
          ? `Big flavor. ${subject}.`
          : `Pull up hungry. ${subject} is bringing the kind of hometown flavor that makes ${audience} come back for seconds. ${detailLine}`.trim(),
    },
    {
      id: "option-3",
      title: "Bolder",
      text:
        length === "Very Short"
          ? `Cravings, meet ${subject}.`
          : `${subject} is not here to whisper. It is here with bold bites, feel-good favorites, and a menu made for ${audience}. ${detailLine}`.trim(),
    },
    {
      id: "option-4",
      title: "Warm Welcome",
      text:
        length === "Very Short"
          ? `Welcome to ${subject}.`
          : `Welcome to ${subject}, a place built for comfort food, familiar favorites, and an easygoing good time for ${audience}. ${detailLine}`.trim(),
    },
    {
      id: "option-5",
      title: "Creative",
      text:
        length === "Very Short"
          ? `${subject}: hometown flavor, hot and ready.`
          : `At ${subject}, the grill is hot, the shakes are cold, and the hometown flavor speaks for itself. Bring your appetite, bring your people, and settle in for something satisfying. ${detailLine}`.trim(),
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
Details: ${payload.details || "not provided"}
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
- If Subject is provided, every option must clearly reference or be directly about that subject
- If Details are provided, every option must include at least 2 concrete details from the Details field when possible
- Do not ignore dates, times, locations, prices, offers, names, or event-specific facts from Details
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