'use strict';
var Model = require('../../Model');
var Role = require('../Role');

const BaseGoon = {
    class: __filename,
    /** @return {String} */
    type: 'mafia',
    /** @return {String} */
    name: 'Goon',
    /** @return {String} */
    publicName: 'Mafia Goon'
}

module.exports =
/**
 * Basic mafia role.
 */
class Goon extends Role {
    constructor(data) {
        super(Model.inherit(data, BaseGoon));
    }

    /** @inheritdoc */
    get commands() {
        return [require('../../Command/Kill')];
    }
}
