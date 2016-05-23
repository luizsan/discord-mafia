'use strict';
var Model = require('../Model');

const BaseVote = {
    class: __filename,
    /** @returns {Player} */
    player: null,
    /** @returns {Player} */
    target: null
}

module.exports =
/**
 * Vote data.
 */
class Vote extends Model {
    constructor(data) {
        super(Model.inherit(data, BaseVote));
        this._relation('player');
        this._relation('target');
    }
}
