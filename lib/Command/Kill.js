'use strict';
var Client = require('../Client');
var Command = require('../Command');

module.exports =
/**
 * Command to vote to kill a player as mafia
 */
new class Kill extends Command {
    /** @inheritdoc */
    get name() { return 'kill'; }
    /** @inheritdoc */
    get isPrivate() { return true; }
    /** @inheritdoc */
    get isGeneric() { return false; }

    /** @inheritdoc */
    execute(message) {
        if (Client.game.cycle != 'night') {
            message.reply('Can\'t kill at day.');
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

        message.reply('You voted to kill ' + target.mention);
        Client.game.setVote(message.player, target);
    }
};
