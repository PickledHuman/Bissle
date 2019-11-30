const funcs = module.require('../funcs.js');

module.exports = {
    roll: function(message, rollstring) {
        return roll(message, rollstring);
    },
}

module.exports.run = async (bot, message, args) => {
    if (args[0] == 'dice') return funcs.invalid(message);

    switch (args[0].toLowerCase()) {
        case 'r':
            rollOnce(message, args);
            break;
        case 'rr':
            rollLots(message, args);
            break;
        default:
            message.channel.send('Use **'+PREFIX+'r** to roll one iteration, **'+PREFIX+'rr** for multiples, or **'+PREFIX+'commands** for more information.');
    }
}

module.exports.help = {
    name: 'dice'
}

function rollOnce(message, args) { // Formats results of a single rollset
    if (!args[1]) return message.channel.send('Okay sure. Roll what?');
    var output = message.author.toString() + '\n'
    let stringNsum = roll(message, args[1]); // tuple of rollset string and int sum
    if (!stringNsum[0]) return; // Encountered bad command in roll function
    if (args[2]) { // add roll descriptor
        output += '**';
        for (let i = 2; i < args.length; i++) {
            output += args[i];
            if (i < args.length-1) output += ' ';
        }
        output += ':** '
    }
    output += stringNsum[0] + '\n**Total:** ' + stringNsum[1];
    message.channel.send(output);
    message.delete();
}

function rollLots(message, args) { // Formats results of multiple rollsets
    // Determine number of iterations
    let deciform = /^\d+$/;
    var iterations = deciform.exec(args[1]);
    if (!iterations) return funcs.invalid(message);
    iterations = iterations[0];

    // Format output before rolling
    var output = message.author.toString() + '\nRolling '
    if (args[3]) { // add roll descriptor
        output += '**';
        for (let i = 3; i < args.length; i++) {
            output += args[i];
            if (i < args.length-1) output += ' ';
        }
        output += ':**\n';
    } else output += iterations + ' iterations:\n';

    // Roll dice several times, format each set result, track grand total
    let sum = 0;
    for (let i = 0; i < iterations; i++) {
        let stringNsum = roll(message, args[2]);
        if (!stringNsum[0]) return; // Encountered bad command in roll function
        output += stringNsum[0] + ' = ' + stringNsum[1] + '\n';
        sum += stringNsum[1];
    }

    // Display total
    output += '**Total:** ' + sum;
    message.channel.send(output);
    message.delete();
}

function roll(message, rollstring) { // Parses, interprets operators, returns results
    var operands = rollstring.split(/[+*/-]/);
    var dform = /^\s*(\d*)d(\d+)(?:((?:(?:k|d)(?:h|l)?)|rr|ro|mi|ma|ra|e)(\d+))*\s*/;
    var results = []; var q = 0; var ops = []; var total = '';
    var result = '';
    for (i = 0; i < operands.length; i++) { // For each operand
        var opsum = 0;
        if (!operands[i].includes('d')) { // If not dice, then must be constant
            if (isNaN(operands[i])) // If not constant, reject
                return funcs.invalid(message);
            result += operands[i] + ' ';
            opsum += eval(operands[i]);
        }
        else { // Must be dice!
            var dice = dform.exec(operands[i]);
            // Safeguards v. asshat commands
            if (!dice||!dice[2]) // No dice to parse or no dice type given
                return funcs.invalid(message);
            if (dice[2] == 1 && dice[3] == 'e' && dice[4] == 1) // Infinite exploding 1's
                return funcs.invalid(message);
            results[i] = rollDice(dice[1], dice[2], message);

            // Interpret optional operands
            results[i] = diceOps(dice, results[i], message);
            
            // Append operand to string, add total to opsum.
            for (j = 0; j < results[i][0].length; j++) {
                opsum += results[i][0][j];
            }
            result +=  dice[1] + 'd' + dice[2] + ' (' + results[i][1].join(', ') + ') ';
        }

        if (!operands[ops.length]) // When a math operator isn't followed by an operand
            return funcs.invalid(message);
        
        if (i < operands.length-1) { // If operand is not last one, append to string
            q += operands[i].length;
            ops[i] = rollstring[q]; result += ops[i] + ' ';
            q++;
        }
        if (i == 0)
            total += opsum;
        else {
            total += ops[i-1] + opsum;
        }
    }
    return [result, eval(total)];
}

function rollDice(x, n, message) { // Calculates individual dice operands
    if (x == '') x = 1;
    var results = [[], []];
    for (k = 0; k < x; k++) {
        if (n == 0) results[0][k] = 0; // If some dillweed rolls a 0-sided die.
        else // Roll dice 
            results[0][k] = Math.floor(Math.random()*n)+1;
        if(results[0][k] == n || results[0][k] == 1) results[1][k] = '**'+results[0][k]+'**';
        else results[1][k] = ''+results[0][k];
    }
    return results;
}

function diceOps(dice, results, message) { // Applies special die operators
    if (dice[3] == "dl" || dice[3] == "kh") {
        if (dice[3] == 'kh')
            dice[4] = dice[1]-dice[4];
        for (k = 0; k < dice[4]; k++) {
            var minIndex = -1; var min = dice[2]+1;
            for (j = 0; j < results[0].length; j++) {
                if((results[0][j] < min) && !results[1][j].includes('~')) {
                    min = results[0][j];
                    minIndex = j;
                }
            }
            results[1][minIndex] = '~~'+results[1][minIndex]+'~~';
            results[0][minIndex] = 0;
        }
    }
    else if (dice[3] == "dh" || dice[3] == "kl") {
        if (dice[3] == 'kl')
            dice[4] = dice[1]-dice[4];
        for (k = 0; k < dice[4]; k++) {
            var maxIndex = -1; var max = 0;
            for (j = 0; j < results[0].length; j++) {
                if((results[0][j] > max) && !results[1][j].includes('~')) {
                    max = results[0][j];
                    maxIndex = j;
                }
            }
            results[1][maxIndex] = '~~'+results[1][maxIndex]+'~~';
            results[0][maxIndex] = 0;
        }
    }
    else if (dice[3] == "d") {
        for (j = 0; j < results[0].length; j++) {
            if(results[0][j] == dice[4]) {
                results[1][j] = '~~'+results[1][j]+'~~';
                results[0][j] = 0;
            }
        }
    }
    else if (dice[3] == 'k') {
        for (j = 0; j < results[0].length; j++) {
            if(results[0][j] != dice[4]) {
                results[1][j] = '~~'+results[1][j]+'~~';
                results[0][j] = 0;
            }
        }
    }
    else if (dice[3] == 'rr') {
        for (j = 0; j < results[0].length; j++) {
            if(results[0][j] <= dice[4]) {
                results[1][j] = '~~'+results[1][j]+'~~, ';
                var newResult;
                do {
                    newResult = rollDice(1, dice[2], message);
                    if (newResult[0][0] == dice[4]) {
                        results[1][j] += '~~'+newResult[1][0]+'~~, ';
                    }
                } while (newResult[0][0] == dice[4]);
                results[1][j] += newResult[1][0];
                results[0][j] = newResult[0][0];
            }
        }
    }
    else if (dice[3] == 'ro') {
        for (j = 0; j < results[0].length; j++) {
            if(results[0][j] <= dice[4]) {
                results[1][j] = '~~'+results[1][j]+'~~, ';
                var newResult = rollDice(1, dice[2], message);
                results[1][j] += newResult[1][0];
                results[0][j] = newResult[0][0];
            }
        }
    }
    else if (dice[3] == 'mi') {
        for (j = 0; j < results[0].length; j++) {
            if(results[0][j] < dice[4]) {
                results[1][j] = '~~'+results[1][j]+'~~, ' + dice[4];
                results[0][j] = parseInt(dice[4]);
            }
        }
    }
    else if (dice[3] == 'ma') {
        for (j = 0; j < results[0].length; j++) {
            if(results[0][j] > dice[4]) {
                results[1][j] = '~~'+results[1][j]+'~~, ' + dice[4];
                results[0][j] = parseInt(dice[4]);
            }
        }
    }
    else if (dice[3] == 'ra') {
        let reroll = true;
        for (j = 0; j < results[0].length; j++) {
            if(results[0][j] == dice[4] && reroll) {
                reroll = !reroll;
                results[1][j] = '__'+results[1][j]+'__, ';
                var newResult = rollDice(1, dice[2], message);
                results[1][j] += newResult[1][0];
                results[0][j] += newResult[0][0];
            }
        }
    }
    else if (dice[3] == 'e') {
        for (j = 0; j < results[0].length; j++) {
            if(results[0][j] == dice[4]) {
                results[1][j] = '__'+results[1][j]+'__, ';
                var newResult;
                do {
                    newResult = rollDice(1, dice[2], message);
                    if (newResult[0][0] == dice[4]) {
                        results[1][j] += '__'+newResult[1][0]+'__, ';
                        results[0][j] += newResult[0][0];
                    }
                } while (newResult[0][0] == dice[4]);
                results[1][j] += newResult[1][0];
                results[0][j] += newResult[0][0];
            }
        }
    }
    return results;
}
