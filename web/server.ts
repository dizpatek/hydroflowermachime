import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { prisma } from './lib/db.js';
import { generateToken, comparePassword } from './lib/auth.js';

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
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to stop autopilot' });
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
