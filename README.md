# Rutin Zinciri

Günlük rutinlerini puana çeviren bir alışkanlık takipçisi. Uygulama boş başlar; takip etmek istediğin işleri sen eklersin, her işe bir önem derecesi verirsin. Bütün işlerini tamamladığın gün 100 puan alırsın; günün puanı 60'ı geçtiğinde zincir devam eder.

- **Android uygulaması:** Google Play'de (paket adı `com.zincir.app`). İnternetsiz çalışır, veriler telefonda kalır.
- **Tarayıcı sürümü:** https://agkoyuna-ui.github.io/rutin-zinciri/
- **Gizlilik politikası:** https://agkoyuna-ui.github.io/rutin-zinciri/gizlilik.html

## Puan nasıl hesaplanır

Bütün işlerin tamam olduğu gün 100 puandır. Her iş bu 100 puandan önem derecesine göre pay alır: çok düşük ×1, düşük ×2, orta ×3, yüksek ×4, çok yüksek ×5. Örneğin bir iş ×5, diğeri ×1 ise ilki 100 puanın 83'ünü, ikincisi 17'sini alır.

| İş türü | Payının tamamını ne zaman alırsın |
|---|---|
| Tikli | Yaptığın gün |
| Süreli (dk, saat, sayfa…) | Günlük hedefe ulaşınca. Hedefin yarısı yarım pay, hedefi geçersen fazlası ek puan |
| Hedefe yakınlık (kalori gibi) | Tam hedefte. Alt sınırda 0, üst sınırı geçince eksi |

Zincir 60 puanda devam eder; 100 normal gün, 150 boş gün seviyesidir.

## Klasörler

- `docs/` uygulamanın kendisi. Tarayıcı sürümü GitHub Pages'tan buradan yayınlanır; Android uygulaması da bu dosyaları içine alır.
- `android/` Android uygulaması. `android/imza/` Play yükleme anahtarıdır ve GitHub'a gitmez.
- `play/` Google Play mağaza metinleri, görseller ve yayınlama adımları.

## Android uygulamasını derlemek

`android` klasöründe, Android Studio'nun Java'sıyla:

```
gradlew bundleRelease assembleRelease
```

AAB `android/app/build/outputs/bundle/release/`, APK `android/app/build/outputs/apk/release/` altında oluşur. Her Play güncellemesinde `android/app/build.gradle` içindeki `versionCode` bir artırılmalı.
