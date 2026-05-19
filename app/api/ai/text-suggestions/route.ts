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

  const base = details
    ? `${subject}: ${details}`
    : `Share the latest details about ${subject}.`;

  return [
    {
      id: "option-1",
      title: "Direct",
      text: base,
    },
    {
      id: "option-2",
      title: "Friendly",
      text: `You're invited to learn more about ${subject}. ${details || ""}`.trim(),
    },
    {
      id: "option-3",
      title: "Polished",
      text: `${subject} is ready to share. ${details || "Add the key details your audience needs to know."}`.trim(),
    },
    {
      id: "option-4",
      title: "Bold",
      text: `Don't miss ${subject}. ${details || ""}`.trim(),
    },
    {
      id: "option-5",
      title: "Simple",
      text: `${subject}${details ? ` — ${details}` : ""}`,
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