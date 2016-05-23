'use strict';
var Model = require('../../Model');
var Cop = require('./Cop');

const BaseInsaneCop = {
    class: __filename,
    /** @return {String} */
    name: 'Insane Cop'
}

module.exports =
/**
 * Role that allows a player to investigate others,
 * but returns the inverse result.
 */
class InsaneCop extends Cop {
    constructor(data) {
        super(Model.inherit(data, BaseInsaneCop));
    }

    /** @inheritdoc */
    getInvestigateResult(target) {
        return target.isMafia ? 'Town' : 'Mafia';
    }
}
