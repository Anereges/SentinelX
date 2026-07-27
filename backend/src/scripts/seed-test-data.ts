import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTestData() {
  console.log('Creating test data...');

  // Create some agents
  const agent1 = await prisma.agent.create({
    data: {
      name: 'Production Server',
      hostname: 'prod-server-01',
      os: 'Ubuntu 22.04',
      ipAddress: '192.168.1.10',
      version: '1.0.0',
      status: 'ONLINE',
      lastHeartbeatAt: new Date(),
    },
  });

  const agent2 = await prisma.agent.create({
    data: {
      name: 'Development Server',
      hostname: 'dev-server-01',
      os: 'Ubuntu 22.04',
      ipAddress: '192.168.1.20',
      version: '1.0.0',
      status: 'ONLINE',
      lastHeartbeatAt: new Date(),
    },
  });

  // Create some security events
  const eventTypes = [
    'AUTHENTICATION_FAILURE',
    'AUTHENTICATION_SUCCESS',
    'SSH_LOGIN',
    'PRIVILEGE_ESCALATION',
    'PROCESS_EXECUTION',
    'FILE_CHANGE',
    'NETWORK_CONNECTION',
  ];

  const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  
  const events = [];
  for (let i = 0; i < 50; i++) {
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    events.push({
      eventType: type,
      sourceIp: `192.168.1.${Math.floor(Math.random() * 255)}`,
      username: `user${Math.floor(Math.random() * 10)}`,
      hostname: `host-${Math.floor(Math.random() * 5)}`,
      severity: severities[Math.floor(Math.random() * severities.length)],
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      agentId: Math.random() > 0.5 ? agent1.id : agent2.id,
    });
  }

  await prisma.securityEvent.createMany({
    data: events,
  });

  console.log('Test data created successfully!');
}

seedTestData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());