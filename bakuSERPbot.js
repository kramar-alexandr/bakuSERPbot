require('dotenv').config()
const { Telegraf } = require('telegraf')
//const token = '1612585342:AAEpyJGuMUTA7XQcyW4JU2JVlIIKa4y74NU';
const readLastLines = require('read-last-lines');
const logpath = '';
let admitusers = {};

/* bot commands for @botFather
log - Get SERP log 
login - write password to use bot

*/

const bot = new Telegraf(process.env.BOT_TOKEN)
//const bot = new Telegraf(token)
bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
//bot.on('sticker', (ctx) => ctx.reply('👍'))
//bot.hears('hi', (ctx) => ctx.reply('Hey there'))
//bot.hears('log', (ctx) => getLasthansaLog(ctx))
bot.command('log', (ctx) => getLasthansaLog(ctx))
bot.command('login', (ctx) => LogIn(ctx))
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

function LoginError(ctx){
    ctx.reply('Please login');
}

function isLogin(ctx){
    let curid = ctx.update.message.from.id;
    if(admitusers[curid]){
        return true;
    }else{
        LoginError(ctx);
        return false;
    }
}

function LogIn(ctx){
    let curid = ctx.update.message.from.id;
    if(admitusers[curid]){
        ctx.reply('Already logined');
    }else{
        var pass = ctx.update.message.text.split(' ')[1];
        if(pass){
            console.log(pass);
            if(pass==process.env.PASS){
                admitusers[curid] = true;
                ctx.reply('👍');
            }else {
                LoginError(ctx);
            }
        }
        
    }
}

function getLasthansaLog(ctx){
    if(!isLogin(ctx)){
        return 'Not loged';
    }
    readLastLines.read(process.env.LOG_PATH, 50)
	.then((lines) => {
        console.log(ctx.update.message.from);
        ctx.reply(lines);
    });
}