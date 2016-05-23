'use strict';
var assert = require('assert');
var Townie = require('../../../lib/Model/Role/Townie');

describe('Model/Role/Townie', () => {
    it('shouldn\'t have any custom command', () => {
        var role = new Townie();
        assert(role.commands.length == 0);
    })
});
