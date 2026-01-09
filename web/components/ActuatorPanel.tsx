import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, Droplets, Sun, Wind, Waves } from 'lucide-react';
import { ActuatorStatusCard } from './ActuatorStatusCard';

interface ActuatorPanelProps {
    actuators?: {
        pumpMain: boolean;
        pumpPhUp: boolean;
        pumpPhDown: boolean;
        pumpNutrient: boolean;
        growLight: boolean;
        humidifier: boolean;
        fanSpeed: number;
    };
}

export function ActuatorPanel({ actuators }: ActuatorPanelProps) {
    const defaultActuators = {
        pumpMain: false,
        pumpPhUp: false,
        pumpPhDown: false,
        pumpNutrient: false,
        growLight: false,
        humidifier: false,
        fanSpeed: 0
    };

    const state = actuators || defaultActuators;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-6"
        >
            <div className="flex items-center gap-2 mb-6">
                <Zap className="w-6 h-6 text-purple-400" />
                <h3 className="font-bold text-white text-lg">Aktüatör Durumları</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <ActuatorStatusCard
                    name="Ana Pompa"
                    icon={<Waves className="w-4 h-4" />}
                    state={state.pumpMain}
                    color="blue"
                />

                <ActuatorStatusCard
                    name="pH Up"
                    icon={<Droplets className="w-4 h-4" />}
                    state={state.pumpPhUp}
                    lastRun="15 dk önce"
                    color="emerald"
                />

                <ActuatorStatusCard
                    name="pH Down"
                    icon={<Droplets className="w-4 h-4" />}
                    state={state.pumpPhDown}
                    lastRun="2 saat önce"
                    color="red"
                />

                <ActuatorStatusCard
                    name="Besin"
                    icon={<Droplets className="w-4 h-4" />}
                    state={state.pumpNutrient}
                    lastRun="1 gün önce"
                    color="yellow"
                />

                <ActuatorStatusCard
                    name="Grow Light"
                    icon={<Sun className="w-4 h-4" />}
                    state={state.growLight}
                    schedule="6:00-22:00"
                    color="yellow"
                />

                <ActuatorStatusCard
                    name="Humidifier"
                    icon={<Activity className="w-4 h-4" />}
                    state={state.humidifier}
                    color="purple"
                />

                <ActuatorStatusCard
                    name="Fan"
                    icon={<Wind className="w-4 h-4" />}
                    state={state.fanSpeed > 0}
                    speed={state.fanSpeed}
                    color="cyan"
                />
            </div>
        </motion.div>
    );
}
