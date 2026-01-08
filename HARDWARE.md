# 🔌 HydroFlower Pro AI - Donanım Kurulum Kılavuzu

## 📦 Gerekli Malzemeler

### 🌿 Sensörler
| Parça | Adet | İşlev |
|-------|------|-------|
| TDS Sensör Modülü | 1 | Suda çözünmüş katı madde (besin yoğunluğu) ölçümü |
| PH4502C pH Sensör | 1 | Su pH değeri ölçümü |
| E-201-C pH Prob | 2 | pH sensörü probu (1 yedek) |
| DS18B20 | 1 | Su sıcaklığı ölçümü |
| DHT22 | 1 | Hava sıcaklığı ve nem ölçümü |
| DS3231 RTC Modülü | 1 | Gerçek zamanlı saat (sulama/ışık zamanlaması) |

### ⚙️ Kontrol ve Güç
| Parça | Adet | İşlev |
|-------|------|-------|
| ESP32-C3 DevKit | 1 | Ana kontrolcü (WiFi/Bluetooth) |
| 5V Röle Kartı (4-8 kanal) | 1 | Pompa, fan, ışık kontrolü |
| SSR-25DA Solid State Röle | 1 | LED/220V cihaz kontrolü (sessiz) |
| MOSFET PWM Modül (15A 400W) | 1 | DC motor/pompa PWM kontrolü |
| XL4015E Step Down Modül | 1 | 12V/24V → 5V dönüştürücü |

### 💧 Su ve Nem Yönetimi
| Parça | Adet | İşlev |
|-------|------|-------|
| Mini DC Brushless Pompa (12V 240L/h) | 1 | Ana su devridaimi |
| 12V NKP Peristaltik Pompa | 2-3 | pH ayarlama ve besin dozajı |
| Mini Humidifier Kit | 1 | Ortam nemi artırma |

### 💡 Aydınlatma
| Parça | Adet | İşlev |
|-------|------|-------|
| COB LED Grow Light Chip (Purple 220V) | 1 | Bitki büyümesi için spektrum |

---

## 🔧 ESP32-C3 Pin Bağlantıları

### Sensör Bağlantıları

#### TDS Sensörü
```
TDS Sensör → ESP32-C3
VCC        → 5V (Step-down çıkışı)
GND        → GND
AOUT       → GPIO 2 (ADC)
```

#### pH Sensörü (PH4502C)
```
PH4502C    → ESP32-C3
VCC        → 5V
GND        → GND
PO (Analog)→ GPIO 3 (ADC)
```
**Kalibrasyon:** pH 4.0 ve pH 7.0 buffer çözeltileri ile iki nokta kalibrasyonu yapın.

#### DS18B20 (Su Sıcaklığı)
```
DS18B20    → ESP32-C3
VCC (Red)  → 3.3V
GND (Black)→ GND
DATA (Yellow)→ GPIO 4 (OneWire)
```
**Not:** DATA ve VCC arasına 4.7kΩ pull-up direnci bağlayın.

#### DHT22 (Hava Sıcaklık/Nem)
```
DHT22      → ESP32-C3
VCC (Pin 1)→ 3.3V
DATA (Pin 2)→ GPIO 5
GND (Pin 4)→ GND
```

#### DS3231 RTC (Gerçek Zamanlı Saat)
```
DS3231     → ESP32-C3
VCC        → 3.3V
GND        → GND
SDA        → GPIO 6
SCL        → GPIO 7
```

---

### Aktüatör Bağlantıları

#### 5V Röle Modülü (4-8 Kanal)
```
Röle Modülü → ESP32-C3
VCC         → 5V (Step-down)
GND         → GND
IN1 (Ana Pompa) → GPIO 8
IN2 (pH Up)     → GPIO 9
IN3 (pH Down)   → GPIO 10
IN4 (Besin)     → GPIO 18
IN5 (Humidifier)→ GPIO 20
```

**Pompa Bağlantıları:**
```
12V Güç → Röle COM
Röle NO → Pompa (+)
Pompa (-) → 12V GND
```

#### SSR-25DA (Grow Light Kontrolü)
```
SSR-25DA   → ESP32-C3
DC+ (3-32V)→ GPIO 19
DC-        → GND

AC Side:
Input      → 220V AC
Output     → Grow Light
```

#### MOSFET PWM Modül (Fan Kontrolü)
```
MOSFET     → ESP32-C3
VCC        → 5V
GND        → GND
PWM        → GPIO 21

Load:
V+         → 12V
V-         → Fan (+)
Fan (-)    → 12V GND
```

---

## ⚡ Güç Kaynağı Şeması

```
220V AC
  │
  ├─→ SSR-25DA → Grow Light (220V)
  │
  └─→ 12V/24V DC Adaptör
        │
        ├─→ XL4015E Step-Down → 5V
        │     │
        │     ├─→ ESP32-C3 (5V/USB)
        │     ├─→ TDS Sensör (5V)
        │     ├─→ pH Sensör (5V)
        │     └─→ Röle Modülü (5V)
        │
        ├─→ Ana Pompa (12V)
        ├─→ Peristaltik Pompalar (12V)
        ├─→ Humidifier (12V)
        └─→ Fan (12V, PWM kontrollü)
```

**Önerilen Güç Kaynağı:** 12V 5A DC Adaptör (60W)

---

## 🧪 Kalibrasyon Prosedürleri

### pH Sensörü Kalibrasyonu

1. **İki Nokta Kalibrasyonu:**
   - pH 4.0 buffer çözeltisine daldırın
   - Serial Monitor'den voltaj değerini okuyun
   - `phCalibration_4` değişkenini güncelleyin
   - pH 7.0 buffer çözeltisine daldırın
   - Serial Monitor'den voltaj değerini okuyun
   - `phCalibration_7` değişkenini güncelleyin

2. **Firmware'de Güncelleme:**
```cpp
float phCalibration_4 = 3.0;   // Ölçtüğünüz voltaj
float phCalibration_7 = 2.5;   // Ölçtüğünüz voltaj
```

### TDS Sensörü Kalibrasyonu

1. **Standart Çözelti Kullanımı:**
   - 1413 µS/cm (707 ppm) kalibrasyon çözeltisi kullanın
   - Serial Monitor'den TDS değerini okuyun
   - Gerekirse formüldeki faktörü ayarlayın

---

## 🔒 Güvenlik Önlemleri

### Elektrik Güvenliği
- ⚠️ **220V AC bağlantıları sadece SSR üzerinden yapın**
- ⚠️ **Tüm 220V bağlantıları izole edin**
- ⚠️ **Su ile temas edebilecek bölgelerde IP65+ koruma kullanın**
- ⚠️ **Topraklama bağlantısı yapın**

### Su Güvenliği
- 💧 **Sensörleri su geçirmez kutulara yerleştirin**
- 💧 **Elektrik bağlantılarını su seviyesinin üstünde tutun**
- 💧 **Acil durum su seviye sensörü ekleyin**

### Sistem Güvenliği
- 🛡️ **Watchdog timer aktif (firmware otomatik reset)**
- 🛡️ **Sensör arıza tespiti**
- 🛡️ **Acil kapatma protokolleri**

---

## 📊 Beklenen Sensör Değer Aralıkları

| Parametre | Min | Optimal | Max | Birim |
|-----------|-----|---------|-----|-------|
| pH | 5.5 | 6.0 | 6.5 | - |
| TDS | 800 | 1000 | 1400 | ppm |
| Su Sıcaklığı | 18 | 20 | 24 | °C |
| Hava Sıcaklığı | 20 | 24 | 28 | °C |
| Nem | 50 | 60 | 70 | % |

---

## 🚀 İlk Kurulum Adımları

1. **Donanım Montajı:**
   - Tüm sensörleri yukarıdaki şemaya göre bağlayın
   - Güç bağlantılarını kontrol edin
   - Topraklama yapın

2. **Firmware Yükleme:**
   ```bash
   cd firmware
   pio run --target upload
   ```

3. **WiFi Yapılandırması:**
   - `main.cpp` dosyasında WiFi bilgilerini güncelleyin
   - WebSocket server IP'sini ayarlayın

4. **Kalibrasyon:**
   - pH sensörünü kalibre edin
   - TDS sensörünü test edin
   - RTC zamanını ayarlayın

5. **Test:**
   - Serial Monitor'den sensör değerlerini kontrol edin
   - Web arayüzünden bağlantıyı doğrulayın
   - Manuel pompa testleri yapın

---

## 🆘 Sorun Giderme

### Sensör Okumuyor
- Bağlantıları kontrol edin
- Voltaj seviyelerini ölçün (multimetre)
- Serial Monitor'den debug mesajlarını okuyun

### WiFi Bağlanamıyor
- SSID ve şifre doğruluğunu kontrol edin
- Router'ın 2.4GHz bandında olduğundan emin olun
- ESP32-C3'ü router'a yaklaştırın

### Pompa Çalışmıyor
- Röle modülü LED'lerini kontrol edin
- 12V güç kaynağını test edin
- Manuel röle testini yapın

---

**Destek:** GitHub Issues veya [email protected]
