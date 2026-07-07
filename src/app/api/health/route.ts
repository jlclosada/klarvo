import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** Healthcheck simple para monitorización/uptime. */
export function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'klarvo',
    time: new Date().toISOString(),
  });
}
