
/// <reference types="vite/client" />

const isProd = import.meta.env.PROD;

// In production, we assume the API is on the same origin as the frontend
export const API_BASE_URL = isProd ? window.location.origin : 'http://localhost:3001';

// For WebSockets, we use the current origin if in production
export const WS_URL = isProd
    ? window.location.origin.replace(/^http/, 'ws')
    : 'ws://localhost:3001';
