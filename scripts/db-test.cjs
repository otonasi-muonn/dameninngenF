const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn']
  });
  try {
    console.log('Connecting to database using DATABASE_URL...');
    const res = await prisma.$queryRaw`SELECT 1 as ok`;
    console.log('Query result:', res);
  } catch (e) {
    console.error('Connection test failed:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
