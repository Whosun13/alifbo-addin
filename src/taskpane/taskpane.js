/* global Office, Word, AlifboEngine */
"use strict";

var E = AlifboEngine;

// ============ SOZLAMALARNI ESLAB QOLISH ============
var STORE_KEY = "alifbo.settings.v1";

function loadSettings() {
    try {
        var raw = localStorage.getItem(STORE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
}
function saveSettings(s) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) { /* xotira yopiq bo'lsa jim o'tamiz */ }
}

// ============ ISTISNO SO'ZLAR ============
function parseExceptions(textVal) {
    var list = [];
    textVal.split("\n").forEach(function (line) {
        line = line.trim();
        if (!line) return;
        var parts = line.split("=");
        var lat = parts[0].trim();
        if (!lat) return;
        var cyr = (parts[1] || "").trim();
        if (!cyr) {
            // Kirill shakli berilmagan bo'lsa — engine orqali avtomatik hosil qilamiz
            cyr = E.convert(lat, "lat2cyr", { exceptions: [] }).text;
        }
        list.push({ lat: lat, cyr: cyr });
    });
    return list;
}
function exceptionsToText(list) {
    return list.map(function (ex) { return ex.lat + " = " + ex.cyr; }).join("\n");
}
function currentExceptions() {
    return parseExceptions(document.getElementById("exceptions").value);
}

// ============ HOZIRGI SOZLAMALAR ============
function currentOpts() {
    return {
        mode: document.getElementById("mode").value,
        scope: document.querySelector('input[name="scope"]:checked').value,
        normalizeTutuq: document.getElementById("normalizeTutuq").checked,
        exceptions: currentExceptions()
    };
}

function persist() {
    var o = currentOpts();
    saveSettings({
        mode: o.mode,
        scope: o.scope,
        normalizeTutuq: o.normalizeTutuq,
        exceptionsText: document.getElementById("exceptions").value
    });
}

// ============ WORD BILAN ISHLASH ============

// Ko'rib chiqish: hech narsani o'zgartirmasdan hisoblaydi
function previewCounts(opts) {
    return Word.run(function (context) {
        var target = opts.scope === "selection"
            ? context.document.getSelection()
            : context.document.body;
        target.load("text");
        return context.sync().then(function () {
            return E.convert(target.text, opts.mode, opts);
        });
    });
}

// Lotin<->lotin, butun hujjat: search&replace — formatlash to'liq saqlanadi
function applyBySearch(opts) {
    return Word.run(function (context) {
        var body = context.document.body;
        var rules = E.searchRules(opts.mode, opts);
        var cats = { istisno: 0, sh: 0, ch: 0, oo: 0, gh: 0, tutuq: 0 };
        var count = 0;

        var chain = context.sync();
        rules.forEach(function (rule) {
            chain = chain.then(function () {
                // Istisno so'zlar wildcard bilan qidiriladi: "<Ishoq" (so'z boshi),
                // "<Mash>" (butun so'z) — wildcard qidiruv registrga sezgir.
                var searchOpts = rule.wildcard
                    ? { matchWildcards: true }
                    : { matchCase: true, matchWildcards: false };
                var found = body.search(rule.find, searchOpts);
                found.load("items");
                return context.sync().then(function () {
                    var n = found.items.length;
                    if (n) {
                        count += n;
                        if (rule.cat) cats[rule.cat] = (cats[rule.cat] || 0) + n;
                        for (var k = 0; k < found.items.length; k++) {
                            found.items[k].insertText(rule.to, Word.InsertLocation.replace);
                        }
                        return context.sync();
                    }
                });
            });
        });
        return chain.then(function () { return { count: count, cats: cats }; });
    });
}

// Boshqa rejimlar, butun hujjat: xatboshi bo'yicha (faqat o'zgarganlari qayta yoziladi)
function applyByParagraphs(opts) {
    return Word.run(function (context) {
        var paras = context.document.body.paragraphs;
        paras.load("items/text");
        return context.sync().then(function () {
            var count = 0;
            paras.items.forEach(function (p) {
                var res = E.convert(p.text, opts.mode, opts);
                if (res.text !== p.text) {
                    count += res.count;
                    p.insertText(res.text, Word.InsertLocation.replace);
                }
            });
            return context.sync().then(function () { return { count: count }; });
        });
    });
}

// Belgilangan matn: bitta bo'lakni o'girish
function applyToSelection(opts) {
    return Word.run(function (context) {
        var sel = context.document.getSelection();
        sel.load("text");
        return context.sync().then(function () {
            var res = E.convert(sel.text, opts.mode, opts);
            if (res.text !== sel.text) {
                sel.insertText(res.text, Word.InsertLocation.replace);
            }
            return context.sync().then(function () { return { count: res.count, cats: res.cats }; });
        });
    });
}

function applyChanges(opts) {
    if (opts.scope === "selection") return applyToSelection(opts);
    if (opts.mode === "old2new" || opts.mode === "new2old") return applyBySearch(opts);
    return applyByParagraphs(opts);
}

// Hujjat ochilganda rejimni avtomatik taxmin qilish
function autoDetect() {
    return Word.run(function (context) {
        var body = context.document.body;
        body.load("text");
        return context.sync().then(function () {
            return E.detectMode(body.text || "");
        });
    });
}

// ============ UI ============
var MODE_HINTS = {
    old2new: "Sh→Ş, Ch→Ç, Oʻ→Ö, Gʻ→Ğ. Istisno so'zlar himoyalanadi. Formatlash to'liq saqlanadi.",
    new2old: "Ş→Sh, Ç→Ch, Ö→Oʻ, Ğ→Gʻ. Formatlash to'liq saqlanadi.",
    cyr2lat_new: "Kirill matni yangi lotin alifbosiga o'giriladi (шаҳар → şahar).",
    cyr2lat_old: "Kirill matni eski lotin alifbosiga o'giriladi (шаҳар → shahar).",
    lat2cyr: "Eski va yangi lotin aralash bo'lsa ham kirillga o'giradi. Rim raqamlari (XXI, IV) o'z holicha qoladi."
};

var MODE_NAMES = {
    old2new: "Eski lotin → Yangi lotin",
    new2old: "Yangi lotin → Eski lotin",
    cyr2lat_new: "Kirill → Yangi lotin",
    cyr2lat_old: "Kirill → Eski lotin",
    lat2cyr: "Lotin → Kirill"
};

Office.onReady(function (info) {
    if (info.host !== Office.HostType.Word) return;
    document.getElementById("loading").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    restoreUI();
    wireUp();
    // Avto-aniqlash — panel ochilishini sekinlashtirmasligi uchun keyinroq
    setTimeout(runAutoDetect, 300);
});

function restoreUI() {
    var s = loadSettings();
    if (s.mode) document.getElementById("mode").value = s.mode;
    if (s.scope) {
        var el = document.querySelector('input[name="scope"][value="' + s.scope + '"]');
        if (el) el.checked = true;
    }
    document.getElementById("normalizeTutuq").checked = !!s.normalizeTutuq;
    document.getElementById("exceptions").value =
        s.exceptionsText || exceptionsToText(E.DEFAULT_EXCEPTIONS);
    syncModeUI();
}

function syncModeUI() {
    var mode = document.getElementById("mode").value;
    document.getElementById("modeHint").textContent = MODE_HINTS[mode] || "";
    document.getElementById("tutuq-group").classList.toggle("hidden", mode !== "old2new");
}

function wireUp() {
    document.getElementById("mode").addEventListener("change", function () {
        syncModeUI();
        persist();
    });
    document.querySelectorAll('input[name="scope"]').forEach(function (el) {
        el.addEventListener("change", persist);
    });
    document.getElementById("normalizeTutuq").addEventListener("change", persist);

    document.getElementById("previewBtn").addEventListener("click", function () {
        run(previewCounts, false);
    });
    document.getElementById("applyBtn").addEventListener("click", function () {
        run(applyChanges, true);
    });

    document.getElementById("saveExceptions").addEventListener("click", function () {
        // Tozalab qayta yozamiz — noto'g'ri qatorlar tushib qoladi
        var list = currentExceptions();
        document.getElementById("exceptions").value = exceptionsToText(list);
        persist();
        flashSaved();
    });
    document.getElementById("resetExceptions").addEventListener("click", function () {
        document.getElementById("exceptions").value = exceptionsToText(E.DEFAULT_EXCEPTIONS);
        persist();
        flashSaved();
    });

    document.getElementById("bannerClose").addEventListener("click", function () {
        document.getElementById("banner").classList.add("hidden");
    });
}

function flashSaved() {
    var el = document.getElementById("exSaved");
    el.classList.remove("hidden");
    setTimeout(function () { el.classList.add("hidden"); }, 1600);
}

function runAutoDetect() {
    autoDetect().then(function (det) {
        if (!det) return;
        var currentMode = document.getElementById("mode").value;
        var bannerText;
        if (det.mode === currentMode) {
            bannerText = "Hujjatda taxminan " + det.count + " ta o'giriladigan o'rin topildi.";
        } else {
            document.getElementById("mode").value = det.mode;
            syncModeUI();
            bannerText = "Hujjat tahlil qilindi — \u00AB" + MODE_NAMES[det.mode] +
                "\u00BB rejimi tavsiya etildi (~" + det.count + " ta o'rin).";
        }
        document.getElementById("bannerText").textContent = bannerText;
        document.getElementById("banner").classList.remove("hidden");
    }).catch(function () { /* aniqlash ishlamasa jim o'tamiz */ });
}

function run(fn, applied) {
    setBusy(true);
    var opts = currentOpts();
    fn(opts)
        .then(function (res) { showResults(res, applied, opts); })
        .catch(function (err) { showError(err); })
        .then(function () { setBusy(false); });
}

function setBusy(b) {
    document.getElementById("previewBtn").disabled = b;
    document.getElementById("applyBtn").disabled = b;
}

var CAT_LABELS = {
    istisno: "Istisno so'zlar (Isʼhoq...)",
    sh: "Sh / sh → Ş / ş",
    ch: "Ch / ch → Ç / ç",
    oo: "Oʻ / oʻ → Ö / ö",
    gh: "Gʻ / gʻ → Ğ / ğ",
    tutuq: "Tutuq belgisi → ʼ"
};

function showResults(res, applied, opts) {
    var box = document.getElementById("results");
    var total = res.count || 0;
    var html = "";

    if (total === 0) {
        box.classList.add("empty");
        html = '<div class="r-head">O\'zgartiriladigan matn topilmadi</div>';
        if (opts.scope === "selection") {
            html += '<div class="r-row"><span class="pair">Avval hujjatda matn belgilanganiga ishonch hosil qiling</span></div>';
        }
    } else {
        box.classList.remove("empty");
        var title = applied
            ? "Bajarildi — " + total + " ta o'zgartirish"
            : "Topildi — " + total + " ta (hali o'zgartirilmadi)";
        html = '<div class="r-head">' + title + "</div>";

        if (res.cats) {
            var order = ["istisno", "sh", "ch", "oo", "gh", "tutuq"];
            order.forEach(function (c) {
                if (res.cats[c] > 0) {
                    html += '<div class="r-row"><span class="pair">' + CAT_LABELS[c] +
                        '</span><span class="count">' + res.cats[c] + "</span></div>";
                }
            });
        }
        html += applied
            ? '<div class="r-row"><span class="pair">Qaytarish</span><span class="count">Ctrl+Z</span></div>'
            : '<div class="r-row"><span class="pair">Tasdiqlash uchun</span><span class="count">\u00ABO\'zgartirish\u00BB</span></div>';
    }
    box.innerHTML = html;
    box.classList.remove("hidden");
}

function showError(err) {
    var box = document.getElementById("results");
    box.classList.add("empty");
    box.classList.remove("hidden");
    var msg = (err && err.message) ? err.message : "Noma'lum xatolik";
    box.innerHTML = '<div class="r-head">Xatolik yuz berdi</div>' +
        '<div class="r-row"><span class="pair">' + msg + "</span></div>";
    if (window.console) console.error(err);
}
