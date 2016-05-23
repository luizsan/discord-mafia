'use strict';
var options = require('./Options')();
var validate = require("validate.js");
var Client = require('./Client');

var constraints = Object.freeze({
    timeout: {
        numericality: {
            onlyInteger: true,
            greatherThan: 0,
        }
    }
});

module.exports =
/**
 * Base class for game setups.
 */
class Setup {
    constructor(channel) {
        this.isReady = false;
        this.channel = channel;
        this.name = 'Unknown';
        this.rules = '';
        this.players = [];
        this.playerMin = 0;
        this.playerMax = 0;
        this.timeout = 0;
    }

    /**
     * Returns custom variables validation schema.
     * @return {Object} validation schema.
     * @readonly
     */
    get constraints() { return constraints; }

    /**
     * Return number of players left to start.
     * @return {Boolean|Number}
     * @readonly
     */
    get left() { return !!this.playerMax && this.playerMax - this.players.length; }

    /**
     * Make this setup ready, so it can start
     * to receive players subscriptions.
     * @param {Object} options - custom variables.
     * @return {Array} Errors on failure.
     */
    onReady(options) {
        return validate(options, this.constraints) || (() => {
            this.isReady = true;
            this.timeout = options.timeout || this.timeout;
            if (this.timeout > 0) {
                this._timeout = setTimeout(() => {
                    Client.setup = null;
                    this.channel.sendMessage('Setup Timeout!');
                }, this.timeout * 60000);
            }
        })();
    }

    /**
     * Finalize and create a game instance.
     * @param {Game} game
     * @return {Game}
     */
    onDone(game) {
        if (this._timeout) clearTimeout(this._timeout);
        return game;
    }

    /**
     * Add a player to this setup.
     * @param {IUser} player
     * @return {Boolean} was add.
     */
    addPlayer(player) {
        if (this.players.find((p) => p.id == player.id)) return false;
        this.players.push(player);

        if (this.playerMax && this.players.length >= this.playerMax) {
            setTimeout(() => {
                Client.game = this.onDone();
                fs.writeFileSync(options.dir.data + '/game.id', Client.game.id, 'utf8');
                Client.game.start();
            });
        }
        return true;
    }

    /**
     * Remove a player in this setup.
     * @param {IUser} player
     * @return {Boolean} was remove.
     */
    removePlayer(player) {
        var removed = false;
        this.players = this.players.filter((p) => {
            if (p.id == player.id) {
                removed = true;
                return false;
            }
            return true;
        });

        return removed;
    }

    /**
     * Helper function to shuffle an array.
     * @param {Array} array
     * @return {Array}
     */
    static shuffle(array) {
        var m = array.length, t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    }
}
