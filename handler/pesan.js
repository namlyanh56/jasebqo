const { InlineKeyboard } = require('grammy');
const { getAcc } = require('../utils/helper');
const { pesanMenu } = require('../utils/menu');

const createDeleteList = (ctx) => {
    const a = getAcc(ctx.from.id);
    if (!a || !a.msgs.length) {
        return { text: 'ℹ️ Daftar pesan teks Anda kosong.', reply_markup: new InlineKeyboard().text('Tutup', 'delete_this') };
    }
    let text = "Pilih pesan teks yang ingin dihapus:\n\n";
    const kb = new InlineKeyboard();
    a.msgs.forEach((msg, i) => {
        text += `${i + 1}. *${msg.slice(0, 30)}${msg.length > 30 ? '...' : ''}*\n`;
        kb.text(`❌ Hapus No. ${i + 1}`, `del_msg_${i}`).row();
    });
    kb.text('💥 HAPUS SEMUA PESAN', 'delete_all_msgs').row();
    kb.text('Tutup', 'delete_this');
    return { text, reply_markup: kb, parse_mode: "Markdown" };
};

module.exports = (bot) => {
  bot.hears('✉️ Kelola Pesan', async (ctx) => {
    const a = getAcc(ctx.from.id);
    if (!a) return ctx.reply('❌ Login dulu');
    await ctx.reply('Silakan kelola pesan broadcast Anda.', { reply_markup: pesanMenu() });
  });

  bot.hears('➕ Tambah Pesan', async (ctx) => {
    const a = getAcc(ctx.from.id);
    if (!a) return ctx.reply('❌ Login dulu');
    ctx.session = { act: 'addmsg' };
    await ctx.reply('Kirim pesan teks yang ingin ditambahkan:');
  });
  
  bot.hears('📋 List Pesan', async (ctx) => {
    const a = getAcc(ctx.from.id);
    if (!a) return ctx.reply('❌ Login dulu');
    if (!a.msgs.length) return ctx.reply('ℹ️ Daftar pesan teks kosong.');
    let responseText = `📝 **Pesan Teks Tersimpan (${a.msgs.length}):**\n\n`;
    a.msgs.forEach((msg, i) => {
      responseText += `  ${i + 1}. *${msg.slice(0, 40)}${msg.length > 40 ? '...' : ''}*\n`;
    });
    await ctx.reply(responseText, { parse_mode: "Markdown" });
  });

  bot.hears('🗑️ Hapus Pesan', async (ctx) => {
    const a = getAcc(ctx.from.id);
    if (!a) return ctx.reply('❌ Login dulu');
    if (!a.msgs.length) return ctx.reply('ℹ️ Daftar pesan teks Anda kosong, tidak ada yang bisa dihapus.');
    const { text, reply_markup, parse_mode } = createDeleteList(ctx);
    await ctx.reply(text, { reply_markup, parse_mode });
  });

  bot.callbackQuery(/del_msg_(\d+)/, async (ctx) => {
    const index = parseInt(ctx.match[1], 10);
    const a = getAcc(ctx.from.id);
    if (a && a.msgs[index] !== undefined) {
        a.msgs.splice(index, 1);
        await ctx.answerCallbackQuery({ text: `✅ Pesan No. ${index + 1} dihapus.` });
        const { text, reply_markup, parse_mode } = createDeleteList(ctx);
        await ctx.editMessageText(text, { reply_markup, parse_mode });
    } else {
        await ctx.answerCallbackQuery({ text: '❌ Pesan sudah tidak ada.', show_alert: true });
    }
  });
  
  bot.callbackQuery('delete_all_msgs', async (ctx) => {
      const a = getAcc(ctx.from.id);
      if (a) {
          a.msgs = [];
          await ctx.answerCallbackQuery({ text: '✅ Semua pesan berhasil dihapus.', show_alert: true });
          const { text, reply_markup, parse_mode } = createDeleteList(ctx);
          await ctx.editMessageText(text, { reply_markup, parse_mode });
      }
  });
};
