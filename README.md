    node index.js
    Siap, Bang Rey! Ini teks lengkap **README.md** dengan format **Full Markdown**. Semuanya sudah saya rangkum jadi satu blok kode supaya Abang tinggal sekali klik "Copy" dan tempel di GitHub.
```markdown
# 🚀 ReyzCloud QRIS Deposit Bot

[![Version](https://img.shields.io/badge/Version-15.0.0-blue.svg)](https://github.com/ReyZ4YouXGod/BotQris)
[![Platform](https://img.shields.io/badge/Platform-Telegram-brightgreen.svg)](https://t.me/ReyCloudDev)
[![Developer](https://img.shields.io/badge/Developer-ReyCloudDev-orange.svg)](https://t.me/ReyCloudDev)

Bot Telegram otomatis untuk sistem deposit **ReyzCloud** menggunakan integrasi API **Pakasir**. Bot ini dirancang untuk kemudahan transaksi hosting dengan verifikasi pembayaran real-time.

---

## 📌 Fitur Utama

*   ✅ **QRIS Otomatis**: Menghasilkan kode QRIS unik secara instan via API Pakasir.
*   ✅ **Disco Buttons**: Tombol menu interaktif yang berganti warna (kedap-kedip).
*   ✅ **Real-time Polling**: Sistem pengecekan status transaksi otomatis setiap 8 detik.
*   ✅ **Channel Logs**: Pengiriman laporan transaksi sukses ke ID Channel tujuan secara otomatis.
*   ✅ **Video Intro**: Tampilan menu utama menggunakan video premium untuk kesan profesional.
*   ✅ **Multi-Platform**: Support berjalan lancar di **Termux**, **VPS**, maupun **Panel Pterodactyl**.

---

## 🛠️ Persiapan & Konfigurasi

### 1. Clone Repository
```bash
git clone https://github.com/ReyZ4YouXGod/BotQris.git
cd BotQris

pkg update && pkg upgrade -y

pkg install nodejs -y

npm install

node index.js

module.exports = {
    botToken: '7805124868:AAFZtImH0qfvyddaX2ba4NwXEPy55k6n04I',
    adminUsername: '@ReyCloudDev',
    channelLogId: '-100xxxxxxxxx', // Ganti dengan ID Channel Log Anda
    pakasir: {
        project: "depodomain",
        api_key: "API_KEY_ANDA",
        base_url: "https://app.pakasir.com/api"
    },
    videoIntro: 'https://k.top4top.io/m_37841mg1e4.mp4',
    notes: 'System Bot Ini Hanya digunakan untuk deposit ReyCloud!'
};
