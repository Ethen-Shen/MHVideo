import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const username = 'Ethen';
  const email = 'ethen@mhvideo.com';
  const password = 'Ethen112..';
  const role = 'super_admin';

  // 幂等：若已存在则跳过
  const existing = await prisma.adminUser.findUnique({ where: { username } });
  if (existing) {
    console.log(`管理员 ${username} 已存在，跳过种子。`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { username },
    update: {},
    create: {
      username,
      email,
      passwordHash,
      role,
    },
  });

  console.log(`默认管理员 ${username} 创建成功。`);
}

main()
  .catch((error) => {
    console.error('种子脚本执行失败:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
