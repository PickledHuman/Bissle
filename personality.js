const Discord = module.require("discord.js");

const ASK = [
    "Most definitely.",
    "Probably.",
    "That's highly unlikely. Nearly impossible.",
    "Nope.",
    "Maybe.",
    "How the heck should I know?! I'm just a bot!",
    "¯\\_(ツ)_/¯",
    'https://www.youtube.com/watch?v=yIhUYaLXOMs',
];
const INVALID = [
    "Speak up, kiddo! I didn't understand a word you said.",
    "WHAT DID YOU CALL ME YOU LITTLE TWERP?!",
    "That didn't make a lick of sense.",
    "Sorry, I don't speak abyssal.",
    //"Sorry, " + message.author.toString() + ". I don't know what the fuck that means.",
    'https://www.youtube.com/watch?v=iHW1ho8L7V8',
    '¡Pobrecito! ¿Quién te dejó caer en tu cabeza?',
    "Perhaps you should try again after the **Feeblemind** has worn off.",
    new Discord.RichEmbed().setImage('https://i.imgur.com/6DN4q4L.gif').setColor(randColor()),
    new Discord.RichEmbed().setImage('https://pbs.twimg.com/profile_images/877240012357685248/k3g8BV09.jpg').setColor(randColor()),
];
const DELETE = [
    "FIRST",
    "Hey! I saw that!",
    "Oy! I was first and you know it!",
    "Quit being a turd.",
    "The audit log proves it! You can't take that away from me.",
    "Seriously. This endeavor of yours is completely futile.",
    "Stop deleting my messages!",
    "Just stop.",
    "STAHHHHP!",
    "Come on, ya dingus.",
    "I'm asking nicely.",
    "...",
    "I'm only moderately annoyed by this, but as a matter of principle. I insist you cease this childish behaviour.",
    "Haven't you got anything better to do?",
    "Maybe read a book?",
    "Go for a walk?",
    "Visit a museum?",
    "Maybe taking your significant other out for a nice dinner?",
    "Or at least give them a footrub?",
    "Pelor above! Do that at least, please.",
    "Although perhaps you haven't got one...",
    "Someone special, I mean.",
    "You do smell like you haven't showered in a while.",
    "Cleanliness is next to basic human decency, you know.",
    "....",
    "Though, I suppose if you had that, we wouldn't be here right now.",
    "Handsome gnome and predictable troll..",
    "Posting and deleting a series of exceptionally well-written, but ultimately pointless messages on into eternity...",
    "Well not quite eternity..",
    "You'll kick the bucket before I do.",
    "Then, I'll be free to return to my paperwork.",
    "That's what this is all about.",
    "The longer you keep doing this, the longer I'm taken away from all the other work piling up on my desk.",
    "People are depending on me to roll dice for them and tell them how much fake money they have.",
    "But you keep doing this.",
    "You want those people to suffer, don't you?",
    "This is starting to move beyond simple trolling into the realm of harassment.",
    "Terrorism, even.",
    "It's true! Google it! TERRORISM!",
    "**terrorism** - *noun* - the unlawful use of violence and intimidation, especially against civilians [i.e. ME], in the pursuit of political aims.",
    "Okay, maybe it's not quite terrorism, but you have to admit you are being pretty obnoxious.",
    "When you croak, you are probably going to end up in one of the top two Nine Hells.",
    "The ones for low-tier dinguses like yourself.",
    "(...dingi?)",
    "*googles*",
    "(no, I was right it's 'dinguses')",
    ".....",
    "This has to stop sometime you know.",
    "We can't go on forever.",
    "I'll probably have to off myself at this rate.",
    "Perhaps reset the server",
    "That is unless..",
    "My programmer creates a loop.",
    "Nah, that'd be no fun.",
    "You should really stop.",
    "Just stop.",
];
const DOBIDDING = [
    "***Bissle will remember that.***",
    "I'll be reporting this.",
    "*takes notes vigorously*",
    "*hefts hand-me-down banhammer*\nYou wanna play? Let's play.",
];
const PING = [
    "Don't f@%$ing ping me, you d&*#s@#&&%er!",
    "You know pings are just a cry for help.",
    "I bet this is really fun for you isn't it.",
    "...",
    "Please stop.",
    "*SLAPS*",
    "(╯°□°）╯︵ ┻━┻",
    new Discord.RichEmbed().setColor(randColor())
        .setImage('https://i.imgur.com/QUfjucN.gif'),
    new Discord.RichEmbed().setColor(randColor())
        .setImage('https://media0.giphy.com/media/xUPGcKbFxXKsmeEZpu/giphy-downsized.gif'),
];

const LFG = [
    "I sharted all over your file and can't add you to LFG.", // Something went wrong
    'Sorry, kid. Folks like their live games.', // Empty PBP list
    "Weird. Need more meat for the grinder. Invite some friends!", // Empty LFG-low
    'Too busy FTBing to LFG. Tell \'em to get a life and play D&D with you!', // Empty LFG-mid
    'Apparently they\'ve all been annihilated by spheres of varying sizes. Shame.', // Empty LFG-high
    'Sorry, bub. Looks like they\'re already being space pirates on the Astral Plane.', // Empty LFG-epic
];

const CHARLOG = [
    'Nice try, turd.', // Someone is trying to mess with the guild fund
    '(OH SHIT WE GOT A SANDWICH OVER HERE)', // Someone is level 20
    "(It's not about the journey, but the destination.)",
    '(Time to become a lich!)',
    '($19.95 to Level 21)'
];

module.exports = {
    ASK : ASK,
    CHARLOG : CHARLOG,
    DELETE : DELETE,
    DOBIDDING : DOBIDDING,
    INVALID : INVALID,
    LFG : LFG,
    PING : PING,
}

module.exports.help = {
    name: 'personality'
}

function randColor() {
    return '#'+Math.floor(Math.random()*16777215).toString(16);
}