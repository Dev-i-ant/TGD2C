import { prisma } from "./prisma";
import { openCaseAction } from "@/app/actions/user";

/**
 * Main game loop for a battle
 */
export async function runBattle(battleId: string) {
    const io = (global as any).io;
    if (!io) {
        console.error("[BattleLogic] Socket.io not found in global scope");
        return;
    }

    try {
        // 1. Fetch battle data with participants and cases
        const battle = await prisma.battle.findUnique({
            where: { id: battleId },
            include: {
                participants: true,
                cases: { include: { case: true }, orderBy: { order: 'asc' } }
            }
        });

        if (!battle || battle.status !== 'WAITING') return;

        // 2. Transition to IN_PROGRESS
        await prisma.battle.update({
            where: { id: battleId },
            data: { status: 'IN_PROGRESS' }
        });

        io.to(`battle:${battleId}`).emit("battle-started", { battleId });

        // 3. Countdown 3-2-1
        for (let i = 3; i > 0; i--) {
            io.to(`battle:${battleId}`).emit("countdown", { seconds: i });
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        io.to(`battle:${battleId}`).emit("countdown", { seconds: 0 });

        // 4. Process each round (each case)
        const totalRounds = battle.cases.length;

        for (let roundIndex = 0; roundIndex < totalRounds; roundIndex++) {
            const currentBattleCase = battle.cases[roundIndex];
            const roundResults: any[] = [];

            // Fetch all possible rewards for this case once
            const rewards = await prisma.reward.findMany({
                where: { caseId: currentBattleCase.caseId, userId: null }
            });

            if (rewards.length === 0) continue;

            // Process each participant
            for (const participant of battle.participants) {
                // Return to classic random (no unique items restriction as requested)
                const pool = rewards;

                const totalWeight = pool.reduce((sum, r) => sum + r.weight, 0);
                let random = Math.random() * totalWeight;
                let pickedReward = pool[0];

                for (const r of pool) {
                    if (random < r.weight) {
                        pickedReward = r;
                        break;
                    }
                    random -= r.weight;
                }

                const value = pickedReward.sellPrice || Math.floor(pickedReward.weight / 2) || 10;

                // Record reward
                await prisma.battleReward.create({
                    data: {
                        battleId: battle.id,
                        participantId: participant.id,
                        roundIndex,
                        rewardId: pickedReward.id,
                        value
                    }
                });

                // Update participant total value
                await prisma.battleParticipant.update({
                    where: { id: participant.id },
                    data: { totalValue: { increment: value } }
                });

                roundResults.push({
                    participantId: participant.id,
                    reward: pickedReward,
                    value
                });
            }

            // Emit round results
            io.to(`battle:${battleId}`).emit("round-finished", {
                roundIndex,
                results: roundResults
            });

            // Wait for animation (6s animation + 0.5s buffer)
            await new Promise(resolve => setTimeout(resolve, 6500));
        }

        // 5. Determine Winner
        const finalParticipants = await prisma.battleParticipant.findMany({
            where: { battleId: battle.id },
            include: { user: true }
        });

        // Sort by total value
        const sorted = [...finalParticipants].sort((a, b) =>
            battle.isCrazyMode ? a.totalValue - b.totalValue : b.totalValue - a.totalValue
        );
        const winner = sorted[0];
        const isTie = sorted.length > 1 && sorted[0].totalValue === sorted[1].totalValue;

        // 6. Handle Rewards distribution
        if (isTie) {
            // Tie-break: everyone gets their own (but they already "paid" for them in entry fee?)
            // Actually in CSGO cases, if it's a tie, no one steals anything.
            // But let's follow the user's logic: "Если ничья, то игроки получают те предметы что они получили."

            for (const p of finalParticipants) {
                if (!p.isBot && p.userId) {
                    // Collect all his rewards in this battle
                    const pRewards = await prisma.battleReward.findMany({
                        where: { battleId: battle.id, participantId: p.id },
                        include: { reward: true }
                    });

                    for (const br of pRewards) {
                        await prisma.reward.create({
                            data: {
                                name: br.reward.name,
                                rarity: br.reward.rarity,
                                image: br.reward.image,
                                weight: br.reward.weight,
                                sellPrice: br.reward.sellPrice,
                                caseId: br.reward.caseId,
                                userId: p.userId,
                                status: 'IN_STOCK'
                            }
                        });
                    }
                }
            }
        } else {
            // Winner takes all from everyone
            if (!winner.isBot && winner.userId) {
                const allRewards = await prisma.battleReward.findMany({
                    where: { battleId: battle.id },
                    include: { reward: true }
                });

                for (const br of allRewards) {
                    await prisma.reward.create({
                        data: {
                            name: br.reward.name,
                            rarity: br.reward.rarity,
                            image: br.reward.image,
                            weight: br.reward.weight,
                            sellPrice: br.reward.sellPrice,
                            caseId: br.reward.caseId,
                            userId: winner.userId,
                            status: 'IN_STOCK'
                        }
                    });
                }

                // Log winner transaction (optional, maybe a credit log for "stolen" value)
                // But usually we just add items to inventory.
            }
        }

        // 7. Finalize Battle
        await prisma.battle.update({
            where: { id: battleId },
            data: { status: 'FINISHED', winnerId: isTie ? null : winner.id }
        });

        io.to(`battle:${battleId}`).emit("battle-finished", {
            winner: isTie ? null : winner,
            isTie
        });

    } catch (error) {
        console.error("[BattleLogic] Error in runBattle:", error);
    }
}
