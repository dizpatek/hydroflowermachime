
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

        // 3. Health Endpoint (Public)
        console.log("3️⃣ Checking System Health Endpoint...");
        // Assuming there is a health endpoint or we check logs
        const logsRes = await axios.get(`${API_URL}/logs`); // Usually public or protected
        console.log("✅ Logs Endpoint Reachable");

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
