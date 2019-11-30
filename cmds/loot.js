const funcs = module.require('../funcs.js');
const dice = module.require('./dice.js');

/* const tA = [
    // [itemName, rarity, resource, consumable?, more rolls?]
    ['Potion of Healing', "Common", "DMG 187", true, false],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    tA[0],
    ['Some random common', "Common", "Homebrew AF", true, true],
    tA[40],
    tA[40],
    tA[40],
    tA[40],
    tA[40],
    tA[40],
    tA[40],
    tA[40],
    tA[40],
    ['Spell Scroll (cantrip)', "Common", "DMG 200", true, false],
    tA[50],
    tA[50],
    tA[50],
    tA[50],
    tA[50],
    tA[50],
    tA[50],
    tA[50],
    tA[50],
    ['Potion of Climbing', "Common", "DMG 187", true, false],
    tA[60],
    tA[60],
    tA[60],
    tA[60],
    tA[60],
    tA[60],
    tA[60],
    tA[60],
    tA[60],
    ['Spell Scroll (1st level)', "Common", "DMG 200", true, false],
    tA[70],
    tA[70],
    tA[70],
    tA[70],
    tA[70],
    tA[70],
    tA[70],
    tA[70],
    tA[70],
    tA[70],
    tA[70],
    tA[70],
    tA[70],
    tA[70],
    tA[70],
    tA[70],
    tA[70],
    tA[70],
    tA[70],
    ['Spell Scroll (2nd level)', "Uncommon", "DMG 200", true, false],
    tA[90],
    tA[90],
    tA[90],
    ['Potion of Greater Healing', "Uncommon", "DMG 187", true, false],
    tA[94],
    tA[94],
    tA[94],
    ['Bag of Holding', "Uncommon", "DMG 153", false, false],
    ['Driftglobe', "Uncommon", "DMG 166", false, false],
]; */


module.exports.run = async (bot, message, args) => {
    if (!funcs.isNorrick(message)) return message.channel.send('OI! GET OUTTA HERE I\'M TESTING SHITE!');
    return;

    // Channel restrictions go here
    //if (message.channel.name != 'guild-hall' && !funcs.testing(message)) return message.channel.send("Sorry, we don't serve clockwhistle surprises here. Only in the " + message.guild.channels.find('name', 'guild-hall') + '.');

    // Parse input, check for dumb shit
    //if (!args[1]) return message.channel.send("Invalid format. Enter your Constitution modifier after the command.\n\t(i.e. **,clockwhistle 2**)");
    //if (isNaN(parseInt(args[1]))) return message.channel.send('Please enter a valid number.');
    //if (parseInt(args[1]) >= 14) return message.channel.send('You cannot fail. Spend as much gold as you want.');
    
    // Make purchase roll, generate prices, return result
    // or
    // Roll mission reward TP, return result
}

module.exports.help = {
    name: 'loot'
}