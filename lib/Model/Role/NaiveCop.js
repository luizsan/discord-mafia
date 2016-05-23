'use strict';
var Model = require('../../Model');
var Cop = require('./Cop');

const BaseNaiveCop = {
    class: __filename,
    /** @return {String} */
    name: 'Paranoid Cop'
}

module.exports =
/**
 * Role that allows a player to investigate others,
 * but always returns the target is town.
 */
class NaiveCop extends Cop {
    constructor(data) {
        super(Model.inherit(data, BaseNaiveCop));
    }

    /** @inheritdoc */
    getInvestigateResult(target) {
        return 'Town';
    }
}
