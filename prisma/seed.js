const { PrismaClient } = require('@prisma/client')
const { PrismaLibSql } = require('@prisma/adapter-libsql')
const { createClient } = require('@libsql/client')

const libsql = createClient({
    url: "file:./prisma/dev.db",
})
const adapter = new PrismaLibSql(libsql)
const prisma = new PrismaClient({ adapter })

async function main() {
    // Demo Case
    const dotaCase = await prisma.case.create({
        data: {
            name: "Dragonclaw Case",
            price: 100,
            rewards: {
                create: [
                    { name: "Dragonclaw Hook", rarity: "IMMORTAL", weight: 1 },
                    { name: "Arcana Bundle", rarity: "ARCANA", weight: 5 },
                    { name: "Rare Set", rarity: "RARE", weight: 20 },
                    { name: "Common Trash", rarity: "COMMON", weight: 74 }
                ]
            }
        }
    })

    // Demo Tasks
    await prisma.task.createMany({
        data: [
            { title: "Подписаться на канал", description: "Подпишись на наш основной канал", points: 50, type: "SUBSCRIPTION", channelId: "@dota2news" },
            { title: "Пригласить друга", description: "Пригласи друга по реф ссылке", points: 100, type: "REFERRAL" }
        ]
    })

    console.log('Seed completed')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
