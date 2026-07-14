/*
 * Alifbo Engine — o'zbek alifbolari o'rtasida o'girish yadrosi.
 * Rejimlar: old2new, new2old, cyr2lat_new, cyr2lat_old, lat2cyr
 *
 * Yondashuv (lotin.uz kabi): kontekstli qoidalar + lug'at.
 *   - Istisno so'zlar (Isʼhoq...) qo'shimchalar bilan ham ishlaydi: Isʼhoqov, Isʼhoqni.
 *   - ц tiklash: qoida (unlilar orasida, so'z boshida/oxirida) + ц-lug'at (sirk→цирк).
 *     Fe'l qo'shimchalari himoyalanadi: ketsin, ketsa → кетсин, кетса (кецин EMAS).
 *   - объект→obyekt: ъ harfi е/ё/ю/я oldidan tushib qoladi; boshqa joyda ʼ (маъно→maʼno).
 *   - Rim raqamlari lotin→kirillda o'z holicha (XXI asr → XXI аср).
 */
(function (root, factory) {
    if (typeof module === "object" && module.exports) module.exports = factory();
    else root.AlifboEngine = factory();
}(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    var APOS = ["\u0027", "\u2019", "\u2018", "\u02BB", "\u02BC", "\u0060", "\u00B4"];
    var APOS_CHARS = "\u0027\u2019\u2018\u02BB\u02BC\u0060\u00B4";
    var APOS_CLASS = "[" + APOS_CHARS + "]";
    var TUTUQ = "\u02BC"; // ʼ

    var LAT_VOWELS = "aeiou\u00F6AEIOU\u00D6";
    var CYR_VOWELS = "\u0430\u0435\u0451\u0438\u043E\u0443\u044D\u044E\u044F\u045E\u0410\u0415\u0401\u0418\u041E\u0423\u042D\u042E\u042F\u040E";
    var CYR_IOTATED = "\u0435\u0451\u044E\u044F\u0415\u0401\u042E\u042F"; // е ё ю я

    function isLetter(ch) { return !!ch && /\p{L}/u.test(ch); }
    function isUpper(ch) { return !!ch && ch !== ch.toLowerCase() && ch === ch.toUpperCase(); }
    function isApos(ch) { return APOS.indexOf(ch) !== -1; }
    function isLatVowel(ch) { return !!ch && LAT_VOWELS.indexOf(ch) !== -1; }
    function isCyrVowel(ch) { return !!ch && CYR_VOWELS.indexOf(ch) !== -1; }

    function caseOut(out, ch, prevCh, nextCh) {
        if (!isUpper(ch)) return out;
        var neighborUpper = (isLetter(nextCh) && isUpper(nextCh)) || (isLetter(prevCh) && isUpper(prevCh));
        if (neighborUpper) return out.toUpperCase();
        return out.charAt(0).toUpperCase() + out.slice(1);
    }

    function matchCase(sample, canonical) {
        var letters = sample.replace(new RegExp(APOS_CLASS, "g"), "");
        if (letters === letters.toUpperCase() && letters !== letters.toLowerCase()) {
            return canonical.toUpperCase();
        }
        if (isUpper(sample.charAt(0))) {
            return canonical.charAt(0).toUpperCase() + canonical.slice(1).toLowerCase();
        }
        return canonical.toLowerCase();
    }

    function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

    var BOUNDARY_BEFORE = "(?<![\\p{L}" + APOS_CHARS + "])";
    var BOUNDARY_AFTER = "(?![\\p{L}" + APOS_CHARS + "])";

    // ================= ISTISNO SO'ZLAR (s'h — ikki tovush) =================
    var DEFAULT_EXCEPTIONS = [
        { lat: "Is\u02BChoq", cyr: "\u0418\u0441\u04B3\u043E\u049B" },
        { lat: "As\u02BChob", cyr: "\u0410\u0441\u04B3\u043E\u0431" },
        { lat: "Mus\u02BChaf", cyr: "\u041C\u0443\u0441\u04B3\u0430\u0444" },
        { lat: "Mas\u02BCh", cyr: "\u041C\u0430\u0441\u04B3" }
    ];

    // Apostrof MAJBURIY bo'lgan naqsh: Is[apos]hoq
    function patternWithApos(lat) {
        var p = "";
        for (var i = 0; i < lat.length; i++) {
            var ch = lat.charAt(i);
            p += isApos(ch) ? APOS_CLASS : escapeRe(ch);
        }
        return p;
    }
    // Apostrofsiz naqsh: Ishoq
    function bareStem(lat) {
        return lat.split("").filter(function (c) { return !isApos(c); }).join("");
    }

    /*
     * Istisno so'zlarni "muzlatish". FAQAT O'ZAK muzlatiladi — qo'shimcha matnda
     * qoladi va oddiy qoidalar bilan o'giriladi (Isʼhoqcha -> Isʼhoqça).
     *
     * Xavfsizlik: qisqa o'zaklar (masalan Masʼh -> "mash") apostrofsiz yozilganda
     * faqat butun so'z sifatida mos keladi, aks holda "mashq", "mashhur" kabi
     * oddiy so'zlar buzilib ketardi. Apostrof bilan yozilgan shakl (mas'hni)
     * har doim, har qanday qo'shimcha bilan ishlaydi.
     */
    function protectExceptions(text, exceptions, outKey, counter) {
        var frozen = [];
        var out = text;
        exceptions.forEach(function (ex) {
            var canonical = ex[outKey];
            var bare = bareStem(ex.lat);
            var risky = bare.length < 5;

            var regexes = [
                // 1) apostrofli shakl — qo'shimcha bilan ham
                new RegExp(BOUNDARY_BEFORE + patternWithApos(ex.lat), "giu"),
                // 2) apostrofsiz shakl — xavfli o'zaklarda faqat butun so'z
                new RegExp(BOUNDARY_BEFORE + escapeRe(bare) + (risky ? BOUNDARY_AFTER : ""), "giu")
            ];
            regexes.forEach(function (re) {
                out = out.replace(re, function (m) {
                    var idx = frozen.length;
                    frozen.push(matchCase(m, canonical));
                    if (counter) counter.count++;
                    return "\uE000" + idx + "\uE001";
                });
            });
        });
        return {
            text: out,
            restore: function (t) {
                return t.replace(/\uE000(\d+)\uE001/g, function (_, i) { return frozen[+i]; });
            }
        };
    }

    // ================= Ц / Ъ LUG'ATI (lotin -> kirill) =================
    // Qoida bilan tiklab bo'lmaydigan ruscha-baynalmilal so'zlar.
    // vs (vowel suffix): true — unli bilan boshlanadigan qo'shimchaga ham ruxsat.
    // sirk uchun false: "sirka" (achchiq suyuqlik) циркa bo'lib ketmasligi kerak.
    var LOAN_DICT = [
        { lat: "sirk", cyr: "\u0446\u0438\u0440\u043A", vs: false },
        { lat: "sement", cyr: "\u0446\u0435\u043C\u0435\u043D\u0442", vs: true },
        { lat: "aksiya", cyr: "\u0430\u043A\u0446\u0438\u044F", vs: true },
        { lat: "aksioner", cyr: "\u0430\u043A\u0446\u0438\u043E\u043D\u0435\u0440", vs: true },
        { lat: "aksent", cyr: "\u0430\u043A\u0446\u0435\u043D\u0442", vs: true },
        { lat: "konsert", cyr: "\u043A\u043E\u043D\u0446\u0435\u0440\u0442", vs: true },
        { lat: "konsepsiya", cyr: "\u043A\u043E\u043D\u0446\u0435\u043F\u0446\u0438\u044F", vs: true },
        { lat: "resept", cyr: "\u0440\u0435\u0446\u0435\u043F\u0442", vs: true },
        { lat: "protsess", cyr: "\u043F\u0440\u043E\u0446\u0435\u0441\u0441", vs: true },
        { lat: "senzura", cyr: "\u0446\u0435\u043D\u0437\u0443\u0440\u0430", vs: true },
        { lat: "sitata", cyr: "\u0446\u0438\u0442\u0430\u0442\u0430", vs: true },
        { lat: "sikl", cyr: "\u0446\u0438\u043A\u043B", vs: true },
        { lat: "silindr", cyr: "\u0446\u0438\u043B\u0438\u043D\u0434\u0440", vs: true },
        { lat: "sivilizatsiya", cyr: "\u0446\u0438\u0432\u0438\u043B\u0438\u0437\u0430\u0446\u0438\u044F", vs: true },
        { lat: "obyekt", cyr: "\u043E\u0431\u044A\u0435\u043A\u0442", vs: true },
        { lat: "subyekt", cyr: "\u0441\u0443\u0431\u044A\u0435\u043A\u0442", vs: true },
        { lat: "syezd", cyr: "\u0441\u044A\u0435\u0437\u0434", vs: true },
        { lat: "inyeksiya", cyr: "\u0438\u043D\u044A\u0435\u043A\u0446\u0438\u044F", vs: true }
    ];

    var LAT_VOWEL_CLASS = "[aeiou\u00F6AEIOU\u00D6]";

    function protectLoanwords(text, counter) {
        var frozen = [];
        var out = text;
        LOAN_DICT.forEach(function (w) {
            var tail = w.vs ? "" : "(?!" + LAT_VOWEL_CLASS + ")";
            var re = new RegExp(BOUNDARY_BEFORE + escapeRe(w.lat) + tail, "giu");
            out = out.replace(re, function (m) {
                var idx = frozen.length;
                frozen.push(matchCase(m, w.cyr));
                if (counter) counter.count++;
                return "\uE004" + idx + "\uE005";
            });
        });
        return {
            text: out,
            restore: function (t) {
                return t.replace(/\uE004(\d+)\uE005/g, function (_, i) { return frozen[+i]; });
            }
        };
    }

    // ================= RIM RAQAMLARI =================
    var ROMAN_RE = new RegExp(
        "(?<![A-Za-z\u0400-\u04FF])" +
        "(?=[IVXLCDM])(M{0,3}(?:CM|CD|D?C{0,3})(?:XC|XL|L?X{0,3})(?:IX|IV|V?I{0,3}))" +
        "(?![A-Za-z\u0400-\u04FF])", "g");

    function protectRomans(text) {
        var frozen = [];
        var out = text.replace(ROMAN_RE, function (m) {
            if (!m) return m;
            var idx = frozen.length;
            frozen.push(m);
            return "\uE002" + idx + "\uE003";
        });
        return {
            text: out,
            restore: function (t) {
                return t.replace(/\uE002(\d+)\uE003/g, function (_, i) { return frozen[+i]; });
            }
        };
    }

    // ================= ESKI <-> YANGI LOTIN =================
    function oldToNewRules() {
        var r = [
            { find: "SH", to: "\u015E", cat: "sh" }, { find: "Sh", to: "\u015E", cat: "sh" }, { find: "sh", to: "\u015F", cat: "sh" },
            { find: "CH", to: "\u00C7", cat: "ch" }, { find: "Ch", to: "\u00C7", cat: "ch" }, { find: "ch", to: "\u00E7", cat: "ch" }
        ];
        APOS.forEach(function (a) {
            r.push({ find: "O" + a, to: "\u00D6", cat: "oo" });
            r.push({ find: "o" + a, to: "\u00F6", cat: "oo" });
            r.push({ find: "G" + a, to: "\u011E", cat: "gh" });
            r.push({ find: "g" + a, to: "\u011F", cat: "gh" });
        });
        return r;
    }

    function newToOldRules() {
        return [
            { find: "\u015E", to: "Sh", cat: "sh" }, { find: "\u015F", to: "sh", cat: "sh" },
            { find: "\u00C7", to: "Ch", cat: "ch" }, { find: "\u00E7", to: "ch", cat: "ch" },
            { find: "\u00D6", to: "O\u02BB", cat: "oo" }, { find: "\u00F6", to: "o\u02BB", cat: "oo" },
            { find: "\u011E", to: "G\u02BB", cat: "gh" }, { find: "\u011F", to: "g\u02BB", cat: "gh" }
        ];
    }

    var TUTUQ_NORM_SET = ["\u0027", "\u2019", "\u2018", "\u02BB", "\u0060", "\u00B4"];

    function applyRules(text, rules, cats) {
        var out = text, count = 0;
        rules.forEach(function (rule) {
            var parts = out.split(rule.find);
            if (parts.length > 1) {
                var n = parts.length - 1;
                count += n;
                if (cats && rule.cat) cats[rule.cat] = (cats[rule.cat] || 0) + n;
                out = parts.join(rule.to);
            }
        });
        return { text: out, count: count };
    }

    function convertLatinDir(text, mode, opts) {
        opts = opts || {};
        var cats = { sh: 0, ch: 0, oo: 0, gh: 0, tutuq: 0, istisno: 0 };
        var counter = { count: 0 };
        var prot = null;

        if (mode === "old2new") {
            prot = protectExceptions(text, opts.exceptions || DEFAULT_EXCEPTIONS, "lat", counter);
            text = prot.text;
            cats.istisno = counter.count;
        }

        var rules = mode === "old2new" ? oldToNewRules() : newToOldRules();
        var res = applyRules(text, rules, cats);
        var out = res.text;
        var count = res.count + counter.count;

        if (mode === "old2new" && opts.normalizeTutuq) {
            TUTUQ_NORM_SET.forEach(function (a) {
                var parts = out.split(a);
                if (parts.length > 1) {
                    cats.tutuq += parts.length - 1;
                    count += parts.length - 1;
                    out = parts.join(TUTUQ);
                }
            });
        }

        if (prot) out = prot.restore(out);
        return { text: out, count: count, cats: cats };
    }

    // ================= KIRILL -> LOTIN =================
    var CYR_SINGLE = {
        "\u0430": "a", "\u0431": "b", "\u0432": "v", "\u0433": "g", "\u0434": "d",
        "\u0436": "j", "\u0437": "z", "\u0438": "i", "\u0439": "y", "\u043A": "k",
        "\u043B": "l", "\u043C": "m", "\u043D": "n", "\u043E": "o", "\u043F": "p",
        "\u0440": "r", "\u0441": "s", "\u0442": "t", "\u0443": "u", "\u0444": "f",
        "\u0445": "x", "\u044D": "e", "\u049B": "q", "\u04B3": "h"
    };

    function cyr2lat(text, target, opts) {
        var isNew = target === "new";
        var out = "";
        var count = 0;

        var map2 = {
            "\u0448": isNew ? "\u015F" : "sh",
            "\u0449": isNew ? "\u015F" : "sh",
            "\u0447": isNew ? "\u00E7" : "ch",
            "\u045E": isNew ? "\u00F6" : "o\u02BB",
            "\u0493": isNew ? "\u011F" : "g\u02BB",
            "\u0451": "yo", "\u044E": "yu", "\u044F": "ya"
        };

        for (var i = 0; i < text.length; i++) {
            var ch = text.charAt(i);
            var lower = ch.toLowerCase();
            var prev = i > 0 ? text.charAt(i - 1) : "";
            var next = i + 1 < text.length ? text.charAt(i + 1) : "";

            // е — so'z boshida / unlidan keyin / ъ ь dan keyin: ye
            if (lower === "\u0435") {
                var yeCond = !isLetter(prev) || isCyrVowel(prev) ||
                    prev === "\u044A" || prev === "\u042A" || prev === "\u044C" || prev === "\u042C";
                out += yeCond ? caseOut("ye", ch, prev, next) : (isUpper(ch) ? "E" : "e");
                count++;
                continue;
            }
            // ц — unlilar orasida ts, aks holda s
            if (lower === "\u0446") {
                var tsCond = isCyrVowel(prev) && isCyrVowel(next);
                out += tsCond ? caseOut("ts", ch, prev, next) : (isUpper(ch) ? "S" : "s");
                count++;
                continue;
            }
            // с + ҳ — eski lotinda "sh" bo'lib o'qilmasligi uchun tutuq (Исҳоқ -> Isʼhoq)
            if (!isNew && (lower === "\u0441") && next && next.toLowerCase() === "\u04B3") {
                out += (isUpper(ch) ? "S" : "s") + TUTUQ;
                count++;
                continue;
            }
            // ъ: е ё ю я oldidan tushib qoladi (объект -> obyekt), boshqa joyda ʼ (маъно -> maʼno)
            if (lower === "\u044A") {
                if (!(next && CYR_IOTATED.indexOf(next) !== -1)) out += TUTUQ;
                count++;
                continue;
            }
            if (lower === "\u044C") { count++; continue; } // ь tashlab yuboriladi

            if (map2[lower] !== undefined) {
                out += caseOut(map2[lower], ch, prev, next);
                count++;
                continue;
            }
            if (CYR_SINGLE[lower] !== undefined) {
                var t = CYR_SINGLE[lower];
                out += isUpper(ch) ? t.toUpperCase() : t;
                count++;
                continue;
            }
            out += ch; // lotin harflari (rim raqamlari), raqam, tinish — o'z holicha
        }
        return { text: out, count: count };
    }

    // ================= LOTIN -> KIRILL =================
    var LAT_SINGLE = {
        "a": "\u0430", "b": "\u0431", "d": "\u0434", "f": "\u0444", "g": "\u0433",
        "h": "\u04B3", "i": "\u0438", "j": "\u0436", "k": "\u043A", "l": "\u043B",
        "m": "\u043C", "n": "\u043D", "o": "\u043E", "p": "\u043F", "q": "\u049B",
        "r": "\u0440", "s": "\u0441", "t": "\u0442", "u": "\u0443", "v": "\u0432",
        "x": "\u0445", "y": "\u0439", "z": "\u0437",
        "\u00F6": "\u045E", "\u011F": "\u0493", "\u015F": "\u0448", "\u00E7": "\u0447"
    };

    // ts -> ц: fe'l qo'shimchalari bundan mustasno (ketsin, ketsa, ketsam, ketsinlar...)
    var TS_NATIVE_SUFFIX = /^(?:a|in(?:lar)?(?!\p{L}))/u;

    function lat2cyr(text, opts) {
        opts = opts || {};
        var count = 0;
        var counter = { count: 0 };

        // 1) Rim raqamlari (XXI asr -> XXI аср)
        var romans = protectRomans(text);
        text = romans.text;

        // 2) Istisno so'zlar (Isʼhoq -> Исҳоқ, qo'shimchalar bilan)
        var prot = protectExceptions(text, opts.exceptions || DEFAULT_EXCEPTIONS, "cyr", counter);
        text = prot.text;
        count += counter.count;

        // 3) Ц/Ъ lug'ati (aksiya -> акция, obyekt -> объект)
        var loans = protectLoanwords(text, counter);
        text = loans.text;

        var out = "";
        var i = 0;
        while (i < text.length) {
            var ch = text.charAt(i);
            var lower = ch.toLowerCase();
            var next = text.charAt(i + 1) || "";
            var next2 = text.charAt(i + 2) || "";
            var prev = i > 0 ? text.charAt(i - 1) : "";

            // Placeholder'larni o'tkazib yuborish
            if (ch === "\uE000" || ch === "\uE002" || ch === "\uE004") {
                var closer = ch === "\uE000" ? "\uE001" : (ch === "\uE002" ? "\uE003" : "\uE005");
                var end = text.indexOf(closer, i);
                out += text.slice(i, end + 1);
                i = end + 1;
                continue;
            }

            // s + tutuq + h -> сҳ (Is'hoq kabi umumiy qoida)
            if (lower === "s" && isApos(next) && next2 && next2.toLowerCase() === "h") {
                out += (isUpper(ch) ? "\u0421" : "\u0441") +
                    (isUpper(next2) ? "\u04B2" : "\u04B3");
                count++;
                i += 3;
                continue;
            }
            // o/g + apostrof -> ў/ғ
            if ((lower === "o" || lower === "g") && isApos(next)) {
                out += lower === "o" ? (isUpper(ch) ? "\u040E" : "\u045E") : (isUpper(ch) ? "\u0492" : "\u0493");
                count++;
                i += 2;
                continue;
            }
            // yangi alifbo harflari
            if (lower === "\u00F6" || lower === "\u011F" || lower === "\u015F" || lower === "\u00E7") {
                var m1 = LAT_SINGLE[lower];
                out += isUpper(ch) ? m1.toUpperCase() : m1;
                count++;
                i += 1;
                continue;
            }
            // sh / ch
            if ((lower === "s" || lower === "c") && next && next.toLowerCase() === "h") {
                out += lower === "s" ? (isUpper(ch) ? "\u0428" : "\u0448") : (isUpper(ch) ? "\u0427" : "\u0447");
                count++;
                i += 2;
                continue;
            }
            // y digraflari (yo'l da yo EMAS: o dan keyin apostrof bor)
            if (lower === "y" && next) {
                var nl = next.toLowerCase();
                if (nl === "o" && !isApos(next2)) { out += isUpper(ch) ? "\u0401" : "\u0451"; count++; i += 2; continue; }
                if (nl === "u") { out += isUpper(ch) ? "\u042E" : "\u044E"; count++; i += 2; continue; }
                if (nl === "a") { out += isUpper(ch) ? "\u042F" : "\u044F"; count++; i += 2; continue; }
                if (nl === "e") { out += isUpper(ch) ? "\u0415" : "\u0435"; count++; i += 2; continue; }
            }
            // ts -> ц: unlilar orasida / so'z boshida / so'z oxirida (fe'l qo'shimchalari mustasno)
            if (lower === "t" && next && next.toLowerCase() === "s") {
                var after = text.slice(i + 2).toLowerCase();
                var nativeSuffix = TS_NATIVE_SUFFIX.test(after);
                var wordStart = !isLetter(prev) && !isApos(prev);
                var wordEnd = !next2 || (!isLetter(next2) && !isApos(next2));
                var tsCond2 =
                    (isLatVowel(prev) && isLatVowel(next2) && !nativeSuffix) || // ofitsiant
                    (wordStart && isLatVowel(next2)) ||                          // tsex
                    (isLatVowel(prev) && wordEnd);                               // abzats
                if (tsCond2) {
                    out += isUpper(ch) ? "\u0426" : "\u0446";
                    count++;
                    i += 2;
                    continue;
                }
            }
            // e — so'z boshida yoki unlidan keyin: э, aks holda е
            if (lower === "e") {
                var eStart = !isLetter(prev) || isLatVowel(prev);
                out += eStart ? (isUpper(ch) ? "\u042D" : "\u044D") : (isUpper(ch) ? "\u0415" : "\u0435");
                count++;
                i += 1;
                continue;
            }
            // tutuq/apostrof -> ъ
            if (isApos(ch)) {
                out += "\u044A";
                count++;
                i += 1;
                continue;
            }
            if (LAT_SINGLE[lower] !== undefined) {
                var m2 = LAT_SINGLE[lower];
                out += isUpper(ch) ? m2.toUpperCase() : m2;
                count++;
                i += 1;
                continue;
            }
            out += ch;
            i += 1;
        }

        out = loans.restore(out);
        out = prot.restore(out);
        out = romans.restore(out);
        return { text: out, count: count };
    }

    // ================= UMUMIY =================
    function convert(text, mode, opts) {
        opts = opts || {};
        if (mode === "old2new" || mode === "new2old") return convertLatinDir(text, mode, opts);
        if (mode === "cyr2lat_new") return cyr2lat(text, "new", opts);
        if (mode === "cyr2lat_old") return cyr2lat(text, "old", opts);
        if (mode === "lat2cyr") return lat2cyr(text, opts);
        throw new Error("Noma'lum rejim: " + mode);
    }

    /*
     * Word search&replace qoidalari (formatlashni saqlaydigan yo'l).
     * Istisno so'zlar uchun WILDCARD qidiruv ishlatiladi:
     *   "<Ishoq"  — so'z boshidagi Ishoq (qo'shimchalar bilan: Ishoqov, Ishoqni)
     *   "<Mash>"  — xavfli qisqa o'zak: faqat butun so'z (mashq, mashhur buzilmaydi)
     */
    function searchRules(mode, opts) {
        opts = opts || {};
        var rules = [];
        if (mode === "old2new") {
            var exceptions = opts.exceptions || DEFAULT_EXCEPTIONS;
            var aposVars = ["\u0027", "\u2019", "\u02BB"];
            exceptions.forEach(function (ex) {
                var pos = -1;
                for (var i = 0; i < ex.lat.length; i++) if (isApos(ex.lat.charAt(i))) { pos = i; break; }
                if (pos < 0) return;
                var before = ex.lat.slice(0, pos), after = ex.lat.slice(pos + 1);
                var bare = before + after;
                var risky = bare.length < 5;
                var forms = [
                    [before, after, ex.lat, bare],
                    [before.toLowerCase(), after.toLowerCase(), ex.lat.toLowerCase(), bare.toLowerCase()],
                    [before.toUpperCase(), after.toUpperCase(), ex.lat.toUpperCase(), bare.toUpperCase()]
                ];
                forms.forEach(function (f) {
                    // apostrofli variantlar — qo'shimcha bilan ham (so'z boshi <)
                    aposVars.forEach(function (a) {
                        rules.push({ find: "<" + f[0] + a + f[1], to: f[2], cat: "istisno", wildcard: true });
                    });
                    // apostrofsiz variant
                    rules.push({
                        find: "<" + f[3] + (risky ? ">" : ""),
                        to: f[2], cat: "istisno", wildcard: true
                    });
                });
            });
            rules = rules.concat(oldToNewRules());
            if (opts.normalizeTutuq) {
                TUTUQ_NORM_SET.forEach(function (a) {
                    rules.push({ find: a, to: TUTUQ, cat: "tutuq" });
                });
            }
        } else if (mode === "new2old") {
            rules = newToOldRules();
        }
        return rules;
    }

    function detectMode(text) {
        var sample = text.slice(0, 30000);
        var cyr = (sample.match(/[\u0400-\u04FF]/g) || []).length;
        var newLat = (sample.match(/[\u015F\u015E\u00E7\u00C7\u00F6\u00D6\u011F\u011E]/g) || []).length;
        var oldLatRes = convertLatinDir(sample, "old2new", {});
        var oldLat = oldLatRes.count;
        if (cyr > 30 && cyr > oldLat) return { mode: "cyr2lat_new", count: cyr };
        if (newLat > 10 && newLat > oldLat) return { mode: "new2old", count: newLat };
        if (oldLat > 5) return { mode: "old2new", count: oldLat };
        return null;
    }

    return {
        convert: convert,
        searchRules: searchRules,
        detectMode: detectMode,
        DEFAULT_EXCEPTIONS: DEFAULT_EXCEPTIONS,
        LOAN_DICT: LOAN_DICT,
        TUTUQ: TUTUQ
    };
}));
