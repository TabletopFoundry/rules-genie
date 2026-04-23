import { NextResponse } from 'next/server';

import { getDb } from '@/lib/db/connection';

export const runtime = 'nodejs';

/**
 * Health check endpoint for deployment monitoring.
 * Returns 200 if the app and database are operational.
 */
export function GET() {
  try {
    const db = getDb();
    const row = db.prepare('SELECT COUNT(*) AS count FROM games').get() as { count: number } | undefined;
    const gameCount = row?.count ?? 0;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '0.1.0',
      database: { connected: true, games: gameCount },
      mode: process.env.RULESGENIE_DEMO_MODE !== 'false' ? 'demo' : 'live'
    });
  } catch {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: { connected: false }
      },
      { status: 503 }
    );
  }
}
