import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'path'

const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
const dbUrl = `file://${dbPath}`;

const adapter = new PrismaLibSql({
    url: dbUrl,
});

const prisma = new PrismaClient({
    adapter,
})

async function main() {
    console.log('Fixing and Expanding Dota 2 cases...')

    // 1. Delete previous cases to avoid mess
    const namesToDelete = ["The Arcana Reliquary", "Collector's Stash", "Heroic Arsenal"];
    await prisma.case.deleteMany({
        where: { name: { in: namesToDelete } }
    });
    console.log('Deleted old cases.');

    // Case 1: The Arcana Reliquary (Expanded & Fixed)
    await prisma.case.create({
        data: {
            name: "The Arcana Reliquary",
            price: 3000,
            image: "https://liquipedia.net/commons/images/a/a9/Cosmetic_icon_The_Magus_Cypher.png",
            rarity: "ARCANA",
            color: "bg-green-500",
            rewards: {
                create: [
                    { name: "Magus Cypher (Rubick)", rarity: "ARCANA", weight: 10, sellPrice: 3500, image: "https://liquipedia.net/commons/images/a/a9/Cosmetic_icon_The_Magus_Cypher.png" },
                    { name: "Bladeform Legacy (Juggernaut)", rarity: "ARCANA", weight: 10, sellPrice: 3000, image: "https://liquipedia.net/commons/images/4/44/Cosmetic_icon_Bladeform_Legacy_Bundle.png" },
                    { name: "Demon Eater (Shadow Fiend)", rarity: "ARCANA", weight: 10, sellPrice: 2800, image: "https://liquipedia.net/commons/images/8/81/Cosmetic_icon_Demon_Eater.png" },
                    { name: "Feast of Abscession (Pudge)", rarity: "ARCANA", weight: 10, sellPrice: 2700, image: "https://liquipedia.net/commons/images/c/c9/Cosmetic_icon_Feast_of_Abscession.png" },
                    { name: "Manifold Paradox (PA)", rarity: "ARCANA", weight: 10, sellPrice: 2500, image: "https://liquipedia.net/commons/images/4/4d/Cosmetic_icon_Manifold_Paradox_Bundle.png" },
                    { name: "Frost Avalanche (CM)", rarity: "ARCANA", weight: 10, sellPrice: 2400, image: "https://liquipedia.net/commons/images/2/2f/Cosmetic_icon_Frost_Avalanche.png" },
                    { name: "Blades of Voth Domosh (LC)", rarity: "ARCANA", weight: 10, sellPrice: 2600, image: "https://liquipedia.net/commons/images/b/b1/Cosmetic_icon_Blades_of_Voth_Domosh.png" },
                    { name: "Fiery Soul of the Slayer (Lina)", rarity: "ARCANA", weight: 10, sellPrice: 2200, image: "https://liquipedia.net/commons/images/7/77/Cosmetic_icon_Fiery_Soul_of_the_Slayer.png" },
                    { name: "Swine of the Sunken Galley (Techies)", rarity: "ARCANA", weight: 10, sellPrice: 2000, image: "https://liquipedia.net/commons/images/a/ad/Cosmetic_icon_Swine_of_the_Sunken_Galley.png" },
                    { name: "Fractal Horns of Inner Abysm (TB)", rarity: "ARCANA", weight: 10, sellPrice: 2800, image: "https://liquipedia.net/commons/images/a/a8/Cosmetic_icon_Fractal_Horns_of_Inner_Abysm.png" }
                ]
            }
        }
    });

    // Case 2: Collector's Stash (Fixed & Expanded with Jackpot Arcanas)
    await prisma.case.create({
        data: {
            name: "Collector's Stash",
            price: 350,
            image: "https://liquipedia.net/commons/images/4/40/Cosmetic_icon_Dragonclaw_Hook.png",
            rarity: "IMMORTAL",
            color: "bg-orange-500",
            rewards: {
                create: [
                    { name: "Dragonclaw Hook", rarity: "IMMORTAL", weight: 1, sellPrice: 50000, image: "https://liquipedia.net/commons/images/4/40/Cosmetic_icon_Dragonclaw_Hook.png" },
                    { name: "Golden Silent Wake", rarity: "IMMORTAL", weight: 1, sellPrice: 80000, image: "https://liquipedia.net/commons/images/b/bd/Cosmetic_icon_Golden_Silent_Wake.png" },
                    { name: "The One True King (WK Arcana)", rarity: "ARCANA", weight: 5, sellPrice: 8000, image: "https://liquipedia.net/commons/images/1/16/Cosmetic_icon_The_One_True_King_Bundle.png" },
                    { name: "Phantom Advent (Spectre Arcana)", rarity: "ARCANA", weight: 5, sellPrice: 7500, image: "https://liquipedia.net/commons/images/1/19/Cosmetic_icon_Phantom_Advent_Bundle.png" },
                    { name: "Dread Retribution (Drow Arcana)", rarity: "ARCANA", weight: 5, sellPrice: 7000, image: "https://liquipedia.net/commons/images/9/9b/Cosmetic_icon_Dread_Retribution_Bundle.png" },
                    { name: "Great Sage's Reckoning (MK Arcana)", rarity: "ARCANA", weight: 15, sellPrice: 2500, image: "https://liquipedia.net/commons/images/9/92/Cosmetic_icon_Great_Sage%27s_Reckoning.png" },
                    { name: "Flockheart's Gamble (Ogre Arcana)", rarity: "ARCANA", weight: 15, sellPrice: 2400, image: "https://liquipedia.net/commons/images/2/25/Cosmetic_icon_Flockheart%27s_Gamble.png" },
                    { name: "Tempest Helm of the Thundergod (Zeus)", rarity: "ARCANA", weight: 15, sellPrice: 2300, image: "https://liquipedia.net/commons/images/3/3b/Cosmetic_icon_Tempest_Helm_of_the_Thundergod.png" },
                    { name: "Pyrexaec Forge", rarity: "IMMORTAL", weight: 19, sellPrice: 30, image: "https://liquipedia.net/commons/images/d/dc/Cosmetic_icon_Pyrexaec_Forge.png" },
                    { name: "Horns of the Betrayer", rarity: "IMMORTAL", weight: 19, sellPrice: 40, image: "https://liquipedia.net/commons/images/b/b5/Cosmetic_icon_Horns_of_the_Betrayer.png" }
                ]
            }
        }
    });

    // Case 3: Heroic Arsenal (Fixed Set Images)
    await prisma.case.create({
        data: {
            name: "Heroic Arsenal",
            price: 50,
            image: "https://liquipedia.net/commons/images/6/65/Cosmetic_icon_The_Spellbinder%27s_Shape_Set.png",
            rarity: "RARE",
            color: "bg-blue-600",
            rewards: {
                create: [
                    { name: "The Spellbinder's Shape", rarity: "RARE", weight: 10, sellPrice: 300, image: "https://liquipedia.net/commons/images/6/65/Cosmetic_icon_The_Spellbinder%27s_Shape_Set.png" },
                    { name: "Guise of the Winged Bolt", rarity: "RARE", weight: 20, sellPrice: 200, image: "https://liquipedia.net/commons/images/1/1d/Cosmetic_icon_Guise_of_the_Winged_Bolt.png" },
                    { name: "Perception of the First Light", rarity: "RARE", weight: 30, sellPrice: 150, image: "https://liquipedia.net/commons/images/8/86/Cosmetic_icon_Perception_of_the_First_Light.png" },
                    { name: "Blessing of the Crested Dawn", rarity: "UNCOMMON", weight: 40, sellPrice: 50, image: "https://liquipedia.net/commons/images/1/14/Cosmetic_icon_Blessing_of_the_Crested_Dawn.png" }
                ]
            }
        }
    });

    console.log('Update completed successfully!');
}

main()
    .catch((e) => {
        console.error('Update failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
