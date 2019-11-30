const funcs = module.require('../funcs.js');
const Discord = module.require('discord.js');
const fs = require('fs');

module.exports.run = async (bot, message, args) => {
    // CHECK PERMISSIONS
    if (message.channel.type === 'dm') return;
    if (!message.member.roles.find("name", "Guild Member")) return funcs.invalid(message);
    if ((message.channel.name != 'group-up' && message.channel.name != 'ping-for-dm') && !funcs.testing(message)) return message.channel.send('Please do yer shit in ' + bot.channels.get('371684792988860417') + '.');
    
    if (!args[1]) { // TOGGLE
        if(!funcs.hasPermission('dmreward', message)) message.channel.send(dmList(message));
        else {
            if(!funcs.hasRole('Available to DM', message.member))
                addDM(message);
            else removeDM(message);
        }
    }
    else switch(args[1].toLowerCase()) { // INTERPRET EXTRA COMMAND
        case 'list':
            message.channel.send(dmList(message));
            break;
        case 'add':
            if(!funcs.hasPermission('dmreward', message)) return message.channel.send(funcs.invalid(message));
            addDM(message);
            break;
        case 'remove':
            if(!funcs.hasPermission('dmreward', message)) message.channel.send(funcs.invalid(message));
            removeDM(message);
            break;
        default:
            return funcs.invalid(message);
    }
    message.delete();
}

module.exports.help = {
    name: 'dm'
}

function addDM(message) {
    let role = message.guild.roles.find('name', 'Available to DM');
    message.member.addRole(role);
    message.channel.send(message.author.toString() + " is available to DM.");
}

function removeDM(message) {
    let role = message.guild.roles.find('name', 'Available to DM');
    message.member.removeRole(role);
    message.channel.send(message.author.toString() + " is no longer available to DM.");
}

function dmList(message) {
    let role = message.guild.roles.find('name', 'Available to DM');
    let downToDM = message.guild.members.filter(member => { 
        return member.roles.find("name", 'Available to DM');
    }).map(member => {
        return member.nickname || '<@!'+member.id+'>';
    });

    var embed = new Discord.RichEmbed()
        .setColor(funcs.randColor());

    var title = '__**Available DMs**__';
    if (downToDM.length != 0) {
        let bois = '';
        for (boi in downToDM) bois += downToDM[boi] + '\n';
        embed.addField(title, bois);
    } else embed.addField(title, 'Sorry, kiddo. Sometimes the internet is like real life and no one wants to DM.');

    return embed;
}
