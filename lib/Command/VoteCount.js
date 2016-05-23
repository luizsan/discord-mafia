'use strict';
var Client = require('../Client');
var Command = require('../Command');

module.exports =
/**
 * Command to show how many votes each player has.
 */
new class VoteCount extends Command {
    /** @inheritdoc */
    get name() { return 'votecount'; }
    /** @inheritdoc */
    get isPrivate() { return false; }
    /** @inheritdoc */
    get isGeneric() { return false; }

    /** @inheritdoc */
    execute(message) {
        if (Client.game.cycle != 'day') {
            message.reply('There isn\'t votes at night.');
            return;
        }

        var votes = Client.game.countVotes();
        var voteCount = 0
        for (var playerId in votes) {
            message.reply(Client.game.players.find((p) => p.id == playerId).mention + ': ' + votes[playerId] + ' votes.');
            ++voteCount;
        }
        if (voteCount > 0) {
            message.reply('Total Votes: '+ voteCount);
        }
    }
};
