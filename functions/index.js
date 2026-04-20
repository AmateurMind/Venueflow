const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

/**
 * processCrowdEvent — HTTP Cloud Function (Gen 2)
 *
 * Receives a crowd event payload from the VenueFlow frontend,
 * computes an alert level, and stores the event in Firestore.
 *
 * Deploy:
 *   cd functions && firebase deploy --only functions
 *
 * Set NEXT_PUBLIC_CLOUD_FUNCTION_URL in .env.local to enable calling this from the app.
 */
exports.processCrowdEvent = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const { eventType, density, waitTime, gateStatus, timestamp } = req.body;

  if (!eventType) {
    res.status(400).json({ error: "eventType is required" });
    return;
  }

  // Compute alert level from crowd density
  const densityNum = Number(density) || 0;
  const alert =
    densityNum > 85
      ? "HIGH_DENSITY"
      : densityNum > 70
      ? "MODERATE_DENSITY"
      : "NORMAL";

  const processed = {
    processed: true,
    eventType,
    density: densityNum,
    waitTime: Number(waitTime) || 0,
    gateStatus: gateStatus || "unknown",
    timestamp: timestamp || new Date().toISOString(),
    alert,
  };

  // Persist to Firestore (non-blocking)
  try {
    const db = getFirestore();
    await db.collection("crowd_events").add(processed);
  } catch {
    // Firestore write failure doesn't block the response
  }

  res.status(200).json(processed);
});
