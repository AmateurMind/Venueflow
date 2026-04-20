import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 400 });
    }

    // Try to get a live match or fall back to any match happening today
    const date = new Date().toISOString().split("T")[0];
    const url = `https://v3.football.api-sports.io/fixtures?date=${date}&timezone=Europe/London`;

    const response = await fetch(url, {
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "v3.football.api-sports.io",
      },
      next: { revalidate: 60 } // Cache for 1 minute
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Sort to find a match that is either live (short is '1H', '2H', 'HT') or scheduled soon
    const fixtures = data.response || [];
    
    const liveMatch = fixtures.find((f: any) => ["1H", "2H", "HT", "LIVE"].includes(f.fixture.status.short));
    const upcomingMatch = fixtures.find((f: any) => f.fixture.status.short === "NS");
    
    const match = liveMatch || upcomingMatch || fixtures[0];

    if (!match) {
      return NextResponse.json({ error: "No matches found today." }, { status: 404 });
    }

    return NextResponse.json({
      league: match.league.name,
      status: match.fixture.status.long,
      time: match.fixture.status.elapsed,
      teams: {
        home: {
          name: match.teams.home.name,
          logo: match.teams.home.logo,
          goals: match.goals.home ?? 0
        },
        away: {
          name: match.teams.away.name,
          logo: match.teams.away.logo,
          goals: match.goals.away ?? 0
        }
      }
    });
  } catch (error: any) {
    console.error("Football API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch match" }, { status: 500 });
  }
}
