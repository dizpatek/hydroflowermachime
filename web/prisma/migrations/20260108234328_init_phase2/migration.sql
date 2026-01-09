-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ESP32Config" (
    "id" TEXT NOT NULL,
    "wifiSSID" TEXT NOT NULL,
    "wifiPassword" TEXT NOT NULL,
    "mqttBroker" TEXT NOT NULL DEFAULT 'broker.hivemq.com',
    "mqttPort" INTEGER NOT NULL DEFAULT 1883,
    "sensorPins" TEXT NOT NULL,
    "pumpPins" TEXT NOT NULL,
    "cameraUrl" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ESP32Config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensorData" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ph" DOUBLE PRECISION NOT NULL,
    "tds" INTEGER NOT NULL,
    "waterTemp" DOUBLE PRECISION NOT NULL,
    "airTemp" DOUBLE PRECISION NOT NULL,
    "humidity" DOUBLE PRECISION NOT NULL,
    "flowRate" DOUBLE PRECISION NOT NULL,
    "waterLevel" TEXT NOT NULL,
    "orp" DOUBLE PRECISION NOT NULL DEFAULT 350.0,

    CONSTRAINT "SensorData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrowthCycle" (
    "id" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "harvestDate" TIMESTAMP(3),
    "autopilotActive" BOOLEAN NOT NULL DEFAULT false,
    "parameters" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrowthCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthCheck" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imageUrl" TEXT NOT NULL,
    "analysis" TEXT NOT NULL,
    "healthScore" INTEGER NOT NULL,
    "actions" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'normal',

    CONSTRAINT "HealthCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "SystemLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutopilotAction" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "parameters" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "cycleId" TEXT,

    CONSTRAINT "AutopilotAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActuatorStatus" (
    "id" TEXT NOT NULL,
    "actuator" TEXT NOT NULL,
    "state" BOOLEAN NOT NULL,
    "lastChanged" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "speed" INTEGER,

    CONSTRAINT "ActuatorStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrowthPhaseHistory" (
    "id" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "GrowthPhaseHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Backup" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Backup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalibrationLog" (
    "id" TEXT NOT NULL,
    "sensor" TEXT NOT NULL,
    "values" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalibrationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
