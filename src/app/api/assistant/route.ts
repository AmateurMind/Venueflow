import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const MAX_MESSAGE_LENGTH = 1000;

/**
 * Extracts named entities from the message using the Cloud Natural Language API.
 * Returns a comma-separated list of entity names, or an empty string if unavailable.
 */
async function extractEntities(text: string): Promise<string> {
  const apiKey = process.env.GOOGLE_CLOUD_API_KEY || process.env.GOOGLE_AI_STUDIO_API_KEY;
  if (!apiKey) return "";

  try {
    const res = await fetch(
      `https://language.googleapis.com/v1/documents:analyzeEntities?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document: { type: "PLAIN_TEXT", content: text },
          encodingType: "UTF8",
        }),
      }
    );

    if (!res.ok) return "";

    const data = await res.json();
    const names: string[] = (data.entities ?? [])
      .slice(0, 5)
      .map((e: { name: string }) => e.name);

    return names.length > 0 ? names.join(", ") : "";
  } catch {
    return "";
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, context, apiKey } = body;

    // Input validation
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid request: message is required" }, { status: 400 });
    }
    if (message.trim().length === 0) {
      return NextResponse.json({ error: "Invalid request: message cannot be empty" }, { status: 400 });
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Invalid request: message exceeds ${MAX_MESSAGE_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Sanitize: strip any characters that could break prompt injection patterns
    const sanitizedMessage = message.replace(/[<>]/g, "").trim();

    // Cloud Natural Language API — extract entities to enrich the Gemini prompt
    const entities = await extractEntities(sanitizedMessage);
    const entityContext = entities
      ? `\nDetected topics in user query (via Cloud Natural Language API): ${entities}.`
      : "";

    if (!apiKey) {
      // Fallback to "Demo" mode if no API key is provided
      let responseText = "**[Demo Mode]** As your Venue Assistant, I recommend ";
      if (sanitizedMessage.toLowerCase().includes("wait") || sanitizedMessage.toLowerCase().includes("line")) {
        responseText += "checking the <u>East Concourse</u> food stalls. They currently have <i>minimal wait times</i> compared to the concessions near Section 202.";
      } else if (sanitizedMessage.toLowerCase().includes("exit")) {
        responseText += "using **Gate 4**. My sensors indicate it's 20% less crowded than the main exit right now.";
      } else {
        responseText += "keeping an eye on the <i>Live Map</i> for updates on crowd density near your seat.";
      }
      return NextResponse.json({ response: responseText });
    }

    // Real Gemini Interaction
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `You are "Venue Assistant", a highly intelligent digital concierge for Metrodome Arena. 
You answer questions for an attendee based on live venue sensor data. Keep your responses concise, helpful, and use markdown (like *italics*, **bold**, or <u>underline</u>). 
Here is the current live context of the venue and the user:
${JSON.stringify(context)}${entityContext}

User question: ${sanitizedMessage}`;

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();

    return NextResponse.json({ response: responseText });
  } catch {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
