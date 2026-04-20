"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Phone, ArrowRight, AlertTriangle, CheckCircle, Wind, Heart, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/Navbar";

const EMERGENCY_EXITS = [
  { id: 1, gate: "Gate 1 — North", status: "Clear", distance: "12 min walk", crowd: "Low", safe: true },
  { id: 2, gate: "Gate 2 — East", status: "Clear", distance: "8 min walk", crowd: "Low", safe: true },
  { id: 3, gate: "Gate 4 — West", status: "Congested", distance: "6 min walk", crowd: "High", safe: false },
  { id: 4, gate: "Gate 6 — South", status: "Clear", distance: "15 min walk", crowd: "Moderate", safe: true },
  { id: 5, gate: "Gate 7 — VIP", status: "Restricted", distance: "4 min walk", crowd: "None", safe: true },
];

const EMERGENCY_CONTACTS = [
  { name: "Venue Security", number: "040-1111-2222", icon: ShieldAlert },
  { name: "Medical Team", number: "040-3333-4444", icon: Heart },
  { name: "Fire Safety", number: "101", icon: Flame },
  { name: "Emergency Line", number: "112", icon: Phone },
];

const SAFETY_ALERTS = [
  { type: "info", message: "High crowd density detected near South Exit (Gate 4). Use Gate 2 for faster exit." },
  { type: "safe", message: "Medical stations at Section 112 and Section 304 are fully staffed." },
];

export default function EmergencyPage() {
  const [alertVisible, setAlertVisible] = useState(true);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-[-1] bg-background" />
      <Navbar />

      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12 space-y-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 font-mono text-xs px-3 py-1">ALL CLEAR — LIVE SAFETY STATUS</Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-heading tracking-tight">
            Safety & <span className="italic text-gradient">Emergency</span> Hub.
          </h1>
          <p className="text-muted-foreground max-w-lg text-base">
            Real-time crowd analysis helps you exit <span className="text-primary italic">safely</span> and quickly. In any situation, <span className="italic underline decoration-accent/40">stay calm and follow the guided routes</span>.
          </p>
          <p className="text-xs text-muted-foreground/50 font-mono">Last updated: {time.toLocaleTimeString()}</p>
        </motion.div>

        {/* Live Safety Alerts */}
        {alertVisible && (
          <div className="space-y-3">
            {SAFETY_ALERTS.map((alert, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}>
                <Card className={`border-l-4 glass ${alert.type === 'info' ? 'border-l-secondary' : 'border-l-primary'}`}>
                  <CardContent className="py-3 flex items-center gap-3">
                    {alert.type === 'info'
                      ? <AlertTriangle className="w-5 h-5 text-secondary flex-shrink-0" />
                      : <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    }
                    <p className="text-sm text-foreground/90">{alert.message}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Emergency Exits */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass border-white/5 h-full">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">Exit Routes <span className="italic text-primary">Status</span></CardTitle>
                <CardDescription>AI-monitored crowd flow at every gate exit.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {EMERGENCY_EXITS.map((exit, i) => (
                  <motion.div
                    key={exit.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="flex items-center justify-between py-3 px-3 rounded-xl transition-all hover:bg-white/[0.03] border border-transparent hover:border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        exit.safe && exit.status === 'Clear' ? 'bg-primary' :
                        exit.status === 'Restricted' ? 'bg-secondary' :
                        'bg-destructive'
                      }`} />
                      <div>
                        <p className="font-medium text-sm text-foreground">{exit.gate}</p>
                        <p className="text-xs text-muted-foreground">{exit.distance} · Crowd: {exit.crowd}</p>
                      </div>
                    </div>
                    <Badge className={`text-xs ${
                      exit.status === 'Clear' ? 'bg-primary/20 text-primary border-primary/30' :
                      exit.status === 'Restricted' ? 'bg-secondary/20 text-secondary border-secondary/30' :
                      'bg-destructive/20 text-destructive border-destructive/30'
                    }`}>
                      {exit.status}
                    </Badge>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Emergency Contacts */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
            <Card className="glass border-white/5">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">Emergency <span className="italic text-accent">Contacts</span></CardTitle>
                <CardDescription>Tap to call. All lines are 24/7 staffed.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {EMERGENCY_CONTACTS.map((contact, i) => (
                  <motion.a
                    key={i}
                    href={`tel:${contact.number.replace(/-/g, '')}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 * i }}
                    className="flex items-center justify-between py-3 px-4 rounded-xl border border-white/5 hover:bg-white/[0.05] hover:border-accent/20 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                        <contact.icon className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{contact.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{contact.number}</p>
                      </div>
                    </div>
                    <Phone className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                  </motion.a>
                ))}
              </CardContent>
            </Card>

            <Card className="glass border-accent/20 glow-accent">
              <CardContent className="pt-6 pb-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
                    <Wind className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl mb-1 italic">Evacuation Protocol</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      If an alarm sounds, proceed calmly to the nearest <span className="text-primary font-semibold">Clear exit</span>. Follow staff instructions. Do <span className="underline decoration-destructive/40">not</span> use elevators. Assembly point: <span className="text-secondary italic">North Car Park, Zone B</span>.
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
