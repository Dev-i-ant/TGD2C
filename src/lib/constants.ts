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
