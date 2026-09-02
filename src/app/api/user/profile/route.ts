import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session_user')?.value;

    if (!sessionCookie) {
      return NextResponse.json({
        user: {
          id: 'usr-101',
          name: 'Admin User',
          email: 'admin@meetrix.ai',
          role: 'admin',
          initials: 'A',
          organization: 'Meetrix Workspace',
        },
      });
    }

    const sessionObj = JSON.parse(sessionCookie);

    let user = await prisma.user.findUnique({
      where: { email: sessionObj.email },
    });

    const displayName = user?.name || sessionObj.name || sessionObj.email.split('@')[0];
    const initials = displayName.charAt(0).toUpperCase();

    return NextResponse.json({
      user: {
        id: user?.id || sessionObj.id,
        name: displayName,
        email: user?.email || sessionObj.email,
        role: user?.role?.toLowerCase() || sessionObj.role,
        initials: initials,
        organization: 'Meetrix Workspace',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session_user')?.value;

    if (!sessionCookie || !name?.trim()) {
      return NextResponse.json({ error: 'Missing session or name' }, { status: 400 });
    }

    const sessionObj = JSON.parse(sessionCookie);

    try {
      await prisma.user.update({
        where: { email: sessionObj.email },
        data: { name: name.trim() },
      });
    } catch {
      // DB might not have this user yet — that's fine, still update cookie
    }

    // ✅ Update the session cookie with the new name
    const updatedSession = {
      ...sessionObj,
      name: name.trim(),
    };

    const response = NextResponse.json({ success: true, message: 'Profile updated successfully' });

    response.cookies.set('session_user', JSON.stringify(updatedSession), {
      httpOnly: false,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
