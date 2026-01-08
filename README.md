# HydroFlower Machine Pro AI 🌿🤖

Bu proje, otonom hidroponik yetiştirme sistemleri için geliştirilmiş hepsi-bir-arada bir kontrol merkezidir. İki ana bileşenden oluşur:

## 🚀 Sistem Bileşenleri

### 1. Web Dashboard (`/web`)
Modern, premium ve yapay zeka destekli kullanıcı arayüzü.
- **Teknoloji**: React 19, Vite, Tailwind CSS, Framer Motion, Recharts.
- **Özellikler**: 
  - Gerçek zamanlı sensör verisi takibi (pH, TDS, Sıcaklık, Nem).
  - Otonom, Öneri ve Gözlem modları.
  - Aktüatör (pompa/ışık) kontrolü.
  - Sistem günlükleri ve AI karar mekanizması.

### 2. Firmware (`/firmware`)
ESP32/Arduino tabanlı donanım kontrol yazılımı.
- **Teknoloji**: C++, Arduino Framework, MQTT.
- **Özellikler**:
  - Sensör okuma ve kalibrasyon.
  - Pompa ve valf kontrolü.
  - WiFi & MQTT bağlantısı ile web arayüzüne veri aktarımı.

## 🛠 Kurulum ve Çalıştırma

### Web Arayüzü
```bash
cd web
npm install
npm run dev
```

### Donanım (Firmware)
1. `firmware/src/main.cpp` dosyasındaki WiFi bilgilerini güncelleyin.
2. PlatformIO veya Arduino IDE ile cihazınıza yükleyin.

## 📱 Vercel Deployment
Web arayüzünü Vercel'de yayınlamak için:
1. GitHub'a push yapın.
2. Vercel'de yeni proje oluşturun.
3. "Root Directory" olarak `web` klasörünü seçin.

---
Geliştirici: **Antigravity AI**
