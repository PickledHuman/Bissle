const funcs = module.require('../funcs.js');
const dice = module.require('./dice.js');
const cwvanilla = [
    'All of the water within 30 feet of you turns to cheap wine. All of the wine within 30 feet of you turns to water.',
    'For the next minute, you see any invisible creature if you have line of sight of it.',
    'A modron appears in an unoccupied space within 5 ft, then disappears after 1 minute.',
    'You suddenly grow a long, hairless blue tail that allows you to teleport up to 20 feet. The tail disappears after one minute or if severed.',
    'Your skin shimmers with a holographic rainbow of colors for one hour.',
    'You gain two extra arms (and your apparel accommodates them). After one minute, the arms fall off and your clothing returns to normal.',
    'You cast **Grease** centered on yourself.',
    'For the next hour, your nose enlarges whenever you tell the truth.',
    'Your skin turns a vibrant shade of blue. **Remove Curse** can end this effect.',
    'An eye appears on your forehead. For the next minute, you have advantage on Wisdom (Perception) checks which rely on sight.',
    'You take on a deathly pallor and the stench of the grave for 24 hours. You cast no reflection or shadow for the duration.',
    'You cast **Levitate** on yourself.',
    'A unicorn appears in space within 5 ft of you and disappears after 1 minute.',
    'You can’t speak for the next minute. Whenever you try, pink bubbles float out of your mouth.',
    'Your hair falls out, but regrows after 24 hours.',
    'For the next minute, anything flammable you touch that isn’t being worn or carried by another creature bursts into flames.',
    'For the next minute, you must shout when you speak.',
    'You cast **Fog Cloud** centered on yourself.',
    'You are frightened by the nearest creature for the next minute.',
    'Each creature within 30 ft of you, including yourself, becomes invisible for one minute. If the creature attacks or casts a spell, the invisibility on that creature breaks.',
    'The next time you see a creature within 10 minutes after drinking this philter, you become charmed by that creature for 1 hour. If the creature is of a species and gender you are normally attracted to, you regard it as your true love while you are charmed.',
    'Illusory butterflies and flower petals flutter in the air within 10 feet of you for the next minute.',
    'Your clothes billow with green smoke for 1 minute.',
    'Grass, flowers and strange plants sprout wherever you step for the next minute.',
    'You cast **Mirror Image**.',
    'You glow with bright light in a 30-foot radius for the next minute. Any creature within 5 ft of you is blinded until they move out of this radius.',
    'You cast **Fly** on a random creature within 60 ft of you.',
    'Your hair stands on end and your hands emit a static charge that shocks anything you touch for the next 24 hours.',
    'A small cloud appears above your head and drizzles a cold rain on your head. The pesky thing sticks around for 10 minutes.',
    'Your size increases by one size category for the next minute.',
    'One of your limbs turns to stone for ten minutes.',
    'You hear faint ethereal music for the next minute.',
    'You can change your gender permanently, or you change gender for one minute, but retain the general body features of your original form. For example: a female with a hairy chest and full beard, or a man with elegant finger nails and pig tails!',
];
const specLength = 17;
const newRace = [
    'Human',
    'Human',
    'Human',
    'Human',
    'Human',
    'Human',
    'Human',
    'Human',
    'Human',
    'Human',
    'High Elf',
    'High Elf',
    'High Elf',
    'High Elf',
    'High Elf',
    'Wood Elf',
    'Wood Elf',
    'Wood Elf',
    'Wood Elf',
    'Wood Elf',
    'Eladrin',
    'Hill Dwarf',
    'Hill Dwarf',
    'Hill Dwarf',
    'Hill Dwarf',
    'Mountain Dwarf',
    'Mountain Dwarf',
    'Mountain Dwarf',
    'Mountain Dwarf',
    'Mountain Dwarf',
    'Stout Halfling',
    'Stout Halfling',
    'Stout Halfling',
    'Stout Halfling',
    'Stout Halfling',
    'Lightfoot Halfling',
    'Lightfoot Halfling',
    'Lightfoot Halfling',
    'Lightfoot Halfling',
    'Lightfoot Halfling',
    'Ghostwise Halfling',
    'Forest Gnome',
    'Forest Gnome',
    'Rock Gnome',
    'Rock Gnome',
    'Deep Gnome',
    'Half-orc',
    'Half-orc',
    'Half-orc',
    'Half-elf',
    'Half-elf',
    'Half-elf',
    'Half-elf',
    'Dragonborn',
    'Dragonborn',
    'Dragonborn',
    'Dragonborn',
    'Infernal Tiefling',
    'Infernal Tiefling',
    'Feral Tiefling',
    'Feral Tiefling',
    'Protector Aasimar',
    'Protector Aasimar',
    'Scourge Aasimar',
    'Fallen Aasimar',
    'Aarakocra',
    'Aarakocra',
    'Aarakocra',
    'Goliath',
    'Goliath',
    'Goliath',
    'Goliath',
    'Air Genasi',
    'Earth Genasi',
    'Fire Genasi',
    'Water Genasi',
    'Tabaxi',
    'Tabaxi',
    'Tabaxi',
    'Firbolg',
    'Firbolg',
    'Firbolg',
    'Triton',
    'Triton',
    'Triton',
    'Kenku',
    'Kenku',
    'Kenku',
    'Lizardfolk',
    'Lizardfolk',
    'Lizardfolk',
    'Lizardfolk',
    'Duergar',
    'Drow',
    'Kobold',
    'Orc',
    'Hobgoblin',
    'Goblin',
    'Bugbear',
    'Yuan-Ti Pureblood'
];

module.exports.run = async (bot, message, args) => {
    if (message.channel.name != 'guild-hall' && !funcs.testing(message)) return message.channel.send("Sorry, we don't serve clockwhistle surprises here. Only in the " + message.guild.channels.find('name', 'guild-hall') + '.');
    if (!args[1]) return message.channel.send("Invalid format. Enter your Constitution modifier after the command.\n\t(i.e. **,clockwhistle 2**)");
    if (isNaN(parseInt(args[1]))) return message.channel.send('Please enter a valid number.');
    if (parseInt(args[1]) >= 14) return message.channel.send('You cannot fail. Spend as much gold as you want.');
    // FUTURE PROJECT: Determine how much money player has, deduct as spent
    let dc = 15;
    let result = dc; let preput = ''; let counter = 0;
    while (result >= dc) {
        let stringNsum = (parseInt(args[1]) >= 0 ? dice.roll(message, 'd20+' + args[1]) : dice.roll(message, 'd20' + args[1]));
        result = stringNsum[1];
        counter++;
        if (counter < 6) preput += '**Con Save #' + counter + '**: ' + stringNsum[0] + ' = ' + result + '\n';
        else preput = '**Con Save #' + counter + '**: ' + stringNsum[0] + ' = ' + result + '\n';
    }
    let output = message.author.toString() + '\n' + preput + cwEffect(message) + '\n';
    bot.commands.get('charlog').run(bot, message, ['transfer', counter*0.5, '429691339270258688']);
    message.channel.send(output);
}

module.exports.help = {
    name: 'clockwhistle'
}

function cwEffect(message) {
    let result = Math.floor(Math.random()*cwvanilla.length + specLength);
    return (result < cwvanilla.length ? cwvanilla[result] : cwSpecial(result-cwvanilla.length, message));
}

function cwSpecial(result, message) {
    if (result > specLength) return 'Bissle pooped his pants.';
    if (result < 8) {
        if (result < 4) {
            if (result < 2) {
                if (result == 0) {
                    let inches = Math.floor(Math.random()*10)+1;
                    return 'Your height ' + (inches%2 == 0 ? 'increases by ' : 'decreases by ') + inches + ' inches.';
                }
                else { // 1
                    let smell = Math.floor(Math.random()*10)+1;
                    return 'You smell like ' + (smell%2 == 0 ? 'lavender' : 'rotten eggs') + '. This effect lasts 24 hours.';
                }
            }
            else {
                if (result == 2) {
                    return 'You grow a ' + (Math.floor(Math.random()*4)+1) + ' foot-long beard made of feathers that remains until you sneeze, at which point the feathers explode from your face.';
                }
                else { // 3
                    return (Math.floor(Math.random()*12)+1) + ' ducklings identify you as their mother.';
                }
            }
        }
        else {
            if (result < 6) {
                if (result == 4) {
                    return 'You teleport ' + ((Math.floor(Math.random()*6)+1)*10) + ' feet to an unoccupied space of your choice.';
                }
                else { // 5
                    let tableB = ['shrubbery', 'snowman', 'doll', 'wax dummy', 'geranium flower', 'potted plant'];
                    let bDeath = ['shrubbery spontaneously combusts', 'snowman melts', 'doll\'s head spins around, falls off,', 'wax dummy shrugs', 'geranium flower wilts', 'pot breaks'];
                    let o = Math.floor(Math.random()*tableB.length);
                    return 'You turn into a ' + tableB[o] + ' for ' + (Math.floor(Math.random()*4)+1) + ' minutes. While a ' + tableB[o] + ', you are considered incapacitated. If you take damage before the time is up, the ' + bDeath[o] + ' and you revert back to your original form.';
                }
            }
            else {
                if (result == 6) {
                    return (Math.floor(Math.random()*6)+1) + ' flumphs appear in an unoccupied space within 60 feet of you and are frightened of you. They vanish after one minute.';
                }
                else { // 7
                    let footTime = Math.floor(Math.random()*6)+1;
                    return 'Your feet feel impossibly heavy; as a matter of fact they’re turned to lead! Your feet return to normal after ' + footTime + (footTime == 1 ? ' minute.' : ' minutes.');
                }
            }
        }
    }
    else { // >= 8
        if (result < 12) {
            if (result < 10) {
                if (result == 8) {
                    let scaryColor = ['red', 'orange', 'blue', 'yellow', 'green', 'purple', 'black', 'white'];
                    return 'For the next hour, you have a phobia to the color ' + scaryColor[Math.floor(Math.random()*8)] + '.';
                }
                else { // 9
                    let fiveDsix = 0;
                    for (i = 0; i < 5; i++) fiveDsix += Math.floor(Math.random()*6)+1;
                    return 'You are immune to being intoxicated by alcohol for ' + fiveDsix + ' days.';
                }
            }
            else {
                if (result == 10) {
                    return 'Congratulations, you have been reborn! For the next hour, you are a ' + newRace[Math.floor(Math.random()*newRace.length)].toLowerCase() + '.';
                }
                else { // 11
                    let scalyNum = Math.floor(Math.random()*4)+1;
                    return scalyNum + ' of your limbs ' + (scalyNum == 1 ? 'is' : 'are') + ' covered in fish scales.';
                }
            }
        }
        else {
            if (result < 14) {
                if (result == 12) {
                    let tableA = ['sheep', 'guinea pig', 'monkey', 'pelican', 'penguin', 'rabbit'];
                    return 'You cast **Polymorph** on yourself. Make a DC 15 Wisdom save, or be turned into a ' + tableA[Math.floor(Math.random()*tableA.length)] + ' for the next hour.';
                }
                else { // 13
                    let astralPlace = ['You are standing on a barren rock flying through the far reaches of space, nothing but twinkling stars and colorful coronas as far as the eye can see! This lasts until the end of your next turn, after which time you return to a random space that is unoccupied within 30 feet of your original space',
                        '*You find yourself standing in the private quarters of a Githyanki astral ship captain who is currently neck deep in pink bubbles. His eyes widen as he bellows in a startled voice,* \n**“BY THE GODS! ANOTHER ONE!”**\n *just before you pop back to your own plane of existence, returning to a random space that is unoccupied within 30 feet of your original space.*']
                    return astralPlace[Math.floor(Math.random()*2)];
                }
            }
            else {
                if (result == 14) {
                    return 'You cast **Sleep** centered on yourself. All creatures affected are unconscious for ' + (Math.floor(Math.random()*10)+1) + ' minutes.';
                }
                else if (result == 15) {
                    let ageChange = Math.floor(Math.random()*10)+1;
                    return 'Your age changes. You are now ' + ageChange + ' years ' + (ageChange%2 == 0 ? 'older.' : 'younger.');
                }
                else { // 16
                    return 'Daisies suddenly sprout from your head for ' + (Math.floor(Math.random()*4)+1) + ' minutes. After the time has passed, the flowers wilt and drop off.';
                }
            }
        }
    }
    return result;
}