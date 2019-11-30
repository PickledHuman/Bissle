const personality = require('../personality.js');

let pings = personality.PING;

module.exports.run = async (bot, message, args) => {
    let x = Math.floor(Math.random()*(pings.length+1));
    if (x == pings.length) {
        message.react(bot.emojis.find("name", "disgust"));
        message.react(bot.emojis.find("name", "gfdi"));
        message.react(bot.emojis.find("name", "banhammer"));
        message.react(bot.emojis.find("name", "blackflare"));
        return;
    }
    message.channel.send(pings[x]);
}

module.exports.help = {
    name: 'ping'
}