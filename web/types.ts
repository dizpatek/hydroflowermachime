export enum GrowthPhase {
  GERMINATION = 'Evre 0a: Çimlenme',
  SEEDLING = 'Evre 0b: Fide',
  VEGETATIVE = 'Evre 1: Vejetatif',
  EARLY_FLOWER = 'Evre 2a: Erken Çiçeklenme',
  LATE_FLOWER = 'Evre 2b: Geç Çiçeklenme',
  FLUSH = 'Evre 3: Hasat Öncesi Yıkama'
}

export enum SystemMode {
  OBSERVE = 'OBSERVE',
  SUGGEST = 'SUGGEST',
  ACT = 'ACT'
}

export enum ActuatorState {
  OFF = 'OFF',
  ON = 'ON'
}

export interface PhaseConfig {
  id: string;
  name: string;
  phMin: number;
  phMax: number;
  tdsMin: number;
  tdsMax: number;
  tempWaterMin: number;
  tempWaterMax: number;
  humidityMin: number;
  humidityMax: number;
  lightCycle: string; // "18/6" or "12/12"
}

export interface SensorData {
  timestamp: number;
  ph: number;
  tds: number;
  waterTemp: number;
  airTemp: number;
  humidity: number;
  co2?: number;
  orp: number; // mV (Oxidation-Reduction Potential)
  waterLevel: 'OK' | 'LOW';
  flowRate: number; // L/min
}

export interface SystemLog {
  id: string;
  timestamp: number;
  level: 'INFO' | 'WARNING' | 'CRITICAL' | 'AI_DECISION';
  message: string;
  confidence?: number; // 0.0 - 1.0
}