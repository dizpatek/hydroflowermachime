import { io, Socket } from 'socket.io-client';
import { WS_URL } from './config';

class WebSocketService {
    private socket: Socket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    connect(url: string = WS_URL) {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(url, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: this.maxReconnectAttempts
        });

        this.socket.on('connect', () => {
            console.log('✅ WebSocket connected');
            this.reconnectAttempts = 0;
        });

        this.socket.on('disconnect', () => {
            console.log('❌ WebSocket disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            this.reconnectAttempts++;
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    onSensorUpdate(callback: (data: any) => void) {
        this.socket?.on('sensor:update', callback);
    }

    onAutopilotStatus(callback: (status: { active: boolean }) => void) {
        this.socket?.on('autopilot:status', callback);
    }

    sendActuatorCommand(command: { pump: string; state: boolean; duration?: number; speed?: number }) {
        this.socket?.emit('actuator:control', command);
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

export const wsService = new WebSocketService();
