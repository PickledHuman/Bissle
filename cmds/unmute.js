const fs = require('fs');
const settings = module.require('../botsettings.json');

module.exports.run = async (bot, message, args) => {
    if (message.channel.type === 'dm') return;
    if (message.member.roles.find("name", "Admins") || message.member.roles.find("name", "Mod")) { // isMod/Admin
        return message.author.send("Sorry, bub. This command has been disabled.");
        let troll = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[1]);
        if (!troll) return message.channel.send("I can't go dispelling silence at a whim. You gotta tell me who!");
        if (troll.id === message.author.id) return message.channel.send("You can't unsilence yourself.");
        
        let role = message.guild.roles.find(r => r.name === 'Silenced');
        if (!role || !troll.roles.has(role.id))
            return message.channel.send("This fellow isn't under the effect of Silence.")

        await troll.removeRole(role);

        delete bot.mutes[troll.id];

        fs.writeFile('./mutes.json', JSON.stringify(bot.mutes), err => {
            if (err) throw err;
            console.log('The Silence on ' + troll.toString() + ' has been dispelled!');
        });

        message.channel.send(message.author.toString() + " *has dispelled the **Silence** on* " + troll.toString() + '.');
        if (message.channel.name != settings.adminchat)    
            message.guild.channels.find("name", settings.adminchat).send(message.author.toString() + " *has dispelled the **Silence** on* " + troll.toString() + '.');
    } else message.channel.send("Sorry, kid. That spell is a bit too high level for ye.");
}

module.exports.help = {
    name: 'unmute'
}