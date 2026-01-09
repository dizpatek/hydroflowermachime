import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { prisma } from './lib/db.js';
import { generateToken, comparePassword } from './lib/auth.js';
import { PHASE_PARAMETERS } from './constants.js';
import { GrowthPhase } from './types.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUP_DIR = path.join(__dirname, 'backups');

if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR);
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());

// ===== AUTHENTICATION ENDPOINTS =====
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(`Login attempt for user: ${username}`);

        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            console.log(`User not found: ${username}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
            console.log(`Invalid password for user: ${username}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken({
            userId: user.id,
            username: user.username,
            role: user.role
        });

        console.log(`Login successful for user: ${username}`);
        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed', details: error instanceof Error ? error.message : String(error) });
    }
});

// ===== DB HEALTH CHECK =====
app.get('/api/health/db', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'connected', database: 'ok' });
    } catch (error) {
        console.error('DB Health check failed:', error);
        res.status(500).json({
            status: 'error',
            message: 'Database connection failed',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

// ===== ESP32 CONFIGURATION =====
app.get('/api/esp32/config', async (req, res) => {
    try {
        const config = await prisma.eSP32Config.findFirst();
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch config' });
    }
});

app.put('/api/esp32/config', async (req, res) => {
    try {
        const config = await prisma.eSP32Config.update({
            where: { id: 'default' },
            data: req.body
        });
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update config' });
    }
});

// ===== SENSOR DATA =====
app.post('/api/sensors/data', async (req, res) => {
    try {
        const data = await prisma.sensorData.create({ data: req.body });

        // Broadcast to all connected clients
        io.emit('sensor:update', data);

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save sensor data' });
    }
});

app.get('/api/sensors/history', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 100;
        const data = await prisma.sensorData.findMany({
            take: limit,
            orderBy: { timestamp: 'desc' }
        });
        res.json(data.reverse());
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// ===== GROWTH CYCLE & AUTOPILOT =====
app.get('/api/cycle/current', async (req, res) => {
    try {
        const cycle = await prisma.growthCycle.findFirst({
            orderBy: { createdAt: 'desc' }
        });
        res.json(cycle);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cycle' });
    }
});

app.post('/api/cycle/phase', async (req, res) => {
    try {
        const { phase } = req.body;

        if (!Object.values(GrowthPhase).includes(phase)) {
            return res.status(400).json({ error: 'Invalid phase' });
        }

        // Get current cycle
        let cycle = await prisma.growthCycle.findFirst({
            orderBy: { createdAt: 'desc' }
        });

        if (!cycle) {
            // Create new cycle if none exists
            cycle = await prisma.growthCycle.create({
                data: {
                    phase,
                    parameters: JSON.stringify(PHASE_PARAMETERS[phase as GrowthPhase])
                }
            });
        }

        // Close previous history endpoint if exists
        const lastHistory = await prisma.growthPhaseHistory.findFirst({
            orderBy: { startDate: 'desc' }
        });

        if (lastHistory && !lastHistory.endDate) {
            await prisma.growthPhaseHistory.update({
                where: { id: lastHistory.id },
                data: { endDate: new Date() }
            });
        }

        // Create new history entry
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
                parameters: JSON.stringify(PHASE_PARAMETERS[phase as GrowthPhase])
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

        // If autopilot is active, update ESP32
        if (cycle.autopilotActive) {
            const params = PHASE_PARAMETERS[phase as GrowthPhase];
            io.emit('esp32:command', {
                settings: {
                    autopilot: true,
                    targetPH: (params.phMin + params.phMax) / 2,
                    targetTDS: (params.tdsMin + params.tdsMax) / 2
                }
            });
        }

        res.json({ success: true, cycle: updatedCycle });
    } catch (error) {
        console.error('Failed to update phase:', error);
        res.status(500).json({ error: 'Failed to update phase' });
    }
});

app.get('/api/cycle/history', async (req, res) => {
    try {
        const history = await prisma.growthPhaseHistory.findMany({
            orderBy: { startDate: 'desc' }
        });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

app.post('/api/autopilot/start', async (req, res) => {
    try {
        const { password } = req.body;

        // Verify password (should be "duffy")
        const user = await prisma.user.findUnique({ where: { username: 'jack' } });
        if (!user || !(await comparePassword(password, user.password))) {
            return res.status(401).json({ error: 'Invalid password' });
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

            const params = JSON.parse(cycle.parameters as string);

            // Send settings to ESP32
            io.emit('esp32:command', {
                settings: {
                    autopilot: true,
                    targetPH: (params.phMin + params.phMax) / 2,
                    targetTDS: (params.tdsMin + params.tdsMax) / 2
                }
            });

            io.emit('autopilot:status', { active: true });
            res.json({ success: true, message: 'Autopilot activated' });
        } else {
            res.status(404).json({ error: 'No active growth cycle' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to start autopilot' });
    }
});

app.post('/api/autopilot/stop', async (req, res) => {
    try {
        const { password } = req.body;

        const user = await prisma.user.findUnique({ where: { username: 'jack' } });
        if (!user || !(await comparePassword(password, user.password))) {
            return res.status(401).json({ error: 'Invalid password' });
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

            // Send disable command to ESP32
            io.emit('esp32:command', {
                settings: {
                    autopilot: false
                }
            });

            io.emit('autopilot:status', { active: false });
            res.json({ success: true, message: 'Autopilot deactivated' });
        } else {
            res.status(404).json({ error: 'No active growth cycle' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to stop autopilot' });
    }
});

// ===== NOTIFICATIONS =====
app.get('/api/notifications', async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

app.put('/api/notifications/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.notification.update({
            where: { id },
            data: { read: true }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark as read' });
    }
});

app.delete('/api/notifications', async (req, res) => {
    try {
        await prisma.notification.deleteMany();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear notifications' });
    }
});

// ===== BACKUPS =====
app.get('/api/backups', async (req, res) => {
    try {
        const backups = await prisma.backup.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(backups);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch backups' });
    }
});

app.post('/api/backups', async (req, res) => {
    try {
        // Fetch all data
        const data = {
            users: await prisma.user.findMany(),
            config: await prisma.eSP32Config.findMany(),
            sensors: await prisma.sensorData.findMany(),
            cycles: await prisma.growthCycle.findMany(),
            history: await prisma.growthPhaseHistory.findMany(),
            logs: await prisma.systemLog.findMany(),
            notifications: await prisma.notification.findMany(),
            timestamp: new Date().toISOString()
        };

        const filename = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        const filepath = path.join(BACKUP_DIR, filename);
        const jsonContent = JSON.stringify(data, null, 2);

        fs.writeFileSync(filepath, jsonContent);

        const backup = await prisma.backup.create({
            data: {
                filename,
                size: Buffer.byteLength(jsonContent)
            }
        });

        res.json(backup);
    } catch (error) {
        console.error('Backup failed:', error);
        res.status(500).json({ error: 'Backup creation failed' });
    }
});

app.get('/api/backups/:filename/download', (req, res) => {
    const filepath = path.join(BACKUP_DIR, req.params.filename);
    if (fs.existsSync(filepath)) {
        res.download(filepath);
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

app.delete('/api/backups/:id', async (req, res) => {
    try {
        const backup = await prisma.backup.findUnique({ where: { id: req.params.id } });
        if (backup) {
            const filepath = path.join(BACKUP_DIR, backup.filename);
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }
            await prisma.backup.delete({ where: { id: req.params.id } });
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Backup not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

// ===== HEALTH CHECKS =====
app.post('/api/health/analyze', async (req, res) => {
    try {
        const config = await prisma.eSP32Config.findFirst();
        if (!config || !config.cameraUrl) {
            return res.status(400).json({ error: 'Camera URL not configured' });
        }

        const { analyzeHealthFromCamera } = await import('./services/gemini.js');

        console.log('Triggering manual health check...');
        const analysis = await analyzeHealthFromCamera(config.cameraUrl);

        res.json(analysis);
    } catch (error) {
        console.error('Manual health check failed:', error);
        res.status(500).json({ error: 'Health analysis failed' });
    }
});

app.get('/api/health/latest', async (req, res) => {
    try {
        const check = await prisma.healthCheck.findFirst({
            orderBy: { timestamp: 'desc' }
        });
        res.json(check);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch health check' });
    }
});

app.get('/api/health/history', async (req, res) => {
    try {
        const checks = await prisma.healthCheck.findMany({
            take: 30,
            orderBy: { timestamp: 'desc' }
        });
        res.json(checks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch health history' });
    }
});

// ===== SYSTEM LOGS =====
app.get('/api/logs', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 50;
        const logs = await prisma.systemLog.findMany({
            take: limit,
            orderBy: { timestamp: 'desc' }
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// ===== WEBSOCKET HANDLERS =====
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('esp32:data', async (data) => {
        // Save sensor data from ESP32
        try {
            const saved = await prisma.sensorData.create({ data });
            io.emit('sensor:update', saved);
        } catch (error) {
            console.error('Failed to save ESP32 data:', error);
        }
    });

    socket.on('actuator:control', (command) => {
        // Forward actuator commands to ESP32
        io.emit('esp32:command', command);
    });

    socket.on('esp32:log', async (data) => {
        try {
            await prisma.systemLog.create({
                data: {
                    level: data.level || 'INFO',
                    message: data.message,
                    source: data.source || 'esp32'
                }
            });
        } catch (error) {
            console.error('Failed to save ESP32 log:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    httpServer.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📡 WebSocket server ready`);
    });
}

export { app, io };
export default app;
