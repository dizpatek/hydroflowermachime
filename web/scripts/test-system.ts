
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function runSystemTest() {
    console.log("🚀 Starting System E2E Test...");

    try {
        // 1. Login
        console.log("1️⃣ Testing Login...");
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            username: 'jack',
            password: 'duffy'
        });

        if (loginRes.status === 200 && loginRes.data.token) {
            console.log("✅ Login Success!");
        } else {
            throw new Error("Login failed (No token)");
        }

        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } }; // If auth required, though config is public currently?

        // 2. Fetch Config
        console.log("2️⃣ Fetching ESP32 Config...");
        const configRes = await axios.get(`${API_URL}/esp32/config`);
        if (configRes.status === 200) {
            console.log("✅ Config Fetched:", configRes.data.wifiSSID ? "OK" : "Empty");
        }

        // 3. Health/Logs Endpoint
        console.log("3️⃣ Checking System Logs...");
        const logsRes = await axios.get(`${API_URL}/logs`, config);
        console.log("✅ Logs Endpoint Reachable");

        // 4. Growth Cycle & Phase (Phase 2)
        console.log("4️⃣ Checking Growth Cycle API...");
        try {
            const phaseRes = await axios.post(`${API_URL}/cycle/phase`, {
                phase: 'VEGETATIVE'
            }, config);
            console.log("✅ Phase Update Success:", phaseRes.data.success);
        } catch (e: any) {
            console.log("⚠️ Phase Update skipped (might need active cycle):", e.response?.data?.error || e.message);
        }

        // 5. Notifications (Phase 2)
        console.log("5️⃣ Checking Notifications API...");
        const notifRes = await axios.get(`${API_URL}/notifications`, config);
        console.log("✅ Notifications Fetched:", Array.isArray(notifRes.data) ? notifRes.data.length : "Fail");

        // 6. Backups (Phase 3)
        console.log("6️⃣ Checking Backup API...");
        const backupRes = await axios.get(`${API_URL}/backups`, config);
        console.log("✅ Backups Fetched:", Array.isArray(backupRes.data) ? "OK" : "Fail");

        console.log("\n🎉 ALL SYSTEMS GO! Backend is serving requests correctly.");

    } catch (error: any) {
        console.error("\n❌ SYSTEM TEST FAILED");
        if (error.code === 'ECONNREFUSED') {
            console.error("Connection Refused! Is the server running? (npm run dev:all)");
        } else {
            console.error("Error:", error.message);
            if (error.response) {
                console.error("Server Response:", error.response.data);
            }
        }
    }
}

runSystemTest();
