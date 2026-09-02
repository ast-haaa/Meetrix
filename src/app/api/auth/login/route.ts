import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email ? String(body.email).trim().toLowerCase() : '';
    const password = body.password ? String(body.password) : '';
    const name = body.name ? String(body.name).trim() : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const configuredAdminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const isInitialAdminEmail = configuredAdminEmail ? email === configuredAdminEmail : false;

    let userData = {
      id: 'usr-101',
      email: email,
      name: name || email.split('@')[0],
      role: isInitialAdminEmail ? 'admin' : 'member',
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

        const assignedRole = isInitialAdminEmail ? 'ADMIN' : 'MEMBER';

        const owner = await prisma.owner.create({
          data: {
            name: name || email.split('@')[0],
            email: email,
            organizationId: org.id,
            role: assignedRole,
          },
        });

        user = await prisma.user.create({
          data: {
            email,
            name: name || email.split('@')[0],
            role: assignedRole,
          },
        });

        await prisma.owner.update({
          where: { id: owner.id },
          data: { userId: user.id },
        });
      }

      userData = {
        id: user.id,
        email: user.email,
        name: user.name || email.split('@')[0],
        role: user.role.toLowerCase(),
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
