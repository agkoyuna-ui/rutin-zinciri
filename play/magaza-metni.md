# Rutin Zinciri: Google Play hazırlığı

## Yüklenecek dosyalar

| Ne | Dosya |
|---|---|
| Uygulama paketi (AAB) | `cikti/Rutin-Zinciri-1.1.aab` |
| Uygulama ikonu (512×512) | `docs/icon-512.png` |
| Tanıtım görseli (1024×500) | `play/tanitim-gorseli.png` |
| Telefon ekran görüntüleri (1080×2160) | `play/ekran-1-bugun.png`, `ekran-2-zincir.png`, `ekran-3-ilerleme.png`, `ekran-4-isler.png`, `ekran-5-yeni-is.png` |
| Gizlilik politikası adresi | https://agkoyuna-ui.github.io/rutin-zinciri/gizlilik.html |

Paket adı: `com.zincir.app` (ilk yüklemeden sonra değişmez). Sürüm: 1.1 (versionCode 2).

## Mağaza sayfası

**Uygulama adı** (en fazla 30 karakter)

```
Rutin Zinciri
```

**Kısa açıklama** (en fazla 80 karakter)

```
Rutinlerini puanla, zincirini koru. İşlerini ve önemlerini sen belirle.
```

**Tam açıklama** (en fazla 4000 karakter)

```
Rutin Zinciri, her gün yaptıklarını puana çeviren ve seni zinciri kırmamaya teşvik eden sade bir alışkanlık takipçisidir.

Kendi işlerini ekle
Uygulama boş başlar. Takip etmek istediğin her şeyi iş olarak ekle:
• Tikli: sabah rutini, akşam planı gibi yapıldı / yapılmadı işler.
• Süreli: kitap sayfası, yürüyüş dakikası, çalışma saati… Birimi ve günlük hedefi sen yazarsın.
• Hedefe yakınlık: kalori gibi, hedefe yaklaştıkça puanı artan, sınırı aşınca düşen işler.

Bütün işlerini bitir, 100 puanı al
Bütün işlerini tamamladığın gün tam 100 puan alırsın. Her işe beş önem derecesinden birini ver: çok düşük, düşük, orta, yüksek, çok yüksek. Önemli işler bu 100 puandan daha büyük pay alır. Süreli işlerde günlük hedefi geçersen fazlası ek puan olur.

Zincirini koru
Günün puanı 60'ı geçtiğinde zincir devam eder. Takvimde her gün rengiyle görünür: yoğun, normal ya da boş gün seviyesi. Şu anki ve en uzun zincirini takip et.

İlerlemeni gör
Dönem boyunca her işte hedefinin neresinde olduğunu, günlük ortalamanı ve toplam puanını gör. Dönemin süresini ve başlangıcını sen seç.

Verilerin sende kalır
Hesap yok, reklam yok, takip yok. Girdiğin her şey telefonunda saklanır ve internetsiz de çalışır.
```

**Kategori önerisi:** Verimlilik. **Etiketler:** alışkanlık takibi, rutin, hedef.

**İletişim e-postası:** Play bunu zorunlu tutar ve mağazada herkese gösterir. Kendi seçtiğin bir adresi yaz.

## Play Console formları için önerilen yanıtlar

- **Veri güvenliği:** "Uygulamanız kullanıcı verisi topluyor ya da paylaşıyor mu?" sorusuna **Hayır**. Kayıtlar cihazda kalıyor, senin bir sunucun yok. Not: Uygulama yazı tiplerini Google Fonts'tan yüklüyor ve bu gizlilik politikasında yazıyor. İleride yazı tiplerini uygulamanın içine gömmek bu soruyu tamamen ortadan kaldırır.
- **Reklamlar:** Uygulamada reklam yok.
- **Uygulama erişimi:** Tüm işlevler giriş yapmadan kullanılabiliyor.
- **İçerik derecelendirmesi:** Kategori "Yardımcı program, Verimlilik, İletişim veya Diğer". Şiddet, cinsellik, kumar, kullanıcılar arası iletişim gibi sorulara **Hayır**. Sonuç büyük ihtimalle "3+ / Herkes" çıkar.
- **Hedef kitle:** 13 yaş ve üstü. 13 yaş altını seçersen Aileler politikası devreye girer ve ek şartlar gelir.
- **Sağlık uygulamaları:** Bu beyan sorulursa uygulamanın genel bir alışkanlık takipçisi olduğunu, sağlık verisini sunucuya göndermediğini belirt. Kalori, kullanıcının isterse eklediği bir iş; varsayılan olarak hiçbir iş yok.

## Yayınlama adımları

1. **Geliştirici hesabı:** play.google.com/console adresinden hesap aç. Tek seferlik 25 dolar ücreti var, kimlik doğrulaması isteniyor.
2. **Uygulama oluştur:** Uygulama adı "Rutin Zinciri", varsayılan dil Türkçe, tür Uygulama, Ücretsiz.
3. **Uygulama imzalama:** "Play Uygulama İmzalama"yı Google'ın yönetmesine bırak (önerilen). Senin elindeki anahtar sadece yükleme anahtarı olur. Kaybedersen Play'den yenisini isteyebilirsin.
4. **Kapalı test (yeni kişisel hesaplarda zorunlu):** Kasım 2023'ten sonra açılan kişisel hesaplar, uygulamayı herkese açmadan önce kapalı testte **en az 12 test kullanıcısıyla 14 gün** test etmek zorunda.
   - "Test > Kapalı test"te bir kanal oluştur.
   - Test kullanıcılarının Gmail adreslerini ekle.
   - `cikti/Rutin-Zinciri-1.1.aab` dosyasını yükle.
   - Test bağlantısını bu kişilere gönder; bağlantıdan katılıp uygulamayı kursunlar.
5. **Mağaza sayfası ve formlar:** Yukarıdaki metinleri, görselleri ve form yanıtlarını gir.
6. **Üretime erişim:** 14 gün dolunca "Üretime erişim başvurusu" yap. Onaylanınca aynı AAB'yi üretim kanalına çıkar.

## Güncelleme çıkarmak

Uygulamada bir şey değiştiğinde:

1. `android/app/build.gradle` içinde `versionCode` değerini 1 artır, `versionName`'i de istersen değiştir (örneğin 1.1). Play aynı versionCode'u ikinci kez kabul etmez.
2. Derle (`android` klasöründe, Android Studio'nun Java'sıyla):

   ```
   gradlew bundleRelease assembleRelease
   ```

3. Yeni AAB `android/app/build/outputs/bundle/release/app-release.aab` konumunda olur, onu Play Console'a yükle.

Yükleme anahtarı `android/imza/` klasöründe. Bu klasör GitHub'a gitmez. Mutlaka bir yedeğini bilgisayarın dışında sakla.
