import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // デモ用ユーザーの作成
  const demoUser = await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      username: 'demo_user',
      email: 'demo@example.com',
      passwordHash: 'dummy_hash', // 実際の運用では適切にハッシュ化
      displayName: 'デモユーザー',
    },
  });

  console.log('Created demo user:', demoUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });