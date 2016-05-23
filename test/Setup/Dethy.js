'use strict';
var assert = require('assert');
var Dethy = require('../../lib/Setup/Dethy');
var Game = require('../../lib/Model/Game');

describe('Dethy', () => {
    it('should return a Game model' , () => {
        var dethy = new Dethy();
        dethy.onReady({});
        var game = dethy.onDone();
        assert(game instanceof Game);
    });
});
