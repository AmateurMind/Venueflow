"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/Navbar";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

const FOOD_STALLS = [
  { id: "food-1", name: "East Concourse Grill", type: "food", section: "Sec 200–210", wait: 4, capacity: 30 },
  { id: "food-2", name: "West Snack Bar", type: "food", section: "Sec 100–110", wait: 12, capacity: 75 },
  { id: "food-3", name: "North Food Court", type: "food", section: "Sec 300–320", wait: 9, capacity: 60 },
  { id: "food-4", name: "VIP Lounge Café", type: "food", section: "VIP Level", wait: 2, capacity: 15 },
  { id: "food-5", name: "South Wrap & Roll", type: "food", section: "Sec 400–420", wait: 18, capacity: 85 },
];

const RESTROOMS = [
  { id: "rest-1", name: "East Wing – Level 2", type: "restroom", section: "Near Sec 205", wait: 1, capacity: 20 },
  { id: "rest-2", name: "North Wing – Level 1", type: "restroom", section: "Near Sec 310", wait: 5, capacity: 55 },
  { id: "rest-3", name: "West Wing – Level 1", type: "restroom", section: "Near Sec 105", wait: 3, capacity: 40 },
  { id: "rest-4", name: "Main Concourse", type: "restroom", section: "Near Gate 4", wait: 8, capacity: 70 },
];

const WATER_STATIONS = [
  { id: "water-1", name: "Hydration Hub A", type: "water", section: "Sec 214", wait: 0, capacity: 5 },
  { id: "water-2", name: "Hydration Hub B", type: "water", section: "Sec 312", wait: 1, capacity: 12 },
  { id: "water-3", name: "Main Gate Station", type: "water", section: "Gate 1 Lobby", wait: 3, capacity: 28 },
];

function WaitBadge({ wait }: { wait: number }) {
  if (wait <= 3) return <Badge className="bg-primary/20 text-primary border-primary/30">{wait === 0 ? "No Wait" : `${wait} min`}</Badge>;
  if (wait <= 9) return <Badge className="bg-secondary/20 text-secondary border-secondary/30">{wait} min</Badge>;
  return <Badge className="bg-destructive/20 text-destructive border-destructive/30">{wait} min</Badge>;
}

function FacilityRow({ item }: { item: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 group hover:bg-white/[0.02] px-2 -mx-2 rounded-xl transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 rounded-xl bg-muted/30 flex items-center justify-center flex-shrink-0">
          {item.capacity > 60
            ? <AlertCircle className="w-4 h-4 text-destructive" />
            : <CheckCircle2 className="w-4 h-4 text-primary" />
          }
        </div>
        <div>
          <p className="font-medium text-foreground text-sm">{item.name}</p>
          <p className="text-xs text-muted-foreground">{item.section}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:block w-28">
          <Progress value={item.capacity} className="h-1.5" />
          <p className="text-[10px] text-muted-foreground/60 mt-1 text-right">{item.capacity}% full</p>
        </div>
        <WaitBadge wait={item.wait} />
      </div>
    </motion.div>
  );
}

export default function FacilitiesPage() {
  const [foodData, setFoodData] = useState(FOOD_STALLS);
  const [restroomData, setRestroomData] = useState(RESTROOMS);
  const [usingFirebase, setUsingFirebase] = useState(false);

  useEffect(() => {
    if (isFirebaseConfigured) {
      // Real-time Firestore listeners
      setUsingFirebase(true);
      const foodQ = query(collection(db, "facilities"), where("type", "==", "food"));
      const restQ = query(collection(db, "facilities"), where("type", "==", "restroom"));

      const unsubFood = onSnapshot(foodQ, (snap) => {
        if (!snap.empty) setFoodData(snap.docs.map(d => ({ id: d.id, ...d.data() })) as any);
      });
      const unsubRest = onSnapshot(restQ, (snap) => {
        if (!snap.empty) setRestroomData(snap.docs.map(d => ({ id: d.id, ...d.data() })) as any);
      });

      return () => { unsubFood(); unsubRest(); };
    } else {
      // Fallback: local simulation
      const interval = setInterval(() => {
        setFoodData(prev => prev.map(s => ({ ...s, wait: Math.max(0, s.wait + Math.floor(Math.random() * 3 - 1)), capacity: Math.min(100, Math.max(0, s.capacity + Math.floor(Math.random() * 6 - 3))) })));
        setRestroomData(prev => prev.map(s => ({ ...s, wait: Math.max(0, s.wait + Math.floor(Math.random() * 2 - 1)), capacity: Math.min(100, Math.max(0, s.capacity + Math.floor(Math.random() * 8 - 4))) })));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const bestFood = [...foodData].sort((a, b) => a.wait - b.wait)[0];

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-[-1] bg-background" />
      <Navbar />
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12 space-y-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <Badge variant="outline" className="text-secondary border-secondary/30 bg-secondary/5 font-mono text-xs px-3 py-1">LIVE FACILITY STATUS</Badge>
          <h1 className="text-4xl md:text-6xl font-heading tracking-tight">
            Find the <span className="italic text-gradient">Shortest</span> Queue.
          </h1>
          <p className="text-muted-foreground max-w-lg text-base">
            Real-time occupancy and wait times across all food, restroom, and hydration stations.
          </p>
        </motion.div>

        {/* Best Pick Banner */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass border-primary/20 glow-primary">
            <CardContent className="py-5 flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-1">AI Recommendation — Least Crowded Right Now</p>
                <p className="text-lg font-heading">
                  <span className="italic">{bestFood.name}</span>
                  <span className="text-muted-foreground text-sm font-body ml-2">at {bestFood.section}</span>
                </p>
              </div>
              <WaitBadge wait={bestFood.wait} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="food">
          <TabsList className="bg-muted/20 border border-white/5 p-1 rounded-xl">
            <TabsTrigger value="food" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">🍔 Food Stalls</TabsTrigger>
            <TabsTrigger value="restrooms" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">🚽 Restrooms</TabsTrigger>
            <TabsTrigger value="water" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">💧 Water</TabsTrigger>
          </TabsList>

          <TabsContent value="food" className="mt-6">
            <Card className="glass border-white/5">
              <CardHeader><CardTitle className="font-heading text-2xl">Food & Beverages</CardTitle><CardDescription>Live wait times. Auto-refreshing every 5 seconds.</CardDescription></CardHeader>
              <CardContent className="divide-y-0">{foodData.map(s => <FacilityRow key={s.id} item={s} />)}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="restrooms" className="mt-6">
            <Card className="glass border-white/5">
              <CardHeader><CardTitle className="font-heading text-2xl">Restroom Availability</CardTitle><CardDescription>Live occupancy tracking per wing.</CardDescription></CardHeader>
              <CardContent>{restroomData.map(s => <FacilityRow key={s.id} item={s} />)}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="water" className="mt-6">
            <Card className="glass border-white/5">
              <CardHeader><CardTitle className="font-heading text-2xl">Hydration Stations</CardTitle><CardDescription>Stay hydrated — find the nearest free water station.</CardDescription></CardHeader>
              <CardContent>{WATER_STATIONS.map(s => <FacilityRow key={s.id} item={s} />)}</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
