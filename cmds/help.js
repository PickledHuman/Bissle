const funcs = module.require('../funcs.js');
const Discord = module.require("discord.js");
const settings = require("../botsettings.json");
const PREFIX = settings.prefix;

const cmd_desc = require('../cmd_desc.json');
const ALL = funcs.ALL;
const ORANGE = funcs.ORANGE;
const STAFF = funcs.STAFF;
const MOD = funcs.MOD;
const ADMIN = funcs.ADMIN;

module.exports.run = async (bot, message, args) => {
    args.shift();
    if (!args[0]) return message.channel.send('What would you like help with? Enter **,help** followed by the name of the command.\nFor a list of commands, enter **,commands**')
    let request = args[0];
    if (!funcs.hasPermission(request, message)) return message.channel.send('No can do, twerp. You\'re not high enough level to use ' + PREFIX + request + '.');
    let embed = new Discord.RichEmbed().setColor(funcs.randColor());
    switch(request) {
        case 'r':
        case 'rr':
            embed.addField(PREFIX+'r | rr',
                "Rolls dice. Supports keep (**k**/**kh**/**kl**), drop (**d**/**dh**/**dl**), reroll once (**ro**), reroll infinitely (**rr**), reroll and add (**ra**), " + 
                    "minimum/maximum (**mi**/**ma**), and exploding dice (**e**).")
            .addField('Examples',
                "**"+PREFIX+"r d100** - Roll a single percentile die.\n" +
                "**"+PREFIX+"r 2d20kh1-1** or **"+PREFIX+"r 2d20dl1-1** - Roll a history check with advantage.\n" +
                "**"+PREFIX+"r 2d20kl1-1** or **"+PREFIX+"r 2d20dh1-1** - Roll a stealth check in half-plate.\n" +
                "**"+PREFIX+"r 2d6ro2+4** - Roll maul damage with Great Weapon Fighting class feature.\n" +
                "**"+PREFIX+"r 2d6rr2+4** - Illegally roll maul damage with Great Weapon Fighting class feature.\n" +
                "**"+PREFIX+"r 10d6ra6** - Toss a 5th-level **Fireball** with Spell Bombardment.\n" +
                "**"+PREFIX+"r 4d8mi2+4** - Cast a 3rd-level **Thunderwave** with Elemental Adept.\n" +
                "**"+PREFIX+"r 5d10e10** - Roll a medicine check as an old-timey doctor in Deadlands.\n" +
                "**"+PREFIX+"rr** to roll several iterations. (i.e. **"+PREFIX+"rr 6 4d6kh3** to roll stats for a homegame)\n")
            .setFooter('Bissle knows PEMDAS, scientific notation, and several other arithmancy spells.');
            break;
        case 'command':
        case 'commands':
            embed = funcs.commandList(message);
            break;
        case 'help':
            embed.addField('HELPHELPHELPHELPHELPHELPHELPHELPHELPHELPHELPHELPHELPHELPHELPHEL',
            'phelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelp' +
            'helphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelp' +
            'helphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelp' +
            'helphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelp' +
            'helphelphelphelphelphelphelphelphelpheplhelphelphelphelphelphelphelphelphelphelp' +
            'helphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelp' +
            'helphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelp' +
            'helphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelp' +
            'helphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelp' +
            'helphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelp' +
            'helphelphelphelphelphelphelphelphelphelphelphelphelphelphelphelp')
            .setFooter('HELPHELPHELPHELPHELPHELPHELPHELPHELPHELPHELPHELPHELPHELPHELPHELPHELPHELP');
            break;
        case 'lfg': // Post link to LFG tutorial?
            embed.addField(PREFIX+'lfg',
                "Toggles LFG role from the " + message.guild.channels.find("name", "lfg") + " channel.\nAutomatically places you in tier for your level.")
            .addField('Subcommands',
                "**"+PREFIX+"lfg [low/mid/high]** - Manually toggles LFG role for specific tier.\n" +
                "**"+PREFIX+"lfg pbp** - Manually toggles LFG role for Play-By-Post games.\n" +
                "**"+PREFIX+"lfg list** - Prints list of all guild members currently LFG.\n" +
                "**"+PREFIX+"lfg [add/remove]** - Same as **lfg** toggle, but only works one way.\n"+
                (funcs.hasPermission('nonsense', message) ? "**__ADMIN ONLY__\n"+PREFIX+"lfg purge [# DAYS]** - Removes guild members who have been on the list for more than the specified number of days." : ''))
            .setFooter('If you forget to remove yourself from LFG before bed, Bissle will send you threatening PMs.');
            break;
        case 'dm':
            embed.addField(PREFIX+'dm',
                "Toggles 'Available to DM' role from the " + message.guild.channels.find("name", "lfg") + " channel.\n")
            .addField('Subcommands',
                "**"+PREFIX+"dm list** - Prints list of all available DMs.\n" +
                "**"+PREFIX+"dm [add/remove]** - Same as **dm** toggle, but only works one way.\n")
            .setFooter('If you forget to remove yourself from the DM list before bed, caffeine-fueled players may send you threatening PMs.');
            break;
        case 'ask':
            embed.addField(PREFIX+'ask [INANE YES/NO QUESTION]',
                "Ask Bissle a yes or no question, and get a 100% true answer.")
            .setFooter('There is no better way of making decisions than entrusting them to an ornery old gnome bureaucrat.');
            break;
        case 'joke':
            embed.addField(PREFIX+'joke',
                "Make Bissle tell you a joke. (Use **,joke [#]** to avoid randomness)")
            .setFooter('Please show mercy and only use this command in PMs. Everything is pain.');
            break;
        case 'clockwhistle': // Guild Hall Only
            embed.addField(PREFIX+'clockwhistle [Con save bonus]',
                "Order the clockwhistle surprise, and keep 'em coming until you fail the save.\n" + 
                "Make sure you've got enough cash for your tab, or Sal'll bust out the maul.")
            .setFooter('Please stop. Your addiction to wild magic is tearing our family apart.');
            break;
        case 'retire': // Hall of DMs Only
            embed.addField(PREFIX+'retire',
                "**WARNING: Use of this function will render you unable to return to your character at their current level. Think about what you are doing.**\n" +
                "Permanently retires your active character from the guild, deletes tracked stats.\n" +
                "This command can only be executed from the " + message.guild.channels.find("name", "hall-of-dms") + '.')
            .setFooter('I was an adventurer once. Level 20 too. But then I retired and, well...');
            break;
        case 'swap':
            embed.addField(PREFIX+'swap',
                "Swaps your active and inactive characters.\nIf you don't have a second character in Bissle, swap and then "+PREFIX+"initiate.\n" +
                "If you retired your active character, but need your inactive one, just swap.\n" +
                "Only retires your active character. Inactive sticks around until you swap and retire.")
            .setFooter('Swap fast enough to duplicate characters and break the space-time continuum. No big.');
            break;
        case 'transfer': // Auction/Hall of DMs Only
            embed.addField(PREFIX+'transfer [#GP] [RECIPIENT\'S DISCORD TAG]',
                "Transfers wealth to another active guild member.\n" +
                "Include silvers and coppers by using decimals. (i.e. 13.37 gp = 13 gp, 3 sp, and 7 cp)\n" + 
                "This command can only be executed from the " + message.guild.channels.find("name", "hall-of-dms") + '.')
            .setFooter('Bot development is hard work. Send your appreciation to @Loreseeker Norrick.');
            break;
        case 'spend': // Market Only for GP, Hall of DMs for TP
            embed.addField(PREFIX+'spend [#GP] on [USELESS ITEM/SERVICE/DTP/MAGIC BLENDERS/GAZEBOS/ETC.]',
                "Spends your hard-earned gold on useless baubles and/or precious healing potions in #the-market.\n" +
                "Include silvers and coppers by using decimals. (i.e. 13.37 gp = 13 gp, 3 sp, and 7 cp)\n" +
                'Items in the PHB can be purchased at the listed price, and sold back for half.\n' +
                'Ping GM/Staff if you\'re looking for something not listed there.\n' +
                'Gold is also spent when rolling DTP, crafting magic items, and constructing buildings.' +
                "This command can only be executed from " + message.guild.channels.find("name", "the-market") + ', ' + message.guild.channels.find("name", "dtp-rolls") + ', ' +  message.guild.channels.find("name", "magic-item-research-and-crafting") + ', or ' + message.guild.channels.find("name", "construction") + '.')
            .addField(PREFIX+'spend [#TP] on [TREASURE TABLE ROLL]',
                "You can also spend treasure points to roll on a loot table before a mission.\n" +
                "See the Treasure Point System doc in #player-documents-forms-and-sheets for more details.\n" +
                "This command can only be executed from the " + message.guild.channels.find("name", "hall-of-dms") + '.')
            .addField(PREFIX+'spend [#MP] on [CLOAK OF BILLOWING, ETC.]',
                "Material points used in crafting magic items are not tracked separately from TP.\n" +
                "When you would collect MP after a mission, **,spend** the rewarded TP on the project.\n" +
                "If an ally is assisting you, have them do the same and ping you.\n" +
                "This command can only be executed from the " + message.guild.channels.find("name", "magic-item-research-and-crafting") + '.')
            .setFooter('I keep having garbage luck on my TP rolls. What am I supposed to do with all these Oathbows?');
            break;
        case 'sell':
            embed.addField(PREFIX+'sell [19 SPLINTMAILS, ETC.] for [#] GP',
                "Sell random shit you don't need for half its PHB listed price.\n" +
                "Include silvers and coppers by using decimals. (i.e. 13.37 gp = 13 gp, 3 sp, and 7 cp)\n" +
                "This command can only be executed from the " + message.guild.channels.find("name", "the-market") + '.')
            .setFooter('Why sell anything when you could just hoard it in your Bag of Carrying-Capacity-Is-Optional?!');
            break;
        case 'donate':
            embed.addField(PREFIX+'donate [#GP]',
                "Give some tithings to keep the guild running proper.\n" +
                "Include silvers and coppers by using decimals. (i.e. 13.37 gp = 13 gp, 3 sp, and 7 cp)")
            .setFooter('Papa Bissle needs a new pair of Boots of the Winterlands.');
            break;
        case 'auction':
            embed.addField('**'+PREFIX+'auction [#GP] [AUCTION-HOLDER\'S DISCORD TAG]**',
                "Pay the winning bid, with 10% automatically taxed to the auction house.\n" +
                "Include silvers and coppers by using decimals. (i.e. 13.37 gp = 13 gp, 3 sp, and 7 cp)\n")
                .addField('**'+PREFIX+'auction on/off**', 'Enable/disable auction house notifications.')
            .setFooter('I don\'t care what anyone says; 1 gp increases are a legitimate tactic.');
            break;
        case 'charinfo': // Staff-rolling for third party's extra info
            embed.addField(PREFIX+'charinfo [DISCORD TAG]',
                "Prints the available information Bissle has on this Guild Member.\n" +
                "Omit the tag to pull up your own info quickly and easily." +
                (funcs.hasPermission('initiate', message) ? "\n**STAFF ONLY:** For more info on a character, execute this command in the " +
                message.guild.channels.find("name", "staff-rolling-channel") + '.' : ''))
            .setFooter('Big Bissle is always watching, but it is still a good idea to track your stuff separately too.');
            break;
        case 'ping': 
            embed.addField(PREFIX+'ping',
                "Pings Bissle for testing purposes." +
                "\nGo ahead. He loves getting pings.")
            .setFooter('DON\'T YOU F@#&ING DARE!');
            break;
        case 'initiate': // Hall of DMs / Office of Alice Only
            embed.addField(PREFIX+'initiate [NEW ADVENTURER\'S NAME] [DISCORD TAG]',
                "Initiates a new Guild Member, creates file in Bissle's cabinet." +
                "\nThis command can only be executed from the " + message.guild.channels.find("name", "hall-of-dms") +
                ' or the ' + message.guild.channels.find("name", "office-of-alice") + '.' + 
                "\nOnce an adventurer is named, it cannot be changed. So be sure to spell it correctly.")
            .setFooter('Granted, you could just fake your death. Easy peasy!');
            break;
        case 'rewards':
        case 'reward': // Rewards Log Only
            embed.addField(PREFIX+'reward [#XP] [#GP] [DISCORD TAGS]',
                "Distributes rewards to tagged Guild Members. List amounts per player.\n" +
                "TP automatically calculated. To award no TP, add a 0 after gp.\n" +
                "(i.e. **,reward 5 .01 0 @Tad @Ahri** gives 5 XP, 1 copper, and 0 TP to each turd listed)\n" +
                'Distributing different amounts to different players will require separate entries.\n' + 
                "This command can only be executed from the " + message.guild.channels.find("name", "rewards-log") + ' channel.')
            .setFooter("Make sure everyone has the correct character active.\nPing an Admin or Mod if you screw something up and need to be banned.");
            break;
        case 'dmrewards':
        case 'dmreward': // Rewards Log Only
            embed.addField(PREFIX+'dmreward',
                "Calculates and distributes DM reward appropriate to your active character level.\n")
            .addField("DM Rewards/Mission:",
                "**XP**: Percentage difference between XP thresholds of current and next character level\n" +
                    "\tLevels 2 - 6: 25%\n\tLevels 7 - 12: 15%\n\tLevels 13 - 19: 20%\n" +
                "**GP**: 25 gp per character level\n\t(If you are level 7, you get 7*25 = 175 gp per mission)\n" +
                "**TP**: .5 TP\n" + 
                "This command can only be executed from the " + message.guild.channels.find("name", "rewards-log") + ' channel.')
            .setFooter('Sweet sweet incentives! Only apply to Remnant games.');
            break;
        case 'staffrewards':
        case 'staffreward': // Rewards Log Only
            embed.addField(PREFIX+'staffreward',
                "Calculates and distributes Staff rewards to tagged Staff members.\n" +
                "This command can only be executed from the " + message.guild.channels.find("name", "rewards-log") + ' channel.')
            .setFooter('Make sure staffers have the correct character active.');
            break;
        case 'adjust': // Rewards Log Only
            embed.addField(PREFIX+'adjust [#] [XP/GP/TP] [DISCORD TAG]',
                "**Admin/Mod-Only Command**\nIncreases/decreases selected players' XP,GP, or TP total by listed amount.\n" +
                "This command can only be executed from the " + message.guild.channels.find("name", "rewards-log") + ' channel.')
            .setFooter('Bissle giveth no shits. Bissle taketh away forever.');
            break;
        case 'mute':
            embed.addField(PREFIX+'mute [DISCORD TAG] [#seconds]',
                "**Admin/Mod-Only Command**\nMutes guild member for optional amount of time.\nMutes indefinitely if no time specified.")
            .setFooter('Hopefully doesn\'t need much use. Still in development.');
            break;
        case 'unmute':
            embed.addField(PREFIX+'ummute [DISCORD TAG]',
                "**Admin/Mod-Only Command**\nUnmutes muted guild member.\nDoes nothing if not muted.")
            .setFooter('Why do we need this? Just ban them.');
            break;
        case 'wipe': // Only usable from bot-test-site
            embed.addField(PREFIX+'wipe',
                "**Norrick-Only Command: __" + (settings.wipeenabled ? 'ENABLED' : 'DISABLED') +
                "__**\nWipes all guild member data from database.\n" +
                "Mostly for testing purposes, sometimes for Fight Club purposes.")
            .setFooter('If you need help wiping something else, look elsewhere.');
            break;
        case 'dobidding':
            embed.addField(PREFIX+'dobidding',
                "**Admin-Only Command**\n" +
                "Make Bissle do your bidding.")
            .setFooter('Pretty self-explanatory really. Not sure why you need help with this.');
            break;
        case 'nonsense': // General-OOC Only
            embed.addField(PREFIX+'nonsense',
                "**Admin-Only Command**\n" +
                "Engage nonsense mode. Become chaos. Watch the world burn.")
            .setFooter('What is life without a little nonsense?');
            break;
        case 'invalid':
            embed.addField(PREFIX+'invalid',
                "**Admin-Only Command**\n" +
                "Manually trigger Bissle's invalid command response.")
            .setFooter('The applications are limitless!');
            break;
        case 'test':
            embed.addField(PREFIX+'test',
                "**Admin-Only Command**\n" +
                "Engage bot-test mode. Overrides normal channel permissions for the bot-test site.")
            .setFooter('Science isn\'t about why; it\'s about why not!');
            break;
        default:
            embed.addField('Sorry, kid. I\'m afraid I can\'t help you with ' + args.join(' ') + '.', "Use ,commands to get a list of what I can help you with.");
    }
    message.channel.send(embed);
}

module.exports.help = {
    name: 'help'
}