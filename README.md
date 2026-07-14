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

## Ishga tushirish (lokal sinov)

Kerak: [Node.js](https://nodejs.org) 18+ va desktop Word.

```bash
npm install            # bog'liqliklar
npm test               # 97 ta test (ixtiyoriy tekshiruv)
npm run install-certs  # localhost sertifikati (bir marta)
npm start              # dev server: https://localhost:3000
```

Keyin alohida terminalda:

```bash
npm run sideload       # Word ochilib, plagin ulanadi
```

Word'da **Bosh sahifa (Home)** lentasidagi **Alifbo → Yangi alifbo** tugmasini bosing.

Qo'lda ulash (agar avtomatik ishlamasa): Word → Insert → Add-ins → My Add-ins →
Upload My Add-in → `manifest.xml`.

## Cheklovlar (halol eslatmalar)

- **Formatlash:** Lotin↔Lotin rejimlarida formatlash to'liq saqlanadi (search&replace usuli).
  Kirill↔Lotin rejimlarida o'zgargan xatboshi ichidagi aralash formatlash (qisman qalin so'z)
  bir xillashishi mumkin — bu Word API cheklovi bilan bog'liq muhandislik kelishuvi.
- **ц tiklash — lug'at chegarasi:** ko'p so'zlar qoida (unlilar orasida, so'z boshi/oxiri:
  ofitsiant, tsex, abzats) va ichki lug'at (sirk, aksiya, konsert, sement...) orqali tiklanadi,
  fe'l qo'shimchalari himoyalangan (ketsin, ketsa → кетсин, кетса). Lug'atda yo'q nodir
  ц-so'z uchrasa, u с bilan qoladi — lug'at engine.js dagi LOAN_DICT ro'yxatida kengaytiriladi.
  (Lotin.uz shu muammoni 87 mingdan ortiq so'zlik yopiq bazasi bilan hal qiladi — istalsa,
  ular bilan API hamkorligi haqida gaplashish mumkin.)
- **Istisno ro'yxati to'liq emas:** yangi so'z topilsa, panelda qo'shib qo'ying —
  format: `Lotin = Кирилл` (kirill qismi ixtiyoriy).
- **Ruscha maxsus harflar** (щ→sh) soddalashtirilgan qoida bilan o'giriladi.

## Nashr qilishdan oldin (production)

1. `src/` va `assets/` ni doimiy HTTPS xostingga joylang (Azure Static Web Apps,
   GitHub Pages, Cloudflare Pages — bepul daraja bor).
2. `manifest.xml` dagi `https://localhost:3000` manzillarini domeningizga almashtiring.
3. AppSource uchun Partner Center'da ro'yxatdan o'tib, manifestni yuboring.

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
