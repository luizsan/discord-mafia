'use strict';
var Client = require('../Client');
var Command = require('../Command');

module.exports =
/**
 * Command to investigate a player as cop
 */
new class Investigate extends Command {
    /** @inheritdoc */
    get name() { return 'investigate'; }
    /** @inheritdoc */
    get isPrivate() { return true; }
    /** @inheritdoc */
    get isGeneric() { return false; }

    /** @inheritdoc */
    execute(message) {
        if (Client.game.cycle != 'night') {
            message.reply('Can\'t investigate at day.');
            return;
        }

        if (message.player.role.cycleReady) {
            message.reply('You already selected a player to investigate.');
            return;
        }

        if (!message.argv[1]) {
            message.reply('Select a player to investigate.');
            return;
        }

        var target = message.parseUser(message.argv[1]);
        target = target && Client.game.players.getBy('userId', target.id);
        if (!target) {
            message.reply('Invalid target.');
            return;
        }

        if (target.id == message.player.id) {
            message.reply('You can\'t investigate yourself.');
            return;
        }

        message.reply('You will investigate ' + target.mention);
        message.player.role.setInvestigate(target);
    }
};
