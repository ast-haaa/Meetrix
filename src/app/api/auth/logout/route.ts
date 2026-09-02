import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear auth session cookie
  response.cookies.set('session_user', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });

  return response;
}
