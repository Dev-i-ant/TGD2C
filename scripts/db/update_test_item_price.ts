
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

console.log('DATABASE_URL:', process.env.DATABASE_URL);

const dbUrl = process.env.DATABASE_URL || 'file:/app/prisma/dev.db';
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
    const item = await prisma.reward.updateMany({
        where: { name: 'The Llama Llama' },
        data: { sellPrice: 50 }, // 50 RUB
    });
    console.log(`Updated ${item.count} items.`);
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
