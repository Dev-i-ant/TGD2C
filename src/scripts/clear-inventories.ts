import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import path from 'path';

// Manual initialization to match src/lib/prisma.ts
const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
const dbUrl = `file://${dbPath}`;

const adapter = new PrismaLibSql({
    url: dbUrl,
});

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    console.log('🚀 Starting database cleanup...');

    try {
        // 1. Delete all rewards assigned to users
        const deletedRewards = await prisma.reward.deleteMany({
            where: {
                userId: { not: null }
            }
        });
        console.log(`✅ Deleted ${deletedRewards.count} user-owned rewards.`);

        // 2. Clear historical "best drops" for all users
        const updatedUsers = await prisma.user.updateMany({
            data: {
                bestItemName: null,
                bestItemRarity: null,
                bestItemImage: null,
                bestItemWeight: 0
            }
        });
        console.log(`✅ Reset historical drop records for ${updatedUsers.count} users.`);

        // 3. Optional: Clear transactions related to item sales or openings if needed
        // For now, only clearing items and records as requested.

        console.log('✨ Cleanup finished successfully!');
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
