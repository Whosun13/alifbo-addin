# Alifbo — Word add-in

O'zbek matnini alifbolar o'rtasida o'giradigan Microsoft Word plagini: eski lotin, yangi lotin va kirill orasida, istalgan yo'nalishda.

## Ulash

1. Word'ni oching.
2. **Insert** (Qo'shish) → **Add-ins** (yoki **My Add-ins**) → **Upload My Add-in**.
3. Ushbu repozitoriydagi `manifest.xml` faylini tanlang.
4. **Bosh sahifa (Home)** lentasida **Alifbo → Yangi alifbo** tugmasi paydo bo'ladi — shuni bosib panelni oching.

Node.js yoki boshqa dastur o'rnatish shart emas — hammasi shu 4 qadam.

## Foydalanish

1. Panelda **Yo'nalish**ni tanlang (masalan "Kirill → Yangi lotin").
2. **Qamrov**ni belgilang — butun hujjatmi yoki faqat belgilangan matnmi.
3. **Ko'rib chiqish** — nechta o'rin o'zgarishini oldindan ko'rasiz.
4. **O'zgartirish** — bajaradi. Yoqmasa, **Ctrl+Z** bilan qaytaring.

Hujjat ochilganda panel avtomatik tahlil qilib, mos rejimni yuqorida taklif qiladi (banner ko'rinishida).

## Rejimlar (5 ta yo'nalish)

| Rejim | Misol |
|---|---|
| Eski lotin → Yangi lotin | shahar → şahar, o'zbek → özbek |
| Yangi lotin → Eski lotin | şahar → shahar |
| Kirill → Yangi lotin | шаҳар → şahar, Ўзбекистон → Özbekiston |
| Kirill → Eski lotin | шаҳар → shahar |
| Lotin → Kirill | shahar/şahar → шаҳар (eski-yangi aralash matn ham) |

## Inobatga olingan nozik holatlar

- **Registr saqlanadi:** shahar→şahar, Shahar→Şahar, SHAHAR→ŞAHAR.
- **Istisno so'zlar:** Isʼhoq, Asʼhob, Musʼhaf, Masʼh kabi so'zlarda "sh" ikki alohida tovush — dastur buzmaydi, hatto qo'shimcha bilan kelsa ham (Isʼhoqov, Isʼhoqni). Ro'yxat panelning "Istisno so'zlar" bo'limida tahrirlanadi.
- **Rim raqamlari:** Lotin→Kirill rejimida XXI, IV kabi raqamlar o'z holicha qoladi (XXI asr → XXI аср).
- **Tutuq belgisi:** maʼno, sanʼat dagi apostrof to'g'ri saqlanadi/o'giriladi.
- **Turli apostroflar:** o', o', oʻ — hammasi tushuniladi.
- **ц harfi:** eng ko'p ishlatiladigan so'zlar uchun to'g'ri tiklanadi (aksiya, sirk, obyekt...), fe'l qo'shimchalari (ketsin, ketsa) buzilmaydi.

## Cheklovlar

- Kirill↔Lotin rejimlarida o'zgargan xatboshi ichidagi aralash formatlash (qisman qalin so'z) ba'zan bir xillashishi mumkin. Lotin↔Lotin rejimlarida formatlash to'liq saqlanadi.
- Istisno so'zlar va ц-lug'ati ro'yxati hammasini qamrab olmasligi mumkin — yangi holat topsangiz, panelda qo'shib qo'yish yoki menga xabar berish kifoya.
