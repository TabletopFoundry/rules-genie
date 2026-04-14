import { NextResponse, type NextRequest } from 'next/server';

/** API route paths that accept state-changing requests (POST/PUT/DELETE). */
const MUTATION_API_PREFIXES = ['/api/ask', '/api/collection', '/api/bookmarks', '/api/feedback'];

/**
 * Middleware providing CSRF protection (P1-6) via Origin header verification.
 * Only applied to mutation (non-GET/HEAD) requests targeting API routes.
 */
export function middleware(request: NextRequest) {
  const { method, nextUrl, headers } = request;

  // Only gate mutation requests to API routes
  if (method === 'GET' || method === 'HEAD') {
    return NextResponse.next();
  }

  const isMutationApi = MUTATION_API_PREFIXES.some((prefix) => nextUrl.pathname.startsWith(prefix));
  if (!isMutationApi) {
    return NextResponse.next();
  }

  // Verify Origin header matches the host
  const origin = headers.get('origin');
  const host = headers.get('host');

  if (!origin || !host) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  if (originHost !== host) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*'
};
