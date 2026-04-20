"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Layers, Eye, Map, Activity, Cpu } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";

const SECTIONS = [
  { id: "S200", label: "200s", top: "30%", left: "60%", density: 72, color: "secondary" },
  { id: "S100", label: "100s", top: "60%", left: "20%", density: 45, color: "primary" },
  { id: "S300", label: "300s", top: "20%", left: "30%", density: 85, color: "destructive" },
  { id: "S400", label: "400s", top: "65%", left: "70%", density: 38, color: "primary" },
  { id: "SVIP", label: "VIP", top: "45%", left: "45%", density: 22, color: "accent" },
];

function DensityDot({ section, onClick, selected }: any) {
  const colors: any = {
    primary: "bg-primary shadow-[0_0_12px_rgba(76,149,116,0.6)]",
    secondary: "bg-secondary shadow-[0_0_12px_rgba(223,193,136,0.6)]",
    destructive: "bg-destructive shadow-[0_0_12px_rgba(229,77,77,0.6)]",
    accent: "bg-accent shadow-[0_0_12px_rgba(195,146,154,0.6)]",
  };

  const size = section.density > 70 ? "w-8 h-8" : section.density > 40 ? "w-6 h-6" : "w-4 h-4";

  return (
    <motion.button
      onClick={() => onClick(section)}
      style={{ top: section.top, left: section.left, transform: "translate(-50%, -50%)" }}
      className="absolute cursor-pointer group"
      whileHover={{ scale: 1.3 }}
    >
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ repeat: Infinity, duration: 2.5 + Math.random() }}
        className={`rounded-full ${size} ${colors[section.color] || colors.primary} ${selected?.id === section.id ? "ring-2 ring-white ring-offset-2 ring-offset-transparent" : ""}`}
      />
      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-foreground/60 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        {section.label}
      </span>
    </motion.button>
  );
}

export default function MapPage() {
  const [selected, setSelected] = useState<any>(null);
  const [sections, setSections] = useState(SECTIONS);
  const [layer, setLayer] = useState<"heatmap" | "flow" | "occupancy">("heatmap");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    const d = setInterval(() => {
      setSections(prev => prev.map(s => ({
        ...s,
        density: Math.min(100, Math.max(10, s.density + Math.floor(Math.random() * 8 - 4))),
        color: s.density > 80 ? "destructive" : s.density > 55 ? "secondary" : "primary",
      })));
    }, 4000);
    return () => { clearInterval(t); clearInterval(d); };
  }, []);

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-[-1] bg-background" />
      <Navbar />

      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <Badge variant="outline" className="text-secondary border-secondary/30 bg-secondary/5 font-mono text-xs px-3 py-1">CROWD INTELLIGENCE LAYER</Badge>
          <h1 className="text-4xl md:text-6xl font-heading tracking-tight">
            Live <span className="italic text-gradient">Crowd</span> Map.
          </h1>
          <p className="text-muted-foreground max-w-lg text-base">
            Real-time crowd density overlays across all stadium sections. Click any zone for <span className="italic text-primary">detailed insights</span>.
          </p>
        </motion.div>

        <div className="flex gap-2 flex-wrap">
          {(["heatmap", "flow", "occupancy"] as const).map(l => (
            <Button key={l} onClick={() => setLayer(l)} variant="outline"
              className={`rounded-full capitalize text-sm ${layer === l ? "bg-primary text-white border-primary" : "bg-white/5 border-white/10"}`}>
              {l === "heatmap" ? "🌡 Heatmap" : l === "flow" ? "🔀 Flow Lines" : "📊 Occupancy"}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Display */}
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
            <Card className="glass border-white/5 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="font-heading text-2xl">Metrodome Arena</CardTitle>
                  <CardDescription className="font-mono text-xs">{time.toLocaleTimeString()} — Auto-refreshing</CardDescription>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block" /> Low
                  <span className="w-2 h-2 rounded-full bg-secondary inline-block ml-2" /> Med
                  <span className="w-2 h-2 rounded-full bg-destructive inline-block ml-2" /> High
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative aspect-[4/3] md:aspect-[16/9] bg-black/60 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=2638&auto=format&fit=crop"
                    alt="Stadium map"
                    fill
                    className="object-cover opacity-40 saturate-0 contrast-125"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent pointer-events-none" />

                  {/* Density Blobs for Heatmap */}
                  {layer === "heatmap" && sections.map(s => (
                    <div key={s.id} style={{ top: s.top, left: s.left, width: `${s.density * 1.2}px`, height: `${s.density * 1.2}px`, transform: "translate(-50%, -50%)" }}
                      className={`absolute rounded-full blur-3xl opacity-30 mix-blend-screen pointer-events-none ${s.color === 'destructive' ? 'bg-red-500' : s.color === 'secondary' ? 'bg-secondary' : 'bg-primary'}`} />
                  ))}

                  {/* Interactive Dots */}
                  {sections.map(s => (
                    <DensityDot key={s.id} section={s} onClick={setSelected} selected={selected} />
                  ))}

                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 glass rounded-xl px-3 py-2 text-xs text-muted-foreground font-mono flex items-center gap-2">
                    <Cpu className="w-3 h-3 text-primary" />
                    AI Density Analysis Active
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section Detail Panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-5">
            <Card className="glass border-white/5">
              <CardHeader>
                <CardTitle className="font-heading text-2xl italic">
                  {selected ? selected.label : "Select a Zone"}
                </CardTitle>
                <CardDescription>
                  {selected ? `Live stats for Section ${selected.label}` : "Click any density marker on the map"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selected ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Crowd Density</span>
                      <span className="font-heading text-2xl italic">{selected.density}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selected.density}%` }}
                        className={`h-full rounded-full ${selected.density > 70 ? 'bg-destructive' : selected.density > 45 ? 'bg-secondary' : 'bg-primary'}`}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground/70">
                      {selected.density > 70
                        ? "⚠️ High density. Consider moving to adjacent sections."
                        : selected.density > 45
                          ? "🟡 Moderate density. Monitor for changes."
                          : "✅ Low density. Safe to move through."}
                    </p>
                    <div className="pt-3 border-t border-white/5 text-xs text-muted-foreground space-y-2">
                      <div className="flex justify-between"><span>Nearest Exit</span><span className="text-foreground font-medium">Gate {(selected.id.charCodeAt(1) % 7) + 1}</span></div>
                      <div className="flex justify-between"><span>Food Nearby</span><span className="text-foreground font-medium">{Math.floor(Math.random() * 3 + 1)} stalls open</span></div>
                      <div className="flex justify-between"><span>Restroom</span><span className="text-primary font-medium">Available</span></div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground/60 italic">Tap a glowing dot on the map to see live data for that section.</p>
                )}
              </CardContent>
            </Card>

            {/* Summary Cards */}
            {sections.slice(0, 3).map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i + 0.4 }}>
                <button onClick={() => setSelected(s)} className="w-full text-left">
                  <Card className={`glass border-white/5 transition-all hover:border-white/20 ${selected?.id === s.id ? "border-primary/40" : ""}`}>
                    <CardContent className="pt-4 pb-4 flex items-center gap-4">
                      <div className={`w-2 h-8 rounded-full flex-shrink-0 ${s.density > 70 ? 'bg-destructive' : s.density > 45 ? 'bg-secondary' : 'bg-primary'}`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Section {s.label}</p>
                        <p className="text-xs text-muted-foreground">{s.density}% density</p>
                      </div>
                      <Badge className="bg-muted/20 border-white/10 text-muted-foreground text-xs">
                        {s.density > 70 ? "High" : s.density > 45 ? "Med" : "Low"}
                      </Badge>
                    </CardContent>
                  </Card>
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
