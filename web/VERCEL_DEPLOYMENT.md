# HydroFlower Vercel Deployment Guide

## Yapılan Değişiklikler

### 1. SPA Routing Düzeltmeleri
- `vercel.json` güncellendi - tüm route'lar index.html'e yönlendiriliyor
- `public/_redirects` dosyası eklendi (fallback için)
- Import path'leri düzeltildi (.js uzantıları kaldırıldı)

### 2. Debug Logging Eklendi
- Login flow'da console.log'lar eklendi
- Dashboard render'ında console.log'lar eklendi
- ProtectedRoute'da token kontrolü log'lanıyor
- Root component'te hata yakalama eklendi

### 3. Güvenlik İyileştirmeleri
- Sensor data'ya safe access eklendi (optional chaining)
- Null/undefined kontrolü yapılıyor

## Vercel'de Yapılması Gerekenler

### Environment Variables
Vercel Dashboard > Settings > Environment Variables bölümünde şunları ekleyin:

```
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=your_database_url_here
JWT_SECRET=your_jwt_secret_here
```

### Build & Output Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Root Directory
Eğer monorepo kullanıyorsanız:
- **Root Directory**: `web`

## Debugging

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

3. **Hata varsa:**
   - Network tab'ı kontrol edin
   - API endpoint'lerin doğru çalıştığını kontrol edin
   - CORS hatası var mı kontrol edin

## Olası Sorunlar ve Çözümleri

### 1. Blank Page After Login
**Sebep**: SPA routing düzgün çalışmıyor
**Çözüm**: ✅ vercel.json ve _redirects dosyaları eklendi

### 2. API Calls Failing
**Sebep**: Environment variables eksik
**Çözüm**: Vercel dashboard'dan environment variables ekleyin

### 3. WebSocket Connection Failed
**Sebep**: Vercel serverless functions WebSocket desteklemiyor
**Çözüm**: WebSocket için ayrı bir backend servisi kullanın (Railway, Render, vb.)

### 4. Database Connection Error
**Sebep**: DATABASE_URL yanlış veya eksik
**Çözüm**: Vercel'de doğru DATABASE_URL'i ayarlayın

## Test Adımları

1. ✅ Build başarılı mı? → `npm run build`
2. ✅ Local'de çalışıyor mu? → `npm run preview`
3. 🔄 Vercel'e deploy et → `git push`
4. 🔄 Browser console'u kontrol et
5. 🔄 Network tab'ı kontrol et

## Deploy Komutu

```bash
# Değişiklikleri commit et
git add .
git commit -m "fix: SPA routing and add debug logging"

# Vercel'e push et
git push origin main
```

## Vercel CLI ile Deploy (Alternatif)

```bash
# Vercel CLI kur (ilk kez)
npm i -g vercel

# Deploy et
vercel --prod
```
