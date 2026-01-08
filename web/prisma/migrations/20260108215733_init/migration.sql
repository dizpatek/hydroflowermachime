-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ESP32Config" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wifiSSID" TEXT NOT NULL,
    "wifiPassword" TEXT NOT NULL,
    "mqttBroker" TEXT NOT NULL DEFAULT 'broker.hivemq.com',
    "mqttPort" INTEGER NOT NULL DEFAULT 1883,
    "sensorPins" TEXT NOT NULL,
    "pumpPins" TEXT NOT NULL,
    "cameraUrl" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SensorData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ph" REAL NOT NULL,
    "tds" INTEGER NOT NULL,
    "waterTemp" REAL NOT NULL,
    "airTemp" REAL NOT NULL,
    "humidity" REAL NOT NULL,
    "flowRate" REAL NOT NULL,
    "waterLevel" TEXT NOT NULL,
    "orp" REAL NOT NULL DEFAULT 350.0
);

-- CreateTable
CREATE TABLE "GrowthCycle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phase" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "harvestDate" DATETIME,
    "autopilotActive" BOOLEAN NOT NULL DEFAULT false,
    "parameters" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "HealthCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imageUrl" TEXT NOT NULL,
    "analysis" TEXT NOT NULL,
    "healthScore" INTEGER NOT NULL,
    "actions" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'normal'
);

-- CreateTable
CREATE TABLE "SystemLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'system'
);

-- CreateTable
CREATE TABLE "AutopilotAction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "parameters" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "cycleId" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
