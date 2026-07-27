import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sentinelx.local' },
    update: {},
    create: {
      email: 'admin@sentinelx.local',
      password: adminPassword,
      name: 'System Administrator',
      role: 'ADMIN'
    }
  });
  console.log('Created admin user: ' + admin.email);

  const analystPassword = await bcrypt.hash('Analyst123!', 10);
  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@sentinelx.local' },
    update: {},
    create: {
      email: 'analyst@sentinelx.local',
      password: analystPassword,
      name: 'Security Analyst',
      role: 'SECURITY_ANALYST'
    }
  });
  console.log('Created analyst user: ' + analyst.email);

  const viewerPassword = await bcrypt.hash('Viewer123!', 10);
  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@sentinelx.local' },
    update: {},
    create: {
      email: 'viewer@sentinelx.local',
      password: viewerPassword,
      name: 'Security Viewer',
      role: 'VIEWER'
    }
  });
  console.log('Created viewer user: ' + viewer.email);

  console.log('Seeding complete!');
  console.log('Default credentials:');
  console.log('   Admin: admin@sentinelx.local / Admin123!');
  console.log('   Analyst: analyst@sentinelx.local / Analyst123!');
  console.log('   Viewer: viewer@sentinelx.local / Viewer123!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });