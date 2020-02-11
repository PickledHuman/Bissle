const funcs = module.require('../funcs.js');
const Discord = module.require('discord.js');
const fs = require('fs');
const sql = require('sqlite');
const pers = require('../personality.js');
const settings = require('../botsettings.json');
const PREFIX = settings.prefix;
sql.open('./charlog.sqlite');

module.exports.run = async (bot, message, args) => {
    // CHECK PERMISSIONS
    if (message.channel.type === 'dm') return;
    if (!message.member.roles.find("name", "Guild Member")) return message.channel.send('You can only LFG if you are a registered Guild Member.')
    if ((message.channel.name != 'lfg' && message.channel.name != 'group-up') && !funcs.testing(message)) return message.channel.send('Please LFG in ' + bot.channels.get('371684792988860417') + '.');
    
    if (!args[1]) { // TOGGLE
        if(!funcs.hasRole('LFG', message.member))
            sql.get(`SELECT * FROM charlog WHERE userId ="${message.author.id}"`).then(row => {
                if (!row) message.channel.send(pers.LFG[0]);
                else {
                    if (row.level < 5) addlfg(bot, message, 'low');
                    else if (row.level < 11) addlfg(bot, message, 'mid');
                    else if (row.level < 17) addlfg(bot, message, 'high');
                    else addlfg(bot, message, 'epic');
                    if (bot.lfgList == null)
                        message.channel.send(listlfg(bot)).then(msg => {
                            bot.lfgList = msg.id;
                        });
                    else
                        message.channel.messages.find("id", bot.lfgList).edit(listlfg(bot));
                }
            }, err => {
                bot.lfgList = null;
                message.channel.send(pers.LFG[0]);
            });
        else removelfg(bot, message, null, false);
    }
    else switch(args[1].toLowerCase()) { // INTERPRET EXTRA COMMAND
        case 'list':
            message.channel.send(listlfg(bot)).then(msg => {
                bot.lfgList = msg.id;
            });
            break;
        case 'epic':
        case 'high':
        case 'mid':
        case 'low':
        case 'pbp':
            toggle(bot, message, args[1].toLowerCase());
            break;
        case 'add':
            let gorp = 0;
            if (args[2]) gorp = args[2].toLowerCase();
            if (!args[2] || !(gorp == 'low' || gorp == 'mid' || gorp == 'high' || gorp == 'epic' || gorp == 'pbp'))
                sql.get(`SELECT * FROM charlog WHERE userId ="${message.author.id}"`).then(row => {
                    if (!row) message.channel.send(pers.LFG[0]);
                    else {
                        if (row.level < 5) addlfg(bot, message, 'low');
                        else if (row.level < 11) addlfg(bot, message, 'mid');
                        else if (row.level < 17) addlfg(bot, message, 'high');
                        else addlfg(bot, message, 'epic');
                    }
                }, err => {
                    bot.lfgList = null;
                    message.channel.send(pers.LFG[0]);
                });
            else addlfg(bot, message, gorp);
            break;
        case 'remove':
            removelfg(bot, message, args[2], false);
            break;
        case 'purge':
            let tiery = null;
            if (!funcs.hasPermission('nonsense', message)) return funcs.invalid(message);
            if (!args[2]) return message.channel.send('Please specify the number of days beyond which folks should be purged from lfg.\n(e.g. **'+PREFIX+'lfg purge 7**)');
            if (args[2] == 'pbp') {
                if (!args[3]) return message.channel.send('Please specify the number of days beyond which folks should be purged from lfg pbp.\n(e.g. **'+PREFIX+'lfg purge pbp 7**)');
                if (isNaN(args[3])) return message.channel.send('Please choose a valid number of days.');
                tiery = 'pbp';
            }
            else if (isNaN(args[2])) return message.channel.send('Please choose a valid number of days.');
            let lfg = bot.lfg; let purgeMsg = '';
            if (args[2] == -1) message.channel.send('***PPPUUURRRRRRRRRRRRRGGGEEE!!!!***');
            let someonePurged = false;
            for (i in lfg) { // ASSEMBLE NAMES AND WAITS
                let wait = (Date.now() - lfg[i].time)/86400000;
                if ((wait > parseFloat(args[2] == 'pbp' ? args[3] : args[2])) && (((lfg[i].low || lfg[i].mid || lfg[i].high || lfg[i].epic) && tiery != 'pbp') || (tiery == 'pbp' && lfg[i].pbp))) {
                    purgeMsg += lfg[i].name + ' has been purged from LFG.\n';
                    removelfg(bot, message, tiery, true, i);
                    someonePurged = true;
                }
            }
            if (!someonePurged) purgeMsg += 'No guild members have been LFG for that long. As such, no one has been purged. Let me go back to sleep, ya turd!'
            message.channel.send(purgeMsg);
            break;
        default:
            return funcs.invalid(message);
    }
    message.delete();
}

module.exports.help = {
    name: 'lfg'
}

function addlfg(bot, message, tier=null) {
    if (!tier || !(tier == 'low' || tier == 'mid' || tier == 'high' || tier == 'epic' || tier == 'pbp')) return message.channel.send('**OH Q@&%*#** One moment, I dropped all my lemons.');
    if (!funcs.hasRole('LFG', message.member) || !bot.lfg[message.member.id]) // ADD LFG, AND APPROPRIATE TIER
        bot.lfg[message.member.id] = {
            name: message.member.nickname || '<@!'+message.member.id+'>',
            guild: message.guild.id,
            time: Date.now(),
            low: tier == 'low',
            mid: tier == 'mid',
            high: tier == 'high',
            epic: tier == 'epic',
            pbp: tier == 'pbp',
        }
    else { // SPECIFIED TIER ONLY
        bot.lfg[message.member.id] = {
            name: message.member.nickname || '<@!'+message.member.id+'>',
            guild: message.guild.id,
            time: bot.lfg[message.member.id].time || Date.now(),
            low: bot.lfg[message.member.id].low || tier == 'low',
            mid: bot.lfg[message.member.id].mid || tier == 'mid',
            high: bot.lfg[message.member.id].high || tier == 'high',
            epic: bot.lfg[message.member.id].epic || tier == 'epic',
            pbp: bot.lfg[message.member.id].pbp || tier == 'pbp',
        }
    }

    let role = message.guild.roles.find('name', 'LFG-'+tier);
    message.member.addRole(role);
    if (!funcs.hasRole('LFG', message.member)) {
        role = message.guild.roles.find('name', 'LFG');
        message.member.addRole(role);
    }

    fs.writeFile('./lfg.json', JSON.stringify(bot.lfg, null, 4), err => {
        if (err) throw err;
    });
    message.channel.send(message.author.toString() + " is LFG for a " + (tier == 'pbp' ? "PBP" : tier+"-level") + " game.");
}

function removelfg(bot, message, tier=null, purge=false, personID=null) {
    let role = message.guild.roles.find('name', 'LFG' + (!tier ? '' : '-'+tier));
    let removee = (purge ? message.guild.members.find('id', personID) : message.guild.member(message.member));
    if (!removee) {
        if (bot.lfg[personID]) delete bot.lfg[personID];
    }
    else {
        if (!role || !removee.roles.has(role.id))
            return funcs.invalid(message);
        if (purge) {
            let z = bot.lfg[removee.id];
            if (tier == 'pbp') {
                removee.removeRole(removee.guild.roles.find("name", "LFG-pbp"));
                bot.lfg[removee.id].pbp = false;
            }
            else {
                removee.removeRole(removee.guild.roles.find("name", "LFG-epic"));
                removee.removeRole(removee.guild.roles.find("name", "LFG-high"));
                removee.removeRole(removee.guild.roles.find("name", "LFG-mid"));
                removee.removeRole(removee.guild.roles.find("name", "LFG-low"));
                removee.removeRole(role);
                bot.lfg[removee.id].low = false;
                bot.lfg[removee.id].mid = false;
                bot.lfg[removee.id].high = false;
                bot.lfg[removee.id].epic = false;
            }
            if (!z.epic && !z.high && !z.mid && !z.low && !z.pbp) delete bot.lfg[removee.id];
        }
        else if (!tier || !bot.lfg[removee.id]) { // TURN EVERYTHING OFF
            removee.removeRole(removee.guild.roles.find("name", "LFG-epic"));
            removee.removeRole(removee.guild.roles.find("name", "LFG-high"));
            removee.removeRole(removee.guild.roles.find("name", "LFG-mid"));
            removee.removeRole(removee.guild.roles.find("name", "LFG-low"));
            if (!personID) removee.removeRole(removee.guild.roles.find("name", "LFG-pbp"));
            removee.removeRole(role);
            if (bot.lfg[removee.id]) delete bot.lfg[removee.id];
            message.channel.send(message.author.toString() + " is no longer LFG.");
        }
        else { // OR TURN ONE THING OFF
            message.member.removeRole(role);
            let stuff = [bot.lfg[message.member.id].time, bot.lfg[message.member.id].low, bot.lfg[message.member.id].mid, bot.lfg[message.member.id].high, bot.lfg[message.member.id].epic, bot.lfg[message.member.id].pbp];
            delete bot.lfg[message.member.id];
            bot.lfg[message.member.id] = {
                name: message.member.nickname || '<@!'+m.id+'>',
                guild: message.guild.id,
                time: stuff[0],
                low: stuff[1] && tier != 'low',
                mid: stuff[2] && tier != 'mid',
                high: stuff[3] && tier != 'high',
                epic: stuff[4] && tier != 'epic',
                pbp: stuff[5] && tier != 'pbp',
            }
            let q = bot.lfg[message.member.id]
            if (!q.epic && !q.high && !q.mid && !q.low && !q.pbp) {
                delete bot.lfg[message.member.id];
                message.member.removeRole(message.member.guild.roles.find("name", "LFG"));
                message.channel.send(message.author.toString() + " is no longer LFG.");
            } else {message.channel.send(message.author.toString() + " is no longer LFG for a " + (tier == 'pbp' ? "PBP" : tier+"-level") + " game.");}
        }
    }
    fs.writeFile('./lfg.json', JSON.stringify(bot.lfg), err => {
        if (err) throw err;
    });

}

function toggle(bot, message, tier=null) {
    if (!tier) return funcs.invalid(message);
    if (message.member.roles.find("name", 'LFG-'+tier)) removelfg(bot, message, tier);
    else addlfg(bot, message, tier);
    if (bot.lfgList == null)
            message.channel.send(listlfg(bot)).then(msg => {
                bot.lfgList = msg.id;
            });
        else
            message.channel.messages.find("id", bot.lfgList).edit(listlfg(bot));
}

function listlfg(bot) {
    let lfg = bot.lfg;
    let lfgepic = []; let lfghigh = []; let lfgmid = []; let lfglow = []; let lfgpbp = []; let twerp;
    for (i in lfg) { // ASSEMBLE NAMES AND WAITS
        let wait = Date.now() - lfg[i].time;
        twerp = lfg[i].name + (wait > 86400000 ? ': ' + Math.floor(wait/86400000) + ' DAY' + (Math.floor(wait/86400000) > 1 ? 'S' : '') + ' LFG' : '' );
        if (lfg[i].pbp) lfgpbp.push([wait, twerp]);
        if (lfg[i].low) lfglow.push([wait, twerp]);
        if (lfg[i].mid) lfgmid.push([wait, twerp]);
        if (lfg[i].high) lfghigh.push([wait, twerp]);
        if (!lfg[i].epic) continue;
        else lfgepic.push([wait, twerp]);
    }

    var embed = new Discord.RichEmbed()
        .setTitle('__Looking For Group__')
        .setColor(funcs.randColor());

    var title = '**PBP PLIX**';
    if (lfgpbp.length != 0) {
        let turds = '';
        lfgpbp.sort(function (a,b) {
            return a[0] - b[0];
        });
        for (turd in lfgpbp) turds += lfgpbp[turd][1] + '\n';
        embed.addField(title, turds);
    } else embed.addField(title, pers.LFG[1]);

    title = '**Low Tier** (Levels 2-4)';
    if (lfglow.length != 0) {
        let turds = '';
        lfglow.sort(function (a,b) {
            return a[0] - b[0];
        });
        for (turd in lfglow) turds += lfglow[turd][1] + '\n';
        embed.addField(title, turds);
    } else embed.addField(title, pers.LFG[2]);

    title = '**Mid Tier** (Levels 5-10)';
    if (lfgmid.length != 0) {
        let turds = '';
        lfgmid.sort(function (a,b) {
            return a[0] - b[0];
        });
        for (turd in lfgmid) turds += lfgmid[turd][1] + '\n';
        embed.addField(title, turds);
    } else embed.addField(title, pers.LFG[3]);

    var title = '**High Tier** (Levels 11-16)';
    if (lfghigh.length != 0) {
        let turds = '';
        lfghigh.sort(function (a,b) {
            return a[0] - b[0];
        });
        for (turd in lfghigh) turds += lfghigh[turd][1] + '\n';
        embed.addField(title, turds);
    } else embed.addField(title, pers.LFG[4]);

    var title = '**Epic Tier** (Levels 17+)';
    if (lfgepic.length != 0) {
        let turds = '';
        lfgepic.sort(function (a,b) {
            return a[0] - b[0];
        });
        for (turd in lfgepic) turds += lfgepic[turd][1] + '\n';
        embed.addField(title, turds);
    } else embed.addField(title, pers.LFG[5]);

    return embed;
}