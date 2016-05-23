'use strict';
var Client = require('../Client');
var Command = require('../Command');

module.exports =
/**
 * Command to subscribe in a setup waiting for players.
 */
new class Subscribe extends Command {
    /** @inheritdoc */
    get name() { return 'subscribe'; }
    /** @inheritdoc */
    get isPrivate() { return false; }
    /** @inheritdoc */
    get isGeneric() { return true; }

    /** @inheritdoc */
    execute(message) {
        if (!Client.setup || !Client.setup.isReady) {
            message.reply('Can\'t find any game to subscribe.');
            return;
        }

        if (!Client.setup.addPlayer(message.author)) {
            message.reply('You are already in this game.');
            return;
        }

        message.reply('Subcribed, thank you very much! Left: ' + Client.setup.left);
    }
};
