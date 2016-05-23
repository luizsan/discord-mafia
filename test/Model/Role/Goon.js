'use strict';
var assert = require('assert');
var sinon = require('sinon');
var Emitter = require('../../../lib/Model/Emitter');
var Goon = require('../../../lib/Model/Role/Goon');

describe('Model/Role/Goon', () => {
    it('should have !kill command', () => {
        var role = new Goon();
        assert(role.commands.indexOf(require('../../../lib/Command/Kill')) >= 0);
    })
});
