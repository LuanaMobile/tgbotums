const { Markup } = require("telegraf");

module.exports = (bot) => {
    bot.command("slot", (ctx) => {
        // Slot oyunu için butonları göster
        ctx.reply(
            "Slot oyununu başlatmak için butona tıklayın.",
            Markup.inlineKeyboard([
                [Markup.button.callback("Başlat", "start_slot")],
            ]),
        );
    });

    bot.action("start_slot", (ctx) => {
        const slotEmojis = ["🍒", "🍋", "🍊", "🍉", "🍇"];
        const result = Array.from(
            { length: 3 },
            () => slotEmojis[Math.floor(Math.random() * slotEmojis.length)],
        );
        const resultMessage =
            `Slot Oyunu: ${result.join(" ")}\n` +
            `Kazanç: ${Math.floor(Math.random() * 100)} TL`; // Örnek kazanç

        ctx.reply(resultMessage);
    });
};
