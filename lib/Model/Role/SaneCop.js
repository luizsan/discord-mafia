'use strict';
var Model = require('../../Model');
var Cop = require('./Cop');

const BaseSaneCop = {
    class: __filename,
    /** @return {String} */
    name: 'Sane Cop'
}

module.exports =
/**
 * Role that allows a player to investigate others.
 * Alias for Cop.
 */
class SaneCop extends Cop {
    constructor(data) {
        super(Model.inherit(data, BaseSaneCop));
    }
}
