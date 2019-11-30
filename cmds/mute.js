const fs = require('fs');
const settings = module.require('../botsettings.json');

module.exports.run = async (bot, message, args) => {
    if (message.channel.type === 'dm') return;
    if (message.member.roles.find("name", "Admins") || message.member.roles.find("name", "Mod")) { // isMod/Admin
        return message.author.send("Sorry, bub. This command has been disabled.");
        let troll = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[1]);
        if (!troll) return message.channel.send("I can't silence everyone willy-nilly. You gotta tell me who!");
        if (troll.id === message.author.id) return message.channel.send("You can't silence yourself.");
        
        let role = message.guild.roles.find(r => r.name === 'Silenced');
        if (!role) { // Create role if doesn't exist
            try {
                role = await message.guild.createRole({
                    name: 'Silenced',
                    color: '#850000',
                    permissions: []
                });

                message.guild.channels.forEach(async (channel, id) => {
                    await channel.overwritePermissions(role, {
                        SEND_MESSAGES: false,
                        ADD_REACTIONS: false,
                        CONNECT: false
                    });
                });
            } catch(e) {
                console.log(e.stack);
            }
        }

        if (troll.roles.has(role.id)) return message.channel.send("This fellow is already muted.");

        bot.mutes[troll.id] = {
            guild: message.guild.id,
            time: Date.now() + (!args[2] ? 3600*1000 : parseInt(args[2])*1000),
        }

        await troll.addRole(role);

        fs.writeFile('./mutes.json', JSON.stringify(bot.mutes, null, 4), err => {
            if (err) throw err;
            message.channel.send(message.author.toString() + " *has cast **Silence** on* " + troll.toString() + '.');
            if (message.channel.name != settings.adminchat)
                message.guild.channels.find("name", settings.adminchat).send(message.author.toString() + " *has cast **Silence** on* " + troll.toString() + '.');
        });
        
    } else message.channel.send("Sorry, kid. That spell is a bit too high level for ye.");
}

module.exports.help = {
    name: 'mute'
}