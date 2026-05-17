// prisma/seed.ts
// Optional: seed the database with test data for development
// Run with: npx ts-node prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a test user
  const hashedPassword = await bcrypt.hash('testpassword123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'test@avatarAI.com' },
    update: {},
    create: {
      email: 'test@avatarAI.com',
      name: 'Test User',
      password: hashedPassword,
    },
  });

  console.log(`✅ Created test user: ${user.email}`);

  // Create a sample avatar
  await prisma.avatar.upsert({
    where: { id: 'seed-avatar-1' },
    update: {},
    create: {
      id: 'seed-avatar-1',
      userId: user.id,
      name: 'Default Avatar',
      config: JSON.stringify({
        skinTone: '#F5CBA7',
        hairColor: '#2C1810',
        hairStyle: 'short',
        eyeColor: '#4A90D9',
        faceShape: 'oval',
        bodyType: 'average',
        height: 1.0,
        topColor: '#2C3E50',
        bottomColor: '#1A252F',
        outfitStyle: 'casual',
        glasses: false,
        glassesStyle: 'none',
        hat: false,
        hatStyle: 'none',
        expressionIntensity: 0.8,
        motionSmoothing: 0.7,
      }),
    },
  });

  console.log('✅ Created sample avatar');
  console.log('\n📋 Test credentials:');
  console.log('   Email:    test@avatarAI.com');
  console.log('   Password: testpassword123');
  console.log('\n🚀 Seeding complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
