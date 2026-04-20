export interface CrowdEvent {
  eventType: "density_update" | "gate_status" | "wait_time_update" | "alert";
  density?: number;
  waitTime?: number;
  gateStatus?: string;
}

interface CloudFunctionResponse {
  processed: boolean;
  alert?: "HIGH_DENSITY" | "MODERATE_DENSITY" | "NORMAL";
  eventType?: string;
}

/**
 * Sends a crowd event to the deployed Cloud Function for processing.
 * Gracefully no-ops if NEXT_PUBLIC_CLOUD_FUNCTION_URL is not set.
 */
export async function triggerCrowdEvent(
  event: CrowdEvent
): Promise<CloudFunctionResponse | null> {
  const url = process.env.NEXT_PUBLIC_CLOUD_FUNCTION_URL;
  if (!url) return null;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...event, timestamp: new Date().toISOString() }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    // Cloud Function call is non-critical
    return null;
  }
}
