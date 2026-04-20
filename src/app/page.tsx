"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Users, 
  Clock, 
  MapPin, 
  ShieldAlert, 
  ChevronRight, 
  Search,
  MessageSquare,
  Navigation
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen">
      {/* Hero Background */}
      <div className="fixed inset-0 z-[-1]">
        <Image
          src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2600&auto=format&fit=crop"
          alt="Stadium background"
          fill
          className="object-cover opacity-30 blur-[2px]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Navigation className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-heading tracking-tighter">Venue<span className="text-primary italicized">Flow</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#" className="hover:text-primary transition-colors underlined decoration-primary/20">Live Map</a>
            <a href="#" className="hover:text-primary transition-colors">Facilities</a>
            <a href="#" className="hover:text-primary transition-colors">Emergency</a>
            <Button variant="secondary" className="rounded-full px-6">Your Seat: <span className="ml-1 font-bold">B204</span></Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12 space-y-12">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 max-w-2xl"
        >
          <Badge variant="outline" className="text-secondary border-secondary/30 px-4 py-1">
            Live from <u>Metrodome Arena</u>
          </Badge>
          <h1 className="text-5xl md:text-7xl font-heading leading-[0.9]">
            Navigate the <span className="italicized text-secondary">Intensity</span>.
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg">
            Real-time insights for the modern spectator. Move <span className="italicized text-primary">smarter</span>, wait <span className="italicized text-primary">less</span>, and never miss a goal.
          </p>
        </motion.div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard 
            icon={<Users className="w-5 h-5" />}
            title="Gate Movement"
            value="Fast"
            description="Gate 4 and 7 are clears currently."
            trend="Normal"
          />
          <MetricCard 
            icon={<Clock className="w-5 h-5" />}
            title="Avg. Concession Wait"
            value="8 Mins"
            description="Wait times are 15% lower than expected."
            trend="Decreasing"
            highlight
          />
          <MetricCard 
            icon={<MapPin className="w-5 h-5" />}
            title="Crowd Density"
            value="64%"
            description="High density near the South Exits."
            trend="Increasing"
          />
        </div>

        {/* Interactive Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Map/Dashboard Area */}
          <Card className="lg:col-span-8 bg-card/40 backdrop-blur-sm border-border/40 overflow-hidden shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-heading underlined decoration-accent/30">Venue <i>Live</i> View</CardTitle>
                <CardDescription>Visualizing real-time movement data</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="rounded-full">Heatmap</Button>
                <Button size="sm" variant="outline" className="rounded-full">Facilities</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 border-t border-border/40">
              <div className="aspect-video relative bg-muted/20 flex items-center justify-center group cursor-crosshair">
                 <Image 
                    src="https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=2638&auto=format&fit=crop"
                    alt="Stadium blueprint" 
                    fill 
                    className="object-cover opacity-50 contrast-125 saturate-50 group-hover:scale-105 transition-transform duration-700"
                 />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }} 
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-4 h-4 bg-primary rounded-full shadow-[0_0_20px_var(--primary)]" 
                    />
                    <Badge className="ml-4 bg-primary/20 text-primary border-primary/40 backdrop-blur-md">You are here</Badge>
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Assistant Sidebar */}
          <Card className="lg:col-span-4 bg-background/80 backdrop-blur-lg border-border/40 flex flex-col shadow-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="font-heading italicized">Venue Assistant</CardTitle>
                  <CardDescription>Powered by Gemini AI</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between overflow-hidden">
               <ScrollArea className="h-[280px] pr-4 mb-4">
                  <div className="space-y-4">
                    <ChatBubble 
                       type="bot" 
                       message="Hello! I'm your digital concierge. How can I assist your stadium experience today?" 
                    />
                    <ChatBubble 
                       type="user" 
                       message="Where's the nearest water station with no line?" 
                    />
                    <ChatBubble 
                       type="bot" 
                       message="Based on current density, the station at Section 214 has zero wait time. It's a 3-minute walk from row B204." 
                    />
                  </div>
               </ScrollArea>
               <div className="flex gap-2 mt-auto">
                 <Input 
                   placeholder="Ask about queues, exits..." 
                   className="bg-muted/10 border-border/40 rounded-full h-11" 
                 />
                 <Button size="icon" className="rounded-full bg-accent hover:bg-accent/80 shrink-0">
                    <ChevronRight className="w-5 h-5" />
                 </Button>
               </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="mt-20 border-t border-border/40 py-12 bg-muted/5">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Navigation className="text-primary w-6 h-6" />
            <span className="text-xl font-heading italicized underline decoration-primary/20">VenueFlow.</span>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground font-medium">
            <a href="#" className="hover:text-foreground">Accessibility</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Support</a>
          </div>
          <p className="text-xs text-muted-foreground/60">
            &copy; 2026 VenueFlow Intelligence. Built for Prompt Wars.
          </p>
        </div>
      </footer>
    </div>
  );
}

function MetricCard({ icon, title, value, description, trend, highlight = false }: any) {
  return (
    <Card className={`border-border/40 overflow-hidden group transition-all hover:bg-muted/10 ${highlight ? 'bg-secondary/10 border-secondary/20 shadow-lg shadow-secondary/5' : 'bg-card/40 backdrop-blur-sm'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${highlight ? 'bg-secondary text-secondary-foreground' : 'bg-muted/20 text-muted-foreground'}`}>
            {icon}
          </div>
          <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-widest ${trend === 'Decreasing' ? 'text-primary border-primary/20' : 'text-accent border-accent/20'}`}>
            {trend}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-heading tracking-tight italicized">{value}</p>
          <p className="text-xs text-muted-foreground/80 leading-relaxed">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ChatBubble({ type, message }: { type: 'user' | 'bot', message: string }) {
  return (
    <div className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
        type === 'user' 
          ? 'bg-primary text-white rounded-tr-none' 
          : 'bg-muted/20 border border-border/40 text-foreground rounded-tl-none italicized'
      }`}>
        {message}
      </div>
    </div>
  );
}
