import { GrowthPhase, PhaseConfig } from './types';

export const PHASE_PARAMETERS: Record<GrowthPhase, PhaseConfig> = {
  [GrowthPhase.GERMINATION]: {
    id: '0a',
    name: 'Çimlenme',
    phMin: 5.8,
    phMax: 6.2,
    tdsMin: 0,
    tdsMax: 150,
    tempWaterMin: 20,
    tempWaterMax: 22,
    humidityMin: 70,
    humidityMax: 85,
    lightCycle: '18/6'
  },
  [GrowthPhase.SEEDLING]: {
    id: '0b',
    name: 'Fide Dönemi',
    phMin: 5.8,
    phMax: 6.2, // Updated to match merged range in Section 3.0
    tdsMin: 0,
    tdsMax: 400, // Updated to match Section 3.0
    tempWaterMin: 19,
    tempWaterMax: 22,
    humidityMin: 65,
    humidityMax: 80, // Updated to match Section 3.0
    lightCycle: '18/6'
  },
  [GrowthPhase.VEGETATIVE]: {
    id: '1',
    name: 'Vejetatif Büyüme',
    phMin: 5.6, // Matches Section 3.0
    phMax: 6.2,
    tdsMin: 500, // Matches Section 3.0
    tdsMax: 900,
    tempWaterMin: 18,
    tempWaterMax: 22,
    humidityMin: 55,
    humidityMax: 70,
    lightCycle: '18/6'
  },
  [GrowthPhase.EARLY_FLOWER]: {
    id: '2a',
    name: 'Erken Çiçeklenme',
    phMin: 5.8,
    phMax: 6.3,
    tdsMin: 900,
    tdsMax: 1100,
    tempWaterMin: 18,
    tempWaterMax: 21,
    humidityMin: 45,
    humidityMax: 55,
    lightCycle: '12/12'
  },
  [GrowthPhase.LATE_FLOWER]: {
    id: '2b',
    name: 'Geç Çiçeklenme',
    phMin: 6.0,
    phMax: 6.5,
    tdsMin: 1100,
    tdsMax: 1300,
    tempWaterMin: 18,
    tempWaterMax: 20,
    humidityMin: 40,
    humidityMax: 45,
    lightCycle: '12/12'
  },
  [GrowthPhase.FLUSH]: {
    id: '3',
    name: 'Hasat Öncesi Yıkama',
    phMin: 6.0,
    phMax: 6.3,
    tdsMin: 0,
    tdsMax: 200,
    tempWaterMin: 18,
    tempWaterMax: 20,
    humidityMin: 40,
    humidityMax: 45,
    lightCycle: '12/12'
  }
};