'use strict';
var IUser = require('discordie/lib/interfaces/IUser');
var Model = require('../Model');
var Client = require('../Client');

const BasePlayer = {
    class: __filename,
    /** @return {String} */
    user: null,
    /** @return {Role} */
    role: null
}

module.exports =
/**
 * Model representing a player in the game.
 */
class Player extends Model {
    constructor(data) {
        super(Model.inherit(data, BasePlayer));
        this._relation('user',
            (v) => Client.getUserBy('id', v),
            (v) => v instanceof IUser ? v.id : v);
        this._relation('role');
    }

    /**
     * Return a metion to this player.
     * @return {String}
     * @readonly
     */
    get mention() {
        return '<@' + this._valuesByProp['user'] + '>';
    }

    /**
     * Return this player userId in discordie.
     * @return {String}
     * @readonly
     */
    get userId() {
        return this._valuesByProp['user'];
    }

    /**
     * Return true if this role is a town role.
     * @return {Boolean}
     * @readonly
     */
    get isTown() {
        return this.role.type === 'town';
    }

    /**
     * Return true if this role is a mafia role.
     * @return {Boolean}
     * @readonly
     */
    get isMafia() {
        return this.role.type === 'mafia';
    }

    /**
     * Initialize this player into the game.
     * @param {Game} game
     */
    initialize(game) {
        this.role.initialize(game, this);
        this.sendPrivate('A new game starts! And you are a ' + this.role.publicName);
    }

    /**
     * Send a private message to this player.
     * @param {String} message
     */
    sendPrivate(message) {
        this.user.openDM().then((channel) => channel.sendMessage(message));
    }

    /** @inheritdoc */
    destroy() {
        this.role.destroy();
        super.destroy();
    }
}
