# HydroFlower Vercel Deployment Guide

## ✅ Yapılan Değişiklikler (Son Güncelleme)

### 1. Vercel Serverless Functions
- ✅ `/api/auth/login` - Authentication endpoint
- ✅ `/api/health/db` - Database health check
- ✅ `/api/sensors/history` - Sensor data history
- ✅ `/api/cycle/current` - Current growth cycle
- ✅ `/api/notifications` - Notifications list
- ✅ `/api/esp32/config` - ESP32 configuration

### 2. SPA Routing Düzeltmeleri
- `vercel.json` güncellendi - tüm route'lar index.html'e yönlendiriliyor
- Serverless functions için runtime ayarlandı

### 3. Debug Logging Eklendi
- GlobalDebugger component eklendi
- Login flow'da console.log'lar eklendi
- Dashboard render'ında console.log'lar eklendi

## 🚀 Vercel'de Yapılması Gerekenler

### Environment Variables (ÖNEMLİ!)
Vercel Dashboard > Settings > Environment Variables bölümünde şunları ekleyin:

```
DATABASE_URL=your_postgresql_database_url_here
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here (opsiyonel)
```

**DATABASE_URL Örneği:**
```
postgresql://user:password@host:5432/database?sslmode=require
```

### Build & Output Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node Version**: 20.x

### Root Directory
Eğer monorepo kullanıyorsanız:
- **Root Directory**: `web`

## 🔍 Debugging

### Browser Console'da Kontrol Edilecekler

1. **Login sırasında:**
   ```
   Login attempt: { username: "...", apiUrl: "..." }
   Login successful: { token: "...", user: {...} }
   Navigating to dashboard...
   ```

2. **Dashboard yüklenirken:**
   ```
   ProtectedRoute check: { hasToken: true, token: "..." }
   Token found, rendering protected content
   Dashboard component rendering...
   ```

3. **Debug Overlay:**
   - Sağ alt köşede "🐞 Debug" butonuna tıklayın
   - Auth token durumunu kontrol edin
   - API URL'i kontrol edin

### API Test Komutları

```bash
# Health check
curl https://hydroflowermachime.vercel.app/api/health/db

# Login test
curl -X POST https://hydroflowermachime.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"jack","password":"duffy"}'
```

## ⚠️ Bilinen Sınırlamalar

### WebSocket Desteği
Vercel serverless functions WebSocket desteklemiyor. WebSocket özellikleri için:
1. Backend'i Railway/Render'a deploy edin
2. Frontend'de WS_URL environment variable'ını ayarlayın

### Dosya Sistemi
Vercel serverless functions read-only filesystem kullanır:
- Backup indirme çalışmayabilir
- Log dosyaları yazılamaz

## ✅ Test Adımları

1. ✅ Build başarılı mı? → `npm run build`
2. ✅ Local'de çalışıyor mu? → `npm run preview`
3. ✅ Vercel'e deploy edildi → `git push`
4. 🔄 Environment variables ayarlandı mı?
5. 🔄 Database bağlantısı çalışıyor mu? → `/api/health/db`
6. 🔄 Login çalışıyor mu? → Test edin

## 📝 Deploy Komutu

```bash
# Değişiklikleri commit et
git add .
git commit -m "feat: add serverless API functions"

# Vercel'e push et
git push origin master
```

## 🔧 Vercel CLI ile Deploy (Alternatif)

```bash
# Vercel CLI kur (ilk kez)
npm i -g vercel

# Deploy et
vercel --prod
```

## 🐛 Sorun Giderme

### 1. "500 Internal Server Error" on Login
**Sebep**: DATABASE_URL eksik veya yanlış
**Çözüm**: Vercel dashboard'dan DATABASE_URL'i kontrol edin

### 2. "Invalid credentials" hatası
**Sebep**: Database'de user yok
**Çözüm**: Local'de `npm run seed` çalıştırın

### 3. Blank page after login
**Sebep**: Token kaydedildi ama route çalışmıyor
**Çözüm**: Browser console'u kontrol edin, Debug overlay'i açın
