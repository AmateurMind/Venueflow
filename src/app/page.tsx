"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { 
  Users, 
  Clock, 
  ShieldAlert, 
  ChevronRight, 
  Settings,
  Navigation,
  Activity,
  Loader2,
  Key
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Navbar } from "@/components/Navbar";
import { logAnalyticsEvent } from "@/lib/firebase";

interface MatchData {
  league: string;
  status: string;
  time: number | null;
  teams: {
    home: { name: string; logo: string; goals: number };
    away: { name: string; logo: string; goals: number };
  };
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: string }[]>([
    { role: 'bot', content: "Hello! I'm your digital concierge for Metrodome Arena. I'm connected to the venue sensors. Set your Gemini API Key in Settings to talk to me!" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Live Metrics State
  const [waitTime, setWaitTime] = useState(8);
  const [density, setDensity] = useState(64);
  const [gateStatus, setGateStatus] = useState("Fast");
  
  // Settings State
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  
  // Football State
  const [match, setMatch] = useState<MatchData | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const storedKey = localStorage.getItem("gemini_api_key");
    if (storedKey) setApiKey(storedKey);

    // Log page view
    logAnalyticsEvent("page_view", { page: "dashboard" });

    // Simulate Live Data
    const interval = setInterval(() => {
      setWaitTime(prev => Math.max(2, prev + (Math.random() > 0.5 ? 1 : -1)));
      setDensity(prev => Math.min(100, Math.max(10, prev + Math.floor(Math.random() * 5 - 2))));
      setGateStatus(Math.random() > 0.8 ? "Moderate" : "Fast");
    }, 4500);
    
    // Fetch live match
    fetch("/api/football")
      .then(r => r.json())
      .then(d => { if (!d.error) setMatch(d) })
      .catch();

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const saveSettings = () => {
    localStorage.setItem("gemini_api_key", apiKey);
    logAnalyticsEvent("settings_configured", { has_api_key: !!apiKey });
    setShowSettings(false);
    if (!messages.find(m => m.content.includes("configured"))) {
      setMessages(prev => [...prev, { role: 'bot', content: "API Key configured! How can I help you navigate the stadium?"}]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputValue("");
    setIsLoading(true);
    logAnalyticsEvent("assistant_message_sent", { has_api_key: !!apiKey });

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          apiKey: apiKey,
          context: {
            seat: "B204",
            closest_gate: "Gate 4",
            current_wait_times: `${waitTime} Mins`,
            current_density: `${density}%`,
            gate_status: gateStatus
          }
        }),
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', content: "Sorry, I'm having trouble connecting to the venue sensors right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen">
      {/* Hero Background */}
      <div className="fixed inset-0 z-[-1]" aria-hidden="true">
        <Image
          src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2600&auto=format&fit=crop"
          alt="Stadium background"
          fill
          className="object-cover opacity-15 blur-[4px] mix-blend-overlay"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background" />
      </div>

      <Navbar />

      <main id="main-content" className="container mx-auto px-4 md:px-6 py-8 md:py-12 space-y-12">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center border-b border-white/5 pb-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-6 max-w-2xl"
          >
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
              </span>
              <Badge variant="outline" className="text-secondary border-secondary/30 px-4 py-1.5 bg-secondary/5 font-mono text-xs">
                LIVE FROM METRODOME ARENA
              </Badge>
            </div>
            <h1 className="text-5xl md:text-7xl font-heading leading-[0.95] tracking-tight">
              Navigate the <span className="italicized text-gradient">Intensity</span>.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
              Real-time insights for the modern spectator. Move <span className="italicized text-primary">smarter</span>, wait <span className="italicized text-primary">less</span>, and never miss a critical moment.
            </p>
          </motion.div>

          {match && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="w-full max-w-sm shrink-0">
              <Card className="glass border-primary/20 glow-primary bg-background/40">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-mono tracking-widest text-primary uppercase">{match.league}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground flex items-center gap-1">
                    {match.time ? <span className="animate-pulse text-destructive font-bold">{match.time}'</span> : match.status}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between pb-5">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 relative bg-white rounded-full overflow-hidden p-1">
                      <Image src={match.teams.home.logo} alt={match.teams.home.name} fill className="object-contain p-1.5" />
                    </div>
                    <span className="text-xs font-bold w-20 text-center truncate">{match.teams.home.name}</span>
                  </div>
                  <div className="text-3xl font-heading italic px-4 flex items-center gap-3">
                    <span>{match.teams.home.goals}</span>
                    <span className="text-muted-foreground/30 text-xl">-</span>
                    <span>{match.teams.away.goals}</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 relative bg-white rounded-full overflow-hidden p-1">
                      <Image src={match.teams.away.logo} alt={match.teams.away.name} fill className="object-contain p-1.5" />
                    </div>
                    <span className="text-xs font-bold w-20 text-center truncate">{match.teams.away.name}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Live Metrics Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <MetricCard 
            icon={<Users className="w-5 h-5 text-accent" />}
            title="Gate Movement"
            value={gateStatus}
            description="Gate 4 and 7 are clearing."
            trend={gateStatus === "Fast" ? "Normal" : "Slowing"}
          />
          <MetricCard 
            icon={<Clock className="w-5 h-5 text-secondary" />}
            title="Avg. Wait Time"
            value={`${waitTime} Mins`}
            description="Updating from concession APIs."
            trend={waitTime < 10 ? "Decreasing" : "Increasing"}
            highlight
          />
          <MetricCard 
            icon={<Activity className="w-5 h-5 text-primary" />}
            title="Crowd Density"
            value={`${density}%`}
            description="High density near South Exits."
            trend={density > 60 ? "Increasing" : "Normal"}
          />
        </motion.div>

        {/* Interactive Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Map/Dashboard Area */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-8"
          >
            <Card className="glass overflow-hidden h-full border-white/5">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-3xl font-heading underlined decoration-primary/40">Venue Live View</CardTitle>
                  <CardDescription className="text-muted-foreground/80 mt-1">Visualizing real-time movement data</CardDescription>
                </div>
                <div className="hidden md:flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-full bg-background/50 backdrop-blur-md border-white/10">Heatmap</Button>
                  <Button size="sm" variant="outline" className="rounded-full bg-background/50 backdrop-blur-md border-white/10">Facilities</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 border-t border-white/5 relative">
                <div className="aspect-[4/3] md:aspect-[16/9] relative bg-black/40 flex items-center justify-center group overflow-hidden">
                   <Image 
                      src="https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=2638&auto=format&fit=crop"
                      alt="Stadium blueprint" 
                      fill 
                      className="object-cover opacity-60 contrast-125 saturate-50 group-hover:scale-105 transition-transform duration-1000 ease-out mix-blend-luminosity"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
                   
                   {/* Map overlays */}
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-3">
                      <div className="relative flex items-center justify-center">
                        <motion.div 
                          animate={{ scale: [1, 2], opacity: [0.8, 0] }} 
                          transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                          className="absolute w-8 h-8 md:w-12 md:h-12 bg-primary rounded-full" 
                        />
                        <div className="w-3 h-3 md:w-4 md:h-4 bg-primary rounded-full shadow-[0_0_15px_var(--primary)] z-10" />
                      </div>
                      <Badge className="bg-background/80 backdrop-blur-md text-foreground border-white/10 px-3 py-1 text-xs">Seat <span className="font-bold ml-1 text-primary">B204</span></Badge>
                   </div>
                   
                   {/* Fake density zones */}
                   <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-destructive/20 blur-3xl rounded-full mix-blend-screen" />
                   <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-secondary/20 blur-3xl rounded-full mix-blend-screen" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Assistant Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="lg:col-span-4 h-full"
          >
            <Card className="glass flex flex-col h-[500px] lg:h-full min-h-[500px] border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full mix-blend-screen" />
              
              <CardHeader className="border-b border-white/5 bg-background/40 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/20 flex flex-shrink-0 items-center justify-center text-accent glow-accent">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="font-heading italicized text-2xl tracking-normal text-foreground">Venue Assistant</CardTitle>
                    <CardDescription className="text-xs font-mono text-muted-foreground/70 tracking-widest uppercase mt-0.5">Powered by Gemini AI</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col justify-between p-0 overflow-hidden">
                 <div
                   ref={scrollRef}
                   role="log"
                   aria-live="polite"
                   aria-label="Venue assistant conversation"
                   className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6"
                 >
                    <AnimatePresence initial={false}>
                      {messages.map((m, idx) => (
                        <ChatBubble key={idx} type={m.role} message={m.content} />
                      ))}
                    </AnimatePresence>
                    
                    {isLoading && (
                      <div className="flex justify-start">
                        <div
                          role="status"
                          aria-label="Analyzing venue data"
                          className="bg-card border border-white/5 px-4 py-3 rounded-2xl rounded-tl-none rounded-tr-2xl text-sm w-fit max-w-[85%] flex items-center gap-2"
                        >
                          <Loader2 className="w-4 h-4 animate-spin text-accent" aria-hidden="true" />
                          <span className="text-muted-foreground italicized text-xs">Analyzing venue data...</span>
                        </div>
                      </div>
                    )}
                 </div>
                 
                 <div className="p-4 bg-background/60 border-t border-white/5 backdrop-blur-md">
                   <div className="relative flex items-center">
                     <Input 
                       id="chat-input"
                       value={inputValue}
                       onChange={(e) => setInputValue(e.target.value)}
                       onKeyDown={handleKeyPress}
                       placeholder="Ask about queues, exits, or food..."
                       aria-label="Ask the Venue Assistant"
                       className="bg-black/40 border-white/10 rounded-full h-12 pl-5 pr-14 text-sm focus-visible:ring-accent focus-visible:border-accent" 
                       disabled={isLoading}
                     />
                     <Button 
                        id="chat-send-btn"
                        size="icon" 
                        onClick={handleSendMessage}
                        disabled={isLoading || !inputValue.trim()}
                        aria-label="Send message"
                        className="absolute right-1.5 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground h-9 w-9 my-auto flex-shrink-0"
                     >
                        <ChevronRight className="w-5 h-5" aria-hidden="true" />
                     </Button>
                   </div>
                 </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <footer className="mt-20 border-t border-white/5 py-12 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-80" aria-label="VenueFlow brand">
            <Navigation className="text-primary w-5 h-5" aria-hidden="true" />
            <span className="text-lg font-heading italicized underline decoration-primary/20">VenueFlow.</span>
          </div>
          <nav aria-label="Footer navigation">
            <div className="flex gap-6 text-sm text-muted-foreground/80 font-medium">
              <a href="#main-content" className="hover:text-foreground transition-colors">Accessibility</a>
              <a href="#main-content" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#main-content" className="hover:text-foreground transition-colors">Support</a>
            </div>
          </nav>
          <p className="text-xs text-muted-foreground/50 font-mono">
            &copy; 2026 VENUEFLOW. BUILT FOR PROMPT WARS.
          </p>
        </div>
      </footer>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-strong border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-heading mb-1 text-foreground">API Configuration</h2>
              <p className="text-sm text-muted-foreground/80 mb-6 font-body">Provide your Gemini API key to activate the live assistant AI.</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Google Gemini Key</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="pl-10 bg-black/40 border-white/10 text-foreground h-11 focus-visible:ring-primary"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 justify-end mt-8">
                  <Button variant="ghost" onClick={() => setShowSettings(false)} className="hover:bg-white/5">Cancel</Button>
                  <Button onClick={saveSettings} className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Key</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  trend: string;
  highlight?: boolean;
}

function MetricCard({ icon, title, value, description, trend, highlight = false }: MetricCardProps) {
  return (
    <Card className={`glass border-white/5 overflow-hidden group transition-all duration-500 hover:border-white/20 hover:bg-white/[0.02] ${highlight ? 'bg-secondary/5 border-secondary/20 glow-secondary' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className={`p-2.5 rounded-xl ${highlight ? 'bg-secondary/10' : 'bg-muted/30'}`}>
            {icon}
          </div>
          <Badge variant="outline" className={`text-[9px] px-2 uppercase font-mono tracking-widest bg-transparent ${trend === 'Decreasing' ? 'text-primary border-primary/30' : 'text-accent border-accent/30'}`}>
            {trend}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-4xl font-heading tracking-tight italicized pb-1 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{value}</p>
          <p className="text-xs text-muted-foreground/60 leading-relaxed font-body">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ChatBubble({ type, message }: { type: 'user' | 'bot', message: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex w-full ${type === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`px-4 py-3 text-[14px] leading-relaxed w-fit max-w-[90%] md:max-w-[85%] ${
        type === 'user' 
          ? 'bg-accent text-accent-foreground rounded-2xl rounded-tr-sm font-medium shadow-none' 
          : 'bg-card border border-white/5 text-foreground rounded-2xl rounded-tl-sm glass italicized pr-6'
      }`}>
        <ReactMarkdown 
          components={{
            p: ({node, ...props}) => <span {...props} />,
            em: ({node, ...props}) => <i className="text-primary font-serif italic" {...props} />,
            strong: ({node, ...props}) => <b className="font-bold text-secondary font-sans not-italic" {...props} />,
            u: ({node, ...props}) => <u className="underline decoration-accent/50 underline-offset-4" {...props} />
          }}
        >
          {message}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
}
