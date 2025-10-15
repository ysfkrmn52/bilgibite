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
