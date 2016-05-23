'use strict';
var assert = require('assert');
var sinon = require('sinon');
var Cop = require('../../../lib/Model/Role/Cop');
var NaiveCop = require('../../../lib/Model/Role/NaiveCop');
var Game = require('../../../lib/Model/Game');
var Player = require('../../../lib/Model/Player');

describe('Model/Role/NaiveCop', () => {
    it('should be instance of Cop', () => {
        var role = new NaiveCop();
        assert(role instanceof Cop);
    });
    describe('#onNightEnd()', () => {
        it('should send a message to player with the "Town" target type', () => {
            var role = new NaiveCop();
            var gameStub = new Game();
            var townStub = new Player({ sendPrivate: sinon.spy(), isMafia: false, mention: '<@0>' });
            var mafiaStub = new Player({ sendPrivate: sinon.spy(), isMafia: true, mention: '<@1>' });
            role.initialize(gameStub, townStub);

            role.investigate = townStub;
            gameStub.emit('night.end');
            assert(townStub.sendPrivate.calledWith('<@0> is Town'));

            townStub.sendPrivate.reset();
            role.investigate = mafiaStub;
            gameStub.emit('night.end');
            assert(townStub.sendPrivate.calledWith('<@1> is Town'));
        });
    });
});
