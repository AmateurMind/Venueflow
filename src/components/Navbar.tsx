"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navigation, Map, Utensils, ShieldAlert, Home } from "lucide-react";

const navLinks = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/map", label: "Live Map", icon: Map },
  { href: "/facilities", label: "Facilities", icon: Utensils },
  { href: "/emergency", label: "Emergency", icon: ShieldAlert },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-background/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-primary to-emerald-400 rounded-xl flex items-center justify-center glow-primary">
            <Navigation className="text-primary-foreground w-5 h-5 -rotate-45" />
          </div>
          <span className="text-xl md:text-2xl font-heading tracking-tighter">
            Venue<span className="text-primary italic">Flow</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-2 text-sm font-medium">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                pathname === href
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>
        {/* Mobile nav */}
        <div className="flex md:hidden items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                pathname === href
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
