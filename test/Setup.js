'use strict';
var assert = require('assert');
var sinon = require('sinon');
var Client = require('../lib/Client');
var Setup = require('../lib/Setup');

describe('Setup',() => {
    describe('#onReady()', () => {
        it('should validate against its constraints', () => {
            var setup = new Setup();
            assert(setup.onReady({timeout: 'invalid'}) != null);
            assert(!setup.isReady);
            assert(setup.onReady({timeout: 10}) == null);
            assert(setup.isReady);
        });
        it('should cancel the setup on timeout', (done) => {
            var setup = new Setup({sendMessage: sinon.stub()});
            Client.setup = setup;
            setup.constraints.timeout.numericality.onlyInteger = false;
            setup.onReady({timeout: 0.00002});
            assert.equal(Client.setup, setup);
            setTimeout(() => {
                assert.equal(Client.setup, null);
                done();
            }, 2);
        });
        it('should cancel the timeout when onDone() is called', (done) => {
            var setup = new Setup();
            setup.onReady({timeout: 0.00002});
            setup.onDone();
            Client.setup = setup;
            setTimeout(() => {
                assert.equal(Client.setup, setup);
                done();
            }, 2);
        });
    });
    describe('#addPlayer()', () => {
        it('should add a player into game', () => {
            var setup = new Setup();
            var player1 = {id: 1};
            var player2 = {id: 2};
            setup.addPlayer(player1);
            setup.addPlayer(player2);
            assert.equal(setup.players.length, 2);
            assert.equal(setup.players[0].id, player1.id);
            assert.equal(setup.players[1].id, player2.id);
        });
        it('shouldn\'t add the same player multiple times', () => {
            var setup = new Setup();
            var player = {id: 1};
            setup.addPlayer(player);
            setup.addPlayer(player);
            assert.equal(setup.players.length, 1);
        });
    });
    describe('#removePlayer()', () => {
        it('should remove a player from game', () => {
            var setup = new Setup();
            var player1 = {id: 1};
            var player2 = {id: 2};
            setup.addPlayer(player1);
            setup.addPlayer(player2);
            assert.equal(setup.players.length, 2);
            setup.removePlayer(player1);
            assert.equal(setup.players.length, 1);
            assert.equal(setup.players[0].id, player2.id);
            setup.removePlayer(player1);
            assert.equal(setup.players.length, 1);
            assert.equal(setup.players[0].id, player2.id);
        });
    });
    describe('.shuffle()', () => {
        it('must shuffle', () => {
            var count = 0;
            var randomReturns = [5, 0, 1, 7, 4, 6, 3, 2].map((r) => r/8);
            var stub = sinon.stub(Math, 'random', () => randomReturns[count++]);

            assert.deepEqual(Setup.shuffle([0, 1, 2, 3, 4, 5, 6, 7]), [1, 7, 3, 2, 4, 6, 0, 5]);
            assert.equal(count, 8);
            stub.restore();
        });
    });
});
