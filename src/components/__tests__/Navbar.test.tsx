import { render, screen } from "@testing-library/react";
import { Navbar } from "@/components/Navbar";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

// Mock next/link — must spread rest props so aria-* attributes pass through
jest.mock("next/link", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MockLink = ({ children, href, ...rest }: any) => (
    <a href={href} {...rest}>{children}</a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

describe("Navbar", () => {
  it("renders the brand Venue text", () => {
    render(<Navbar />);
    // "VenueFlow" is split into two spans; check for at least 'Venue'
    expect(screen.getAllByText(/venue/i).length).toBeGreaterThan(0);
  });

  it("renders all four navigation links", () => {
    render(<Navbar />);
    expect(screen.getAllByText("Dashboard").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Live Map").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Facilities").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Emergency").length).toBeGreaterThan(0);
  });

  it("has a nav element with accessible label", () => {
    render(<Navbar />);
    expect(screen.getByRole("navigation", { name: /main navigation/i })).toBeInTheDocument();
  });

  it("marks the current page link with aria-current attribute", () => {
    render(<Navbar />);
    // The active link(s) have aria-current="page"
    const currentLinks = document.querySelectorAll('[aria-current="page"]');
    expect(currentLinks.length).toBeGreaterThan(0);
  });

  it("has a skip to main content link", () => {
    render(<Navbar />);
    const skipLink = screen.getByText("Skip to main content");
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  it("logo link points to the home route", () => {
    render(<Navbar />);
    // Logo link has aria-label="VenueFlow home"
    const logoLink = screen.getByRole("link", { name: /VenueFlow home/i });
    expect(logoLink).toHaveAttribute("href", "/");
  });
});
