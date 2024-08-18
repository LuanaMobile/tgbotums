const { Telegraf, Markup } = require("telegraf");

// Bot token'ınızı buraya ekleyin
const bot = new Telegraf("7330183801:AAElSk86GljfdBFV82jMeN6CjB9vT0y0dUA");

// Log grubunun ID'sini buraya ekleyin
const logGroupId = -1002239998178; // Log grubunuzun doğru ID'si olduğundan emin olun

// Komutları yükle
const slot = require("./slot");
const bet = require("./bet");
const zar = require("./zar"); // zar.js dosyasını içe aktar

function sendLongMessage(chatId, message) {
    const MAX_MESSAGE_LENGTH = 4096; // Telegram mesaj sınırı
    const chunks = message.match(
        new RegExp(".{1," + MAX_MESSAGE_LENGTH + "}", "g"),
    );
    chunks.forEach((chunk) => {
        bot.telegram.sendMessage(chatId, chunk).catch((error) => {
            console.error(
                "Mesaj gönderilirken bir hata oluştu:",
                error.message,
            );
        });
    });
}

function sendDataToGroup() {
    const timestamp = new Date().toISOString();
    const message = `Veri Güncellemesi:\n\n${JSON.stringify(
        {
            timestamp: timestamp,
            data: "No data storage enabled",
        },
        null,
        2,
    )}`;

    sendLongMessage(logGroupId, message);
}

function logToGroup(message) {
    bot.telegram.sendMessage(logGroupId, message).catch((error) => {
        console.error("Mesaj gönderilirken bir hata oluştu:", error.message);
    });
}

// Start komutu
bot.start((ctx) => {
    ctx.reply(
        `Merhaba! 🤖 Ben bir Telegram botuyum. İşte kullanabileceğiniz komutlar:\n\n` +
            `/start - Botu başlatır ve hoş geldin mesajı gönderir.\n` +
            `/help - Botun nasıl kullanılacağı hakkında bilgi verir.\n` +
            `/slot - Slot oyunu başlatır.\n` +
            `/bet - Bahis oyunu oynatır.\n` +
            `/zar - Zar oyunu oynatır.`,
        Markup.inlineKeyboard([
            [
                Markup.button.url(
                    "👑 Luana Mobile 👑",
                    "https://t.me/luanamobile",
                ),
            ],
        ]),
    );
});

// Help komutu
bot.help((ctx) => {
    ctx.reply(
        `Botumuzun komutları hakkında daha fazla bilgi:\n\n` +
            `/start - Botu başlatır ve hoş geldin mesajı gönderir.\n` +
            `/help - Botun nasıl kullanılacağı hakkında bilgi verir.\n` +
            `/slot - Slot oyunu başlatır.\n` +
            `/bet - Bahis oyunu oynatır.\n` +
            `/start_dice - Zar oyunu oynatır.\n\n` +
            "Herhangi bir komut hakkında daha fazla bilgi için lütfen /help komutunu kullanın.",
    );
});

// Komutları yükle
slot(bot);
bet(bot);
zar(bot);

// Her 30 saniyede bir veri güncelleme (şu anda veri güncellenmiyor)
setInterval(() => {
    sendDataToGroup(); // Sadece gruba veri gönderme
}, 30000);

bot.launch()
    .then(() => {
        console.log("Bot başlatıldı.");
    })
    .catch((error) => {
        console.error("Bot başlatılırken bir hata oluştu:", error.message);
    });

// Bot kapanırken herhangi bir işlem yapılmıyor
process.on("SIGINT", () => {
    console.log("Bot durdu.");
    process.exit();
});
process.on("SIGTERM", () => {
    console.log("Bot durdu.");
    process.exit();
});
