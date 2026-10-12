# Rutin Zinciri

Günlük rutin takibi: günün puanı, zincir takvimi ve dönem ilerlemesi. Telefonda ve PC'de çalışır. Veriler evdeki PC'de durur, telefon aynı Wi-Fi'deyken kendiliğinden eşitlenir.

## Kullanım

**PC:** `Rutin Zinciri.bat` dosyasını aç. Program başlar ve uygulama tarayıcıda açılır (`http://localhost:8765`). Windows Güvenlik Duvarı ilk açılışta sorarsa özel ağlar için izin ver, yoksa telefon bağlanamaz.

**Telefon (Android):** PC'deki uygulamada Ayarlar bölümündeki "Telefonu bağla" adımlarını izle. Bağlandıktan sonra Chrome menüsünden "Ana ekrana ekle" ile telefona kur.

Telefon dışarıdayken uygulama yine açılır ve girdiklerin telefonda bekler. Eve gelip aynı Wi-Fi'ye bağlanınca PC'ye gönderilir. Bunun için PC'de programın açık olması gerekir.

**Windows açılınca kendiliğinden başlasın:** `pc/Otomatik baslat - ac.bat` dosyasını bir kez aç. Vazgeçmek için `pc/Otomatik baslat - kapat.bat`.

## Sorun giderme

| Üstte görünen | Anlamı |
|---|---|
| Sadece bu cihaz | Telefon henüz PC'ye bağlanmadı |
| PC'ye bağlı değil | PC'ye ulaşılamıyor. Dışarıdaysan normal. Evdeysen PC'de program açık mı, ikisi aynı Wi-Fi'de mi bak |
| Program kapalı | PC'de `Rutin Zinciri.bat` çalışmıyor |
| Kod yanlış | Telefondaki kod PC'dekiyle aynı değil |
| İzin gerekli | Chrome'da bu site için yerel ağ izni kapalı |

Telefon evde olduğu halde bağlanmıyorsa PC'nin ev ağındaki adresi değişmiş olabilir. PC'deki Ayarlar bölümünde güncel bağlantı yazar, telefonda onu yeniden aç.

## Dosyalar

- `docs/` uygulamanın kendisi. GitHub Pages'ta yayınlanır.
- `pc/server.js` PC'de çalışan program. Ek paket gerektirmez, sadece Node.js.
- `pc/veri/` girdiğin veriler (`rutin-data.json`) ve eşleştirme kodu (`kod.txt`). Sadece bu bilgisayarda durur, GitHub'a gitmez. Yedek almak için bu klasörü kopyalaman yeterli.
