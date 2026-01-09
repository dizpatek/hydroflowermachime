import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { password } = req.body;

        const user = await prisma.user.findUnique({ where: { username: 'jack' } });
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Geçersiz şifre' });
        }

        const cycle = await prisma.growthCycle.findFirst({
            orderBy: { createdAt: 'desc' }
        });

        if (cycle) {
            await prisma.growthCycle.update({
                where: { id: cycle.id },
                data: { autopilotActive: false }
            });

            await prisma.systemLog.create({
                data: {
                    level: 'WARNING',
                    message: 'Autopilot deactivated by user',
                    source: 'user'
                }
            });

            res.json({ success: true, message: 'Otopilot durduruldu' });
        } else {
            res.status(404).json({ error: 'Aktif döngü bulunamadı' });
        }
    } catch (error) {
        console.error('Autopilot stop error:', error);
        res.status(500).json({ error: 'Failed to stop autopilot' });
    } finally {
        await prisma.$disconnect();
    }
}
