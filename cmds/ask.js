const personality = module.require('../personality.js');

let fortunes = personality.ASK;

module.exports.run = async (bot, message, args) => {
    if (args[1]) message.channel.send(fortunes[Math.floor(Math.random() * fortunes.length)]);
    else message.channel.send("Speak up sonny! I didn't hear your question.");
}

module.exports.help = {
    name: 'ask'
}