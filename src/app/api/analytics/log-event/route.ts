import { NextResponse } from "next/server";
import { logVenueEvent } from "@/lib/bigquery";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event_type, page, density, wait_time, gate_status, metadata } = body;

    if (!event_type || typeof event_type !== "string") {
      return NextResponse.json(
        { error: "event_type is required" },
        { status: 400 }
      );
    }

    await logVenueEvent({ event_type, page, density, wait_time, gate_status, metadata });

    return NextResponse.json({ logged: true });
  } catch {
    return NextResponse.json({ error: "Failed to log event" }, { status: 500 });
  }
}
