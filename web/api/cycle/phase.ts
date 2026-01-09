import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import { PHASE_PARAMETERS } from '../../constants.js'; // Note: Ensure this import works or copy constants
import { GrowthPhase } from '../../types.js';

const prisma = new PrismaClient();

// Re-define constants locally if import is tricky in serverless structure without Proper build step handling for shared files
// But Vite build usually handles it. Let's try importing first. If it fails, we inline.
// Actually, for Vercel functions, relative imports outside api dir can be tricky if not bundled. 
// Safest is to duplicate constants here or ensure tsconfig includes them. 
// Given the setup, I'll inline the minimal needed constants to be safe and fast.

const PHASE_PARAMS: Record<string, any> = {
    'GERMINATION': { phMin: 5.8, phMax: 6.2, tdsMin: 0, tdsMax: 150 },
    'SEEDLING': { phMin: 5.8, phMax: 6.2, tdsMin: 0, tdsMax: 400 },
    'VEGETATIVE': { phMin: 5.6, phMax: 6.2, tdsMin: 500, tdsMax: 900 },
    'EARLY_FLOWER': { phMin: 5.8, phMax: 6.3, tdsMin: 900, tdsMax: 1100 },
    'LATE_FLOWER': { phMin: 6.0, phMax: 6.5, tdsMin: 1100, tdsMax: 1300 },
    'FLUSH': { phMin: 6.0, phMax: 6.3, tdsMin: 0, tdsMax: 200 }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { phase } = req.body;

        // Validasyon
        if (!PHASE_PARAMS[phase]) {
            return res.status(400).json({ error: 'Invalid phase' });
        }

        let cycle = await prisma.growthCycle.findFirst({
            orderBy: { createdAt: 'desc' }
        });

        if (!cycle) {
            cycle = await prisma.growthCycle.create({
                data: {
                    phase,
                    parameters: JSON.stringify(PHASE_PARAMS[phase])
                }
            });
        }

        // Close previous history
        const lastHistory = await prisma.growthPhaseHistory.findFirst({
            orderBy: { startDate: 'desc' }
        });

        if (lastHistory && !lastHistory.endDate) {
            await prisma.growthPhaseHistory.update({
                where: { id: lastHistory.id },
                data: { endDate: new Date() }
            });
        }

        // Create new history
        await prisma.growthPhaseHistory.create({
            data: {
                phase,
                startDate: new Date()
            }
        });

        // Update cycle
        const updatedCycle = await prisma.growthCycle.update({
            where: { id: cycle.id },
            data: {
                phase,
                parameters: JSON.stringify(PHASE_PARAMS[phase])
            }
        });

        // Log system event
        await prisma.systemLog.create({
            data: {
                level: 'INFO',
                message: `Growth phase changed to ${phase}`,
                source: 'user'
            }
        });

        res.json({ success: true, cycle: updatedCycle });
    } catch (error) {
        console.error('Failed to update phase:', error);
        res.status(500).json({ error: 'Failed to update phase' });
    } finally {
        await prisma.$disconnect();
    }
}
