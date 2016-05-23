'use strict';
var Model = require('../../Model');
var Cop = require('./Cop');

const BaseParanoidCop = {
    class: __filename,
    /** @return {String} */
    name: 'Paranoid Cop'
}

module.exports =
/**
 * Role that allows a player to investigate others,
 * but always returns the target is mafia.
 */
class ParanoidCop extends Cop {
    constructor(data) {
        super(Model.inherit(data, BaseParanoidCop));
    }

    /** @inheritdoc */
    getInvestigateResult(target) {
        return 'Mafia';
    }
}
