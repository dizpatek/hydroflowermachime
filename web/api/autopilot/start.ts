import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { PHASE_PARAMETERS } from '../../constants.js';

const prisma = new PrismaClient();

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

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { password } = req.body;

        // Şifre kontrolü ("jack" kullanıcısı için)
        // Not: Gerçek senaryoda bu kontrol auth middleware ile JWT üzerinden yapılmalı 
        // ancak mevcut yapıda kullanıcıdan özel şifre istendiği için bu şekilde bırakıyoruz.
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
                data: { autopilotActive: true }
            });

            await prisma.systemLog.create({
                data: {
                    level: 'INFO',
                    message: 'Autopilot activated by user',
                    source: 'user'
                }
            });

            // WebSocket olmadığı için ESP32'ye emir gönderemiyoruz.
            // ESP32'nin bu durumu HTTP polling ile kontrol etmesi gerekecek (`/api/esp32/config` veya benzeri üzerinden).

            res.json({ success: true, message: 'Otopilot başlatıldı' });
        } else {
            res.status(404).json({ error: 'Aktif döngü bulunamadı' });
        }
    } catch (error) {
        console.error('Autopilot start error:', error);
        res.status(500).json({ error: 'Failed to start autopilot' });
    } finally {
        await prisma.$disconnect();
    }
}
