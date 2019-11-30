const Discord = require('discord.js');
const crypto = require('crypto');
const settings = require('./botsettings.json');
const cmd_desc = require('./cmd_desc.json');
const personality = require('./personality.js');
const PREFIX = settings.prefix;

const ALL = ['r', 'rr', 'command', 'commands', 'help', 'ask', 'joke',];
const ORANGE = ['lfg', 'dm', 'clockwhistle', 'retire', 'swap', 'transfer', 'spend', 'sell', 'donate', 'auction', 'charinfo', 'ping'];
const STAFF = ['initiate', 'reward', 'dmreward', ];
const MOD = ['adjust', 'mute', 'unmute', 'staffreward'];
const ADMIN = ['wipe', 'dobidding', 'nonsense', 'invalid', 'test',];

var testing = false;

module.exports = {
    ALL : ALL,
    ORANGE : ORANGE,
    STAFF : STAFF,
    MOD : MOD,
    ADMIN : ADMIN,

    randColor : function() {
        return randColor();
    },
    
    invalid : function(message) {
        invalid(message);
    },
    
    isNorrick : function(msg) {
        return (msg.member.id == '287716869933105154');
    },

    isDev : function(msg) {
        return (msg.member.id == '287716869933105154' || msg.member.id == '140598051269115905');
    },

    commandList : function(message){
        let embed = new Discord.RichEmbed().setColor(randColor())
            .setFooter("More functionality will be added as Bissle sees fit.");
        let nextSet = ''; let cmd;
    
        // Universal Commands
        for (i in ALL) {
            if (ALL[i] == 'rr' || ALL[i] == 'command') continue;
            cmd = cmd_desc[cmdHash(ALL[i])];
            nextSet += '**' + PREFIX+cmd.title + '** - ' + cmd.blurb + '\n';
        }
        embed.addField('__**Bissle Commands**__', nextSet + (message.channel.type == 'dm' ? '**'+PREFIX+'charinfo** - Prints only your information while in DMs.\n' : ''));
        if (message.channel.type == 'dm' || !hasRole('Guild Member', message.member)) return embed;
    
        // Guild Member Commands
        nextSet = '';
        for (i in ORANGE) {
            cmd = cmd_desc[cmdHash(ORANGE[i])];
            nextSet += '**' + PREFIX+cmd.title + '** - ' + cmd.blurb + '\n';
        }
        embed.addField('__**Guild Members Only**__', nextSet);
        if (!hasPermission('reward', message)) return embed;
        // Staff Commands
        nextSet = '';
        for (i in STAFF) {
            cmd = cmd_desc[cmdHash(STAFF[i])];
            nextSet += '**' + PREFIX+cmd.title + '** - ' + cmd.blurb + '\n';
        }
        embed.addField('__**Staff Only**__', nextSet);
        if (!hasRole('Admins', message.member) && !hasRole('Technomancer', message.member)) return embed;
        // Admin Commands
        nextSet = '';
        for (i in MOD) {
            cmd = cmd_desc[cmdHash(MOD[i])];
            nextSet += '**' + PREFIX+cmd.title + '** - ' + cmd.blurb + '\n';
        }
        for (i in ADMIN) {
            cmd = cmd_desc[cmdHash(ADMIN[i])];
            nextSet += '**' + PREFIX+cmd.title + '** - ' + cmd.blurb + '\n';
        }
        embed.addField('__**Admins Only**__', nextSet);
        return embed;
    },

    hasPermission : function(command, message) {
        return hasPermission(command, message);
    },

    hasRole : function(role, twerp) {
        return hasRole(role, twerp);
    },

    testing(message) {
        return testing && message.channel.name == 'bot-test-site';
    },

    testmode(message) {
        if (message.channel.name != 'bot-test-site') return invalid(message);
        message.delete();
        testing = !testing;
        return message.channel.send((testing ? '**TEST MODE ENABLED:** Channel permissions overridden.' : '**TEST MODE DISABLED:** Channel permissions restored.'));
    },

    cmdHash : function(command) {
        return cmdHash(command);
    }
}

module.exports.help = {
    name: 'funcs'
}

function randColor() {
    return '#'+Math.floor(Math.random()*16777215).toString(16);
}

function hasPermission(command, message) {
    let cmdInfo = cmd_desc[cmdHash(command)];

    if (!cmdInfo) return true; // Command does not exist

    if (message.channel.type == 'dm') return cmdInfo.dmable;

    let twerp = message.member;

    if (cmdInfo.minrole == 'ALL') return true;
    if (hasRole('Admins', twerp) || hasRole('Admin', twerp) || hasRole('Technomancer', twerp)) return true;
    if (hasRole('Mod', twerp) || hasRole('Mods', twerp) || hasRole('Pink Piddlers', twerp)) return cmdInfo.minrole != "ADMIN";
    if (hasRole('GM', twerp) || hasRole('GMs', twerp) || hasRole('Staff', twerp)) return cmdInfo.minrole == "STAFF" || cmdInfo.minrole == "ORANGE";
    if (hasRole('Guild Member', twerp) || hasRole('Guild Members', twerp) || hasRole('Adventurer', twerp) || hasRole('Dinguses', twerp)) return cmdInfo.minrole == "ORANGE";
}

function hasRole(role, twerp) {
    if (twerp.roles.find('name', role) != null) return true;
    return false;
}

function cmdHash(command) {
    return Math.round(parseInt(crypto.createHash('md5').update(command).digest('hex'), 16)/Math.pow(10, 27));
}

function invalid(message) {
    var responses = personality.INVALID;
    let x = Math.floor(Math.random()*(responses.length));
    return message.channel.send(responses[x]);
}