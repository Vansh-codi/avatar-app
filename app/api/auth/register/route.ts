// app/api/auth/register/route.ts
// User registration endpoint with validation, bcrypt, and JWT

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signToken, getAuthCookieOptions } from '@/lib/auth';
import { authRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitResponse = authRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const { email, password, name } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name?.trim() || null,
        password: hashedPassword,
      },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    // Generate JWT
    const token = await signToken({ userId: user.id, email: user.email });

    // Build response with cookie
    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
      token,
    }, { status: 201 });

    response.cookies.set(getAuthCookieOptions(token));

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
