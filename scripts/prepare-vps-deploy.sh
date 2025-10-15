#!/bin/bash

# BilgiBite VPS Deployment Hazırlık Scripti
# Bu script VPS'e yüklenecek dosyaları hazırlar

echo "🚀 BilgiBite VPS Deployment Paketi Hazırlanıyor..."

# Deployment klasörü oluştur
rm -rf vps-deploy
mkdir -p vps-deploy

# Gerekli dosyaları kopyala
echo "📦 Kaynak dosyalar kopyalanıyor..."

# Ana dosyalar
cp -r client vps-deploy/
cp -r server vps-deploy/
cp -r shared vps-deploy/
cp -r public vps-deploy/
cp -r migrations vps-deploy/

# Konfigürasyon dosyaları
cp package*.json vps-deploy/
cp tsconfig.json vps-deploy/
cp vite.config.ts vps-deploy/
cp tailwind.config.ts vps-deploy/
cp postcss.config.js vps-deploy/
cp drizzle.config.ts vps-deploy/

# .env.example'ı kopyala (kullanıcı kendi .env'ini oluşturacak)
cp .env.example vps-deploy/.env.example

# VPS kurulum scripti oluştur
cat > vps-deploy/INSTALL.md << 'EOF'
# BilgiBite VPS Kurulum Rehberi

## ADIM 1: Dosyaları Yükle
FileZilla ile tüm dosyaları `/var/www/bilgibite` klasörüne yükle

## ADIM 2: drizzle.config.ts Düzenle
```bash
nano drizzle.config.ts
```
Şu satırı değiştir:
```typescript
dialect: "postgresql",  // BUNU
dialect: "mysql",       // BUNA ÇEVİR
```

## ADIM 3: Environment Variables
```bash
cp .env.example .env
nano .env
```

Şu değerleri doldur:
```env
DATABASE_URL=mysql://bilgibite_user:GuvenliSifre123!@localhost:3306/bilgibite
NODE_ENV=production
PORT=5000
ANTHROPIC_API_KEY=your_key_here
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
```

## ADIM 4: Paketleri Yükle
```bash
npm install
```

## ADIM 5: Database Schema
```bash
npm run db:push
```

## ADIM 6: Build
```bash
npm run build
```

## ADIM 7: Çalıştır
```bash
# Test için:
npm start

# PM2 ile production:
pm2 start npm --name "bilgibite" -- start
pm2 save
pm2 startup
```

## ADIM 8: Nginx (Opsiyonel)
Eğer Nginx kullanacaksan deployment/nginx/nginx.conf dosyasını kullan
EOF

# PM2 ecosystem dosyası oluştur
cat > vps-deploy/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'bilgibite',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
}
EOF

echo "✅ Deployment paketi hazır: ./vps-deploy/"
echo ""
echo "📋 SONRAKI ADIMLAR:"
echo "1. FileZilla ile vps-deploy/ klasöründeki TÜM dosyaları VPS'e yükle"
echo "2. VPS'de INSTALL.md dosyasındaki adımları takip et"
echo ""
echo "📁 Yüklenecek dosyalar:"
ls -lh vps-deploy/
