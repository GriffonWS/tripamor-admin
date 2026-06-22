import { NextResponse } from 'next/server';
import { createSessionToken, setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json(
      { error: 'Server not configured. ADMIN_PASSWORD missing.' },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as { password?: string };
  const submitted = body.password ?? '';

  if (submitted !== adminPassword) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const token = await createSessionToken();
  await setSessionCookie(token);
  return NextResponse.json({ success: true });
}
