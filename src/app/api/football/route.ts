import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const date = new Date().toISOString().split("T")[0];
    const url = `https://v3.football.api-sports.io/fixtures?date=${date}&timezone=Europe/London`;

    const response = await fetch(url, {
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "v3.football.api-sports.io",
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch match data" }, { status: 502 });
    }

    const data = await response.json();
    const fixtures = data.response || [];

    const liveMatch = fixtures.find((f: any) =>
      ["1H", "2H", "HT", "LIVE"].includes(f.fixture.status.short)
    );
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
          goals: match.goals.home ?? 0,
        },
        away: {
          name: match.teams.away.name,
          logo: match.teams.away.logo,
          goals: match.goals.away ?? 0,
        },
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch match data" }, { status: 500 });
  }
}
