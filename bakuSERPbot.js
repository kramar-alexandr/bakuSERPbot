require('dotenv').config()
const { Telegraf } = require('telegraf');
const { Markup } = require('telegraf');
const readLastLines = require('read-last-lines');
let admitusers = {};
const fs  = require('fs');


const bot = new Telegraf(process.env.BOT_TOKEN)
bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.hears(process.env.PASS, (ctx) => {
    ctx.telegram.deleteMessage(ctx.chat.id,ctx.update.message.message_id);
    LogIn(ctx);    
})

bot.on('text', (ctx) => {
    if(isLogin(ctx)){
        drawMenu(ctx);
    }
})
bot.action('drawLog', (ctx) => getLasthansaLog(ctx))   
bot.action('restartServer', (ctx) => shutDownSERP(ctx,1))   
bot.action('hardRestartServer', (ctx) => shutDownSERP(ctx,2))   
bot.action('usersList', (ctx) => usersList(ctx))   
bot.action('serverOfflineUnderstand', (ctx) => serverOfflineUnderstand(ctx))   
bot.launch()


getServerStatus();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))


function drawMenu(ctx){
    bot.telegram.sendMessage(ctx.chat.id, 'Select', {
        reply_markup: {
            inline_keyboard: [
                [
                    {text:'Log', callback_data: 'drawLog'},
                    {text:'Kill', callback_data: 'restartServer'},
                    {text:'Hard Kill', callback_data: 'hardRestartServer'},
                    {text:'Users List', callback_data: 'usersList'}
                ]
            ]
        }
    })
}

function LoginError(ctx){
    ctx.reply('Please login');
}

function isLogin(ctx){
    let curid
    try{
        if(ctx.update.message){
            curid = ctx.update.message.from.id
        }
    }catch(error){console.log(error);}

    if(!curid){
        try{
            if(ctx.update.callback_query){
                curid = ctx.update.callback_query.from.id
            }
        }catch(error){console.log(error);}
    }
    if(admitusers[curid]){
        return true;
    }else{
        LoginError(ctx);
        return false;
    }
}

function shutDownSERP(ctx,type){
    if(!isLogin(ctx)){
        return 'Not loged';
    }
    try{
        var path = process.env.SERP_PATH + '/hansa.pid';
        path = path.replace(/\/\//g,"\/");
        readLastLines.read(path, 1)
        .then((lines) => {
            try{
                if(lines){
                    if(type==1){
                        process.kill(lines)
                        ctx.reply(lines);
                    }
                    if(type==2){
                        process.kill(lines,9)
                        ctx.reply(lines);
                    }
                }
            }catch(error){ctx.reply(error);}
        });
    }catch(error){console.log(error);}
}


function serverOfflineUnderstand(ctx){
    if(!isLogin(ctx)){
        return 'Not loged';
    }
    admitusers[ctx.update.callback_query.from.id].needtosenderror = 10;
}

function usersList(ctx){
    if(!isLogin(ctx)){
        return 'Not loged';
    }
    ctx.reply(Object.values(admitusers).map((user) =>{return user.username}));
}


function LogIn(ctx){
    let curid = ctx.update.message.from.id;
    if(admitusers[curid]){
        drawMenu(ctx);
    }else{
        var pass = ctx.update.message.text;
        if(pass){
            if(pass==process.env.PASS){
                admitusers[curid] = ctx.message.from;
                admitusers[curid]['chat'] = ctx.message.chat;
                admitusers[curid].needtosenderror = 0;
                console.log(admitusers[curid]);
                drawMenu(ctx);
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
    let path = (process.env.SERP_PATH + '/hansa.log').replace(/\/\//g,"\/");
    try{
        readLastLines.read(path, 50)
        .then((lines) => {
            ctx.reply(lines);
        });
    }catch(error){ctx.reply(error);}
}

function sendUserServerOffline(user){
    console.log('sendUserServerOffline ' + user.needtosenderror);
    if(user.needtosenderror<10){
        user.needtosenderror++;
        bot.telegram.sendMessage(user.chat.id,'Server is offline', {
            reply_markup: {
                inline_keyboard: [
                    [
                        {text:'Understand', callback_data: 'serverOfflineUnderstand'},
                    ]
                ]
            }
        });
    }
}

function getServerStatus(){
    console.log('getServerStatus');
    let path = (process.env.SERP_PATH + '/hansa.pid').replace(/\/\//g,"\/");
    Object.values(admitusers).forEach(user => {
        try{
            if(!fs.existsSync(path)){           
                sendUserServerOffline(user);
            }else{
                try{
                    readLastLines.read(path, 1)
                    .then((lines) => {
                        try{
                            if(process.kill(lines,0)){
                                if(user.needtosenderror>0){
                                    bot.telegram.sendMessage(user.chat.id,'Server is Online');
                                }
                                user.needtosenderror = 0;
                            }

                        }catch(error){
                            console.log(error);
                            sendUserServerOffline(user);
                        }
                    });
                }catch(error){sendUserServerOffline(user);}
            }
        }catch(error){console.log(error);}
    });

    setTimeout(getServerStatus, 10000);
}

