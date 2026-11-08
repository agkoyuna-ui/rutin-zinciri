# Rutin Zinciri

Günlük rutinlerini puana çeviren bir alışkanlık takipçisi. Maddelerini ve her maddenin puanını kendin belirlersin; günün puanı eşiği geçtiğinde zincir devam eder.

- **Android uygulaması:** Google Play'de (paket adı `com.zincir.app`). İnternetsiz çalışır, veriler telefonda kalır.
- **Tarayıcı sürümü:** https://agkoyuna-ui.github.io/rutin-zinciri/
- **Gizlilik politikası:** https://agkoyuna-ui.github.io/rutin-zinciri/gizlilik.html

## Bilgisayarla eşitleme (isteğe bağlı)

Telefonundaki kayıtları evdeki bilgisayarınla eşitlemek istersen bilgisayarda küçük bir program çalıştırırsın. Veriler internete çıkmaz; ev Wi-Fi'n üzerinden doğrudan senin bilgisayarına gider.

1. Bilgisayara [Node.js](https://nodejs.org) kur.
2. Bu sayfadan kodu indir (Code > Download ZIP) ve bir klasöre çıkar.
3. `Rutin Zinciri.bat` dosyasını aç. Uygulama tarayıcıda açılır (`http://localhost:8765`). Windows Güvenlik Duvarı sorarsa özel ağlar için izin ver.
4. Bilgisayardaki uygulamada Ayarlar > Bilgisayarla eşitleme bölümündeki bağlantıyı kopyala.
5. Telefonda Rutin Zinciri'nde Ayarlar > Bilgisayarla eşitleme bölümüne bağlantıyı yapıştırıp Bağlan'a bas.

Bağlandığında bilgisayardaki maddeler ve ayarlar telefona gelir, günlük kayıtlar birleşir. Telefon dışarıdayken girdiklerin telefonda bekler, eve gelince gönderilir. Bunun için bilgisayarda programın açık olması gerekir.

**Windows açılınca kendiliğinden başlasın:** `pc/Otomatik baslat - ac.bat` dosyasını bir kez aç. Vazgeçmek için `pc/Otomatik baslat - kapat.bat`.

### Sorun giderme

| Üstte görünen | Anlamı |
|---|---|
| PC'ye bağlı değil | Bilgisayara ulaşılamıyor. Dışarıdaysan normal. Evdeysen programın açık olduğuna ve ikisinin aynı Wi-Fi'de olduğuna bak |
| Program kapalı | Bilgisayarda `Rutin Zinciri.bat` çalışmıyor |
| Kod yanlış | Telefondaki kod bilgisayardakiyle aynı değil |

Telefon evde olduğu halde bağlanmıyorsa bilgisayarın ev ağındaki adresi değişmiş olabilir. Bilgisayardaki Ayarlar'da güncel bağlantı yazar, telefonda onu yeniden yapıştır.

## Klasörler

- `docs/` uygulamanın kendisi. Tarayıcı sürümü GitHub Pages'tan buradan yayınlanır; Android uygulaması da bu dosyaları içine alır.
- `android/` Android uygulaması. `android/imza/` yükleme anahtarıdır ve GitHub'a gitmez.
- `pc/server.js` bilgisayarda çalışan eşitleme programı. Ek paket gerektirmez, sadece Node.js.
- `pc/veri/` bilgisayardaki veriler ve eşleştirme kodu. GitHub'a gitmez; yedek almak için bu klasörü kopyalaman yeterli.
- `play/` Google Play mağaza metinleri, görseller ve yayınlama adımları.

## Android uygulamasını derlemek

`android` klasöründe, Android Studio'nun Java'sıyla:

```
gradlew bundleRelease assembleRelease
```

AAB `android/app/build/outputs/bundle/release/`, APK `android/app/build/outputs/apk/release/` altında oluşur. Her Play güncellemesinde `android/app/build.gradle` içindeki `versionCode` bir artırılmalı.
