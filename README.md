# 🌿 HydroFlower Machine Pro AI

**Otonom Hidroponik Yetiştirme Sistemi** - ESP32-C3 tabanlı, yapay zeka destekli, tam otomatik bitki yetiştirme platformu.

![Status](https://img.shields.io/badge/status-active-success.svg)
![Platform](https://img.shields.io/badge/platform-ESP32--C3-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## ✨ Özellikler

### 🤖 Yapay Zeka Destekli Kontrol
- **Gemini Vision API** ile günlük sağlık kontrolü
- Otomatik hastalık ve besin eksikliği tespiti
- Acil durum müdahale sistemi
- Makine öğrenmesi tabanlı optimizasyon

### 📊 Gerçek Zamanlı İzleme
- **7 farklı sensör** ile sürekli veri toplama
  - pH, TDS, Su Sıcaklığı, Hava Sıcaklığı, Nem, ORP, Akış
- WebSocket ile anlık veri aktarımı
- Grafiksel veri görselleştirme
- Geçmiş veri analizi

### ⚙️ Tam Otomasyon
- **Otonom Pilot Modu** (şifre korumalı)
- Otomatik pH dengesi (peristaltik pompa dozajı)
- Otomatik besin takviyesi
- RTC tabanlı ışık programlama
- Nem ve sıcaklık kontrolü

### 🔐 Güvenlik ve Yönetim
- Kullanıcı kimlik doğrulama (jack/duffy)
- Şifre korumalı kritik işlemler
- Acil durdurma protokolleri
- Sistem günlükleri ve uyarılar

---

## 🏗️ Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────┐
│                    WEB ARAYÜZÜ (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Login   │  │Dashboard │  │ Settings │  │  Admin   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                    WebSocket (Socket.io)
                            │
┌─────────────────────────────────────────────────────────────┐
│              BACKEND SERVER (Node.js + Express)             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │   API    │  │ WebSocket│  │  Gemini  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                             │
│              DATABASE (SQLite/PostgreSQL)                   │
└─────────────────────────────────────────────────────────────┘
                            │
                    WebSocket Client
                            │
┌─────────────────────────────────────────────────────────────┐
│                  ESP32-C3 FIRMWARE (C++)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SENSÖRLER                    AKTÜATÖRLER            │  │
│  │  • TDS Sensör                 • Ana Pompa           │  │
│  │  • pH Sensör                  • pH Up/Down Pompa    │  │
│  │  • DS18B20 (Su Sıc)          • Besin Pompası       │  │
│  │  • DHT22 (Hava)              • Grow Light (SSR)    │  │
│  │  • RTC DS3231                 • Humidifier          │  │
│  │                               • Fan (PWM)           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Proje Yapısı

```
HydroFlowerMachine/
├── web/                    # React Web Uygulaması
│   ├── pages/             # Login, Dashboard, Settings
│   ├── services/          # WebSocket, Gemini AI
│   ├── lib/               # Database, Auth
│   ├── prisma/            # Database schema & migrations
│   ├── server.ts          # Express API server
│   └── public/            # Static assets
│
├── firmware/              # ESP32-C3 Firmware
│   ├── src/
│   │   └── main.cpp      # Ana firmware kodu
│   └── platformio.ini    # PlatformIO yapılandırması
│
├── HARDWARE.md           # Donanım kurulum kılavuzu
└── README.md            # Bu dosya
```

---

## 🚀 Hızlı Başlangıç

### 1️⃣ Web Uygulaması

```bash
cd web

# Bağımlılıkları yükle
npm install

# Veritabanını oluştur
npx prisma migrate dev --name init

# Varsayılan kullanıcıyı ekle (jack/duffy)
npm run seed

# Geliştirme modunda başlat (frontend + backend)
npm run dev:all
```

**Tarayıcıda aç:** http://localhost:5173

### 2️⃣ ESP32-C3 Firmware

```bash
cd firmware

# WiFi bilgilerini güncelle (src/main.cpp)
# const char* ssid = "YOUR_WIFI_SSID";
# const char* password = "YOUR_WIFI_PASSWORD";

# Firmware'i yükle
pio run --target upload

# Serial Monitor
pio device monitor
```

### 3️⃣ Donanım Kurulumu

Detaylı donanım bağlantıları için: **[HARDWARE.md](./HARDWARE.md)**

---

## 🔧 Yapılandırma

### Ortam Değişkenleri (.env)

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
GEMINI_API_KEY="your-gemini-api-key"
ESP32_WEBSOCKET_URL="ws://localhost:8080"
```

### ESP32 Ayarları

Web arayüzünden **Settings → ESP32 Ayarları** bölümünden:
- WiFi SSID ve şifre
- MQTT broker ayarları
- Sensör pin yapılandırması
- Kamera URL'si

---

## 📱 Kullanım

### Giriş Yapma
- **Kullanıcı Adı:** jack
- **Şifre:** duffy

### Otonom Pilot Başlatma
1. Dashboard'da **"OTOPİLOT BAŞLAT"** butonuna tıklayın
2. Şifrenizi girin (duffy)
3. Sistem otomatik olarak:
   - pH dengesini korur
   - Besin seviyesini ayarlar
   - Işık programını yönetir
   - Sıcaklık ve nemi kontrol eder

### AI Sağlık Kontrolü
- Günlük otomatik kontrol: 12:00
- Manuel kontrol: Dashboard'dan tetiklenebilir
- Gemini Vision API bitki görüntüsünü analiz eder
- Hastalık, besin eksikliği ve stres tespiti
- Acil durumda otomatik müdahale

---

## 🛠️ Geliştirme

### Web Uygulaması Teknolojileri
- **Frontend:** React 19, Vite, TailwindCSS, Framer Motion
- **Backend:** Node.js, Express, Socket.io
- **Database:** Prisma ORM, SQLite/PostgreSQL
- **AI:** Google Gemini Vision API
- **Charts:** Recharts

### Firmware Teknolojileri
- **Platform:** ESP32-C3 (WiFi/Bluetooth)
- **Framework:** Arduino
- **Libraries:** 
  - WebSockets (Socket.io client)
  - OneWire (DS18B20)
  - DHT (DHT22)
  - RTClib (DS3231)
  - ArduinoJson

---

## 📊 Sensör Özellikleri

| Sensör | Ölçüm | Aralık | Doğruluk |
|--------|-------|--------|----------|
| **TDS** | Besin yoğunluğu | 0-2000 ppm | ±10 ppm |
| **pH** | Asitlik | 0-14 pH | ±0.1 pH |
| **DS18B20** | Su sıcaklığı | -55 to 125°C | ±0.5°C |
| **DHT22** | Hava sıc/nem | -40 to 80°C, 0-100% | ±0.5°C, ±2% |
| **RTC** | Zaman | - | ±2 ppm |

---

## 🔌 Donanım Gereksinimleri

### Temel Bileşenler
- ESP32-C3 DevKit (1x)
- TDS Sensör Modülü (1x)
- pH Sensör (PH4502C + Prob) (1x)
- DS18B20 Su Sıcaklık Sensörü (1x)
- DHT22 Hava Sensörü (1x)
- DS3231 RTC Modülü (1x)

### Güç ve Kontrol
- 5V Röle Modülü (4-8 kanal) (1x)
- SSR-25DA Solid State Röle (1x)
- MOSFET PWM Modül (15A) (1x)
- XL4015E Step-Down (1x)
- 12V 5A DC Adaptör (1x)

### Pompalar ve Işık
- Mini DC Pompa 12V (1x)
- Peristaltik Pompa 12V (2-3x)
- COB LED Grow Light 220V (1x)
- Mini Humidifier (1x)

**Toplam Maliyet:** ~$150-200

---

## 📈 Yol Haritası

- [x] Web arayüzü ve backend
- [x] Veritabanı entegrasyonu
- [x] Kimlik doğrulama sistemi
- [x] WebSocket real-time iletişim
- [x] Gemini AI entegrasyonu
- [x] ESP32-C3 firmware (tüm sensörler)
- [ ] Kamera entegrasyonu (ESP32-CAM)
- [ ] Mobil uygulama (React Native)
- [ ] E-posta/SMS bildirimleri
- [ ] Çoklu kullanıcı desteği
- [ ] Bulut senkronizasyonu

---

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

## 📄 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 👨‍💻 Geliştirici

**Antigravity AI Team**

- 🌐 Website: [hydroflowermachime.vercel.app](https://hydroflowermachime.vercel.app)
- 📧 Email: [email protected]
- 💬 Discord: HydroFlower Community

---

## 🙏 Teşekkürler

- Google Gemini AI Team
- ESP32 Community
- Open Source Contributors

---

<div align="center">

**⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!**

Made with ❤️ and 🌿 by Antigravity AI

</div>
