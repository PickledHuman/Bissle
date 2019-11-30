const funcs = module.require('../funcs.js');
const settings = module.require('../botsettings.json');
const personality = module.require('../personality.js');
const fs = require('fs');
const sql = require('sqlite');
sql.open('../charlog.sqlite');

const thresholds = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];
const dmRewardBracket = [25, 15, 20];
const cpxpRatios = [-1, 27, 20, 9, 5, 15, 25, 31, 32, 35, 32, 48, 52, 79, 84, 87, 98, 133, 166, 200, 200];// CURRENT DM REWARDS

const gnollTax = 1;


module.exports.run = async (bot, message, args) => {
    if (args[0] == 'charlog') return funcs.invalid(message);
    /*else if (args[0] == 'makeitrain') {
        if (funcs.isNorrick(message))
            sql.run(`UPDATE charlog SET cp = cp+8000`);
        return;
    }*/
    if (message.channel.name == 'rewards-log' && !(args[0] == 'reward' || args[0] == 'dmreward' || args[0] == 'staffreward' || args[0] == 'adjust')) {
        message.author.send('Please use only the '+ (funcs.hasPermission('adjust', message) ? '**'+PREFIX+'adjust**, **'+PREFIX+'staffreward**, ' : '') + '**'+PREFIX+'reward** and **'+PREFIX+'dmreward** commands in the ' + message.guild.channels.find('name', 'rewards-log') + '.');
        message.delete();
        return;
    }

    switch (args[0]) {
        case 'charinfo':
            let target = message.mentions.users.first() || message.author;
            sql.get(`SELECT * FROM charlog WHERE userId ="${target.id}"`).then(row => {
                if (!row) return message.channel.send("According to my records, " + ( target.id == message.author.id ? 'you are' : 'this person is' ) + " not a member of our guild.");
                if (target.id == '429691339270258688' && !funcs.hasPermission("nonsense", message)) return message.channel.send(personality.CHARLOG[0]);
                let info = '__**' + row.name + '**__\n**Level:** ' + row.level;
                if (message.author.id == target.id || (funcs.hasPermission('initiate', message) && (message.channel.name == 'staff-rolling-channel' || funcs.testing(message))))
                    info += '\n**XP:** ' + row.xp + ' XP. ' + (row.level != 20 ? '(' + (thresholds[row.level] - row.xp) +' XP til Level ' + (row.level+1) + ')' : '***'+ personality.CHARLOG[1+Math.floor(Math.random()*(personality.CHARLOG.length-1))] +'***' ) +
                    '\n**TP:** ' + (row.tp/2) + ' TP\n**Wealth:** ' + (Math.floor(row.cp)/100) + ' GP';
                message.channel.send(info);
                message.delete();
            }, err => {
                message.channel.send("My files show that the Adventurer's Guild of Remnant is completely devoid of adventurers. Weird!");
            });
            break;
        case 'spend':
            if (['the-market', 'dtp-rolls', 'downtime', 'guild-hall', 'hall-of-staff', 'magic-item-research-and-crafting', 'construction', 'magic-item-purchasing', 'business'].indexOf(message.channel.name) < 0 && !funcs.testing(message)) return message.channel.send("Not everything can be bought. Enter **"+PREFIX+"help spend** for more information on where you can **"+PREFIX+"spend**.");
            if (!args[1]) return message.channel.send('Please specify a valid number.');
            if (args[1][0] == '.') args[1] = '0' + args[1];
            if (isNaN(args[1]) || parseFloat(args[1]) <= 0) return message.channel.send('Please specify a valid number.');
            if (!args[2]) return message.channel.send('Please specify whether you are spending gp or tp.');
            let stype = args[2].toLowerCase();
            if (!(stype == 'gp' || stype == 'tp')) return message.channel.send('You can only spend gp or tp. NOT ' + args[2].toUpperCase() + '!');
            if (stype == 'tp' && parseInt(args[1]) - parseFloat(args[1]) != 0) return message.channel.send('Please specify a valid number of TP.');
            if (stype == 'gp' && parseInt(parseFloat(args[1])*100) - parseFloat(args[1])*100 != 0) return message.channel.send('Please specify a valid number of GP.');

            if (!args[3]) return message.channel.send('Please specify what you intend to spend your ' + stype + ' on.');
            let samt = parseFloat(args[1]);
            for (i = 0; i < 3; i++) args.shift();
            if (args[0].toLowerCase() == 'on') args.shift();
            if (!args[0]) return message.channel.send('Please specify what you intend to spend your ' + stype + ' on.');
            let sacquisition = args.join(' ');
            sql.get(`SELECT * FROM charlog WHERE userId ="${message.author.id}"`).then(row => {
                if (!row) message.channel.send('https://www.youtube.com/watch?v=n5diMImYIIA');
                else { // Reward and confirm
                    switch(stype) {
                        case 'gp':
                            samt *= 100;
                            if (samt > row.cp) message.channel.send("You cannot spend more " + stype + " than you have.");
                            else if (samt*gnollTax > row.cp) message.channel.send("Resources are scarce these days. You need an extra " + samt*(gnollTax-1) + " to afford that.");
                            else {
                                message.channel.send(row.name + ' has wasted ' + (samt/100) + ' GP on ' + sacquisition + '.' +
                                    '\n**New GP Total:** ' + ((row.cp - Math.round(samt*gnollTax))/100) + ' GP');
                                sql.run(`UPDATE charlog SET cp = ${row.cp - Math.round(samt*gnollTax)} WHERE userId = ${message.author.id}`);
                            }
                            break;
                        case 'tp':
                            if ((message.channel.name != 'hall-of-staff' && message.channel.name != 'magic-item-research-and-crafting' && message.channel.name != 'magic-item-purchasing') && !funcs.testing(message))
                                return message.channel.send("You can't spend TP anywhere. Go to the " + message.guild.channels.find('name', 'hall-of-staff') + ', or the ' + message.guild.channels.find('name', 'magic-item-research-and-crafting') + ' channel if adding MP to a project.');
                            samt *= 2;
                            if (samt > row.tp) message.channel.send("You cannot spend more " + stype + " than you have.");
                            else {
                                message.channel.send(row.name + ' has wasted ' + (samt/2) + ' TP on ' + sacquisition + '.' +
                                    '\n**New TP Total:** ' + ((row.tp - samt)/2) + ' TP');
                                sql.run(`UPDATE charlog SET tp = ${row.tp - samt} WHERE userId = ${message.author.id}`);
                            }
                            break;
                    }
                }
                message.delete();
            }, err => {
                message.channel.send("Can't spend money when you haven't got a bank account!");
            });
            break;
        case 'sell':
            // ,sell shitty longsword for 12.5
            if (message.channel.name != 'the-market' && !funcs.testing(message)) return message.channel.send("OI! SELL UR SHIT IN " + message.guild.channels.find('name', 'the-market') + " YA TURD!");
            args.shift();
            if (!args[0]) return message.channel.send('Please indicate what you are selling, followed by the amount (GP) it is being sold for.');
            let profit = args.pop();
            if (profit.toLowerCase() == 'gp' && !!args[0]) profit = args.pop();
            if (!args[0]) return message.channel.send('Please indicate what you are selling, followed by the amount (GP) it is being sold for.');
            if (isNaN(profit) || parseFloat(profit) <= 0) return message.channel.send('QUIT FUKEN ABOOT!');
            if (parseInt(parseFloat(profit)*100) - parseFloat(profit)*100 != 0) return message.channel.send('Please specify a valid number of GP.');
            if (args[args.length-1] == 'for') args.pop();
            if (!args[0]) return message.channel.send('Please indicate what you are selling, followed by the amount (GP) it is being sold for.');
            let gizmo = args.join(' ');
            profit = parseFloat(profit);
            sql.get(`SELECT * FROM charlog WHERE userId ="${message.author.id}"`).then(row => {
                if (!row) return message.channel.send('https://www.youtube.com/watch?v=XM4GFiMnK18');
                else { // Reward and confirm
                    profit *= 100;
                    message.channel.send(row.name + ' has earned ' + (profit/100) + ' GP by pawning off ' + gizmo + '.' +
                        '\n**New GP Total:** ' + ((row.cp + profit)/100) + ' GP');
                    sql.run(`UPDATE charlog SET cp = ${row.cp + profit} WHERE userId = ${message.author.id}`);
                    message.delete();
                }
            }, err => {
                message.channel.send("Can't sell shit if you haven't got a wallet wik witch ta keep da proseets!");
            });
            break;
        case 'reward':
            if (!funcs.hasPermission('initiate', message)) return message.channel.send('You cannot give rewards because you are not a GM.');
            if (!funcs.testing(message) && message.channel.name != 'rewards-log') return message.channel.send("Mission rewards must be recorded in the " + message.guild.channels.find('name', 'rewards-log') + '.');
            // Validate XP
            if (!args[1]) return message.channel.send('Please specify a valid number of XP.');
            if (isNaN(args[1]) || parseInt(args[1]) < 0 || parseInt(args[1]) - parseFloat(args[1]) != 0) return message.channel.send('Please specify valid reward values for XP and GP, in that order.');
            // Validate GP
            if (!args[2]) return message.channel.send('Please specify valid reward values for XP and GP, in that order.'); // Probably won't happen
            if (args[2].toLowerCase() == 'gp' && !(!args[3])) args[2] = args[3];
            if (args[2][0] == '.') args[2] = '0' + args[2];
            if (isNaN(args[2]) || parseFloat(args[2]) < 0) return message.channel.send('Please specify valid reward values for XP and GP, in that order.'); // No NaN or negatives
            if (parseInt(parseFloat(args[2])*100) - parseFloat(args[2])*100 != 0) return message.channel.send('Please specify valid reward values for XP and GP in that order.'); // Stop at CP
            let noTP = (args[3] == '0');
            let recipients = message.mentions.users;
            if (!recipients) return message.channel.send('Please specify at least one recipient.')
            message.channel.send('__**REWARDS**__\n**DM:** ' + message.author.toString());
            recipients.forEach(recipient => {
                if (recipient.id == message.author.id && !funcs.isNorrick(message)) {
                    message.channel.send('You cannot reward yourself.');
                }
                else if (recipient.id == '429691339270258688' && !funcs.isNorrick(message)) message.channel.send(personality.CHARLOG[0]);
                else sql.get(`SELECT * FROM charlog WHERE userId ="${recipient.id}"`).then(row => {
                    if (!row) message.channel.send(recipient.toString() + ' has not yet been initiated. Cannot process reward paperwork.');
                    else { // Reward and confirm
                        let pxpamt = parseInt(args[1]);
                        let pcpamt = parseFloat(args[2])*100;
                        let ptpamt = (noTP ? 0 :(row.level < 11 ? (row.level < 5 ? 2 : 4) : (row.level < 17 ? 6 : 8)));
                        message.channel.send(row.name + ' ('+recipient.toString()+') has been awarded ' + pxpamt + ' XP, ' + (pcpamt/100) + ' GP, and ' + (ptpamt/2) + ' TP.');

                        // Process XP
                        let increase = 0;
                        for (i = 0; row.xp + pxpamt >= thresholds[row.level+i]; i++) increase++;
                        if (increase > 1) message.guild.channels.find("name", settings.adminchat).send(recipient.toString() + "'s character ("+row.name+") has leveled up more than once. **Check that shit!**");
                        if (increase > 0) message.channel.send('__**CONGRATULATIONS, ' + row.name.toUpperCase() + '!**__\n' + row.name + ' is now level **' + (row.level+increase) + '**!\n' +
                            bot.emojis.find("name", "praise") + bot.emojis.find("name", "disgust") + bot.emojis.find("name", "SweatSouls") + bot.emojis.find("name", "nat20"));
                        sql.run(`UPDATE charlog SET level = ${row.level + increase} WHERE userId = ${recipient.id}`);
                        sql.run(`UPDATE charlog SET xp = ${row.xp + pxpamt} WHERE userId = ${recipient.id}`);

                        // Process GP
                        sql.run(`UPDATE charlog SET cp = ${row.cp + pcpamt} WHERE userId = ${recipient.id}`);

                        // Process TP
                        sql.run(`UPDATE charlog SET tp = ${row.tp + ptpamt} WHERE userId = ${recipient.id}`);
                    }
                }, err => {
                    message.channel.send("Sorry, can't process these rewards. Lost all my files.\nI could've sworn I put them in that angry looking bag of holding...");
                });
            });
            break;
        case 'dmreward':
            if (!funcs.hasPermission('initiate', message)) return message.channel.send('You cannot claim GM rewards because you are not a GM.');
            if (!funcs.testing(message) && message.channel.name != 'rewards-log') return message.channel.send("DM rewards must be recorded in the " + message.guild.channels.find('name', 'rewards-log') + '.');
            sql.get(`SELECT * FROM charlog WHERE userId ="${message.author.id}"`).then(rowDM => {
                if (!rowDM) message.channel.send(message.author.toString() + ' has not yet been initiated. Cannot process DM reward paperwork.');
                else { // Reward and confirm
                    let level = rowDM.level;
                    let xpamt = (level == 20 ? 625 : (thresholds[level] - thresholds[level-1])/100);
                    if (level < 7) xpamt *= dmRewardBracket[0];
                    else if (level < 13) xpamt *= dmRewardBracket[1];
                    else xpamt *= dmRewardBracket[2];
                    let cpamt = xpamt*cpxpRatios[level];
                    let tpamt = (level < 11 ? (level < 5 ? 1 : 2) : (level < 17 ? 3 : 4));

                    message.channel.send(rowDM.name + ' has been awarded ' + xpamt + ' XP, ' + (cpamt/100) + ' GP, and ' + (tpamt/2.0) + ' TP.');
                    let increase = 0;
                    for (i = 0; rowDM.xp + xpamt >= thresholds[level+i]; i++) increase++;
                    if (increase > 1) message.guild.channels.find("name", settings.adminchat).send(message.author.toString() + " has leveled up more than once from GMing. **Check that shit!**");
                    if (increase > 0) message.channel.send('__**CONGRATULATIONS, ' + rowDM.name.toUpperCase() + '!**__\nYou are now level **' + (level+increase) + '**!\n' +
                        bot.emojis.find("name", "praise") + bot.emojis.find("name", "disgust") + bot.emojis.find("name", "SweatSouls") + bot.emojis.find("name", "nat20"));
                    sql.run(`UPDATE charlog SET level = ${level + increase} WHERE userId = ${message.author.id}`);
                    sql.run(`UPDATE charlog SET xp = ${rowDM.xp + xpamt} WHERE userId = ${message.author.id}`);
                    sql.run(`UPDATE charlog SET cp = ${rowDM.cp + cpamt} WHERE userId = ${message.author.id}`);
                    sql.run(`UPDATE charlog SET tp = ${rowDM.tp + tpamt} WHERE userId = ${message.author.id}`);
                    message.delete();
                }
            }, err => {
                message.channel.send('*digs through pile of fire-damaged papers covered in varying amounts of jelly*\n"What\'d you say your name was again?"');
            });
            break;
        case 'staffreward':
            if (!funcs.hasPermission('adjust', message)) return message.channel.send('You cannot allocate Staff rewards because you are not an Admins.');
            if (!funcs.testing(message) && message.channel.name != 'rewards-log') return message.channel.send("Staff rewards must be recorded in the " + message.guild.channels.find('name', 'rewards-log') + '.');
            let goodStaff = message.mentions.users;
            let staffCnt = 0;
            goodStaff.forEach(goodBoi => {
                staffCnt += 1;
                if (goodBoi.id == message.author.id && !funcs.isNorrick(message)) {
                    message.channel.send('You cannot reward yourself.');
                }
                else if (goodBoi.id == '429691339270258688') message.channel.send(personality.CHARLOG[0]);
                else sql.get(`SELECT * FROM charlog WHERE userId ="${goodBoi.id}"`).then(rowStaff => {
                    if (!rowStaff) message.channel.send(goodBoi.toString() + ' has not yet been initiated. Cannot process Staff reward paperwork.');
                    else { // Reward and confirm
                        let level = rowStaff.level;
                        let xpamt = (level == 20 ? 625 : (thresholds[level] - thresholds[level-1])/100);
                        if (level < 7) xpamt *= dmRewardBracket[0];
                        else if (level < 13) xpamt *= dmRewardBracket[1];
                        else xpamt *= dmRewardBracket[2];
                        let cpamt = xpamt*cpxpRatios[level];
                        let tpamt = (level < 11 ? (level < 5 ? 1 : 2) : (level < 17 ? 3 : 4));
                        message.channel.send(rowStaff.name + ' has been awarded ' + xpamt + ' XP, ' + (cpamt/100) + ' GP, and ' + (tpamt/2.0) + ' TP for fulfilling Staff duties.');
                        let increase = 0;
                        for (i = 0; rowStaff.xp + xpamt >= thresholds[level+i]; i++) increase++;
                        if (increase > 1) message.guild.channels.find("name", settings.adminchat).send(goodBoi.toString() + " has leveled up more than once from Staff work. **Check that shit!**");
                        if (increase > 0) message.channel.send('__**CONGRATULATIONS, ' + rowStaff.name.toUpperCase() + '!**__\nYou are now level **' + (level+increase) + '**!\n' +
                            bot.emojis.find("name", "praise") + bot.emojis.find("name", "disgust") + bot.emojis.find("name", "SweatSouls") + bot.emojis.find("name", "nat20"));
                        sql.run(`UPDATE charlog SET level = ${level + increase} WHERE userId = ${goodBoi.id}`);
                        sql.run(`UPDATE charlog SET xp = ${rowStaff.xp + xpamt} WHERE userId = ${goodBoi.id}`);
                        sql.run(`UPDATE charlog SET cp = ${rowStaff.cp + cpamt} WHERE userId = ${goodBoi.id}`);
                        sql.run(`UPDATE charlog SET tp = ${rowStaff.tp + tpamt} WHERE userId = ${goodBoi.id}`);
                    }
                }, err => {
                    message.channel.send('*digs through pile of fire-damaged papers covered in varying amounts of jelly*\n"What\'d you say your name was again?"');
                });
            });
            if (staffCnt == 0) return message.channel.send("Please specify at least one recipient.");
            message.delete();
            break;
        case 'fix':
            break;
        case 'transfer':
            if (!funcs.testing(message) && (message.channel.name != 'auction-house' && message.channel.name != 'hall-of-staff' && message.channel.name != 'guild-hall'&& message.channel.name != 'business')) return message.channel.send("Any gold sent to another guild member must be done in the " + message.guild.channels.find('name', 'hall-of-staff') + '.');
            if (!args[1]) return message.channel.send('Please specify a valid amount of GP.');
            if (args[1][0] == '.') args[1] = '0' + args[1];
            if (isNaN(args[1]) || parseFloat(args[1]) <= 0 || parseInt(parseFloat(args[1])*100) - parseFloat(args[1])*100 != 0) return message.channel.send('Please specify a valid number of GP.');
            if (!args[2] || (args[2].toLowerCase() == 'gp' && !args[3])) return message.channel.send('Please specify a valid recipient.');
            let trecipient = message.guild.member(message.mentions.users.first() || message.guild.members.get((args[2].toLowerCase() == 'gp' ? args[3] : args[2])));
            if (!trecipient) return message.channel.send('Please specify who you intend to transfer gp to.');
            if (trecipient.id == message.author.id) message.channel.send("Fuck off and quit wasting my time!");
            if (trecipient.id != '429691339270258688' && message.channel.name == 'guild-hall') return message.channel.send("Any gold sent to another guild member must be done in the " + message.guild.channels.find('name', 'hall-of-staff') + '.');
            let tamt = parseFloat(args[1])*100;
            sql.get(`SELECT * FROM charlog WHERE userId ="${message.author.id}"`).then(row => {
                if (!row) message.channel.send("We haven't got a file for you, kid. You need to be initiated into the guild before you can transfer cash to an adventurer.");
                else {
                    if (tamt > row.cp) message.channel.send("You cannot spend more gp than you have.");
                    else {
                        sql.get(`SELECT * FROM charlog WHERE userId ="${trecipient.id}"`).then(row2 => {
                            if (trecipient.id == '429691339270258688') message.channel.send('You have donated ' + args[1] + " GP to the Adventurer's Guild of Remnant. Thanks for your support.");
                            else {
                                if (!row2) return message.channel.send('You cannot send gold to someone who isn\'t initiated.');
                                else {message.channel.send(row.name + ' ('+message.author.toString()+') has transfered ' + args[1] + ' GP to ' + row2.name + ' ('+trecipient.toString()+').');
                            }
                            sql.run(`UPDATE charlog SET cp = ${row.cp - tamt} WHERE userId = ${message.author.id}`);
                            sql.run(`UPDATE charlog SET cp = ${row2.cp + tamt} WHERE userId = ${trecipient.id}`);
                            }
                            message.delete();
                        }, err2 => {
                            message.channel.send("Can't transfer gold to someone I haven't got files for!");
                        });
                    }
                }
            }, err => {
                message.channel.send("Sorry, I lost your bank account.");
            });
            break;
        case 'initiate':
            if (!funcs.hasPermission('initiate', message)) return message.channel.send('Only a GM or Staff member can initiate a new Guild Member.');
            if (!funcs.testing(message) && message.channel.name != 'hall-of-staff' && message.channel.name != 'office-of-alice') return message.channel.send("Important paperwork such as this must be notarized. Go to the " +
                message.guild.channels.find('name', 'hall-of-staff') + ' or the ' + message.guild.channels.find('name', 'office-of-alice') + ' to be initiated.');
            let initiat = message.guild.member(message.mentions.users.first()) || message.member;
            if (initiat.id != message.author.id && !funcs.hasPermission('dmreward', message)) return message.channel.send('Only a GM or Staff member can initiate a new Guild Member.');
            sql.get('SELECT * FROM charlog WHERE userId = ' + initiat.id).then(row => {
                initiate (sql, message, args, row, initiat);
                message.delete();
            }).catch(() => {
                sql.run('CREATE TABLE IF NOT EXISTS charlog (userId TEXT, name, level INTEGER, xp INTEGER, cp INTEGER, tp INTEGER)').then(row => {
                    initiate (sql, message, args, row, initiat);
                    message.delete();
                })
            });
            break;
        case 'retire':
            if (message.channel.name != 'hall-of-staff' && !funcs.testing(message)) return message.channel.send("Important paperwork such as this must be notarized in triplicate. Go to the " +
                message.guild.channels.find('name', 'hall-of-staff') + ' if you wish to retire.');
            sql.get(`SELECT * FROM charlog WHERE userId ="${message.author.id}"`).then(row => {
                if (!row || !funcs.hasPermission('swap', message)) return message.channel.send("According to my records, you are not a member of our guild.");
                else {
                    if (!args[1]) return message.channel.send('Are you sure you wish to retire? If so, type '+PREFIX+'retire YES (case-sensitive).');
                    if (args[1] + ' ' + args[2] != 'YES (case-sensitive).') return message.channel.send('If you wish to retire, type "**'+PREFIX+'retire YES (case-sensitive).**"');
                    message.channel.send(message.author.toString() + '\n' + row.name + " has retired from the Adventurer's Guild of Remnant.");
                    sql.run(`DELETE FROM charlog WHERE userId ="${message.author.id}"`);
                    message.delete();
                }
            }, err => {
                message.channel.send("It seems file cabinet has been swallowed by a portal into the astral plane. Guess you're already sorta retired, huh?");
            });
            break;
        case 'wipe':
            if (!settings.wipeenabled || !funcs.isNorrick(message) || !funcs.testing(message)) return funcs.invalid(message);
            sql.run('DROP TABLE IF EXISTS charlog');
            console.log('CHARLOG DELETED');
            break;
        case 'adjust':
            if (!funcs.hasPermission('adjust', message)) return message.channel.send('You cannot adjust rewards because you are not a Mod.');
            if (!funcs.testing(message) && message.channel.name != 'rewards-log') return message.channel.send("All reward adjustments must be recorded in the " + message.guild.channels.find('name', 'rewards-log') + '.');
            if (!args[1]) return message.channel.send('Please specify a valid number.');
            if (args[1][0] == '.') args[1] = '0' + args[1];
            if (isNaN(args[1]) || parseFloat(args[1]) == 0) return message.channel.send('Please specify a valid number.');
            if (!args[2]) return message.channel.send('Please specify reward type.');
            let atype = args[2].toLowerCase();
            if (!(atype == 'xp' || atype == 'gp' || atype == 'tp')) return message.channel.send('Please specify value to adjust (XP, TP or GP).');
            if (atype == 'xp' && parseInt(args[1]) - parseFloat(args[1]) != 0) return message.channel.send('Please specify a valid amount of XP.');
            else if (atype == 'gp' && parseInt(parseFloat(args[1])*100) - parseFloat(args[1])*100 != 0) return message.channel.send('Please specify a valid amount of GP.');
            else if (atype == 'tp' && parseInt(parseFloat(args[1])*2) - parseFloat(args[1])*2 != 0) return message.channel.send('Please specify a valid amount of TP.');
            let adjustees = message.mentions.users;
            if (!adjustees) message.channel.send('Please specify for whom you wish to adjust ' + atype + ' value.');
            adjustees.forEach(recipient => {
                if (!funcs.isNorrick(message) && (recipient.id == message.author.id || !funcs.hasPermission('adjust', message))) {
                    message.channel.send('You cannot adjust your own ' + atype + '.');
                }
                else if (recipient.id == '429691339270258688' && !funcs.isNorrick(message)) message.channel.send(personality.CHARLOG[0]);
                else sql.get(`SELECT * FROM charlog WHERE userId ="${recipient.id}"`).then(row => {
                    if (!row) message.channel.send(recipient.toString() + ' has not yet been initiated. Cannot process reward paperwork.');
                    else { // Reward and confirm
                        let amt = parseFloat(args[1]);
                        switch(atype.toLowerCase()) {
                            case 'xp':
                                if (row.xp + amt < 0) message.channel.send('You cannot cause someone to have less than 0 ' + args[2] + '.');
                                else {
                                    let output = message.author.toString() + ' has ' + (amt > 0 ? 'allocated ' : 'deducted ' ) + Math.abs(amt) + ' XP ' + (amt>0 ? 'to ' : 'from ') + row.name + '.' +
                                        '\n**New XP Total:** ' + (row.xp + amt);
                                    let change = 0;
                                    for (i = 0; row.xp + amt >= thresholds[row.level+i]; i++) change++;
                                    for (i = 0; row.xp + amt < thresholds[row.level-1+i]; i--) change--;
                                    output = (change != 0 ? '\n' + '__**CONGRATULATIONS**__' + '\n' + output + '\n' + row.name + ' is now level **' + (row.level+change) + '**!\n' +
                                        bot.emojis.find("name", "praise") + bot.emojis.find("name", "disgust") + bot.emojis.find("name", "SweatSouls") + bot.emojis.find("name", "nat20") : output);
                                    message.channel.send(output);
                                    sql.run(`UPDATE charlog SET level = ${row.level + change} WHERE userId = ${recipient.id}`);
                                    sql.run(`UPDATE charlog SET xp = ${row.xp + amt} WHERE userId = ${recipient.id}`);
                                }
                                break;
                            case 'gp':
                                amt *= 100
                                if (row.cp + amt < 0) message.channel.send('You cannot cause someone to have less than 0 ' + args[2] + '.');
                                else {
                                    message.channel.send(message.author.toString() + ' has ' + (amt > 0 ? 'allocated ' : 'deducted ' ) + Math.abs(amt/100) + ' GP ' + (amt>0 ? 'to ' : 'from ') + row.name + '.' +
                                        '\n**New GP Total:** ' + ((row.cp + amt)/100) + ' GP');
                                    sql.run(`UPDATE charlog SET cp = ${row.cp + amt} WHERE userId = ${recipient.id}`);
                                }
                                break;
                            case 'tp':
                                amt *= 2;
                                if (row.tp + Math.round(amt) < 0) message.channel.send('You cannot cause someone to have less than 0 ' + args[2] + '.');
                                else {
                                    message.channel.send(message.author.toString() + ' has ' + (amt > 0 ? 'allocated ' : 'deducted ' ) + Math.abs(amt/2) + ' TP ' + (amt>0 ? 'to ' : 'from ') + row.name + '.' +
                                        '\n**New TP Total:** ' + ((row.tp + amt)/2));
                                    sql.run(`UPDATE charlog SET tp = ${row.tp + amt} WHERE userId = ${recipient.id}`);
                                }
                                break;
                        }
                    }
                }, err => {
                    message.channel.send('Look, kid. All I do is stamp paperwork and dig for fat boogers, and I\'m all outta ink.');
                });
            });
            break;
        case 'donate':
            if (!args[1]) return message.channel.send('Please specify a valid number.');
            if (args[1][0] == '.') args[1] = '0' + args[1];
            if (isNaN(args[1]) || parseFloat(args[1]) <= 0) return message.channel.send('Please specify a valid number.');
            if (parseInt(parseFloat(args[1])*100) - parseFloat(args[1])*100 != 0) return message.channel.send('Please specify a valid number of GP.');

            let damt = parseFloat(args[1]);
            sql.get(`SELECT * FROM charlog WHERE userId ="${message.author.id}"`).then(row => {
                if (!row) message.channel.send('http://i0.kym-cdn.com/photos/images/original/001/282/535/c19.png');
                else { // Reward and confirm
                    damt *= 100;
                    if (damt > row.cp) message.channel.send("You cannot donate more GP than you have.");
                    else {
                        sql.get(`SELECT * FROM charlog WHERE userId = 429691339270258688`).then(row2 => {
                            //message.channel.send(message.author.toString() + ' has donated ' + args[1] + " GP to the Adventurer's Guild of Remnant.");
                            message.channel.send(row.name + ' has donated ' + args[1] + " GP to the Adventurer's Guild of Remnant.");
                            sql.run(`UPDATE charlog SET cp = ${row.cp - damt} WHERE userId = ${message.author.id}`);
                            sql.run(`UPDATE charlog SET cp = ${row2.cp + damt} WHERE userId = 429691339270258688`);
                            message.delete();
                        }, err2 => {
                            message.channel.send("WE'VE BEEN ROBBED!");
                        });
                    }
                }
            }, err => {
                message.channel.send("Can't spend money when you haven't got a bank account!");
            });
            break;
        case 'auction':
            if (!funcs.testing(message) && message.channel.name != 'auction-house') return message.channel.send("Please make auction payments in the " + message.guild.channels.find('name', 'auction-house') + '.');
            if (!args[1]) return message.channel.send('Please specify a valid amount of GP.');
            else if (args[1] == 'on') {
                if(message.member.roles.find("name", "auction-folks")) return message.channel.send("Auction notifications are already enabled for you, ya dingus!")
                message.member.addRole(message.guild.roles.find(r => r.name === 'auction-folks'));
                return message.channel.send("Auction House notifications enabled.");
            }
            else if (args[1] == 'off') {
                if(!message.member.roles.find("name", "auction-folks")) return message.channel.send("Auction notifications are already disabled for you, ya dingus!")
                message.member.removeRole(message.member.guild.roles.find("name", "auction-folks"));
                return message.channel.send("Auction House notifications disabled.");
            }
            if (args[1][0] == '.') args[1] = '0' + args[1];
            if (isNaN(args[1]) || parseFloat(args[1]) <= 0 || parseInt(parseFloat(args[1])*100) - parseFloat(args[1])*100 != 0) return message.channel.send('Please specify a valid number of GP.');
            if (!args[2]) return message.channel.send('Please specify whose auction you won.');
            let aucrecipient = message.guild.member(message.mentions.users.first() || (args[3] && args[2].toLowerCase() == 'gp' ? message.guild.members.get(args[3]) : message.guild.members.get(args[2])));
            if (!aucrecipient) return message.channel.send('Please specify whose auction you won.');
            if (aucrecipient.id == message.author.id) message.channel.send("Fuck off turd.");
            let winningbid = parseFloat(args[1])*100;
            sql.get(`SELECT * FROM charlog WHERE userId ="${message.author.id}"`).then(row => {
                if (!row) message.channel.send("We haven't got a file for you, kid. You need to be initiated into the guild before you can transfer cash to an adventurer.");
                else {
                    if (winningbid > row.cp) message.channel.send("You cannot spend more gp than you have.");
                    else {
                        let auctiontax = Math.floor(winningbid/10); let winnings = winningbid - auctiontax;
                        sql.get(`SELECT * FROM charlog WHERE userId ="${aucrecipient.id}"`).then(row2 => {
                            if (!row2) message.channel.send("We haven't got a file for this person. They need to be initiated before they can receive auction winnings.");
                            else {
                                message.channel.send(message.author.toString() + ' has paid ' + (winnings/100) + ' GP to ' + aucrecipient.toString() + '. ' + (auctiontax/100) + ' GP has been paid to the auction house.');
                                sql.run(`UPDATE charlog SET cp = ${row.cp - winningbid} WHERE userId = ${message.author.id}`);
                                sql.run(`UPDATE charlog SET cp = ${row2.cp + winnings} WHERE userId = ${aucrecipient.id}`);
                                sql.get(`SELECT * FROM charlog WHERE userId ='429691339270258688'`).then(row3 => {
                                    sql.run(`UPDATE charlog SET cp = ${row3.cp + auctiontax} WHERE userId = '429691339270258688'`);
                                }, err3 => {
                                    message.channel.send("The Guild has been robbed!");
                                });
                            }
                            message.delete();
                        }, err2 => {
                            message.channel.send("Can't transfer gold to someone I haven't got files for!");
                        });
                    }
                }
            }, err => {
                message.channel.send("Sorry, I lost your bank account.");
            });
            break;
        case 'headcount':
            if (!funcs.hasPermission('nonsense', message)) return message.channel.send('Sorry, bub. That\'s classified.');
            let headCount = await sql.get(`SELECT COUNT(CASE WHEN level >= 2 THEN 1 END) AS 'total',
                COUNT(CASE WHEN level >= 2 AND level < 5 THEN 1 END) AS 'low',
                COUNT(CASE WHEN level >= 5 AND level < 11 THEN 1 END) AS 'mid',
                COUNT(CASE WHEN level >= 11 AND level < 17 THEN 1 END) AS 'high',
                COUNT(CASE WHEN level >= 17 THEN 1 END) AS 'epic'
                FROM charlog`);
            message.channel.send('__**TOTAL GUILD MEMBERSHIP:**__ ' + headCount.total + '\n' +
                '**Low Tier:** ' + headCount.low + '\n' +
                '**Mid Tier:** ' + headCount.mid + '\n' +
                '**High Tier:** ' + headCount.high + '\n' +
                '**Epic Tier:** ' + headCount.epic);
            break;
        case 'swap':
            // check some stuff
            if (!funcs.testing(message) && message.channel.name != 'bot-commands') {
                message.author.send("Please swap characters in the " + message.guild.channels.find('name', 'bot-commands') + ' channel.');
                message.delete();
                return;
            }
            sql.get(`SELECT * FROM charlog WHERE userId ="${message.author.id}"`).then(row => {
                if (!row) {
                    if (!bot.vault[message.author.id]) {
                        return message.channel.send("According to my records, you are not a member of our guild. Please "+PREFIX+"initiate yourself first!");
                    }
                    let v2Name = bot.vault[message.author.id].name;
                    let v2Level = bot.vault[message.author.id].level;
                    let v2XP = bot.vault[message.author.id].xp;
                    let v2CP = bot.vault[message.author.id].cp;
                    let v2TP = bot.vault[message.author.id].tp;

                    // get inactive character information and make it active
                    sql.run("INSERT INTO charlog (userId, name, level, xp, cp, tp) VALUES (?, ?, ?, ?, ?, ?)", [message.author.id, v2Name, v2Level, v2XP, v2CP, v2TP]);
                    fs.writeFile('./vault.json', JSON.stringify(bot.vault, null, 4), err => {
                        if (err) throw err;
                    });
                    delete bot.vault[message.author.id];
                    message.channel.send(message.author.toString() + ' has made **' + v2Name + '** active.');
                    return;
                }
                // Active character info
                let tempName = row.name;
                let tempLevel = row.level;
                let tempXP = row.xp;
                let tempCP = row.cp;
                let tempTP = row.tp;

                // Vault character info
                if (!bot.vault[message.author.id]) {
                    sql.run(`DELETE FROM charlog WHERE userId = ${message.author.id}`);
                    message.channel.send(message.author.toString() + ' has made **' + tempName + '** inactive.');
                }
                else {
                    let vName = bot.vault[message.author.id].name;
                    let vLevel = bot.vault[message.author.id].level;
                    let vXP = bot.vault[message.author.id].xp;
                    let vCP = bot.vault[message.author.id].cp;
                    let vTP = bot.vault[message.author.id].tp;

                    // get inactive character information and make it active
                    sql.run(`DELETE FROM charlog WHERE userId = ${message.author.id}`).then(row => {
                        sql.run("INSERT INTO charlog (userId, name, level, xp, cp, tp) VALUES (?, ?, ?, ?, ?, ?)", [message.author.id, vName, vLevel, vXP, vCP, vTP]);
                    }, err => {
                        if (err) throw err;
                    });
                    message.channel.send(message.author.toString() + ' has made **' + vName + '** active. **' + tempName + '** is now in the vault.');
                }

                bot.vault[message.member.id] = {
                    name: tempName,
                    level: tempLevel,
                    xp: tempXP,
                    cp: tempCP,
                    tp: tempTP,
                }
    
                fs.writeFile('./vault.json', JSON.stringify(bot.vault, null, 4), err => {
                    if (err) throw err;
                });
                
                message.delete();
            }, err => {
                message.channel.send("Some shit went wrong!");
            });
            break;
        default:
            return funcs.invalid(message);
    }
}

module.exports.help = {
    name: 'charlog'
}

function initiate (sql, message, args, row, initiat) {
    if (!row.name) { // No character logged. INITIATE!
        if (!args[1]) return message.channel.send('Initiate who?\nEnter: '+PREFIX+'initiate [CORRECTLY-SPELLED ADVENTURER NAME] [DISCORD TAG]'); // If no name given
        if (initiat.id != message.author.id || args[args.length-1] == '<@!' + message.author.id + '>') args.pop();
        if (!args[1]) return message.channel.send('Please reenter this command as follows:\n' +
            PREFIX+'initiate [CORRECTLY-SPELLED ADVENTURER NAME] [DISCORD TAG]'); // If improper format
        args.shift();
        let charname = args.join(' ');
        if (!/^[a-zA-Z0-9'\- ]+$/.test(charname)) return message.channel.send("Invalid character name.");
        message.channel.send(initiat.toString() + "\nWelcome to the Adventurer's Guild of Remnant, " + charname + '!');
        sql.run("INSERT INTO charlog (userId, name, level, xp, cp, tp) VALUES (?, ?, ?, ?, ?, ?)", [initiat.id, charname, 2, 300, 8000, 0]);
        initiat.addRole(message.guild.roles.find(r => r.name === 'Guild Member'));
        initiat.removeRole(message.guild.roles.find(r => r.name === 'uninitiated'));

        // Give out a healing pot
        sql.get(`SELECT * FROM charlog WHERE userId = 429691339270258688`).then(row2 => {
            if (!row2) message.channel.send('http://i0.kym-cdn.com/photos/images/original/001/282/535/c19.png');
            else { // Reward and confirm
                if (5000 > row2.cp) message.channel.send("Adventurer's Guild of Remnant is broke AF. Can't even donate one stinkin' healing pot!");
                else {
                    sql.run(`UPDATE charlog SET cp = ${row2.cp - 5000} WHERE userId = 429691339270258688`);
                    /*message.channel.send("Due to complaints about decreased life expectancy, too few clerics, etc., and through the generosity of your fellow guild members, " + 
                                        "we, the Adventurer's Guild of Remnant hereby bequeath to you **one free healing potion (standard variety)**. " + 
                                         "Use it wisely.");*/
                }
            }
        }, err2 => {
            console.log("WE'VE BEEN ROBBED!");
        });

    } else return message.channel.send((initiat.id == message.author.id ? 'You must retire your current adventurer before you can initiate a new one.' : 'This person\'s current adventurer must retire before they can initiate a new one.'));
}