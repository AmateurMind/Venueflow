import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "@/app/page";

// Mock react-markdown (ESM-only — not compatible with Jest's CJS transform)
jest.mock("react-markdown", () => {
  const ReactMarkdown = ({ children }: { children: string }) => <span>{children}</span>;
  ReactMarkdown.displayName = "ReactMarkdown";
  return ReactMarkdown;
});

// Mock Firebase to avoid real network/analytics calls in tests
jest.mock("@/lib/firebase", () => ({
  logAnalyticsEvent: jest.fn().mockResolvedValue(undefined),
  db: {},
  isFirebaseConfigured: true,
}));

// Mock next/image
jest.mock("next/image", () => {
  const MockImage = ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  );
  MockImage.displayName = "MockImage";
  return MockImage;
});

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

// Mock next/link
jest.mock("next/link", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MockLink = ({ children, href, ...rest }: any) => (
    <a href={href} {...rest}>{children}</a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

// Mock fetch
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ error: "No matches" }),
});

// Mock framer-motion to avoid animation issues in tests
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("Home page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ error: "No matches" }),
    });
  });

  it("renders without crashing", () => {
    render(<Home />);
    expect(document.body).toBeInTheDocument();
  });

  it("shows the live metrics section heading", () => {
    render(<Home />);
    expect(screen.getByText("Gate Movement")).toBeInTheDocument();
    expect(screen.getByText("Avg. Wait Time")).toBeInTheDocument();
    expect(screen.getByText("Crowd Density")).toBeInTheDocument();
  });

  it("shows the Venue Assistant header", () => {
    render(<Home />);
    expect(screen.getByText("Venue Assistant")).toBeInTheDocument();
  });

  it("shows the initial bot greeting message", () => {
    render(<Home />);
    expect(screen.getByText(/Hello! I'm your digital concierge/i)).toBeInTheDocument();
  });

  it("shows the chat input field", () => {
    render(<Home />);
    const input = screen.getByRole("textbox", { name: /ask the venue assistant/i });
    expect(input).toBeInTheDocument();
  });

  it("shows the send button", () => {
    render(<Home />);
    const sendBtn = screen.getByRole("button", { name: /send message/i });
    expect(sendBtn).toBeInTheDocument();
  });

  it("send button is disabled when input is empty", () => {
    render(<Home />);
    const sendBtn = screen.getByRole("button", { name: /send message/i });
    expect(sendBtn).toBeDisabled();
  });

  it("typing in input updates the field value", () => {
    render(<Home />);
    const input = screen.getByRole("textbox", { name: /ask the venue assistant/i });
    fireEvent.change(input, { target: { value: "Where is gate 4?" } });
    expect(input).toHaveValue("Where is gate 4?");
  });

  it("send button becomes enabled after typing", () => {
    render(<Home />);
    const input = screen.getByRole("textbox", { name: /ask the venue assistant/i });
    const sendBtn = screen.getByRole("button", { name: /send message/i });
    fireEvent.change(input, { target: { value: "Hello" } });
    expect(sendBtn).not.toBeDisabled();
  });

  it("sending a message calls the fetch API", async () => {
    // football call (on mount) returns no match
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ error: "No matches" }) })
      // assistant call returns response
      .mockResolvedValueOnce({ ok: true, json: async () => ({ response: "Here is what I found." }) });

    render(<Home />);
    const input = screen.getByRole("textbox", { name: /ask the venue assistant/i });
    fireEvent.change(input, { target: { value: "Where is the exit?" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/assistant",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("shows new user message in chat after sending", async () => {
    // football call (on mount) returns no match
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ error: "No matches" }) })
      // assistant call returns response
      .mockResolvedValueOnce({ ok: true, json: async () => ({ response: "Go to Gate 4." }) });

    render(<Home />);
    const input = screen.getByRole("textbox", { name: /ask the venue assistant/i });
    fireEvent.change(input, { target: { value: "Where is the exit?" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Where is the exit?")).toBeInTheDocument();
    });
  });

  it("shows live badge indicating LIVE FROM METRODOME ARENA", () => {
    render(<Home />);
    expect(screen.getByText("LIVE FROM METRODOME ARENA")).toBeInTheDocument();
  });

  it("shows Venue Live View section", () => {
    render(<Home />);
    expect(screen.getByText("Venue Live View")).toBeInTheDocument();
  });
});
