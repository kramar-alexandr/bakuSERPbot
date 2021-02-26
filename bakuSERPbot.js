require('dotenv').config()
const { Telegraf } = require('telegraf')
//const token = '1612585342:AAEpyJGuMUTA7XQcyW4JU2JVlIIKa4y74NU';
const readLastLines = require('read-last-lines');
const logpath = '';


const bot = new Telegraf(process.env.BOT_TOKEN)
//const bot = new Telegraf(token)
bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.hears('log', (ctx) => getLasthansaLog(ctx))
bot.command('log', (ctx) => getLasthansaLog(ctx))
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

function getLasthansaLog(ctx){
    ctx.reply('res');
    readLastLines.read(process.env.LOG_PATH, 50)
	.then((lines) => {
        ctx.reply(lines);
        });
    //readLastLines.read(process.env.LOG_PATH, 50, (lines) => {
    //    console.log(lines);
    //});
	//.then((lines,ctx) => ctx.reply(lines));
}