# Vexora Modelling - Kurulum Rehberi

Bu klasör; ana site, 404 sayfası, Discord girişli yönetim paneli ve
JsonBin tabanlı ürün verisini içerir.

## Klasör yapısı (kısaca)
- public/        -> Sitenin herkese açık dosyaları (ana sayfa, 404, logo, 404 görseli)
- admin/         -> Yönetim paneli (sadece admin Discord ID'leri görür, herkese açık değil)
- api/           -> Sunucu tarafı kodlar (veri, giriş, çıkış, yönetim sayfası)
- lib/           -> Yardımcı kodlar (oturum, JsonBin)
- vercel.json    -> Vercel ayarları
- .env.example   -> Gerekli ortam değişkenlerinin listesi (gerçek değerleri buraya yazma)

## ADIM 1 - JsonBin
1. https://jsonbin.io adresinde panele gir.
2. Eski Master Key'i sil, yeni bir Master Key üret. (Eski key sohbette açıkta kaldı.)
3. Terminalde şu komutu çalıştır, SENIN_YENI_KEY yerine yeni key'ini yaz:

   curl -X POST https://api.jsonbin.io/v3/b \
     -H "Content-Type: application/json" \
     -H "X-Master-Key: SENIN_YENI_KEY" \
     -H "X-Bin-Name: vexora-data" \
     -H "X-Bin-Private: true" \
     -d '{"settings":{"heroTitle":"Vexora Modelling","heroSubtitle":"GMod için özel player modelling","discordInvite":""},"products":[]}'

4. Dönen JSON içindeki metadata.id değeri BIN ID'dir. Kaydet.

## ADIM 2 - Discord uygulaması
1. https://discord.com/developers/applications -> New Application.
2. OAuth2 sekmesi:
   - Client ID'yi kopyala (DISCORD_CLIENT_ID)
   - Reset Secret ile Client Secret'ı üret ve kopyala (DISCORD_CLIENT_SECRET)
   - Redirects kısmına şunu ekle (SITEN yerine Vercel adresin gelecek):
     https://SITEN.vercel.app/api/auth/callback
3. Yönetici olacak kişilerin Discord ID'lerini al:
   Discord Ayarlar -> Gelişmiş -> Geliştirici Modu'nu aç.
   Kişinin profiline sağ tık -> Kullanıcı ID'sini kopyala.

## ADIM 3 - GitHub
1. Bu klasördeki dosyaların tamamını repoya yükle. Terminalde:

   cd vexora-modelling
   git init
   git add .
   git commit -m "ilk surum"
   git branch -M main
   git remote add origin https://github.com/KULLANICI_ADIN/REPO_ADIN.git
   git push -u origin main

2. .env dosyası repoya gitmez (.gitignore sayesinde). Gizli bilgiler sadece Vercel'de olacak.

## ADIM 4 - Vercel
1. https://vercel.com/new -> GitHub reposunu seç -> Import.
2. Environment Variables bölümüne şunları ekle:
   - JSONBIN_MASTER_KEY        = yeni key
   - JSONBIN_BIN_ID            = Adım 1'deki ID
   - DISCORD_CLIENT_ID         = Discord'dan
   - DISCORD_CLIENT_SECRET     = Discord'dan
   - DISCORD_REDIRECT_URI      = https://SITEN.vercel.app/api/auth/callback
   - ADMIN_DISCORD_IDS         = ID'ler, virgülle ayrılmış (boşluk yok)
   - SESSION_SECRET            = rastgele uzun metin
     (Üretmek için: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
3. Deploy et. Vercel'in verdiği adresi (SITEN.vercel.app) not al.
4. Adres farklıysa DISCORD_REDIRECT_URI'yi ve Discord Redirects kısmını bu adresle
   birebir aynı yap, sonra Vercel'de Redeploy yap.

## ADIM 5 - Test
1. https://SITEN.vercel.app -> Giriş animasyonu ve ana sayfa açılmalı.
2. https://SITEN.vercel.app/olmayan-sayfa -> 404 görseli çıkmalı.
3. https://SITEN.vercel.app/api/auth/discord -> Discord giriş ekranı açılır.
   Admin ID'sindeki hesapla girersen yönetim paneli açılır.
4. https://SITEN.vercel.app/yonetim -> Admin ise panel, değilse 404 görseli.

## Ürün ekleme
Panel üzerinden: Ürün ekle -> Ad, fiyat, açıklama, görsel linki, satın alma linki -> Kaydet.
Kod deploy etmeye gerek yoktur.

## Sık sorunlar
- Discord "redirect_uri invalid" diyorsa: Discord'daki Redirects ile
  DISCORD_REDIRECT_URI birebir aynı olmalı (sonunda / olmadan).
- Panel açılmıyor, hep 404: ADMIN_DISCORD_IDS içinde o kişinin ID'si olmalı
  ve env değişkenlerini değiştirdikten sonra Redeploy yapılmalı.
- Ürünler yüklenmiyor: JSONBIN_MASTER_KEY ve JSONBIN_BIN_ID doğru mu kontrol et.
