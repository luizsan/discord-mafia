'use strict';
var Model = require('../../Model');
var Role = require('../Role');

const BaseTownie = {
    class: __filename,
    /** @return {String} */
    type: 'town',
    /** @return {String} */
    name: 'Townie',
    /** @return {String} */
    publicName: 'Townie'
}

module.exports =
/**
 * Basic town role.
 */
class Townie extends Role {
    constructor(data) {
        super(Model.inherit(data, BaseTownie));
    }
}
