import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request payload' }, { status: 400 });
    }

    const email = body?.email ? String(body.email).trim().toLowerCase() : '';
    const password = body?.password ? String(body.password) : '';
    const name = body?.name ? String(body.name).trim() : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const configuredAdminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const isInitialAdminEmail = (configuredAdminEmail && email === configuredAdminEmail) || email === 'admin@meetrix.ai';
    const isGuestUser = email === 'guest@meetrix.ai' || email.toLowerCase().includes('guest');

    let userData = {
      id: isGuestUser ? 'usr-guest' : 'usr-101',
      email: email,
      name: isGuestUser ? 'Guest User' : (name || email.split('@')[0]),
      role: isGuestUser ? 'guest' : (isInitialAdminEmail ? 'admin' : 'member'),
    };

    try {
      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        let org = await prisma.organization.findFirst();
        if (!org) {
          org = await prisma.organization.create({
            data: {
              name: 'Meetrix Workspace',
              slug: 'meetrix-workspace',
            },
          });
        }

        const assignedRole = isGuestUser ? 'MEMBER' : (isInitialAdminEmail ? 'ADMIN' : 'MEMBER');

        const owner = await prisma.owner.create({
          data: {
            name: isGuestUser ? 'Guest User' : (name || email.split('@')[0]),
            email: email,
            organizationId: org.id,
            role: assignedRole,
          },
        });

        user = await prisma.user.create({
          data: {
            email,
            name: isGuestUser ? 'Guest User' : (name || email.split('@')[0]),
            role: assignedRole,
          },
        });

        await prisma.owner.update({
          where: { id: owner.id },
          data: { userId: user.id },
        });
      } else if (isInitialAdminEmail && user.role !== 'ADMIN') {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: 'ADMIN' },
        });
        await prisma.owner.updateMany({
          where: { email },
          data: { role: 'ADMIN' },
        });
      }

      userData = {
        id: user.id,
        email: user.email,
        name: isGuestUser ? 'Guest User' : (user.name || email.split('@')[0]),
        role: isGuestUser ? 'guest' : user.role.toLowerCase(),
      };
    } catch (dbErr) {
      console.warn('Prisma DB lookup warning, proceeding with session auth:', dbErr);
    }

    const isAdminUser = userData.role === 'admin';
    const targetRedirect = isAdminUser ? '/admin/dashboard' : '/dashboard';

    const response = NextResponse.json({
      success: true,
      user: userData,
      redirectUrl: targetRedirect,
    });

    response.cookies.set('session_user', JSON.stringify(userData), {
      httpOnly: false,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}
