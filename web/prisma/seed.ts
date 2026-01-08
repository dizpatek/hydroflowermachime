import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create default admin user (jack/duffy)
    const hashedPassword = await bcrypt.hash('duffy', 10);
    const user = await prisma.user.upsert({
        where: { username: 'jack' },
        update: {},
        create: {
            username: 'jack',
            password: hashedPassword,
            role: 'admin',
        },
    });
    console.log('✅ Created user:', user.username);

    // Create default ESP32 configuration
    const esp32Config = await prisma.eSP32Config.upsert({
        where: { id: 'default' },
        update: {},
        create: {
            id: 'default',
            wifiSSID: 'YourWiFiSSID',
            wifiPassword: 'YourWiFiPassword',
            mqttBroker: 'broker.hivemq.com',
            mqttPort: 1883,
            sensorPins: JSON.stringify({ ph: 34, tds: 35, temp: 32, moisture: 33 }),
            pumpPins: JSON.stringify({ circ: 12, phUp: 13, phDown: 14, nuteA: 27, nuteB: 26 }),
            cameraUrl: 'http://192.168.1.100:81/stream',
        },
    });
    console.log('✅ Created ESP32 config');

    // Create initial growth cycle
    const growthCycle = await prisma.growthCycle.create({
        data: {
            phase: 'VEGETATIVE',
            startDate: new Date(),
            harvestDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
            autopilotActive: false,
            parameters: JSON.stringify({
                phMin: 5.5,
                phMax: 6.5,
                tdsMin: 800,
                tdsMax: 1200,
                tempMin: 18,
                tempMax: 22,
                humidityMin: 50,
                humidityMax: 70,
            }),
        },
    });
    console.log('✅ Created initial growth cycle');

    console.log('🎉 Seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
