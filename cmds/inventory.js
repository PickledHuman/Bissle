const Discord = require("discord.js");
const funcs = module.require('../funcs.js');
const fs = require('fs');

module.exports.run = async (bot, message, args) => {
    if (!funcs.isNorrick(message)) return funcs.invalid(message);
    args.shift();
    let command = (!args[0] ? 'show' : args[0]);
    switch(command) {
        case 'add':
            // PARSE ITEM INFO: ,inventory add Potion-of-Healing stock20 price50 refresh24(hours) max5
            if (!args[1]) return message.channel.send('Please name the item you wish to add to inventory.');
            if (!args[2] || isNaN(args[2]) || parseInt(args[2]) != parseFloat(args[2]) || parseInt(args[2]) <= 0) return message.channel.send('Please enter a valid number of items to stock.');
            if (!args[3] || isNaN(args[3]) || parseFloat(args[2]) <= 0) return message.channel.send('Please enter a valid price.');
            if (!args[4] || isNaN(args[4]) || parseInt(args[4]) != parseFloat(args[4]) || parseInt(args[4]) <= 0) return message.channel.send('Please enter how often this item should refresh (in hours).');
            if (args[5]) if (isNaN(args[5]) || parseInt(args[5]) != parseFloat(args[5]) || parseInt(args[5]) <= 0) return message.channel.send('Please enter a valid maximum purchase limit.');

            let name = args[1].split('-').join(' ');
            let hours = parseInt(args[4]);
            bot.inventory[funcs.cmdHash(args[1])] = {
                name: name,
                currentStock: parseInt(args[2]),
                stock: parseInt(args[2]),
                price: parseFloat(args[3]),
                nextRefresh: Date.now() + (1000 * 60 * 60 * hours),
                restockTime: 1000 * 60 * 60 * hours,
                maxbuy: (!args[5] ? 0 : parseInt(args[5])),
            }

            fs.writeFile('./inventory.json', JSON.stringify(bot.inventory, null, 4), err => {
                if (err) throw err;
                message.channel.send(name + ' has been added to the Guild Inventory.');
            });
            break;
        case 'refresh':
            if (!args[1]) return message.channel.send('Please name the item you wish to refresh.');
            if (args[1] == 'ALL') {
                let tempFresh;
                for (i in bot.inventory) {
                    tempFresh = refreshedThing(bot, message, i);
                    delete bot.inventory[i];
                    bot.inventory[i] = tempFresh;
                }
                message.channel.send('The Heroes Guild Inventory has been restocked!');
            } else {
                let itemCode = funcs.cmdHash(args[1]);
                if (!bot.inventory[itemCode]) return message.channel.send('Sorry, we don\'t keep that in stock.');
                let refreshed = refreshedThing(bot, message, itemCode);
                delete bot.inventory[itemCode];
                bot.inventory[itemCode] = refreshed;
                message.channel.send(bot.inventory[itemCode].name + ' has been restocked!');
            }
            fs.writeFile('./inventory.json', JSON.stringify(bot.inventory, null, 4), err => {
                if (err) throw err;
            });
            break;
        case 'remove':
            if (!args[1]) return message.channel.send('Please name the item you wish to remove from inventory.');
            let item = funcs.cmdHash(args[1]);
            if (!bot.inventory[item]) return message.channel.send('That item doesn\'t exist. Looks like my work here is done.');
            
            delete bot.inventory[item];

            fs.writeFile('./inventory.json', JSON.stringify(bot.inventory, null, 4), err => {
                if (err) throw err;
                message.channel.send(args[1] + ' has been removed from the Guild Inventory.');
            });
            break;
        case 'show':
            let embed = new Discord.RichEmbed().setColor(funcs.randColor()).setTitle('Heroes Guild Inventory');
            let empty = true;
            for (i in bot.inventory) {
                empty = false;
                let name = bot.inventory[i].name;
                let price = bot.inventory[i].price;
                let refresh = getRefresh(bot, message, i);
                let currentStock = bot.inventory[i].currentStock;
                embed = embed.addField(capitalize(name.split(' ')).join(' ') + ', ' + price + " gp", "**IN STOCK:** " + currentStock + 
                    "\n\t*Restocks in " + refresh + '* ', true);
            }
            if (empty) return message.channel.send('Sorry, bub. I haven\'t got anything to sell ya.');
            message.channel.send(embed);
            break;
        case 'buy':
            // ,buy [#] [ITEM NAME]
            let number = 1;
            if (args[1] && !isNaN(args[1])) {
                if (parseInt(args[1]) != parseFloat(args[1]) || parseInt(args[1]) <= 0) return message.channel.send('Please specify a valid number of items to purchase.');
                else number = parseInt(args[1]);
                args.shift();
            }
            if (!args[1]) return message.channel.send('Please specify the item you wish to buy.');
            args.shift();
            let thingname = interpretItem(args)
            let thing = funcs.cmdHash(thingname); // CODE INTERPRET
            if (!bot.inventory[thing]) return message.channel.send('Sorry friendo, we don\'t sell that here.');
            if (bot.inventory[thing].currentStock == 0) {
                let refresh = getRefresh(bot, message, thing);
                return message.channel.send('Sorry, we are sold out. We restock in ' + refresh + '.');
            }
            if (number > bot.inventory[thing].currentStock) return message.channel.send('Sorry, we only have ' + bot.inventory[thing].currentStock + ' of those.');
            
            let update = {
                name: bot.inventory[thing].name,
                currentStock: bot.inventory[thing].currentStock - number,
                stock: bot.inventory[thing].stock,
                price: bot.inventory[thing].price,
                nextRefresh: bot.inventory[thing].nextRefresh,
                restockTime: bot.inventory[thing].restockTime,
                maxbuy: bot.inventory[thing].maxbuy,
            }
            delete bot.inventory[thing];
            bot.inventory[thing] = update;

            fs.writeFile('./inventory.json', JSON.stringify(bot.inventory, null, 4), err => {
                if (err) throw err;
                message.channel.send(number + ' ' + bot.inventory[thing].name + (number > 1 ? 's have' : ' has') + ' been sold to ' + message.author.toString() + '.');
            });
            break;
        default:
            funcs.invalid(message);
    }
}

module.exports.help = {
    name: 'inventory'
}

function getRefresh(bot, message, item) {
    let refresh = bot.inventory[item].nextRefresh - Date.now();
    if (refresh <= 0) bot.commands.get('inventory').run(bot, message, ['inventory', 'refresh', bot.inventory[item].name.split(' ').join('-')]);
    if (refresh/(60000) < 1) refresh = 'less than one minute.';
    else if (refresh/(3600000) < 1) refresh = refresh + ' minute' + (refresh/3600000 == 1 ? '' : 's');
    else refresh = Math.floor(refresh/86400000) + ' days, ' + Math.floor((refresh%86400000)/3600000) + ' hours';
    return refresh;
}

function refreshedThing(bot, message, itemCode) {
    let newTime = bot.inventory[itemCode].nextRefresh
    while (Date.now() > newTime)
        newTime += bot.inventory[itemCode].restockTime;
    return {
        name: bot.inventory[itemCode].name,
        currentStock: Math.max(bot.inventory[itemCode].stock, bot.inventory[itemCode].currentStock),
        stock: bot.inventory[itemCode].stock,
        price: bot.inventory[itemCode].price,
        nextRefresh: newTime,
        restockTime: bot.inventory[itemCode].restockTime,
        maxbuy: bot.inventory[itemCode].maxbuy,
    };
}

function interpretItem(args) {
    let words = []; let item = 'mglubiyet'
    for (i in args) words[i] = args[i].toLowerCase();
    if (words.includes('potion') || words.includes('potions')) {
        if (words.includes('healing')) {
            item = (!words.includes('greater') ? 'healing-potion' : 'greater-healing-potion');
        }
    }
    if (words.includes('scroll')) {
        if (words.includes('first') || words.includes('one'))
            item = '1st-level-spell-scroll';
        else if (words.includes('second') || words.includes('two'))
            item = '2nd-level-spell-scroll';
        else if (words.includes('third') || words.includes('three'))
            item = '3rd-level-spell-scroll';
    }
    return item;
}

function capitalize(words) {
    for (i in words) {
        words[i] = words[i][0].toUpperCase() + words[i].substring(1).toLowerCase();
    }
    return words;
}