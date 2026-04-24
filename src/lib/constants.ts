export const RARITIES = ['COMMON', 'UNCOMMON', 'RARE', 'MYTHICAL', 'LEGENDARY', 'ANCIENT', 'IMMORTAL', 'ARCANA'] as const;

export type Rarity = typeof RARITIES[number];

export const RARITY_COLORS: Record<Rarity, string> = {
    COMMON: 'text-gray-300 bg-gray-500/20 px-1.5 rounded',
    UNCOMMON: 'text-green-400 bg-green-500/20 px-1.5 rounded',
    RARE: 'text-blue-400 bg-blue-500/20 px-1.5 rounded',
    MYTHICAL: 'text-purple-400 bg-purple-500/20 px-1.5 rounded',
    LEGENDARY: 'text-pink-500 bg-pink-500/20 px-1.5 rounded',
    ANCIENT: 'text-red-500 bg-red-500/20 px-1.5 rounded',
    IMMORTAL: 'text-orange-500 bg-orange-500/20 px-1.5 rounded',
    ARCANA: 'text-green-300 bg-green-300/20 px-1.5 rounded',
};

export const RARITY_TEXT_COLORS: Record<Rarity, string> = {
    COMMON: 'text-gray-300',
    UNCOMMON: 'text-green-400',
    RARE: 'text-blue-400',
    MYTHICAL: 'text-purple-400',
    LEGENDARY: 'text-pink-500',
    ANCIENT: 'text-red-500',
    IMMORTAL: 'text-orange-500',
    ARCANA: 'text-green-300',
};

export const getRarityRank = (rarity: string): number => {
    const index = RARITIES.indexOf(rarity as Rarity);
    return index === -1 ? 0 : index;
};

export const getRarityColor = (rarity: string): string => {
    return RARITY_COLORS[rarity as Rarity] || 'text-white/40';
};

export const getRarityTextColor = (rarity: string): string => {
    return RARITY_TEXT_COLORS[rarity as Rarity] || 'text-white/40';
};

export const RARITY_BASELINES: Record<string, number> = {
    'COMMON': 5,
    'UNCOMMON': 15,
    'RARE': 50,
    'MYTHICAL': 150,
    'LEGENDARY': 500,
    'ANCIENT': 1500,
    'IMMORTAL': 5000,
    'ARCANA': 15000
};

export const ECONOMY_CONFIG: Record<Rarity, { multiplier: number; baseProbability: number }> = {
    ARCANA: { multiplier: 50.0, baseProbability: 1.0 },
    IMMORTAL: { multiplier: 4.0, baseProbability: 2.0 },
    ANCIENT: { multiplier: 2.0, baseProbability: 4.0 },
    LEGENDARY: { multiplier: 1.2, baseProbability: 6.0 },
    MYTHICAL: { multiplier: 0.5, baseProbability: 10.0 },
    RARE: { multiplier: 0.2, baseProbability: 15.0 },
    UNCOMMON: { multiplier: 0.1, baseProbability: 22.0 },
    COMMON: { multiplier: 0.05, baseProbability: 40.0 },
};

export const calculateSuggestedPrice = (rarity: string, casePrice: number): number => {
    const config = ECONOMY_CONFIG[rarity as Rarity] || ECONOMY_CONFIG.COMMON;
    return Math.max(1, Math.floor(casePrice * config.multiplier));
};

export const calculateSuggestedWeight = (rarity: string, itemsCountInRarity: number): number => {
    const config = ECONOMY_CONFIG[rarity as Rarity] || ECONOMY_CONFIG.COMMON;
    if (itemsCountInRarity <= 0) return 0;
    // We target a fixed total probability for the rarity group.
    // If there are 2 items in Mythical (10%), each gets weight that results in 5% each.
    // Since probability = weight / totalWeight, we can use 1000 * probability as weight units.
    return Math.max(1, Math.floor((config.baseProbability * 100) / itemsCountInRarity));
};

export const calculateEffectivePrice = (rarity: string, weight: number, customPrice?: number | null) => {
    if (customPrice !== null && customPrice !== undefined && customPrice > 0) return customPrice;

    const base = RARITY_BASELINES[rarity.toUpperCase()] || 10;
    const weightBonus = Math.floor(500 / Math.max(weight, 1));
    return base + weightBonus;
};

export function pickWeightedReward<T extends { weight: number }>(items: T[]): T {
    if (items.length === 0) {
        throw new Error('pickWeightedReward requires a non-empty list');
    }

    const totalWeight = items.reduce((acc, item) => acc + item.weight, 0);
    let randomNum = Math.random() * totalWeight;
    let winner = items[0];

    for (const item of items) {
        if (randomNum < item.weight) {
            winner = item;
            break;
        }
        randomNum -= item.weight;
    }

    return winner;
}

// --- Super Admin Configuration ---
// Configure via env: SUPER_ADMIN_IDS="123456789,987654321"
const rawSuperAdminIds = (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process?.env?.SUPER_ADMIN_IDS || '';

export const SUPER_ADMINS = rawSuperAdminIds
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
