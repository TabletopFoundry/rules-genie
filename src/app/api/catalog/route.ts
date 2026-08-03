import { NextResponse } from 'next/server';
import {
  CATALOG_SIZE,
  findByMechanic,
  findByTheme,
  getAllGames,
  getCatalogStats,
  searchCatalog
} from '@tabletopfoundry/catalog';

export const runtime = 'nodejs';

/**
 * Unified catalog endpoint — exposes the suite-wide canonical game
 * catalog (`@tabletopfoundry/catalog`) to any other sub-project, browser
 * client, or external tool.
 *
 * This is the v0 wire-up for Feature 5 (Single Hosted MCP / API Gateway)
 * from NEXT-GEN-PLANNING.md: instead of letting each sub-project ship
 * its own per-app game list, a single source of truth is consumed here.
 *
 * Query parameters:
 *   - `mechanic=<name>` — return only games whose `mechanics` includes the value
 *   - `theme=<name>`    — return only games whose `themes` includes the value
 *   - `q=<text>`        — substring match against name + tagline
 *   - `players=<n>`     — restrict to games whose `[playerMin, playerMax]` covers `n`
 *   - `limit=<n>`       — max number of games to return
 *
 * Multiple parameters compose via `searchCatalog`. With no query the full
 * catalog is returned (small enough — 25 games — to ship in one response).
 *
 * Response shape:
 *   {
 *     "version": "0.1.0",
 *     "size": <number total in catalog>,
 *     "returned": <number after filtering>,
 *     "stats": { … },     // present only when no filters are applied
 *     "games": CatalogGame[]
 *   }
 *
 * Cache: results are static for the lifetime of the package version, so
 * we serve a long max-age with stale-while-revalidate. Clients SHOULD
 * cache by `?` query string. Tokens are not required (Feature 5 will add
 * scoped API keys once central auth ships).
 *
 * @example
 * ```bash
 * curl -s http://localhost:3000/api/catalog | jq '.size, .stats.totalGames'
 * curl -s 'http://localhost:3000/api/catalog?mechanic=Deck+Building' | jq '.games[].name'
 * curl -s 'http://localhost:3000/api/catalog?q=spirit' | jq '.games[0].tfId'
 * ```
 */
export function GET(request: Request) {
  const url = new URL(request.url);
  const mechanic = url.searchParams.get('mechanic');
  const theme = url.searchParams.get('theme');
  const q = url.searchParams.get('q');
  const playersRaw = url.searchParams.get('players');
  const limitRaw = url.searchParams.get('limit');

  const players = parsePositiveInt(playersRaw);
  const limit = parsePositiveInt(limitRaw);
  const hasFilters = Boolean(mechanic || theme || q || players || limit);

  let games;
  // Fast paths use the indexed lookups; everything else flows through
  // searchCatalog which does a single linear scan with composed filters.
  if (mechanic && !theme && !q && !players && !limit) {
    games = findByMechanic(mechanic);
  } else if (theme && !mechanic && !q && !players && !limit) {
    games = findByTheme(theme);
  } else if (!hasFilters) {
    games = getAllGames();
  } else {
    games = searchCatalog({
      ...(q ? { query: q } : {}),
      ...(mechanic ? { mechanics: [mechanic] } : {}),
      ...(theme ? { themes: [theme] } : {}),
      ...(typeof players === 'number' ? { supportsPlayerCount: players } : {}),
      ...(typeof limit === 'number' ? { limit } : {})
    });
  }

  return NextResponse.json(
    {
      version: '0.1.0',
      size: CATALOG_SIZE,
      returned: games.length,
      ...(hasFilters ? {} : { stats: getCatalogStats() }),
      games
    },
    {
      headers: {
        // Catalog is static per deploy — safe to cache aggressively.
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600'
      }
    }
  );
}

/** Parse a positive integer query param; returns undefined on missing/invalid. */
function parsePositiveInt(value: string | null): number | undefined {
  if (value === null || value.trim() === '') return undefined;
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return undefined;
  return n;
}
