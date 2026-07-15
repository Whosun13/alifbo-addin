// Oddiy HTTPS statik server (localhost:3000).
// Office add-in faqat HTTPS orqali ishlaydi, shuning uchun ishonchli localhost
// sertifikatini office-addin-dev-certs orqali olamiz.

const https = require("https");
const fs = require("fs");
const path = require("path");
const devCerts = require("office-addin-dev-certs");

const PORT = 3000;
const ROOT = __dirname;

const MIME = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".png": "image/png",
    ".xml": "text/xml; charset=utf-8",
    ".json": "application/json; charset=utf-8"
};

function serve(req, res) {
    // CORS — Office ba'zan resurslarni tekshiradi
    res.setHeader("Access-Control-Allow-Origin", "*");

    let urlPath = decodeURIComponent(req.url.split("?")[0]);
    if (urlPath === "/") urlPath = "/src/taskpane/taskpane.html";

    // Yo'lni ROOT ichida ushlab turamiz (traversal himoyasi)
    const filePath = path.normalize(path.join(ROOT, urlPath));
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403); res.end("Forbidden"); return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end("Topilmadi: " + urlPath); return; }
        res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
        res.end(data);
    });
}

devCerts.getHttpsServerOptions().then((options) => {
    https.createServer(options, serve).listen(PORT, () => {
        console.log("Dev server: https://localhost:" + PORT);
        console.log("Task pane:  https://localhost:" + PORT + "/src/taskpane/taskpane.html");
    });
}).catch((e) => {
    console.error("Sertifikat xatosi. Avval `npx office-addin-dev-certs install` ni bajaring.");
    console.error(e);
    process.exit(1);
});
