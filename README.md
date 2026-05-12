<div align="center">

# ⚡ ReyzCloud QRIS Payment
### **Automated Deposit System for High-Performance Hosting**

[![Telegram](https://img.shields.io/badge/Telegram-ReyCloudDev-26A5E4?style=for-the-badge&logo=telegram)](https://t.me/ReyCloudDev)
[![NodeJS](https://img.shields.io/badge/Node.js-v16+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Pakasir](https://img.shields.io/badge/API-Pakasir-FF0000?style=for-the-badge)](https://app.pakasir.com)

---

<p align="center">
  <b>Bot deposit otomatis tercanggih untuk ekosistem ReyzCloud.</b><br>
  <i>Efisien, Aman, dan Super Cepat.</i>
</p>

[Fitur](#-fitur-utama) • [Konfigurasi](#-setup-konfigurasi) • [Termux](#-instalasi-termux) • [Pterodactyl](#-instalasi-panel)

</div>

---

## 💎 Fitur Utama

| Fitur | Deskripsi |
| :--- | :--- |
| 🚀 **Instant QRIS** | Generate QRIS dinamis dalam hitungan detik via Pakasir API. |
| 🌈 **Disco UI** | Tampilan menu dengan tombol animasi yang menarik perhatian user. |
| 🤖 **Auto-Checking** | Validasi pembayaran otomatis tanpa perlu cek mutasi manual. |
| 📊 **Log Channel** | Laporan transaksi masuk langsung ke channel admin secara real-time. |
| 🎬 **Media Intro** | Pesan selamat datang menggunakan video untuk kesan premium. |

---

## ⚙️ Setup Konfigurasi

Buka file `config.js` dan lengkapi datanya agar bot sinkron dengan akun kamu:

```javascript
module.exports = {
    botToken: '7805124868:AAFZtImH0qfvy...', // Token dari BotFather
    adminUsername: '@ReyCloudDev',
    channelLogId: '-100xxxxxxxxx',         // ID Channel untuk laporan
    pakasir: {
        project: "depodomain",             // Nama project di Pakasir
        api_key: "API_KEY_ANDA",           // API Key dari Dashboard
        base_url: "[https://app.pakasir.com/api](https://app.pakasir.com/api)"
    }
};


pkg update && pkg upgrade -y

pkg install nodejs git -y

git clone https://github.com/ReyZ4YouXGod/BotQris.git

cd BotQris

npm install

node index.js

