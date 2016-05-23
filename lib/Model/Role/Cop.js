'use strict';
var Model = require('../../Model');
var Townie = require('./Townie');

const BaseCop = {
    class: __filename,
    /** @return {String} */
    name: 'Cop',
    /** @return {String} */
    publicName: 'Town Cop',
    /** @return {Player} */
    investigate: null
}

module.exports =
/**
 * Role that allows a player to investigate others.
 */
class Cop extends Townie {
    constructor(data) {
        super(Model.inherit(data, BaseCop));
        this._relation('investigate');
    }

    /** @inheritdoc */
    initialize(game, player) {
        super.initialize(game, player);
        game.on('night.start', this, 'onNightStart');
        game.on('night.end', this, 'onNightEnd');
        this.on('ready', game, 'onCycleReady');
    }

    /**
     * (event: night.start)
     * Make the game wait the investigation.
     */
    onNightStart() {
        this.cycleReady = false;
    }

    /**
     * (event: night.end)
     * Handles investigation on night end.
     */
    onNightEnd() {
        if (this.investigate) {
            this.player.sendPrivate(this.investigate.mention + ' is ' + this.getInvestigateResult(this.investigate));
        }
        this.investigate = null;
    }

    /**
     * Mark a target to be investigated
     * @param {Player} target
     */
    setInvestigate(target) {
        this.investigate = target;
        this.cycleReady = !!this.investigate;
        this.emit('ready');
    }

    /**
     * Return target investigation result.
     * @param {Player} target
     * @return {String}
     */
    getInvestigateResult(target) {
        return target.isMafia ? 'Mafia' : 'Town';
    }

    /** @inheritdoc */
    get commands() {
        return [require('../../Command/Investigate')];
    }
}
