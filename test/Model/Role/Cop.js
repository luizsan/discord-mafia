'use strict';
var assert = require('assert');
var sinon = require('sinon');
var Cop = require('../../../lib/Model/Role/Cop');
var Game = require('../../../lib/Model/Game');
var Player = require('../../../lib/Model/Player');

describe('Model/Role/Cop', () => {
    it('should have !investigate command', () => {
        var role = new Cop();
        assert(role.commands.indexOf(require('../../../lib/Command/Investigate')) >= 0);
    });
    /* TODO make better
    it('should register #onNightEnd() to receive events from game.', () => {
        var role = new Cop();
        var gameStub = new StubEmitter();
        var playerStub = new StubEmitter();

        role.initialize(gameStub, playerStub);
        assert(gameStub.hasListeners('night.end'));
        assert.strictEqual(role.player, playerStub);
    });
    */
    describe('#onNightEnd()', () => {
        it('should send a message to player with the correct target type', () => {
            var role = new Cop();
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
            assert(townStub.sendPrivate.calledWith('<@1> is Mafia'));
        });
    });
    /* TODO make better */
    describe('#setInvestigate()', () => {
        it('should setup the target and tell the game he is ready', () => {
            var role = new Cop();
            var gameStub = new Game({ onCycleReady: sinon.stub() });
            var townStub = new Player({ sendPrivate: sinon.spy(), isMafia: false, mention: '<@0>' });
            role.initialize(gameStub, townStub);

            role.setInvestigate(townStub);
            assert.equal(role.investigate.id, townStub.id);
            assert(role.cycleReady);
            assert(gameStub.onCycleReady.calledOnce);

            gameStub.onCycleReady.reset();
            role.setInvestigate(null);
            assert.equal(role.investigate, null);
            assert(!role.cycleReady);
            assert(gameStub.onCycleReady.calledOnce);
        });
    });
});
