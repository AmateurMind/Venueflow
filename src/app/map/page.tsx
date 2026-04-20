"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layers, Activity, Cpu } from "lucide-react";
import { APIProvider, Map, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

const MOCK_SECTIONS = [
  { id: "S200", label: "200s", lat: 41.3812, lng: 2.1232, density: 72 },
  { id: "S100", label: "100s", lat: 41.3805, lng: 2.1220, density: 45 },
  { id: "S300", label: "300s", lat: 41.3803, lng: 2.1235, density: 85 },
  { id: "S400", label: "400s", lat: 41.3814, lng: 2.1222, density: 38 },
  { id: "SVIP", label: "VIP", lat: 41.3809, lng: 2.1228, density: 22 },
];

// Stadium center (Spotify Camp Nou, Barcelona)
const STADIUM_CENTER = { lat: 41.3809, lng: 2.1228 };

function densityColor(density: number) {
  if (density > 70) return "#e54d4d";
  if (density > 45) return "#dfc188";
  return "#4c9574";
}

function DensityMarker({ section, onClick, selected }: any) {
  const color = densityColor(section.density);
  return (
    <AdvancedMarker position={{ lat: section.lat, lng: section.lng }} onClick={() => onClick(section)}>
      <div
        className="flex flex-col items-center cursor-pointer"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        <div
          style={{
            width: `${Math.max(24, section.density / 3)}px`,
            height: `${Math.max(24, section.density / 3)}px`,
            backgroundColor: color,
            borderRadius: "50%",
            opacity: 0.85,
            boxShadow: `0 0 16px ${color}88`,
            border: selected?.id === section.id ? `3px solid white` : `2px solid ${color}`,
            transition: "all 0.3s ease",
          }}
        />
        <span className="text-[10px] font-mono font-bold mt-1 bg-background/80 backdrop-blur rounded px-1 text-foreground">
          {section.label}
        </span>
      </div>
    </AdvancedMarker>
  );
}

export default function MapPage() {
  const [sections, setSections] = useState(MOCK_SECTIONS);
  const [selected, setSelected] = useState<any>(null);
  const [layer, setLayer] = useState<"heatmap" | "occupancy">("heatmap");
  const [time, setTime] = useState(new Date());
  const [usingFirebase, setUsingFirebase] = useState(false);

  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (isFirebaseConfigured) {
      setUsingFirebase(true);
      const unsub = onSnapshot(collection(db, "sections"), (snap) => {
        if (!snap.empty) setSections(snap.docs.map(d => ({ id: d.id, ...d.data() })) as any);
      });
      return () => unsub();
    } else {
      const interval = setInterval(() => {
        setSections(prev => prev.map(s => ({
          ...s,
          density: Math.min(100, Math.max(10, s.density + Math.floor(Math.random() * 8 - 4))),
        })));
      }, 4000);
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-[-1] bg-background" />
      <Navbar />

      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-secondary border-secondary/30 bg-secondary/5 font-mono text-xs px-3 py-1">
              CROWD INTELLIGENCE — {usingFirebase ? "🔥 FIREBASE LIVE" : "SIMULATED DATA"}
            </Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-heading tracking-tight">
            Live <span className="italic text-gradient">Crowd</span> Map.
          </h1>
          <p className="text-muted-foreground max-w-lg text-base">
            Click any zone on the map for live <span className="italic text-primary">density insights</span> and smart routing recommendations.
          </p>
        </motion.div>

        {/* Layer Controls */}
        <div className="flex gap-2">
          {(["heatmap", "occupancy"] as const).map(l => (
            <Button key={l} onClick={() => setLayer(l)} variant="outline"
              className={`rounded-full capitalize text-sm ${layer === l ? "bg-primary text-white border-primary" : "bg-white/5 border-white/10"}`}>
              {l === "heatmap" ? "🌡 Heatmap" : "📊 Occupancy"}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Google Map */}
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
            <Card className="glass border-white/5 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="font-heading text-2xl">Metrodome Arena</CardTitle>
                  <CardDescription className="font-mono text-xs">{time.toLocaleTimeString()} — Live</CardDescription>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" /> Low</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-secondary inline-block" /> Med</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-destructive inline-block" /> High</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-[4/3] md:aspect-[16/9] w-full overflow-hidden rounded-b-xl">
                  {mapsApiKey ? (
                    <APIProvider apiKey={mapsApiKey}>
                      <Map
                        defaultCenter={STADIUM_CENTER}
                        defaultZoom={17}
                        mapId="venueflow-map"
                        gestureHandling="cooperative"
                        disableDefaultUI={false}
                        style={{ width: "100%", height: "100%" }}
                        colorScheme="DARK"
                      >
                        {sections.map(s => (
                          <DensityMarker key={s.id} section={s} onClick={setSelected} selected={selected} />
                        ))}
                        {selected && (
                          <InfoWindow position={{ lat: selected.lat, lng: selected.lng }} onCloseClick={() => setSelected(null)}>
                            <div className="p-1 text-black text-xs font-semibold">
                              <p className="font-bold">Section {selected.label}</p>
                              <p>Density: {selected.density}%</p>
                            </div>
                          </InfoWindow>
                        )}
                      </Map>
                    </APIProvider>
                  ) : (
                    // Fallback when no Maps API key
                    <div className="w-full h-full bg-muted/20 flex flex-col items-center justify-center gap-4 text-center px-8">
                      <Layers className="w-12 h-12 text-muted-foreground/40" />
                      <div>
                        <p className="text-base font-heading text-muted-foreground">Google Maps not configured</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Add <code className="bg-muted/30 px-1 rounded text-secondary">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your <code className="bg-muted/30 px-1 rounded text-secondary">.env.local</code> to enable the live map.</p>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mt-4 w-full max-w-sm">
                        {sections.map(s => (
                          <button key={s.id} onClick={() => setSelected(s)}
                            className={`p-3 rounded-xl border text-left transition-all hover:border-white/20 ${selected?.id === s.id ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/[0.02]'}`}>
                            <p className="text-sm font-bold font-heading">{s.label}</p>
                            <p className={`text-xs font-mono ${s.density > 70 ? 'text-destructive' : s.density > 45 ? 'text-secondary' : 'text-primary'}`}>{s.density}%</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section Detail Panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-5">
            <Card className="glass border-white/5">
              <CardHeader>
                <CardTitle className="font-heading text-2xl italic">
                  {selected ? `Section ${selected.label}` : "Select a Zone"}
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
                        className="h-full rounded-full"
                        style={{ backgroundColor: densityColor(selected.density) }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground/70">
                      {selected.density > 70
                        ? "⚠️ High density. Move to adjacent sections."
                        : selected.density > 45
                          ? "🟡 Moderate. Monitor for changes."
                          : "✅ Low density. Safe to move through."}
                    </p>
                    <div className="pt-3 border-t border-white/5 text-xs text-muted-foreground space-y-2">
                      <div className="flex justify-between"><span>Nearest Exit</span><span className="text-foreground font-medium">Gate {(selected.id.charCodeAt(1) % 7) + 1}</span></div>
                      <div className="flex justify-between"><span>Restroom</span><span className="text-primary font-medium">Available</span></div>
                      <div className="flex justify-between"><span>Concessions</span><span className="text-foreground font-medium">{Math.floor(Math.random() * 3 + 1)} stalls open</span></div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground/60 italic">Tap a zone on the map to view live data.</p>
                )}
              </CardContent>
            </Card>

            {/* Live Summary Cards */}
            {sections.slice(0, 3).map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i + 0.4 }}>
                <button onClick={() => setSelected(s)} className="w-full text-left">
                  <Card className={`glass border-white/5 transition-all hover:border-white/20 ${selected?.id === s.id ? "border-primary/40" : ""}`}>
                    <CardContent className="pt-4 pb-4 flex items-center gap-4">
                      <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: densityColor(s.density) }} />
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

            {/* AI Routing card */}
            <Card className="glass border-primary/20 glow-primary">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/30">
                    <Cpu className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">AI Smart Routing</p>
                    <p className="text-sm leading-relaxed text-foreground">
                      {selected
                        ? `From Section ${selected.label}, the fastest exit is <span class="text-primary font-bold">Gate ${(selected.id.charCodeAt(1) % 7) + 1}</span>. Expected walk: 4 mins.`
                        : "Select a zone to generate your AI-optimised exit route."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
