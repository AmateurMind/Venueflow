import type { Metadata } from "next";
import { Instrument_Serif, Barlow, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

export const metadata: Metadata = {
  title: "VenueFlow | Smart Stadium Companion",
  description: "Improving event experiences through real-time crowd movement and coordination.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("antialiased", instrumentSerif.variable, barlow.variable, "font-sans", geist.variable)}>
      <body className="font-body bg-background text-foreground min-h-screen">
        {children}
      </body>
    </html>
  );
}
