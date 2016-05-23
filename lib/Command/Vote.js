'use strict';
var Client = require('../Client');
var Command = require('../Command');

module.exports =
/**
 * Command to vote for lynch.
 */
new class Vote extends Command {
    /** @inheritdoc */
    get name() { return 'vote'; }
    /** @inheritdoc */
    get isPrivate() { return false; }
    /** @inheritdoc */
    get isGeneric() { return false; }

    /** @inheritdoc */
    execute(message) {
        if (Client.game.cycle != 'day') {
            message.reply('Can\'t vote at night.');
            return;
        }

        if (!message.argv[1]) {
            Client.game.setVote(message.player, null);
            message.reply('Removed Vote');
            return;
        }

        var target = message.parseUser(message.argv[1]);
        target = target && Client.game.players.getBy('userId', target.id);
        if (!target) {
            message.reply('Invalid target.');
            return;
        }

        message.reply('Voted on ' + target.mention);
        Client.game.setVote(message.player, target);
    }
};
