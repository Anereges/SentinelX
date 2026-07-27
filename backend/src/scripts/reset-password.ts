import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    const user = await prisma.user.update({
      where: { email: 'admin@sentinelx.local' },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Password reset for:', user.email);
    console.log('   New password: Admin123!');
  } catch (error) {
    console.error('❌ Error resetting password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();