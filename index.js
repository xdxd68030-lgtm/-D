const http = require('http');

const TOKENS = process.env.TOKENS ? process.env.TOKENS.split(',').map(t => t.trim()).filter(Boolean) : [];
const CHANNEL_IDS = process.env.CHANNEL_IDS ? process.env.CHANNEL_IDS.split(',').map(c => c.trim()).filter(Boolean) : [];
const MESSAGE1 = process.env.MESSAGE1 || '';
const MESSAGE2 = process.env.MESSAGE2 || '';

if (!TOKENS.length || !CHANNEL_IDS.length || (!MESSAGE1 && !MESSAGE2)) { console.error('[X] Degiskenler eksik!'); process.exit(1); }

const MESSAGES = [MESSAGE1, MESSAGE2].filter(Boolean);

console.log(`[*] ${TOKENS.length} token | ${CHANNEL_IDS.length} kanal | ${MESSAGES.length} mesaj`);
console.log('[*] Baslatiliyor...\n');

let totalSent = 0;
let currentTokenIndex = 0;

async function tick() {
    const token = TOKENS[currentTokenIndex];
    currentTokenIndex = (currentTokenIndex + 1) % TOKENS.length;

    const channelId = CHANNEL_IDS[Math.floor(Math.random() * CHANNEL_IDS.length)];
    const message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

    try {
        const res = await fetch(`https://discord.com/api/v9/channels/${channelId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({ content: message })
        });

        if (res.ok) {
            totalSent++;
            console.log(`[+] Hesap #${currentTokenIndex} | Toplam: ${totalSent}`);
        }
    } catch { }

    setImmediate(tick);
}

tick();

const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Aktif | Gonderilen: ${totalSent}`);
}).listen(PORT, () => console.log(`[*] Port ${PORT} aktif\n`));
