import OpenAI from "openai";

export const runtime = "nodejs";

type RequestPayload = {
  templateKey?: string;
  designKey?: string;
  targetLabel?: string;
  currentText?: string;
};

function buildPrompt(payload: RequestPayload) {
  return `
You are writing concise microsite copy suggestions for Ko-Host.

Template: ${payload.templateKey || "unknown"}
Design: ${payload.designKey || "unknown"}
Field: ${payload.targetLabel || "text block"}
Current text: ${payload.currentText || ""}

Return exactly 5 strong alternative suggestions as a JSON object:
{ "suggestions": ["...", "...", "...", "...", "..."] }

Rules:
- keep each suggestion short and production-ready
- no markdown
- no numbering
- no explanations
- focus on polished real microsite wording
`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestPayload;

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          suggestions: [
            "Welcome to our event",
            "Celebrate with us",
            "Join us for something special",
            "A moment worth sharing",
            "Be part of the celebration",
          ],
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
    const parsed = JSON.parse(raw) as { suggestions?: string[] };

    return Response.json(
      {
        suggestions: Array.isArray(parsed.suggestions)
          ? parsed.suggestions.slice(0, 5)
          : [],
      },
      { status: 200 },
    );
  } catch {
    return Response.json(
      {
        suggestions: [
          "Welcome to our event",
          "Celebrate with us",
          "Join us for something special",
          "A moment worth sharing",
          "Be part of the celebration",
        ],
      },
      { status: 200 },
    );
  }
}