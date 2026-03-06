const http = require('http');

// ─── Environment Variables ───
const TOKENS = process.env.TOKENS ? process.env.TOKENS.split(',').map(t => t.trim()).filter(Boolean) : [];
const CHANNEL_IDS = process.env.CHANNEL_IDS ? process.env.CHANNEL_IDS.split(',').map(c => c.trim()).filter(Boolean) : [];
const MESSAGE1 = process.env.MESSAGE1 || '';
const MESSAGE2 = process.env.MESSAGE2 || '';

// ─── Validation ───
if (!TOKENS.length) { console.error('[X] TOKENS bos! Environment variable ekle.'); process.exit(1); }
if (!CHANNEL_IDS.length) { console.error('[X] CHANNEL_IDS bos! Environment variable ekle.'); process.exit(1); }
if (!MESSAGE1 && !MESSAGE2) { console.error('[X] MESSAGE1 ve MESSAGE2 bos! En az birini ekle.'); process.exit(1); }

const MESSAGES = [MESSAGE1, MESSAGE2].filter(Boolean);

console.log('════════════════════════════════════════');
console.log(`  Token Sayisi : ${TOKENS.length}`);
console.log(`  Kanal Sayisi : ${CHANNEL_IDS.length}`);
console.log(`  Mesaj Sayisi : ${MESSAGES.length}`);
console.log('════════════════════════════════════════');

// ─── Stats ───
let totalSent = 0;
let totalFail = 0;
let currentTokenIndex = 0;

// ─── Send Message ───
async function sendMessage(token, channelId, message) {
    const res = await fetch(`https://discord.com/api/v9/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        },
        body: JSON.stringify({ content: message })
    });
    return res;
}

// ─── Main Loop ───
async function tick() {
    // Siradaki token
    const token = TOKENS[currentTokenIndex];
    currentTokenIndex = (currentTokenIndex + 1) % TOKENS.length;

    // Rastgele kanal sec
    const channelId = CHANNEL_IDS[Math.floor(Math.random() * CHANNEL_IDS.length)];

    // Rastgele mesaj sec (MESSAGE1 veya MESSAGE2)
    const message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

    try {
        const res = await sendMessage(token, channelId, message);
        if (res.ok) {
            totalSent++;
            console.log(`[+] Hesap #${currentTokenIndex} -> Kanal ${channelId.slice(-4)} | Toplam: ${totalSent}`);
        } else {
            totalFail++;
            console.log(`[!] Hesap #${currentTokenIndex} | Status: ${res.status} | Fail: ${totalFail}`);
        }
    } catch (err) {
        totalFail++;
        console.log(`[X] Baglanti hatasi | Fail: ${totalFail}`);
    }

    // 200ms - 300ms arasi rastgele gecikme
    const delay = Math.floor(Math.random() * (300 - 200 + 1)) + 200;
    setTimeout(tick, delay);
}

// ─── Start ───
console.log('[*] Baslatiliyor...\n');
tick();

// ─── HTTP Server (Render icin) ───
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Aktif | Gonderilen: ${totalSent} | Hata: ${totalFail}`);
}).listen(PORT, () => {
    console.log(`[*] HTTP Server port ${PORT} uzerinde aktif\n`);
});
