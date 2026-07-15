// Alifbo Engine — to'liq test to'plami
const E = require("./src/taskpane/engine.js");

let pass = 0, fail = 0;
function t(mode, inp, exp, opts) {
    const got = E.convert(inp, mode, opts).text;
    const ok = got === exp;
    if (ok) pass++; else fail++;
    console.log((ok ? "OK   " : "XATO ") + `[${mode}] "${inp}" -> "${got}"` + (ok ? "" : `  (kutilgan: "${exp}")`));
}

console.log("=== ESKI -> YANGI LOTIN ===");
t("old2new", "shahar", "şahar");
t("old2new", "Shahar", "Şahar");
t("old2new", "SHAHAR", "ŞAHAR");
t("old2new", "choy ichdim", "çoy içdim");
t("old2new", "CHOY", "ÇOY");
t("old2new", "o'zbek", "özbek");
t("old2new", "o\u2019zbek", "özbek");
t("old2new", "O'zbekiston", "Özbekiston");
t("old2new", "G'alaba", "Ğalaba");
t("old2new", "g\u02BBalaba", "ğalaba");
t("old2new", "To'g'ri", "Töğri");
t("old2new", "ma'no", "ma'no");
t("old2new", "san'at", "san'at");
t("old2new", "yangi", "yangi");
t("old2new", "ishonch", "işonç");

console.log("\n=== ISTISNO SO'ZLAR — QO'SHIMCHALAR BILAN (eski -> yangi) ===");
t("old2new", "Is'hoq keldi", "Isʼhoq keldi");
t("old2new", "Ishoq keldi", "Isʼhoq keldi");
t("old2new", "Is'hoqov", "Isʼhoqov");              // qo'shimcha: -ov
t("old2new", "Ishoqov", "Isʼhoqov");               // apostrofsiz + qo'shimcha
t("old2new", "Ishoqni ko'rdim", "Isʼhoqni kördim"); // -ni
t("old2new", "Ishoqga berdim", "Isʼhoqga berdim"); // -ga
t("old2new", "ISHOQOV", "ISʼHOQOV");
t("old2new", "Is'hoqcha", "Isʼhoqça");             // qo'shimchadagi ch ham o'giriladi!
t("old2new", "As'hobiddin", "Asʼhobiddin");
t("old2new", "Mushafdan", "Musʼhafdan");
t("old2new", "mas'hni", "masʼhni");                // apostrofli — qo'shimcha bilan
t("old2new", "mashq qildik", "maşq qildik");       // MASH o'zagi xavfli: mashq buzilmaydi
t("old2new", "mashhur ishonch", "maşhur işonç");   // mashhur ham buzilmaydi
t("old2new", "mashinada", "maşinada");             // mashina ham

console.log("\n=== YANGI -> ESKI LOTIN ===");
t("new2old", "şahar", "shahar");
t("new2old", "Şahar", "Shahar");
t("new2old", "çiroyli", "chiroyli");
t("new2old", "Özbekiston", "Oʻzbekiston");
t("new2old", "ğalaba", "gʻalaba");
t("new2old", "Töğri", "Toʻgʻri");

console.log("\n=== KIRILL -> YANGI LOTIN ===");
t("cyr2lat_new", "шаҳар", "şahar");
t("cyr2lat_new", "ШАҲАР", "ŞAHAR");
t("cyr2lat_new", "чиройли", "çiroyli");
t("cyr2lat_new", "Ўзбекистон", "Özbekiston");
t("cyr2lat_new", "ғалаба", "ğalaba");
t("cyr2lat_new", "қалам", "qalam");
t("cyr2lat_new", "ҳаво", "havo");
t("cyr2lat_new", "хабар", "xabar");
t("cyr2lat_new", "ердан", "yerdan");
t("cyr2lat_new", "Ердан", "Yerdan");
t("cyr2lat_new", "келди", "keldi");
t("cyr2lat_new", "поезд", "poyezd");
t("cyr2lat_new", "объект", "obyekt");        // ъ + е: ъ tushadi (TUZATILDI)
t("cyr2lat_new", "объектив", "obyektiv");
t("cyr2lat_new", "субъект", "subyekt");
t("cyr2lat_new", "съезд", "syezd");
t("cyr2lat_new", "объём", "obyom");          // ъ + ё
t("cyr2lat_new", "маъно", "maʼno");          // ъ undosh oldida: ʼ saqlanadi
t("cyr2lat_new", "санъат", "sanʼat");
t("cyr2lat_new", "цирк", "sirk");
t("cyr2lat_new", "акция", "aksiya");
t("cyr2lat_new", "официант", "ofitsiant");
t("cyr2lat_new", "ёлғиз", "yolğiz");
t("cyr2lat_new", "ЁЛҒИЗ", "YOLĞIZ");
t("cyr2lat_new", "Ёлғиз", "Yolğiz");
t("cyr2lat_new", "юлдуз", "yulduz");
t("cyr2lat_new", "яхши", "yaxşi");
t("cyr2lat_new", "XXI аср", "XXI asr");
t("cyr2lat_new", "2026 йил", "2026 yil");

console.log("\n=== KIRILL -> ESKI LOTIN ===");
t("cyr2lat_old", "шаҳар", "shahar");
t("cyr2lat_old", "Ўзбекистон", "Oʻzbekiston");
t("cyr2lat_old", "ғалаба", "gʻalaba");
t("cyr2lat_old", "Исҳоқ", "Isʼhoq");
t("cyr2lat_old", "Исҳоқов", "Isʼhoqov");     // qo'shimcha bilan ham
t("cyr2lat_old", "асҳоб", "asʼhob");
t("cyr2lat_old", "объект", "obyekt");
t("cyr2lat_old", "чиройли", "chiroyli");

console.log("\n=== LOTIN -> KIRILL ===");
t("lat2cyr", "shahar", "шаҳар");
t("lat2cyr", "şahar", "шаҳар");
t("lat2cyr", "SHAHAR", "ШАҲАР");
t("lat2cyr", "Shahar", "Шаҳар");
t("lat2cyr", "O'zbekiston", "Ўзбекистон");
t("lat2cyr", "Özbekiston", "Ўзбекистон");
t("lat2cyr", "g'alaba", "ғалаба");
t("lat2cyr", "ğalaba", "ғалаба");
t("lat2cyr", "chiroyli", "чиройли");
t("lat2cyr", "çiroyli", "чиройли");
t("lat2cyr", "yo'l", "йўл");
t("lat2cyr", "yoz", "ёз");
t("lat2cyr", "Yoz", "Ёз");
t("lat2cyr", "yulduz", "юлдуз");
t("lat2cyr", "yaxshi", "яхши");
t("lat2cyr", "erkin", "эркин");
t("lat2cyr", "kecha", "кеча");
t("lat2cyr", "poema", "поэма");
t("lat2cyr", "poyezd", "поезд");
t("lat2cyr", "Yer", "Ер");
t("lat2cyr", "ma'no", "маъно");
t("lat2cyr", "san'at", "санъат");
t("lat2cyr", "xabar", "хабар");
t("lat2cyr", "havo", "ҳаво");
t("lat2cyr", "qalam", "қалам");
t("lat2cyr", "2026-yil, 14-iyul", "2026-йил, 14-июл");

console.log("\n=== LOTIN -> KIRILL: istisno so'zlar qo'shimchalar bilan ===");
t("lat2cyr", "Is'hoq", "Исҳоқ");
t("lat2cyr", "Ishoq", "Исҳоқ");
t("lat2cyr", "Is'hoqov", "Исҳоқов");
t("lat2cyr", "Ishoqni", "Исҳоқни");
t("lat2cyr", "ISHOQGA", "ИСҲОҚГА");
t("lat2cyr", "Mus'hafdan", "Мусҳафдан");
t("lat2cyr", "mashq", "машқ");               // xavfli o'zak himoyasi
t("lat2cyr", "mashhur", "машҳур");

console.log("\n=== LOTIN -> KIRILL: ц ni tiklash (TUZATILDI) ===");
t("lat2cyr", "sirk", "цирк");                // lug'at
t("lat2cyr", "sirkka bordik", "циркка бордик"); // lug'at + qo'shimcha
t("lat2cyr", "sirka", "сирка");              // sirka (achchiq suyuqlik) buzilmaydi!
t("lat2cyr", "aksiya", "акция");
t("lat2cyr", "aksiyalar", "акциялар");
t("lat2cyr", "Aksiya", "Акция");
t("lat2cyr", "konsertga", "концертга");
t("lat2cyr", "sement", "цемент");
t("lat2cyr", "ofitsiant", "официант");       // qoida: unlilar orasida
t("lat2cyr", "militsiya", "милиция");
t("lat2cyr", "konstitutsiya", "конституция");
t("lat2cyr", "litsey", "лицей");
t("lat2cyr", "tsex", "цех");                 // qoida: so'z boshida
t("lat2cyr", "abzats", "абзац");             // qoida: so'z oxirida
t("lat2cyr", "ketsin", "кетсин");            // fe'l qo'shimchasi — ц EMAS!
t("lat2cyr", "ketsa", "кетса");
t("lat2cyr", "ketsam", "кетсам");
t("lat2cyr", "aytsangiz", "айтсангиз");
t("lat2cyr", "ketsinlar", "кетсинлар");

console.log("\n=== LOTIN -> KIRILL: ъ lug'ati ===");
t("lat2cyr", "obyekt", "объект");
t("lat2cyr", "Obyektiv", "Объектив");
t("lat2cyr", "subyekt", "субъект");
t("lat2cyr", "syezd", "съезд");

console.log("\n=== LOTIN -> KIRILL: rim raqamlari ===");
t("lat2cyr", "XXI asr", "XXI аср");
t("lat2cyr", "IV bob va X asr", "IV боб ва X аср");
t("lat2cyr", "XIV Lui", "XIV Луи");
t("lat2cyr", "MMXXVI yil", "MMXXVI йил");
t("lat2cyr", "Iigirma", "Иигирма");

console.log("\n=== REJIMNI ANIQLASH ===");
const d1 = E.detectMode("Бу кирилл матни. Ўзбекистон Республикаси тўғрисида қонун ҳужжатлари мажмуаси эълон қилинди.");
console.log((d1 && d1.mode === "cyr2lat_new" ? "OK   " : "XATO ") + "kirill matn -> " + (d1 && d1.mode));
if (d1 && d1.mode === "cyr2lat_new") pass++; else fail++;
const d2 = E.detectMode("Bu eski lotin matni. O'zbekiston sharoitida ishlab chiqarish va boshqa sohalarda o'zgarishlar bo'lishi kutilmoqda.");
console.log((d2 && d2.mode === "old2new" ? "OK   " : "XATO ") + "eski lotin -> " + (d2 && d2.mode));
if (d2 && d2.mode === "old2new") pass++; else fail++;

console.log("\n=== WILDCARD QOIDALARI (Word uchun) ===");
const rules = E.searchRules("old2new", {});
const hasWildIshoq = rules.some(r => r.wildcard && r.find === "<Ishoq");
const hasWildMash = rules.some(r => r.wildcard && r.find === "<Mash>");
console.log((hasWildIshoq ? "OK   " : "XATO ") + "\"<Ishoq\" wildcard qoidasi bor (qo'shimchalar uchun)");
console.log((hasWildMash ? "OK   " : "XATO ") + "\"<Mash>\" faqat butun so'z qoidasi bor (mashq himoyasi)");
if (hasWildIshoq) pass++; else fail++;
if (hasWildMash) pass++; else fail++;

console.log(`\n========= NATIJA: ${pass} ta o'tdi, ${fail} ta xato =========`);
process.exit(fail ? 1 : 0);
