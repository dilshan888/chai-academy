import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Clearing Progress table...');
    try {
        // using raw query to bypass schema validation
        await prisma.$executeRawUnsafe('TRUNCATE TABLE "Progress" CASCADE;');
        console.log('Progress table cleared successfully.');
    } catch (error) {
        console.error('Error clearing Progress table:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
