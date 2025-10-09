# 🚀 BilgiBite Vercel Deployment Rehberi

## ⚠️ ÖNEMLİ DEĞİŞİKLİKLER (9 Ekim 2025)

✅ **Environment Variable Sorunu Çözüldü!**
- `CLIENT_URL` ve `FRONTEND_URL` artık **zorunlu değil**
- Production'da eksik olsa bile uygulama **crash olmayacak**
- Otomatik fallback: `bilgibite.com`

✅ **CORS Otomatik Yapılandırma**
- Hiçbir origin ayarlanmasa bile **çalışacak**
- Wildcard fallback ile güvenli startup

✅ **API Bağlantısı Hazır**
- Frontend Vercel backend'e otomatik bağlanacak
- `VITE_API_BASE_URL` environment variable desteği

---

## ADIM 1: Vercel Hesabı Oluşturun

1. https://vercel.com adresine gidin
2. "Sign Up" butonuna tıklayın
3. **GitHub ile giriş yapın** (önerilen)
4. GitHub hesabınızla yetkilendirin

✅ Vercel hesabınız hazır!

---

## ADIM 2: Backend Deploy (GitHub Zaten Var)

**Not:** Backend'iniz zaten GitHub'da: `ysfkrmn52/bilgibite-backend`

---

## ADIM 3: Vercel'e Deploy

1. https://vercel.com/dashboard adresine gidin
2. "Add New..." → "Project" tıklayın
3. GitHub'dan import: `ysfkrmn52/bilgibite-backend`
4. "Import" butonuna tıklayın

### ✅ Zorunlu Environment Variables:

"Environment Variables" bölümünde **şunları mutlaka** ekleyin:

```bash
# Database
DATABASE_URL=postgresql://neondb_owner:npg_...@ep-gentle-poetry-adsnth8u.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

# AI Service
ANTHROPIC_API_KEY=sk-ant-api03-JTlBPEBHhfj_oo24N5VqVuYxI0OYKvjg2Lv4rMNnG02PqBZZ6NRSI0wfXGc_t_BwOoS3bU0UzPdhyZQZs0w8wAA

# Firebase Backend (Admin SDK)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"bilgibite",...}

# Firebase Frontend
VITE_FIREBASE_PROJECT_ID=bilgibite
VITE_FIREBASE_API_KEY=AIzaSyDmX1BhCjyFgkf-dqBWcAEXutPMM
VITE_FIREBASE_APP_ID=1:140527188205:web:81c361b6388008496b74e4

# Environment
NODE_ENV=production
```

### ⚙️ Optional (Önerilen):

Bu değişkenler **yoksa bile çalışır**, ancak eklerseniz daha iyi:

```bash
# Frontend URL (default: bilgibite.com)
FRONTEND_URL=https://bilgibite.com

# Additional CORS origins (virgülle ayırın)
ALLOWED_ORIGINS=https://www.bilgibite.com,https://bilgibite.com
```

5. "Deploy" butonuna tıklayın

✅ 2-3 dakika içinde deployment tamamlanır!

### 🎯 Deploy Sonrası:

Vercel size bir URL verecek:
```
https://bilgibite-backend-abc123.vercel.app
```

Bu URL'i kopyalayın, frontend'de kullanacağız!

---

## ADIM 4: Frontend Build ve Hostinger Deploy

### 4.1. Local Build (Replit'te)

1. Backend URL'inizi alın (örnek: `https://bilgibite-backend.vercel.app`)

2. Frontend build alın:
```bash
VITE_API_BASE_URL=https://bilgibite-backend.vercel.app npm run build
```

### 4.2. Hostinger'a Upload

1. `dist/` klasöründeki tüm dosyaları Hostinger'a yükleyin
2. Domain: `bilgibite.com`

### 4.3. Coming Soon Toggle

`/public/.htaccess` dosyasını düzenleyin:

**Coming Soon Açmak İçin** (Lines 10-11'deki # işaretlerini KALDIR):
```apache
RewriteCond %{REQUEST_URI} !^/coming-soon\.html$
RewriteRule ^(.*)$ /coming-soon.html [L]
```

**Coming Soon Kapatmak İçin** (Lines 10-11'e # ekle):
```apache
# RewriteCond %{REQUEST_URI} !^/coming-soon\.html$
# RewriteRule ^(.*)$ /coming-soon.html [L]
```

---

## ADIM 5: Firebase Authorized Domains

Firebase Console'a gidin: https://console.firebase.google.com

1. **Authentication → Settings → Authorized Domains**
2. Şu domain'leri ekleyin:
   - `bilgibite.com` ✅
   - `www.bilgibite.com` ✅
   - `bilgibite-backend.vercel.app` ✅

---

## 🧪 Test ve Doğrulama

### Backend Health Check
```bash
curl https://bilgibite-backend.vercel.app/health
```

Beklenen response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-09T...",
  "environment": "production"
}
```

### Frontend Test
1. `https://bilgibite.com` adresine gidin
2. Login/Register test edin
3. Admin panel test edin (`ysfkrmn.5239@gmail.com`)

---

## 🐛 Sorun Giderme

### "Environment Variable Missing" Hatası
**Artık crash olmaz!** Default değerler kullanılır.
- Ancak production için mutlaka Vercel'de ekleyin

### "CORS Error"
**Otomatik wildcard CORS var**, ancak güvenlik için:
```bash
# Vercel'de ekleyin:
ALLOWED_ORIGINS=https://bilgibite.com,https://www.bilgibite.com
```

### "API Not Found (404)"
Frontend build sırasında `VITE_API_BASE_URL` set edildiğinden emin olun:
```bash
VITE_API_BASE_URL=https://your-vercel-url.vercel.app npm run build
```

### "Database Connection Error"
- Neon Database URL doğru mu? (Vercel'de kontrol edin)
- Neon'da "Suspend inactive projects" kapalı olmalı
- Connection pooling enabled olmalı

### Firebase Auth Fails
- Firebase Console'da domain authorization yapıldı mı?
- `FIREBASE_SERVICE_ACCOUNT_KEY` tam JSON formatında mı?

---

## 📊 Monitoring ve Logs

### Vercel Logs
```bash
# Real-time logs
vercel logs --follow

# Specific deployment logs
vercel logs [deployment-url]
```

### Neon Database
- Neon Dashboard → Monitoring
- Query performance
- Connection stats

---

## 🚀 Güncelleme Workflow

### Backend Güncelleme
```bash
# Replit'te değişiklikler yap
git add .
git commit -m "Update backend"
git push origin main

# Vercel otomatik deploy yapacak!
```

### Frontend Güncelleme
```bash
# Build al
VITE_API_BASE_URL=https://bilgibite-backend.vercel.app npm run build

# dist/ klasörünü Hostinger'a yükle
```

---

## 💡 Production Best Practices

1. **Environment Variables**: Always use Vercel Dashboard
2. **Monitoring**: Check logs regularly
3. **Database**: Neon automatic backups enabled
4. **Rate Limiting**: Backend'de zaten aktif
5. **Error Tracking**: Production logs in Vercel

---

## 📞 Destek ve İletişim

Herhangi bir sorun yaşarsanız:

1. ✅ Vercel logs: `vercel logs`
2. ✅ Browser console errors
3. ✅ Health check: `/health` endpoint
4. ✅ Firebase domain authorization

**Son Güncelleme**: 9 Ekim 2025  
**Status**: ✅ Production-Ready  
**Backend**: Vercel Serverless  
**Frontend**: Hostinger Static  
**Database**: Neon PostgreSQL  
**Auth**: Firebase
