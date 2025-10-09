# VERCEL DEPLOYMENT TALİMATLARI

## ADIM 1: Vercel Hesabı Oluşturun

1. https://vercel.com adresine gidin
2. "Sign Up" butonuna tıklayın
3. **GitHub ile giriş yapın** (en kolay yol)
4. GitHub hesabınızla yetkilendirin

✅ Vercel hesabınız hazır!

---

## ADIM 2: GitHub'a Kod Yükleme (Replit'ten)

### 2.1. GitHub Repository Oluşturun

1. https://github.com/new adresine gidin
2. Repository adı: `bilgibite-backend`
3. Private seçin
4. "Create repository" tıklayın

### 2.2. Replit'te Git Push

Replit'te Shell'de şu komutları çalıştırın:

```bash
# Git yapılandırma
git config --global user.email "your-email@example.com"
git config --global user.name "Your Name"

# GitHub repository'nize bağlayın
git remote remove origin  # Eski bağlantıyı kaldır
git remote add origin https://github.com/KULLANICI_ADINIZ/bilgibite-backend.git

# Push yapın
git add .
git commit -m "Backend deployment to Vercel"
git push -u origin main
```

**Not:** GitHub username ve token gerekebilir.

---

## ADIM 3: Vercel'e Deploy

1. https://vercel.com/dashboard adresine gidin
2. "Add New..." → "Project" tıklayın
3. GitHub repository'nizi seçin: `bilgibite-backend`
4. "Import" butonuna tıklayın

### Environment Variables Ekleyin:

"Environment Variables" bölümünde şunları ekleyin:

```
DATABASE_URL
(Neon PostgreSQL URL'inizi buraya yapıştırın)

ANTHROPIC_API_KEY
sk-ant-api03-JTlBPEBHhfj_oo24N5VqVuYxI0OYKvjg2Lv4rMNnG02PqBZZ6NRSI0wfXGc_t_BwOoS3bU0UzPdhyZQZs0w8wAA

VITE_FIREBASE_PROJECT_ID
bilgibite

VITE_FIREBASE_API_KEY
AIzaSyDmX1BhCjyFgkf-dqBWcAEXutPMM

VITE_FIREBASE_APP_ID
1:140527188205:web:81c361b6388008496b74e4

FIREBASE_SERVICE_ACCOUNT_KEY
(Firebase service account JSON'unuzu buraya yapıştırın)

NODE_ENV
production
```

5. "Deploy" butonuna tıklayın

✅ 2-3 dakika içinde deployment tamamlanır!

---

## ADIM 4: Vercel URL'ini Alın

Deploy tamamlandıktan sonra:

1. Vercel dashboard'da project'inize tıklayın
2. URL görünecek: `https://bilgibite-backend.vercel.app`
3. Bu URL'i kopyalayın

---

## ADIM 5: Frontend'i Güncelleme

Vercel URL'inizi aldıktan sonra bana söyleyin:

"Vercel URL: https://bilgibite-backend.vercel.app"

Ben frontend'i bu URL'e bağlayacağım!

---

## Sorun Giderme

### GitHub Push Hatası
```bash
# Personal Access Token oluşturun:
# GitHub → Settings → Developer settings → Personal access tokens → Generate new token
# Token'ı kullanarak push yapın
```

### Environment Variables Eksik
- Her variable'ı tek tek ekleyin
- Value'larda tırnak işareti kullanmayın

### Build Hatası
- Logs'u kontrol edin
- Replit Agent'e hata mesajını gönderin
