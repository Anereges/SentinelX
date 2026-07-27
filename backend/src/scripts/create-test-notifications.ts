import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestNotifications() {
  console.log('Creating test alerts for notifications...');

  const alerts = [
    {
      title: '🚨 SSH Brute Force Attack',
      description: 'Multiple failed SSH authentication attempts from 192.168.1.100. 15 attempts in 2 minutes.',
      severity: 'HIGH',
      status: 'NEW',
      sourceIp: '192.168.1.100',
      username: 'root',
    },
    {
      title: '🔥 Critical: Privilege Escalation Detected',
      description: 'Sudo command executed with elevated privileges on web-server-01',
      severity: 'CRITICAL',
      status: 'NEW',
      username: 'admin',
      hostname: 'web-server-01',
    },
    {
      title: '⚠️ Port Scanning Activity',
      description: 'Multiple port connection attempts detected from 10.0.0.50 scanning ports 22, 80, 443, 8080',
      severity: 'MEDIUM',
      status: 'NEW',
      sourceIp: '10.0.0.50',
    },
    {
      title: '🔴 Suspicious Process Execution',
      description: 'Unknown process "cryptominer" executed with high privileges on dev-server-01',
      severity: 'HIGH',
      status: 'NEW',
      username: 'user1',
      hostname: 'dev-server-01',
    },
    {
      title: '🛡️ Failed Authentication Attempts',
      description: 'Multiple failed login attempts from unknown IP 203.0.113.45 targeting 3 different users',
      severity: 'MEDIUM',
      status: 'NEW',
      sourceIp: '203.0.113.45',
      username: 'unknown',
    },
  ];

  for (const alertData of alerts) {
    await prisma.alert.create({
      data: alertData,
    });
  }

  console.log('✅ Created', alerts.length, 'test alerts for notifications');
}

createTestNotifications()
  .catch(console.error)
  .finally(() => prisma.$disconnect());