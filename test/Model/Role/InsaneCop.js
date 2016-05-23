'use strict';
var assert = require('assert');
var sinon = require('sinon');
var Cop = require('../../../lib/Model/Role/Cop');
var InsaneCop = require('../../../lib/Model/Role/InsaneCop');
var Game = require('../../../lib/Model/Game');
var Player = require('../../../lib/Model/Player');

describe('Model/Role/InsaneCop', () => {
    it('should be instance of Cop', () => {
        var role = new InsaneCop();
        assert(role instanceof Cop);
    });
    describe('#onNightEnd()', () => {
        it('should send a message to player with the inverse target type', () => {
            var role = new InsaneCop();
            var gameStub = new Game();
            var townStub = new Player({ sendPrivate: sinon.spy(), isMafia: false, mention: '<@0>' });
            var mafiaStub = new Player({ sendPrivate: sinon.spy(), isMafia: true, mention: '<@1>' });
            role.initialize(gameStub, townStub);

            role.investigate = townStub;
            gameStub.emit('night.end');
            assert(townStub.sendPrivate.calledWith('<@0> is Mafia'));

            townStub.sendPrivate.reset();
            role.investigate = mafiaStub;
            gameStub.emit('night.end');
            assert(townStub.sendPrivate.calledWith('<@1> is Town'));
        });
    });
});
