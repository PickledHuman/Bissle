const Discord = require("discord.js");
const funcs = module.require('../funcs.js');
const fs = require('fs');

module.exports.run = async (bot, message, args) => {
    if (!funcs.isNorrick(message)) return funcs.invalid(message);
    switch(args[0]) {
        case 'new':
        case 'bid':
        case 'list':
        default:
            funcs.invalid(message);
    }
}

module.exports.help = {
    name: 'newAuction'
}