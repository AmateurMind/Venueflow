import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { message, context, apiKey } = await req.json();

    if (!apiKey) {
      // Fallback to "Demo" mode if no API key is provided
      let responseText = "**[Demo Mode]** As your Venue Assistant, I recommend ";
      if (message.toLowerCase().includes("wait") || message.toLowerCase().includes("line")) {
        responseText += "checking the <u>East Concourse</u> food stalls. They currently have <i>minimal wait times</i> compared to the concessions near Section 202.";
      } else if (message.toLowerCase().includes("exit")) {
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

User question: ${message}`;

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();

    return NextResponse.json({ response: responseText });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to process request with Gemini: " + error.message }, { status: 500 });
  }
}
