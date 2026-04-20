/**
 * @jest-environment node
 *
 * API Route Tests — test handler logic directly using Node.js native fetch API
 */

// ---- Assistant Route ----
describe("POST /api/assistant", () => {
  const makeRequest = (body: Record<string, unknown>) =>
    new Request("http://localhost/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  it("returns 400 when message is missing", async () => {
    const { POST } = await import("@/app/api/assistant/route");
    const req = makeRequest({ apiKey: "", context: {} });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/message is required/i);
  });

  it("returns 400 when message is empty string", async () => {
    const { POST } = await import("@/app/api/assistant/route");
    const req = makeRequest({ message: "   ", apiKey: "", context: {} });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/cannot be empty/i);
  });

  it("returns 400 when message exceeds 1000 characters", async () => {
    const { POST } = await import("@/app/api/assistant/route");
    const req = makeRequest({ message: "a".repeat(1001), apiKey: "", context: {} });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/exceeds/i);
  });

  it("returns demo response when no apiKey provided", async () => {
    const { POST } = await import("@/app/api/assistant/route");
    const req = makeRequest({ message: "Tell me something", apiKey: "", context: {} });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.response).toContain("[Demo Mode]");
  });

  it("demo response handles exit keyword", async () => {
    const { POST } = await import("@/app/api/assistant/route");
    const req = makeRequest({ message: "How do I exit the stadium?", apiKey: "", context: {} });
    const res = await POST(req);
    const json = await res.json();
    expect(json.response).toContain("Gate 4");
  });

  it("demo response handles wait keyword", async () => {
    const { POST } = await import("@/app/api/assistant/route");
    const req = makeRequest({ message: "What is the wait time?", apiKey: "", context: {} });
    const res = await POST(req);
    const json = await res.json();
    expect(json.response).toContain("East Concourse");
  });
});

// ---- Football Route ----
describe("GET /api/football", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns 503 when API_FOOTBALL_KEY is not set", async () => {
    delete process.env.API_FOOTBALL_KEY;
    const { GET } = await import("@/app/api/football/route");
    const res = await GET();
    expect(res.status).toBe(503);
  });
});
