import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestAlerts() {
  console.log('Creating test alerts...');

  const alerts = [
    {
      title: 'SSH Brute Force Attack',
      description: 'Multiple failed SSH authentication attempts from 192.168.1.100',
      severity: 'HIGH',
      status: 'NEW',
      sourceIp: '192.168.1.100',
      username: 'root',
    },
    {
      title: 'Privilege Escalation Detected',
      description: 'Sudo command executed with elevated privileges',
      severity: 'CRITICAL',
      status: 'NEW',
      username: 'admin',
      hostname: 'web-server-01',
    },
    {
      title: 'Port Scanning Activity',
      description: 'Multiple port connection attempts detected',
      severity: 'MEDIUM',
      status: 'NEW',
      sourceIp: '10.0.0.50',
    },
    {
      title: 'Suspicious Process Execution',
      description: 'Unknown process executed with high privileges',
      severity: 'HIGH',
      status: 'ACKNOWLEDGED',
      username: 'user1',
      hostname: 'dev-server-01',
    },
    {
      title: 'Failed Authentication Attempts',
      description: 'Multiple failed login attempts from unknown IP',
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

  console.log('✅ Created', alerts.length, 'test alerts');
}

createTestAlerts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());