'use strict';
var assert = require('assert');
var sinon = require('sinon');
var IUser = require('discordie/lib/interfaces/IUser');
var Client = require('../../lib/Client');
var Player = require('../../lib/Model/Player');
var Role = require('../../lib/Model/Role');

describe('Model/Player', () => {
    describe('#constructor()', () => {
        it('should accept any kind of reference', () => {
            Client._client._users.update({id: '1'});
            var iuser = new IUser(Client._client, '1');
            var role = new Role();
            var player1 = new Player({user: iuser, role: role});
            var player2 = new Player({user: iuser.id, role: role.id});

            assert.deepEqual(player1.user, iuser);
            assert.deepEqual(player2.user, iuser);
            assert.deepEqual(player1.role, role);
            assert.deepEqual(player2.role, role);
        });
    });
    describe('#initialize()', () => {
        it('should chain to its role and send a welcome message', () => {
            var game = {};
            var role = new Role({publicName: 'MyRole', initialize: sinon.stub()});
            var player = new Player({role: role, sendPrivate: sinon.stub()});
            player.initialize(game);
            assert(role.initialize.calledWithExactly(game, player));
            assert(player.sendPrivate.calledOnce);
            assert(player.sendPrivate.args[0][0].endsWith('MyRole'));
        });
    });
    describe('#isMafia()/#isTown()', () => {
        it('should return the correct type from role', () => {
            var townPlayer = new Player({role: new Role({type: 'town'})});
            var mafiaPlayer = new Player({role: new Role({type: 'mafia'})});

            assert(townPlayer.isTown);
            assert(!townPlayer.isMafia);
            assert(!mafiaPlayer.isTown);
            assert(mafiaPlayer.isMafia);
        });
    });
    describe('#mention/#userId', () => {
        it('should return the correct mention/id from IUser', () => {
            Client._client._users.update({id: '1'});
            var iuser = new IUser(Client._client, '1');
            var player = new Player({user: iuser});

            assert.equal(player.mention, iuser.mention);
            assert.equal(player.userId, iuser.id);
        });
    });
    describe('#sendPrivate()', () => {
        it('should open a private channel and send a message', (done) => {
            Client._client._users.update({id: '1'});
            var iuser = new IUser(Client._client, '1');
            var channelStub = sinon.stub().withArgs("My test message.");
            var getChannelStub = sinon.stub(Client._client.DirectMessageChannels, 'getOrOpen').returns(Promise.resolve({sendMessage: channelStub}));
            var player = new Player({user: iuser});

            player.sendPrivate("My test message.");
            assert(getChannelStub.calledOnce);
            // eventually
            setTimeout(() => { assert(channelStub.calledOnce); done(); });
        });
    });
});
