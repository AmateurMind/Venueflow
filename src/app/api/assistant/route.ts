import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const MAX_MESSAGE_LENGTH = 1000;

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
${JSON.stringify(context)}

User question: ${sanitizedMessage}`;

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();

    return NextResponse.json({ response: responseText });
  } catch {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
