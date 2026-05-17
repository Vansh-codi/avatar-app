// app/api/auth/login/route.ts
// Login endpoint with bcrypt comparison and JWT issuance

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signToken, getAuthCookieOptions } from '@/lib/auth';
import { authRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const rateLimitResponse = authRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Generic error to prevent user enumeration
    if (!user) {
      await bcrypt.compare(password, '$2a$12$invalid-hash-for-timing-safety'); // Timing attack prevention
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Generate JWT
    const token = await signToken({ userId: user.id, email: user.email });

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
      token,
    });

    response.cookies.set(getAuthCookieOptions(token));

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
