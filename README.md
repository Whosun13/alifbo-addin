# Alifbo — Word add-in

O'zbek matnini alifbolar o'rtasida o'giradigan Microsoft Word plagini.

## Rejimlar (5 ta yo'nalish)

| Rejim | Misol |
|---|---|
| Eski lotin → Yangi lotin | shahar → şahar, o'zbek → özbek |
| Yangi lotin → Eski lotin | şahar → shahar |
| Kirill → Yangi lotin | шаҳар → şahar, Ўзбекистон → Özbekiston |
| Kirill → Eski lotin | шаҳар → shahar |
| Lotin → Kirill | shahar/şahar → шаҳар (eski-yangi aralash ham) |

## Inobatga olingan holatlar

- **Registr:** shahar→şahar, Shahar→Şahar, SHAHAR→ŞAHAR — barcha rejimlarda.
- **Istisno so'zlar:** Isʼhoq, Asʼhob, Musʼhaf, Masʼh — bularda s va h alohida tovush.
  Dastur ularni buzmaydi; apostrofsiz yozilgan bo'lsa (Ishoq) to'g'ri shaklga (Isʼhoq) keltiradi.
  **Qo'shimchalar bilan ham ishlaydi:** Isʼhoqov, Isʼhoqni, Isʼhoqga, Musʼhafdan...
  Xavfsizlik: qisqa o'zaklar (Masʼh) apostrofsiz faqat butun so'z sifatida mos keladi,
  shuning uchun mashq, mashhur, mashina kabi oddiy so'zlar buzilmaydi.
  Ro'yxat panelda tahrirlanadi va eslab qolinadi.
- **Rim raqamlari:** Lotin→Kirill rejimida XXI, IV, MMXXVI kabi raqamlar o'z holicha qoladi
  (XXI asr → XXI аср). Faqat haqiqiy rim raqami ko'rinishidagi so'zlar himoyalanadi.
- **Tutuq belgisi:** maʼno, sanʼat dagi apostrof lotin↔lotin da saqlanadi; kirillga
  o'girishda ъ ga, kirilldan ʼ ga o'giriladi.
- **Kontekstli harflar:**
  - е: so'z boshida/unlidan keyin ye (ердан→yerdan, поезд→poyezd), undoshdan keyin e (келди→keldi)
  - ъ: е/ё/ю/я oldidan tushib qoladi (объект→obyekt, съезд→syezd), boshqa joyda ʼ (маъно→maʼno)
  - e: so'z boshida э (erkin→эркин), undoshdan keyin е (kecha→кеча)
  - ц: unlilar orasida ts (официант→ofitsiant), boshqa joyda s (цирк→sirk, акция→aksiya)
  - с+ҳ → sʼh eski lotinda (Исҳоқ→Isʼhoq) — "sh" bo'lib o'qilmasligi uchun
- **Turli apostroflar:** o', o', oʻ, o` — hammasi tushuniladi.
- **ng:** alifbodan chiqarilgani matnga ta'sir qilmaydi (avvaldan n+g).

## Qulayliklar

- **Avto-aniqlash:** hujjat ochilganda matn tahlil qilinadi va mos rejim taklif etiladi.
- **Ko'rib chiqish:** o'zgartirishdan oldin nechta o'rin topilganini ko'rsatadi.
- **Sozlamalar eslab qolinadi:** rejim, qamrov, istisno ro'yxati keyingi safar tiklanadi.
- **Bekor qilish:** Ctrl+Z.

## Fayllar

```
manifest.xml              — plagin ta'rifi
server.js                 — lokal HTTPS dev server
tests.js                  — 97 ta test (npm test)
src/taskpane/
  engine.js               — o'girish yadrosi (5 rejim, istisno, rim raqamlari)
  taskpane.html/.css/.js  — panel interfeysi va Word integratsiyasi
assets/                   — ikonkalar
```
