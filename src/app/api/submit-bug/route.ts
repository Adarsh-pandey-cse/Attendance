
import { NextResponse } from 'next/server';

// This API route is no longer used by the primary bug submission flow,
// but is kept to avoid breaking changes if it was used by other parts of the app.
// The new flow uses a Server Action for maximum reliability.
export async function POST(req: Request) {
  console.warn("DEPRECATED API ROUTE: /api/submit-bug is no longer the primary method for bug submission.");
  return NextResponse.json({ error: 'This API endpoint is deprecated. Please use the new Server Action form.' }, { status: 410 });
}
