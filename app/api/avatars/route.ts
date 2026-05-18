
// app/api/avatars/route.ts
// Save or update avatar configuration for authenticated user

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/db';
// import { getCurrentUser } from '@/lib/auth';
// import { apiRateLimit } from '@/lib/rateLimit';

// export async function POST(req: NextRequest) {
//   const rateLimitResponse = apiRateLimit(req);
//   if (rateLimitResponse) return rateLimitResponse;

//   // Auth check (FIX: pass cookies correctly)
//    const user = await getCurrentUser();
//   if (!user) {
//     return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
//   }

//   try {
//     const body = await req.json();
//     const { name, config, previewUrl, avatarId } = body;

//     if (!config) {
//       return NextResponse.json({ error: 'Avatar config is required' }, { status: 400 });
//     }

//     // Limit saved avatars per user
//     const avatarCount = await prisma.avatar.count({
//       where: { userId: user.userId },
//     });

//     if (!avatarId && avatarCount >= 20) {
//       return NextResponse.json(
//         { error: 'Maximum 20 saved avatars per account' },
//         { status: 403 }
//       );
//     }

//     let avatar;

//     if (avatarId) {
//       // Update existing avatar (verify ownership)
//       const existing = await prisma.avatar.findFirst({
//         where: { id: avatarId, userId: user.userId },
//       });

//       if (!existing) {
//         return NextResponse.json({ error: 'Avatar not found' }, { status: 404 });
//       }

//       avatar = await prisma.avatar.update({
//         where: { id: avatarId },
//         data: {
//           name: name || existing.name,
//           config: JSON.stringify(config),
//           previewUrl,
//         },
//       });
//     } else {
//       // Create new avatar
//       avatar = await prisma.avatar.create({
//         data: {
//           userId: user.userId,
//           name: name || 'My Avatar',
//           config: JSON.stringify(config),
//           previewUrl,
//         },
//       });
//     }

//     // Parse config back to object before returning
//     const parsed = {
//       ...avatar,
//       config: JSON.parse(avatar.config as string),
//     };

//     return NextResponse.json(
//       { avatar: parsed },
//       { status: avatarId ? 200 : 201 }
//     );
//   } catch (error) {
//     console.error('Save avatar error:', error);
//     return NextResponse.json(
//       { error: 'Failed to save avatar' },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(req: NextRequest) {
//  const user = await getCurrentUser();
//   if (!user) {
//     return NextResponse.json(
//       { error: 'Authentication required' },
//       { status: 401 }
//     );
//   }

//   try {
//     const avatars = await prisma.avatar.findMany({
//       where: { userId: user.userId },
//       orderBy: { updatedAt: 'desc' },
//       select: {
//         id: true,
//         name: true,
//         config: true,
//         previewUrl: true,
//         createdAt: true,
//         updatedAt: true,
//       },
//     });

//     // Parse config strings back to objects
//     const parsed = avatars.map(a => ({
//       ...a,
//       config: (() => {
//         try {
//           return JSON.parse(a.config as string);
//         } catch {
//           return a.config;
//         }
//       })(),
//     }));

//     return NextResponse.json({ avatars: parsed });
//   } catch (error) {
//     console.error('Fetch avatars error:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch avatars' },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(req: NextRequest) {
//  const user = await getCurrentUser();
//   if (!user) {
//     return NextResponse.json(
//       { error: 'Authentication required' },
//       { status: 401 }
//     );
//   }

//   const { searchParams } = new URL(req.url);
//   const avatarId = searchParams.get('id');

//   if (!avatarId) {
//     return NextResponse.json(
//       { error: 'Avatar ID required' },
//       { status: 400 }
//     );
//   }

//   try {
//     const avatar = await prisma.avatar.findFirst({
//       where: { id: avatarId, userId: user.userId },
//     });

//     if (!avatar) {
//       return NextResponse.json({ error: 'Avatar not found' }, { status: 404 });
//     }

//     await prisma.avatar.delete({
//       where: { id: avatarId },
//     });

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error('Delete avatar error:', error);
//     return NextResponse.json(
//       { error: 'Failed to delete avatar' },
//       { status: 500 }
//     );
//   }
// }
// app/api/avatars/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { apiRateLimit } from '@/lib/rateLimit';

async function getAuthUser() {
  // Try JWT first (email/password login)
  const jwtUser = await getCurrentUser();
  if (jwtUser) return { userId: jwtUser.userId, email: jwtUser.email };

  // Try NextAuth session (Google login)
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    const dbUser = await prisma.user.upsert({
      where: { email: session.user.email },
      update: { name: session.user.name || '' },
      create: {
        email: session.user.email,
        name: session.user.name || '',
        password: '',
      },
    });
    return { userId: dbUser.id, email: dbUser.email };
  }

  return null;
}

export async function POST(req: NextRequest) {
  const rateLimitResponse = apiRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, config, previewUrl, avatarId } = body;

    if (!config) {
      return NextResponse.json({ error: 'Avatar config is required' }, { status: 400 });
    }

    const avatarCount = await prisma.avatar.count({
      where: { userId: user.userId },
    });

    if (!avatarId && avatarCount >= 20) {
      return NextResponse.json(
        { error: 'Maximum 20 saved avatars per account' },
        { status: 403 }
      );
    }

    let avatar;

    if (avatarId) {
      const existing = await prisma.avatar.findFirst({
        where: { id: avatarId, userId: user.userId },
      });

      if (!existing) {
        return NextResponse.json({ error: 'Avatar not found' }, { status: 404 });
      }

      avatar = await prisma.avatar.update({
        where: { id: avatarId },
        data: {
          name: name || existing.name,
          config: JSON.stringify(config),
          previewUrl,
        },
      });
    } else {
      avatar = await prisma.avatar.create({
        data: {
          userId: user.userId,
          name: name || 'My Avatar',
          config: JSON.stringify(config),
          previewUrl,
        },
      });
    }

    const parsed = {
      ...avatar,
      config: JSON.parse(avatar.config as string),
    };

    return NextResponse.json(
      { avatar: parsed },
      { status: avatarId ? 200 : 201 }
    );
  } catch (error) {
    console.error('Save avatar error:', error);
    return NextResponse.json(
      { error: 'Failed to save avatar' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const avatars = await prisma.avatar.findMany({
      where: { userId: user.userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        config: true,
        previewUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const parsed = avatars.map(a => ({
      ...a,
      config: (() => {
        try {
          return JSON.parse(a.config as string);
        } catch {
          return a.config;
        }
      })(),
    }));

    return NextResponse.json({ avatars: parsed });
  } catch (error) {
    console.error('Fetch avatars error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch avatars' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const avatarId = searchParams.get('id');

  if (!avatarId) {
    return NextResponse.json({ error: 'Avatar ID required' }, { status: 400 });
  }

  try {
    const avatar = await prisma.avatar.findFirst({
      where: { id: avatarId, userId: user.userId },
    });

    if (!avatar) {
      return NextResponse.json({ error: 'Avatar not found' }, { status: 404 });
    }

    await prisma.avatar.delete({
      where: { id: avatarId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete avatar error:', error);
    return NextResponse.json(
      { error: 'Failed to delete avatar' },
      { status: 500 }
    );
  }
}