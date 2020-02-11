const Discord = require("discord.js");
const settings = require("./botsettings.json");
const funcs = module.require('./funcs.js');
const fs = require('fs');
const personality = require('./personality.js');
const PREFIX = settings.prefix;
var nonsenseModeEnabled = false; var alphaLet = 6; var prevNick = 'Mix-Master ICE';

const bot = new Discord.Client({ disableEveryone: true });
bot.commands = new Discord.Collection();
bot.mutes = require('./mutes.json');
bot.lfg = require('./lfg.json');
bot.vault = require('./vault.json');
bot.inventory = require('./inventory.json');

bot.lfgList = null;


fs.readdir("./cmds/", (err, files) => {
    if (err) console.error(err);

    let jsfiles = files.filter(f => f.split('.').pop() === 'js');
    if (jsfiles.length <= 0) return console.log('No commands to load.');

    console.log('Loading ' + jsfiles.length + ' commands...');

    jsfiles.forEach((f, i) => {
        let props = require('./cmds/' + f);
        console.log((i + 1) + ': ' + f + ' loaded!');
        bot.commands.set(props.help.name, props);
    });
    console.log('All commands locked and loaded.');
});

bot.on("ready", async () => {
    console.log("Bissle is ready to rumble!");
});

bot.on("error", console.error);

/*bot.on("messageDelete", function (msg) {
    if (msg.author.id === settings.id) {
        let response = personality.DELETE;
        for (i = 1; i < response.length; i++) {
            if (msg.content === response[i - 1]) return msg.channel.send(response[i]);
        }
    }
});

bot.on("channelCreate", async chanel => {
    if (chanel.type != "dm") return chanel.send("FIRST");
});*/

bot.on("message", async (message) => {
    if (nonsenseModeEnabled) {
        autoBoop(message);
        /* alphabet(message); */
        tag(message);
    }

    // Don't parse bot messages
    if (message.author.equals(bot.user)) return;

    // Manages LFG list function, don't worry about it
    if (!message.content.startsWith(PREFIX)) {
        if (message.channel.name == 'group-up') bot.lfgList = null;
        return;
    }

    // Escapes early if user is not a developer
    if (!funcs.isDev(message)) return;

    let args = message.content.substring(PREFIX.length).split(" ");

    for (let arg in args) while (args[arg] == '') args.splice(arg, 1);

    if (!args[0]) return;
    
    // Checks if user is permitted to use command
    let good = funcs.hasPermission(args[0].toLowerCase(), message);
    if (!good && !funcs.testing(message)) return funcs.invalid(message);

    // Directs to appropriate file to process user's command
    let cmd = bot.commands.get(args[0].toLowerCase());
    if (cmd) cmd.run(bot, message, args);
    else
        switch (args[0].toLowerCase()) {
            case "rr":
            case "r":
                bot.commands.get('dice').run(bot, message, args);
                break;
            case "info":
            case "commands":
            case "command":
                message.channel.send(funcs.commandList(message));
                break;
            // CHARLOG BLOCK
            case 'dmrewards':
                args.shift();
                bot.commands.get('charlog').run(bot, message, ['dmreward'].concat(args));
                break;
            case 'rewards':
                args.shift();
                bot.commands.get('charlog').run(bot, message, ['reward'].concat(args));
                break;
            case 'lfglist':
                bot.commands.get('lfg').run(bot, message, ['lfg', 'list']);
                break;
            case 'swap':
            case 'headcount':
            case 'donate':
            case "adjust":
            case "wipe":
            case "initiate":
            case "retire":
            case "transfer":
            case "sell":
            case "spend":
            case "charinfo":
            case "dmreward":
            case "reward":
            case "testo":
                bot.commands.get('charlog').run(bot, message, args);
                break;
            // NEW STUFF
            case "auction":
                bot.commands.get('charlog').run(bot, message, args);
                break;
            case "buy":
                bot.commands.get('inventory').run(bot, message, ['inventory'].concat(args));
                break;
            // ADMIN ONLY
            case "dobidding":
                if (message.channel.type != 'dm') message.delete();
                message.channel.send(dobidding(message));
                break;
            case "nonsense":
                message.delete();
                if (message.channel.name != 'general-ooc' && !funcs.testing(message)) return message.channel.send("Nonsense mode can only be activated from " + message.guild.channels.find('name', 'general-ooc') + '.');
                else return message.channel.send("Nonsense mode can only be activated from staff channels.");
                if (nonsenseModeEnabled) message.channel.send('**NONSENSE MODE DISABLED**: Boring normality stabilized.');
                else message.channel.send('**NONSENSE MODE ENABLED**: Prepare loins for maximum nonsense.');
                nonsenseModeEnabled = !nonsenseModeEnabled;
                break;
            case "test":
                funcs.testmode(message);
                break;
            case "reset":
                if (!funcs.hasPermission('dobidding', message)) return funcs.invalid(message);
                reset(message);
                break;
            case "makeitrain": // This was a one-off function to adjust everyone's TP total.
                if (!funcs.isDev(message)) break;
                message.guild.members.forEach(wanker => {
                    if (bot.vault[wanker.id]) {
                        let oldTP = bot.vault[wanker.id].tp;
                        let wLevel = bot.vault[wanker.id].level
                        bot.vault[wanker.id].tp = Math.ceil(oldTP*(wLevel < 11 ? (wLevel < 5 ? 3 : 2) : (wLevel < 17 ? 5/3.0 : 1.5)));
                    }
                });
                fs.writeFile('./vault.json', JSON.stringify(bot.vault, null, 4), err => {
                    if (err) throw err;
                });
                bot.commands.get('charlog').run(bot, message, args);
                message.channel.send("RAIN MADE");
                // Log Membership
                /*
                let memberData = "id,username,discriminator,nickname,lastMessageSent\n";
                message.guild.members.forEach(wanker => {
                    if (!wanker.user.bot) {
                        //console.log(wanker.id+": "+wanker.displayName+", "+wanker.nickname+", "+wanker.user+", "+wanker.lastMessage.createdAt+", "+wanker.user.id+" "+wanker.user.discriminator+" "+wanker.user.username+" "+wanker.user.toString());
                        memberData += wanker.id+","+wanker.user.username+","+wanker.user.discriminator.padStart(4,'0')+","+(wanker.nickname != null ? '"'+wanker.nickname+'"' : "")+","+(wanker.lastMessage != null ? '"'+wanker.lastMessage.createdAt+'"' : "")+"\n";
                    }
                });
                
                // Write data in 'member_data.txt' . 
                fs.writeFile('member_data.csv', memberData, (err) => { 
                    if (err) console.log(err); 
                }) */

                break;
            default: funcs.invalid(message);
        }
});

function dobidding(message) {
    var responses = personality.DOBIDDING;
    return responses[Math.floor(Math.random() * responses.length)];
}

function autoBoop(message) {
    if (message.channel.name == 'general-ooc') {
        message.react(bot.emojis.find("name", "boop"));
    }
}

function alphabet(message) {
    if (message.member.id == '123675155032440832') { // G only
        let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        message.member.setNickname(alphabet[alphaLet++]).catch(function (error) {
            console.log(error);
        });
        alphaLet = alphaLet % 26;
        return;
    }
}

function tag(message) {
    if (message.channel.name != 'general-ooc') return;
    if (message.member.roles.find('name', 'Admins')) return;
    let swap = message.member.nickname;
    message.member.setNickname(prevNick).catch(function (error) {
        console.log(error);
    });
    prevNick = swap;
    console.log('SWAPPED');
}

function reset(message) {
    var c = 9;
    var interval = setInterval(function () {
        // use the message's channel (TextChannel) to send a new message
        if (c == 9) {
            message.channel.send('**SERVER RESET IN T-MINUS 10...**');
        }
        message.channel.send('**' + c-- + '...**')
            .catch(console.error); // add error handling here
        if (c == 0) {
            clearInterval(interval);
            return;
        }
    }, 1000);
}

bot.login(settings.token);
