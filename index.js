const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const QRCode = require('qrcode');
const config = require('./config');

const bot = new TelegramBot(config.botToken, { polling: true });
const buttonIntervals = new Map();
const activeIntervals = {};

// Helper: Hitung Runtime
const getBotRuntime = () => {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    return `${hours}j ${minutes}m`;
};

// Fungsi Disco (Tombol Kedap-kedip)
function startDisco(chatId, messageId) {
    let index = 0;
    const interval = setInterval(async () => {
        index = (index + 1) % 3;
        try {
            await bot.editMessageReplyMarkup({
                inline_keyboard: [
                    [{ text: "Developer", url: "https://t.me/ReyCloudDev" }],
                    [{ text: "Deposit QRIS ", callback_data: "deposit" }],
                    [{ text: "Channel", url: "https://t.me/AboutReyZ4You" }]
                ]
            }, { chat_id: chatId, message_id: messageId });
        } catch (e) {}
    }, 1500);
    buttonIntervals.set(messageId, interval);
}

// Handler /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const runtime = getBotRuntime();
    
    const caption = `
<blockquote><strong>
— ReyzCloud Bots
▫️ Developer : ${config.adminUsername}
▫️ Version : 1.0.0
▫️ RunTime : ${runtime}

— Notes :
${config.notes}
</strong></blockquote>`;

    try {
        const sent = await bot.sendVideo(chatId, config.videoIntro, {
            caption: caption,
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Developer", url: "https://t.me/ReyCloudDev" }],
                    [{ text: "Deposit QRIS ", callback_data: "deposit" }],
                    [{ text: "Channel", url: "https://t.me/AboutReyZ4You" }]
                ]
            }
        });
        startDisco(chatId, sent.message_id);
    } catch (e) {
        bot.sendMessage(chatId, "Selamat datang! Gunakan /bayar [nominal] untuk deposit.");
    }
});

// Handler /bayar
bot.onText(/\/bayar (\d+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const amount = parseInt(match[1]);
    const user = msg.from;
    const username = user.username ? `@${user.username}` : user.first_name;
    
    if (amount < 1000) return bot.sendMessage(chatId, "❌ Minimal deposit Rp 1.000");
    
    const order_id = "RC-" + Date.now();
    bot.sendMessage(chatId, "⏳ Memproses QRIS...");

    try {
        const response = await axios.post(`${config.pakasir.base_url}/transactioncreate/qris`, {
            project: config.pakasir.project,
            order_id: order_id,
            amount: amount,
            api_key: config.pakasir.api_key
        });

        if (response.data.qr_string) {
            const qrBuffer = await QRCode.toBuffer(response.data.qr_string, { scale: 7 });
            await bot.sendPhoto(chatId, qrBuffer, {
                caption: `✅ <b>QRIS DEPOSIT</b>\n\nID: <code>${order_id}</code>\nTotal: <b>Rp ${amount.toLocaleString('id-ID')}</b>\n\nStatus otomatis dicek setiap 8 detik.`,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [[{ text: "❌ Batalkan", callback_data: `cancel_${order_id}_${amount}` }]]
                }
            });
            startCheckStatus(chatId, order_id, amount, username);
        }
    } catch (e) {
        bot.sendMessage(chatId, "❌ Gagal menghubungi API Pakasir.");
    }
});

// Handler Button Callback
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data;

    if (data === "deposit") {
        bot.sendMessage(chatId, "📌 <b>Cara Deposit:</b>\nKetik perintah <code>/bayar [nominal]</code>\nContoh: <code>/bayar 10000</code>", { parse_mode: "HTML" });
    }

    if (data.startsWith('cancel_')) {
        const [_, order_id, amount] = data.split('_');
        try {
            await axios.post(`${config.pakasir.base_url}/transactioncancel`, {
                project: config.pakasir.project,
                order_id: order_id,
                amount: parseInt(amount),
                api_key: config.pakasir.api_key
            });
            if (activeIntervals[order_id]) clearInterval(activeIntervals[order_id]);
            bot.editMessageCaption("❌ <b>DEPOSIT DIBATALKAN</b>", { chat_id: chatId, message_id: messageId, parse_mode: "HTML" });
        } catch (e) {}
    }
    bot.answerCallbackQuery(query.id);
});

// Polling Status Pembayaran
function startCheckStatus(chatId, order_id, amount, username) {
    activeIntervals[order_id] = setInterval(async () => {
        try {
            const url = `${config.pakasir.base_url}/transactiondetail?project=${config.pakasir.project}&amount=${amount}&order_id=${order_id}&api_key=${config.pakasir.api_key}`;
            const res = await axios.get(url);
            
            if (res.data.transaction && res.data.transaction.status === 'completed') {
                clearInterval(activeIntervals[order_id]);
                delete activeIntervals[order_id];

                const waktu = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

                // Notif User
                bot.sendMessage(chatId, `🎊 <b>DEPOSIT BERHASIL!</b>\n\nID: <code>${order_id}</code>\nSaldo Anda sudah diperbarui.`, { parse_mode: "HTML" });

                // Kirim Log ke Channel
                const logMsg = `🔔 <b>DEPOSIT BERHASIL!</b>\n\n` +
                               `👤 <b>User:</b> ${username}\n` +
                               `💰 <b>Nominal:</b> Rp ${amount.toLocaleString('id-ID')}\n` +
                               `📅 <b>Waktu:</b> ${waktu} WIB\n` +
                               `🆔 <b>Order ID:</b> <code>${order_id}</code>\n\n` +
                               `Note: ${config.notes}`;
                
                bot.sendMessage(config.channelLogId, logMsg, { parse_mode: "HTML" });
            }
        } catch (e) {}
    }, 8000);
}

console.log("===============================");
console.log("   REYZCLOUD BOT STARTED...   ");
console.log("===============================");
