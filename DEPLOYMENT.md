# ☁️ Vercel Deployment Guide

You requested support for Vercel deployment. Because Vercel is a "Serverless" platform, two major changes are required from your local setup:

## 1. Database (SQLite -> Postgres)
The current database (`dev.db`) is a local file. On Vercel, this file will be **deleted** every time the app sleeps (which is often). You must switch to a Cloud Database.

**Steps:**
1.  Create a free Postgres database on **[Neon.tech](https://neon.tech)** or **[Supabase](https://supabase.com)**.
2.  Get your connection string (e.g., `postgres://user:pass@endpoint.neon.tech/neondb`).
3.  Update `web/prisma/schema.prisma`:
    ```prisma
    datasource db {
      provider = "postgresql" // Change from "sqlite"
      url      = env("DATABASE_URL")
    }
    ```
4.  Delete `web/prisma/migrations` folder locally.
5.  Run `npx prisma migrate dev --name init` to create the tables in your new Cloud DB.
6.  In Vercel Project Settings, set `DATABASE_URL` to your cloud connection string.

## 2. WebSockets on Vercel
Standard Vercel functions have distinct timeout limits (10s-60s) which break persistent WebSocket connections (Socket.io).

**Options:**
- **Option A (Easier):** Deploy the backend (`server.ts`) to a VPS (DigitalOcean, Railway, Render) instead of Vercel. Keep the Frontend on Vercel.
- **Option B (Harder):** Refactor the app to use Pusher.com or Vercel AI SDK for real-time features instead of Socket.io.

## 3. Connecting ESP32
Once deployed, your ESP32 acts as a client.
- **Firmware Update**: In `firmware/src/main.cpp`, change `websocket_server` to your deployed domain (e.g., `hydroflower-api.railway.app`) and port to `443` (SSL).

## ✅ Current Local Setup (Ready to Test)
For now, your system is fully configured for **Local Testing**:
- **WiFi**: Murphy / sifreyok
- **Server**: Your PC (192.168.1.33)
- **Login**: jack / duffy (Fixed!)
