// Firebase — seed script
// Run once to populate Firestore with initial venue data
// node scripts/seed-firebase.mjs

import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const facilities = [
  { id: "food-1", name: "East Concourse Grill", type: "food", section: "Sec 200–210", wait: 4, capacity: 30 },
  { id: "food-2", name: "West Snack Bar", type: "food", section: "Sec 100–110", wait: 12, capacity: 75 },
  { id: "food-3", name: "North Food Court", type: "food", section: "Sec 300–320", wait: 9, capacity: 60 },
  { id: "food-4", name: "VIP Lounge Café", type: "food", section: "VIP Level", wait: 2, capacity: 15 },
  { id: "food-5", name: "South Wrap & Roll", type: "food", section: "Sec 400–420", wait: 18, capacity: 85 },
  { id: "rest-1", name: "East Wing – Level 2", type: "restroom", section: "Near Sec 205", wait: 1, capacity: 20 },
  { id: "rest-2", name: "North Wing – Level 1", type: "restroom", section: "Near Sec 310", wait: 5, capacity: 55 },
  { id: "rest-3", name: "West Wing – Level 1", type: "restroom", section: "Near Sec 105", wait: 3, capacity: 40 },
  { id: "rest-4", name: "Main Concourse", type: "restroom", section: "Near Gate 4", wait: 8, capacity: 70 },
  { id: "water-1", name: "Hydration Hub A", type: "water", section: "Sec 214", wait: 0, capacity: 5 },
  { id: "water-2", name: "Hydration Hub B", type: "water", section: "Sec 312", wait: 1, capacity: 12 },
  { id: "water-3", name: "Main Gate Station", type: "water", section: "Gate 1 Lobby", wait: 3, capacity: 28 },
];

const sections = [
  { id: "S200", label: "200s", lat: 28.6129, lng: 77.2295, density: 72 },
  { id: "S100", label: "100s", lat: 28.6119, lng: 77.2280, density: 45 },
  { id: "S300", label: "300s", lat: 28.6140, lng: 77.2278, density: 85 },
  { id: "S400", label: "400s", lat: 28.6115, lng: 77.2305, density: 38 },
  { id: "SVIP", label: "VIP", lat: 28.6129, lng: 77.2295, density: 22 },
];

async function seed() {
  for (const f of facilities) {
    await setDoc(doc(db, "facilities", f.id), f);
    console.log("Seeded:", f.id);
  }
  for (const s of sections) {
    await setDoc(doc(db, "sections", s.id), { ...s, updatedAt: new Date() });
    console.log("Seeded:", s.id);
  }
  console.log("Done!");
}

seed();
