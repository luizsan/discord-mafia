'use strict';
var Model = require('../Model');
var Emitter = require('./Emitter');

const BaseRole = {
    class: __filename,
    /** @return {Player} */
    player: null,
    /** @return {String} */
    type: '<not defined>',
    /** @return {String} */
    name: '<not defined>',
    /** @return {String} */
    publicName: '<not defined>',
    /** @return {Boolean} */
    cycleReady: true,
}

module.exports =
/**
 * Base class for roles in the game.
 */
class Role extends Emitter {
    constructor(data) {
        super(Model.inherit(data, BaseRole));
        this._relation('player');
    }

    /**
     * Initialize this role into the game.
     * @param {Game} game
     * @param {Player} player
     */
    initialize(game, player) {
        this.player = player;
    }

    /**
     * Return a list of custom commands allowed to this role.
     * @return {Array}
     * @readonly
     */
    get commands() {
        return [];
    }
}
