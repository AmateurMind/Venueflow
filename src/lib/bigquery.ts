import { BigQuery } from "@google-cloud/bigquery";

let bqClient: BigQuery | null = null;

function getBigQueryClient(): BigQuery | null {
  const projectId =
    process.env.GOOGLE_CLOUD_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!projectId) return null;

  if (!bqClient) {
    // Support JSON credentials as env var (for Vercel / production deployments)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      const credentials = JSON.parse(
        process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
      );
      bqClient = new BigQuery({ projectId, credentials });
    } else {
      // Falls back to Application Default Credentials (local gcloud auth)
      bqClient = new BigQuery({ projectId });
    }
  }

  return bqClient;
}

export interface VenueEvent {
  event_type: string;
  page?: string;
  density?: number;
  wait_time?: number;
  gate_status?: string;
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Logs a venue event to BigQuery.
 * Gracefully no-ops if BigQuery is not configured.
 */
export async function logVenueEvent(event: VenueEvent): Promise<void> {
  const bq = getBigQueryClient();
  if (!bq) return;

  const datasetId = process.env.BQ_DATASET_ID || "venueflow";
  const tableId = process.env.BQ_TABLE_ID || "events";

  const row = {
    timestamp: new Date().toISOString(),
    event_type: event.event_type,
    page: event.page || "dashboard",
    density: event.density ?? null,
    wait_time: event.wait_time ?? null,
    gate_status: event.gate_status ?? null,
    metadata: JSON.stringify(event.metadata || {}),
  };

  try {
    await bq.dataset(datasetId).table(tableId).insert([row]);
  } catch {
    // BigQuery logging is non-critical — never throw
  }
}
