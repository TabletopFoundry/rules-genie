import { NextResponse } from 'next/server';

import { getDb } from '@/lib/db/connection';
import { getAssistantModeOverview, getPreferredAssistantMode } from '@/lib/ux';

export const runtime = 'nodejs';

/**
 * Health check endpoint for deployment monitoring and load balancer probes.
 *
 * - `GET /api/health` → 200 if app + database are operational
 * - Returns 503 with `unhealthy` status on database failure
 *
 * @example
 * ```bash
 * curl -s http://localhost:3000/api/health | jq .
 * ```
 */
export function GET() {
  try {
    const db = getDb();
    const row = db.prepare('SELECT COUNT(*) AS count FROM games').get() as { count: number } | undefined;
    const gameCount = row?.count ?? 0;
    const preferredMode = getPreferredAssistantMode();
    const modeOverview = getAssistantModeOverview(preferredMode);

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version ?? '0.1.0',
        database: { connected: true, games: gameCount },
        mode: preferredMode,
        modeDescription: modeOverview.healthSummary,
        uptime: process.uptime()
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    );
  } catch {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: { connected: false }
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    );
  }
}
