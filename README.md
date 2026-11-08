# Rutin Zinciri

Günlük rutinlerini puana çeviren bir alışkanlık takipçisi. Uygulama boş başlar; takip etmek istediğin işleri sen eklersin, her işe bir önem derecesi verirsin, puanı uygulama hesaplar. Günün puanı eşiği geçtiğinde zincir devam eder.

- **Android uygulaması:** Google Play'de (paket adı `com.zincir.app`). İnternetsiz çalışır, veriler telefonda kalır.
- **Tarayıcı sürümü:** https://agkoyuna-ui.github.io/rutin-zinciri/
- **Gizlilik politikası:** https://agkoyuna-ui.github.io/rutin-zinciri/gizlilik.html

## Puan nasıl hesaplanır

| İş türü | Puan |
|---|---|
| Tikli | Yaptığın gün önem derecesinin puanı |
| Süreli (dk, saat, sayfa…) | Günlük hedefe ulaşınca önem derecesinin puanı; hedefin iki katı iki kat puan |
| Hedefe yakınlık (kalori gibi) | Hedefte önem derecesinin puanı; alt sınırda 0, üst sınırı geçince eksi |

Önem dereceleri: çok düşük 10, düşük 20, orta 30, yüksek 40, çok yüksek 50 puan. Zincir eşikleri, bütün işlerin hedefte olduğu bir günün puanına göre kendiliğinden hesaplanır: zincir %60, normal gün %100, boş gün %160.

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
