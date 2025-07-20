import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // デモ用ユーザーの作成
  const hashedPassword = await bcrypt.hash('demo123456', 12);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      username: 'demo_user',
      email: 'demo@example.com',
      passwordHash: hashedPassword,
      displayName: 'デモユーザー',
    },
  });

  console.log('Created demo user:', demoUser.username);
  
  // サンプル楽曲データの作成（オプション）
  const sampleSong = await prisma.song.upsert({
    where: { 
      title_difficulty: {
        title: 'Sample Song',
        difficulty: 'ANOTHER'
      }
    },
    update: {},
    create: {
      title: 'Sample Song',
      difficulty: 'ANOTHER',
      level: 12,
      notes: 1500,
      bpm: '150',
      coef: 1.0000,
    },
  });

  console.log('Created sample song:', sampleSong.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });