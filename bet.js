const { Markup } = require("telegraf");

let balance = 1000; // Başlangıç bakiyesi
let gameStarted = false; // Oyunun başlatılıp başlatılmadığını takip etmek için değişken
const cooldownTime = 5 * 60 * 1000; // 5 dakika (milisaniye cinsinden)
const userCooldowns = {}; // Kullanıcıların son yatırım zamanlarını saklamak için nesne

module.exports = (bot) => {
    bot.command("start_bet", (ctx) => {
        gameStarted = true; // Oyunun başlatıldığını işaretle

        ctx.reply(
            `🎉 Bahis Oyunu Başladı! 🎉\n\n` +
                `🔹 Nasıl Oynanır:\n` +
                `1️⃣ Oyunun başlatılması için /start_bet komutunu kullanın.\n` +
                `2️⃣ Bahis yapmak için /bet komutunu kullanabilirsiniz.\n` +
                `3️⃣ Yatırım yapmak için /betdeposit komutunu kullanarak bakiye ekleyebilirsiniz.\n\n` +
                `🔹 Kurallar:\n` +
                `- Bahis oyunu başlatıldığında oyuna başlamış olursunuz.\n` +
                `- Oyunu durdurmak isterseniz /stop_bet komutunu kullanabilirsiniz.\n` +
                `- Her bahiste kazanç veya kayıp durumuna göre güncel bakiyeniz güncellenir.\n\n` +
                `🔹 Önemli Not:\n` +
                `- Kayıp miktarı bakiyenizin %30'u kadar olabilir.\n` +
                `- Yatırımlar arasında 5 dakika bekleme süreniz var. \n\n` +
                `Yapımcı: @luanamobile`,
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

    bot.command("stop_bet", (ctx) => {
        gameStarted = false;
        ctx.reply(
            `Oyun durduruldu. Yeniden başlatmak için /start_bet komutunu kullanabilirsiniz.`,
        );
    });

    bot.command("bet", (ctx) => {
        if (!gameStarted) {
            ctx.reply(
                "Lütfen önce oyunu başlatın. /start_bet komutunu kullanarak oyunu başlatabilirsiniz.",
            );
            return;
        }

        if (balance <= 0) {
            ctx.reply(
                "Yetersiz bakiye! Bahis oynamak için bakiyenizi artırmanız gerekiyor.",
            );
            return;
        }

        const random = Math.random();
        let resultMessage = "";

        if (random < 0.1) {
            // %10 big win
            const bigWinAmount = Math.floor(Math.random() * 500) + 1;
            balance += bigWinAmount;
            resultMessage = `🎉 Big Win! Kazanç: ${bigWinAmount} TL\nGüncel Bakiye: ${balance} TL`;
        } else if (random < 0.15) {
            // %5 jackpot
            const jackpotAmount = Math.floor(Math.random() * 3000) + 1;
            balance += jackpotAmount;
            resultMessage = `💥 Jackpot! Kazanç: ${jackpotAmount} TL\n🎊🎉🎉\nGüncel Bakiye: ${balance} TL`;
        } else if (random < 0.3) {
            // %30 oranla kazanç
            const winAmount = Math.floor(Math.random() * 81) + 10;
            balance += winAmount;
            resultMessage = `🏆 Kazanç: ${winAmount} TL\nGüncel Bakiye: ${balance} TL`;
        } else {
            // %70 oranla kayıp
            const lossPercentage = 0.3; // Kayıp miktarını bakiyenin %30'u olarak belirliyoruz
            const lossAmount = Math.floor(balance * lossPercentage);
            balance -= lossAmount;
            resultMessage = `💔 Kayıp: ${lossAmount} TL\nGüncel Bakiye: ${balance} TL`;
        }

        // Kayıp işleminden sonra bakiyeyi kontrol et
        if (balance < 0) balance = 0;

        ctx.reply(resultMessage);
    });

    bot.command("betdeposit", (ctx) => {
        const userId = ctx.from.id;
        const currentTime = Date.now();
        const lastDepositTime = userCooldowns[userId] || 0;

        if (currentTime - lastDepositTime < cooldownTime) {
            const remainingTime = Math.ceil(
                (cooldownTime - (currentTime - lastDepositTime)) / 1000,
            );
            ctx.reply(
                `Lütfen bir süre bekleyiniz. ${remainingTime} saniye sonra tekrar deneyebilirsiniz.`,
            );
            return;
        }

        userCooldowns[userId] = currentTime;

        ctx.reply(
            "Yatırım yapmak için bir miktar seçin:",
            Markup.inlineKeyboard([
                [Markup.button.callback("50 TL", "deposit_50")],
                [Markup.button.callback("100 TL", "deposit_100")],
                [Markup.button.callback("150 TL", "deposit_150")],
            ]),
        );
    });

    bot.action("deposit_50", (ctx) => {
        const previousBalance = balance;
        balance += 50;
        ctx.reply(
            `Yatırım Yapıldı: 50 TL\nÖnceki Bakiye: ${previousBalance} TL\nYeni Bakiye: ${balance} TL`,
        );
    });

    bot.action("deposit_100", (ctx) => {
        const previousBalance = balance;
        balance += 100;
        ctx.reply(
            `Yatırım Yapıldı: 100 TL\nÖnceki Bakiye: ${previousBalance} TL\nYeni Bakiye: ${balance} TL`,
        );
    });

    bot.action("deposit_150", (ctx) => {
        const previousBalance = balance;
        balance += 150;
        ctx.reply(
            `Yatırım Yapıldı: 150 TL\nÖnceki Bakiye: ${previousBalance} TL\nYeni Bakiye: ${balance} TL`,
        );
    });
};
