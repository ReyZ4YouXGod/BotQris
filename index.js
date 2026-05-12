const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const QRCode = require('qrcode');
const config = require('./config');

const bot = new Telegraf(config.botToken);

const activeIntervals = {};

// Helper: Uptime
const getBotRuntime = () => {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    return `${hours}j ${minutes}m`;
};

// --- MIDDLEWARE & ERROR HANDLING ---
bot.catch((err, ctx) => {
    console.error(`Telegraf Error for ${ctx.updateType}:`, err);
});

// --- COMMANDS ---

bot.start(async (ctx) => {
    const runtime = getBotRuntime();
    const caption = `
<blockquote><strong>
— ReyzCloud Bots
▫️ Status : Online 🟢
▫️ Version : 15.0.0 (Telegraf)
▫️ RunTime : ${runtime}

— Notes :
${config.assets.notes}
</strong></blockquote>`;

    try {
        await ctx.replyWithVideo(config.assets.videoIntro, {
            caption: caption,
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
                [Markup.button.url("Developers ⏰", "https://t.me/dickyfox27")],
                [Markup.button.callback("Deposit QRIS 💳", "deposit")],
                [Markup.button.url("Channels 📡", "https://t.me/PollingArc")]
            ])
        });
    } catch (e) {
        ctx.reply("Welcome to ReyzCloud! Gunakan /bayar [nominal]");
    }
});

bot.command('bayar', async (ctx) => {
    const text = ctx.message.text.split(' ');
    if (text.length < 2) return ctx.reply("❌ Format salah! Contoh: /bayar 10000");

    const amount = parseInt(text[1]);
    const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;

    if (isNaN(amount) || amount < 1000) return ctx.reply("❌ Minimal Rp 1.000");

    const order_id = "RC-" + Date.now();
    const loading = await ctx.reply("⏳ Generating QRIS...");

    try {
        const response = await axios.post(`${config.pakasir.base_url}/transactioncreate/qris`, {
            project: config.pakasir.project,
            order_id: order_id,
            amount: amount,
            api_key: config.pakasir.api_key
        });

        if (response.data.qr_string) {
            await ctx.deleteMessage(loading.message_id);
            const qrBuffer = await QRCode.toBuffer(response.data.qr_string, { scale: 8 });
            
            await ctx.replyWithPhoto({ source: qrBuffer }, {
                caption: `✅ <b>PEMBAYARAN QRIS</b>\n\nID: <code>${order_id}</code>\nNominal: <b>Rp ${amount.toLocaleString('id-ID')}</b>\n\n<i>Silakan scan dan bayar, status akan otomatis terdeteksi.</i>`,
                parse_mode: 'HTML',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback("❌ Batalkan", `cancel_${order_id}_${amount}`)]
                ])
            });

            startCheckStatus(ctx, order_id, amount, username);
        }
    } catch (e) {
        ctx.reply("❌ Gagal menghubungi API Pakasir.");
    }
});

// --- CALLBACK HANDLERS ---

bot.action('deposit', (ctx) => {
    ctx.replyWithHTML("📌 Ketik: <code>/bayar [nominal]</code>\nContoh: <code>/bayar 50000</code>");
    ctx.answerCbQuery();
});

bot.action(/cancel_(.+)_(.+)/, async (ctx) => {
    const order_id = ctx.match[1];
    const amount = ctx.match[2];

    try {
        await axios.post(`${config.pakasir.base_url}/transactioncancel`, {
            project: config.pakasir.project,
            order_id: order_id,
            amount: parseInt(amount),
            api_key: config.pakasir.api_key
        });

        if (activeIntervals[order_id]) {
            clearInterval(activeIntervals[order_id]);
            delete activeIntervals[order_id];
        }

        await ctx.editMessageCaption("❌ <b>TRANSAKSI DIBATALKAN</b>", { parse_mode: 'HTML' });
    } catch (e) {
        ctx.answerCbQuery("Gagal membatalkan.");
    }
    ctx.answerCbQuery();
});

// --- CORE LOGIC ---

function startCheckStatus(ctx, order_id, amount, username) {
    activeIntervals[order_id] = setInterval(async () => {
        try {
            const url = `${config.pakasir.base_url}/transactiondetail?project=${config.pakasir.project}&amount=${amount}&order_id=${order_id}&api_key=${config.pakasir.api_key}`;
            const res = await axios.get(url);
            
            if (res.data.transaction && res.data.transaction.status === 'completed') {
                clearInterval(activeIntervals[order_id]);
                delete activeIntervals[order_id];

                const waktu = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

                await ctx.replyWithHTML(`🎊 <b>DEPOSIT BERHASIL!</b>\n\nID: <code>${order_id}</code>\nSaldo otomatis masuk ke akun ReyzCloud.`);

                const logMsg = `🔔 <b>LOG DEPOSIT MASUK</b>\n\n👤 User: ${username}\n💰 Nominal: Rp ${amount.toLocaleString('id-ID')}\n📅 Waktu: ${waktu} WIB\n🆔 Order ID: <code>${order_id}</code>\n\n${config.assets.notes}`;
                
                await ctx.telegram.sendMessage(config.channelLogId, logMsg, { parse_mode: 'HTML' });
            }
        } catch (e) {
            // Silently fail to keep polling
        }
    }, 8000);
}

// --- START BOT ---
bot.launch().then(() => {
    console.log("===============================");
    console.log("   REYZCLOUD TELEGRAF ACTIVE   ");
    console.log("   DEPLOYED ON PTERODACTYL     ");
    console.log("===============================");
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
