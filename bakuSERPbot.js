const { Telegraf } = require('telegraf')
const token = '1527680518:AAH8zOl7H0Z5wz4I_EPOZ9hhG6YEUxZewoE';

//const bot = new Telegraf(process.env.BOT_TOKEN)
const bot = new Telegraf(token)
bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))