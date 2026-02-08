
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

console.log('DATABASE_URL:', process.env.DATABASE_URL);

// Mimic src/lib/prisma.ts EXACTLY
const dbUrl = process.env.DATABASE_URL || 'file:/app/prisma/dev.db';

const adapter = new PrismaLibSql({
    url: dbUrl
});

const prisma = new PrismaClient({ adapter });

async function main() {
    // 1. Find Test Case
    const testCase = await prisma.case.findFirst({
        where: { name: 'Test Case (Beta)' }
    });

    if (!testCase) {
        console.error('Test Case (Beta) not found!');
        return;
    }

    // 2. Add The Llama Llama
    // Using a placeholder image since scraping failed
    const item = await prisma.reward.create({
        data: {
            name: 'The Llama Llama',
            rarity: 'Mythical', // Assessing as Mythical based on typical courier rarity
            image: '/assets/cases/dota2/test_llama.png', // Placeholder
            weight: 100, // Common enough for testing
            caseId: testCase.id
        }
    });

    console.log(`Added item: ${item.name} to case: ${testCase.name}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
