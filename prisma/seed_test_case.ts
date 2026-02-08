import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'path'

const defaultDbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
const dbUrl = process.env.DATABASE_URL || `file://${defaultDbPath}`;

const adapter = new PrismaLibSql({
    url: dbUrl,
});

const prisma = new PrismaClient({
    adapter,
})

async function main() {
    console.log('Creating Test Case (Beta)...')

    const testCaseName = "Test Case (Beta)";

    // Delete if exists
    await prisma.case.deleteMany({
        where: { name: testCaseName }
    });

    await prisma.case.create({
        data: {
            name: testCaseName,
            price: 1,
            image: "https://liquipedia.net/commons/images/d/df/Cosmetic_icon_Bzz_Is_Perfect_Texture.png",
            rarity: "COMMON",
            color: "bg-gray-500",
            rewards: {
                create: [
                    { name: "Bracer of the Burning Coalition", rarity: "COMMON", weight: 25, sellPrice: 5, image: "https://liquipedia.net/commons/images/3/3d/Cosmetic_icon_Bracer_of_the_Burning_Coalition.png" },
                    { name: "Armor of the Burning Coalition", rarity: "COMMON", weight: 25, sellPrice: 5, image: "https://liquipedia.net/commons/images/d/de/Cosmetic_icon_Armor_of_the_Burning_Coalition.png" },
                    { name: "Quiver of the Winged Bolt", rarity: "COMMON", weight: 25, sellPrice: 5, image: "https://liquipedia.net/commons/images/1/1d/Cosmetic_icon_Quiver_of_the_Winged_Bolt.png" },
                    { name: "Staff of the Crystalline Queen", rarity: "COMMON", weight: 25, sellPrice: 5, image: "https://liquipedia.net/commons/images/3/30/Cosmetic_icon_Staff_of_the_Crystalline_Queen.png" },
                    // Test Item for Withdrawal Debugging
                    { name: "The Llama Llama", rarity: "MYTHICAL", weight: 50, sellPrice: 50, image: "/assets/cases/dota2/test_llama.png" }
                ]
            }
        }
    });

    console.log('Test Case (Beta) created successfully!');
}

main()
    .catch((e) => {
        console.error('Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
