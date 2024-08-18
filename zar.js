const { Markup } = require("telegraf");

// Başlangıç bakiyesi
let balance = 1000;
const bets = {};
const userBets = {};
const admins = new Set(); // Adminleri tutmak için Set

function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
}

function playDiceGame(ctx, betAmount, guess) {
    if (balance < betAmount) {
        ctx.reply(
            "Yetersiz bakiye! Bahis oynamak için bakiyenizi artırmanız gerekiyor.",
        );
        return;
    }

    // Zarları at
    const dice1 = rollDice();
    const dice2 = rollDice();
    const total = dice1 + dice2;

    let resultMessage = `🎲 Zarlar: ${dice1} ve ${dice2}\nToplam: ${total}\n`;

    // Sonuç ve ödeme hesaplaması
    if (total === 7) {
        if (guess === "exact") {
            balance += betAmount * 3;
            resultMessage += `💰 Büyük Kazanç! Bahisiniz 3x katlandı. Yeni Bakiye: ${balance} TL`;
        } else {
            balance -= betAmount;
            resultMessage += `❌ Kayıp! Bahisiniz kaybedildi. Yeni Bakiye: ${balance} TL`;
        }
    } else if (total < 7 && guess === "under") {
        // %15 kazanma oranı için %1.3 katlama
        if (Math.random() < 0.15) {
            balance += betAmount * 1.3;
            resultMessage += `🎉 Kazanç! Bahisiniz 1.3x katlandı. Yeni Bakiye: ${balance} TL`;
        } else {
            balance -= betAmount;
            resultMessage += `❌ Kayıp! Bahisiniz kaybedildi. Yeni Bakiye: ${balance} TL`;
        }
    } else if (total > 7 && guess === "over") {
        // %15 kazanma oranı için %1.3 katlama
        if (Math.random() < 0.15) {
            balance += betAmount * 1.3;
            resultMessage += `🎉 Kazanç! Bahisiniz 1.3x katlandı. Yeni Bakiye: ${balance} TL`;
        } else {
            balance -= betAmount;
            resultMessage += `❌ Kayıp! Bahisiniz kaybedildi. Yeni Bakiye: ${balance} TL`;
        }
    } else {
        balance -= betAmount;
        resultMessage += `❌ Kayıp! Bahisiniz kaybedildi. Yeni Bakiye: ${balance} TL`;
    }

    // Bahis tamamlandı
    delete userBets[ctx.from.id];
    ctx.reply(resultMessage);
}

module.exports = (bot) => {
    bot.command("start_dice", (ctx) => {
        ctx.reply(
            `🎲 **Zar Oyunu Başladı!** 🎲\n\n` +
                `🔹 **Nasıl Oynanır:**\n` +
                `1️⃣ /start_dice komutunu kullanarak oyunu başlatın.\n` +
                `2️⃣ Bahis yapmak için /bet_dice komutunu kullanabilirsiniz.\n` +
                `3️⃣ Bahis yapmadan önce /dicedeposit komutunu kullanarak bakiye ekleyebilirsiniz.\n\n` +
                `🔹 **Kurallar:**\n` +
                `- Zarların toplamı 7'yi geçerse bahis kazanılır.\n` +
                `- Zarların toplamı 7'den az ise bahis kazanılır.\n` +
                `- Zarların toplamı tam olarak 7 ise bahis 3x katlanır.\n\n` +
                `🔹 **Yatırımlar:**\n` +
                `- /dicedeposit komutunu kullanarak yatırım yapabilirsiniz.`,
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

    bot.command("bet_dice", (ctx) => {
        if (userBets[ctx.from.id]) {
            ctx.reply(
                "Bir bahis zaten yapıldı. Bahis yapmadan önce mevcut bahisi sonuçlandırmanız gerekiyor.",
            );
            return;
        }

        ctx.reply(
            "🎲 Bahis Miktarını Seçin:",
            Markup.inlineKeyboard([
                [Markup.button.callback("10 TL", "bet_10")],
                [Markup.button.callback("100 TL", "bet_100")],
                [Markup.button.callback("500 TL", "bet_500")],
                [Markup.button.callback("1000 TL", "bet_1000")],
                [Markup.button.callback("2500 TL", "bet_2500")],
            ]),
        );
    });

    bot.command("dicedeposit", (ctx) => {
        ctx.reply(
            "💰 Yatırım Yapmak İçin Bir Miktar Seçin:",
            Markup.inlineKeyboard([
                [Markup.button.callback("100 TL", "deposit_100")],
                [Markup.button.callback("200 TL", "deposit_200")],
                [Markup.button.callback("300 TL", "deposit_300")],
                ...(admins.has(ctx.from.id)
                    ? [Markup.button.callback("50.000 TL", "deposit_50000")]
                    : []),
            ]),
        );
    });

    bot.action("bet_10", (ctx) => {
        bets[ctx.from.id] = 10;
        userBets[ctx.from.id] = true;
        ctx.reply(
            "🎲 Bahis Miktarı Seçildi: 10 TL\n" +
                "🔍 Zarların sonuçlarını tahmin edin:\n" +
                "1️⃣ 7'nin Üstü\n" +
                "2️⃣ 7'nin Altı\n" +
                "3️⃣ Tam 7",
            Markup.inlineKeyboard([
                [Markup.button.callback("7'nin Üstü", "guess_over")],
                [Markup.button.callback("7'nin Altı", "guess_under")],
                [Markup.button.callback("Tam 7", "guess_exact")],
            ]),
        );
    });

    bot.action("bet_100", (ctx) => {
        bets[ctx.from.id] = 100;
        userBets[ctx.from.id] = true;
        ctx.reply(
            "🎲 Bahis Miktarı Seçildi: 100 TL\n" +
                "🔍 Zarların sonuçlarını tahmin edin:\n" +
                "1️⃣ 7'nin Üstü\n" +
                "2️⃣ 7'nin Altı\n" +
                "3️⃣ Tam 7",
            Markup.inlineKeyboard([
                [Markup.button.callback("7'nin Üstü", "guess_over")],
                [Markup.button.callback("7'nin Altı", "guess_under")],
                [Markup.button.callback("Tam 7", "guess_exact")],
            ]),
        );
    });

    bot.action("bet_500", (ctx) => {
        bets[ctx.from.id] = 500;
        userBets[ctx.from.id] = true;
        ctx.reply(
            "🎲 Bahis Miktarı Seçildi: 500 TL\n" +
                "🔍 Zarların sonuçlarını tahmin edin:\n" +
                "1️⃣ 7'nin Üstü\n" +
                "2️⃣ 7'nin Altı\n" +
                "3️⃣ Tam 7",
            Markup.inlineKeyboard([
                [Markup.button.callback("7'nin Üstü", "guess_over")],
                [Markup.button.callback("7'nin Altı", "guess_under")],
                [Markup.button.callback("Tam 7", "guess_exact")],
            ]),
        );
    });

    bot.action("bet_1000", (ctx) => {
        bets[ctx.from.id] = 1000;
        userBets[ctx.from.id] = true;
        ctx.reply(
            "🎲 Bahis Miktarı Seçildi: 1000 TL\n" +
                "🔍 Zarların sonuçlarını tahmin edin:\n" +
                "1️⃣ 7'nin Üstü\n" +
                "2️⃣ 7'nin Altı\n" +
                "3️⃣ Tam 7",
            Markup.inlineKeyboard([
                [Markup.button.callback("7'nin Üstü", "guess_over")],
                [Markup.button.callback("7'nin Altı", "guess_under")],
                [Markup.button.callback("Tam 7", "guess_exact")],
            ]),
        );
    });

    bot.action("bet_2500", (ctx) => {
        bets[ctx.from.id] = 2500;
        userBets[ctx.from.id] = true;
        ctx.reply(
            "🎲 Bahis Miktarı Seçildi: 2500 TL\n" +
                "🔍 Zarların sonuçlarını tahmin edin:\n" +
                "1️⃣ 7'nin Üstü\n" +
                "2️⃣ 7'nin Altı\n" +
                "3️⃣ Tam 7",
            Markup.inlineKeyboard([
                [Markup.button.callback("7'nin Üstü", "guess_over")],
                [Markup.button.callback("7'nin Altı", "guess_under")],
                [Markup.button.callback("Tam 7", "guess_exact")],
            ]),
        );
    });

    bot.action("guess_over", (ctx) => {
        const betAmount = bets[ctx.from.id];
        if (!betAmount) return;
        playDiceGame(ctx, betAmount, "over");
    });

    bot.action("guess_under", (ctx) => {
        const betAmount = bets[ctx.from.id];
        if (!betAmount) return;
        playDiceGame(ctx, betAmount, "under");
    });

    bot.action("guess_exact", (ctx) => {
        const betAmount = bets[ctx.from.id];
        if (!betAmount) return;
        playDiceGame(ctx, betAmount, "exact");
    });

    bot.action("deposit", (ctx) => {
        ctx.reply(
            "💰 Yatırım Yapmak İçin Bir Miktar Seçin:",
            Markup.inlineKeyboard([
                [Markup.button.callback("100 TL", "deposit_100")],
                [Markup.button.callback("200 TL", "deposit_200")],
                [Markup.button.callback("300 TL", "deposit_300")],
                ...(admins.has(ctx.from.id)
                    ? [Markup.button.callback("50.000 TL", "deposit_50000")]
                    : []),
            ]),
        );
    });

    bot.action("deposit_100", (ctx) => {
        balance += 100;
        ctx.reply(`💵 100 TL yatırım yaptınız. Yeni Bakiye: ${balance} TL`);
    });

    bot.action("deposit_200", (ctx) => {
        balance += 200;
        ctx.reply(`💵 200 TL yatırım yaptınız. Yeni Bakiye: ${balance} TL`);
    });

    bot.action("deposit_300", (ctx) => {
        balance += 300;
        ctx.reply(`💵 300 TL yatırım yaptınız. Yeni Bakiye: ${balance} TL`);
    });

    bot.action("deposit_50000", (ctx) => {
        if (admins.has(ctx.from.id)) {
            balance += 50000;
            ctx.reply(
                `💵 50.000 TL yatırım yaptınız. Yeni Bakiye: ${balance} TL`,
            );
        } else {
            ctx.reply("Bu komutu kullanma yetkiniz yok.");
        }
    });

    bot.action("help", (ctx) => {
        ctx.reply(
            `❓ **Yardım Menüsü** ❓\n\n` +
                `🎲 **Zar Oyunu Başlangıç:**\n` +
                `/start_dice - Zar oyununu başlatır.\n` +
                `/bet_dice - Bahis yapmanıza olanak tanır.\n` +
                `/dicedeposit - Bakiye yatırmanıza olanak tanır.\n\n` +
                `💡 **Yatırımlar:**\n` +
                `Bahis yapmadan önce bakiye eklemek için /dicedeposit komutunu kullanabilirsiniz.\n\n` +
                `🔗 **İletişim:**\n` +
                `[👑 Luana Mobile 👑](https://t.me/luanamobile)\n\n` +
                `Bu bot hakkında daha fazla bilgi için lütfen bağlantıya tıklayın.`,
        );
    });

    bot.command("addadmin", (ctx) => {
        if (ctx.from.id === 1416011526) {
            // Replace YOUR_ADMIN_ID with your admin ID
            const username = ctx.message.text.split(" ")[1];
            if (username) {
                bot.telegram
                    .getChatMember(ctx.chat.id, username)
                    .then((member) => {
                        if (
                            member.status === "member" ||
                            member.status === "administrator" ||
                            member.status === "creator"
                        ) {
                            admins.add(ctx.from.id);
                            ctx.reply(`${username} admin olarak eklendi.`);
                        } else {
                            ctx.reply(
                                "Belirtilen kullanıcı bu grupta bulunmuyor veya admin değil.",
                            );
                        }
                    })
                    .catch(() => {
                        ctx.reply("Kullanıcı bilgileri alınamadı.");
                    });
            } else {
                ctx.reply("Kullanıcı adını belirtmelisiniz.");
            }
        } else {
            ctx.reply("Bu komutu kullanma yetkiniz yok.");
        }
    });
};
