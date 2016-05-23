'use strict';
var fs = require('fs');
var Discordie = require('discordie');
var Options = require('./Options')();

// lateLoad
var Message;

module.exports =
class Client {
    static create() {
        Message = require('./Message');

        Client._createClient();
        Client._createStructure();

        Client.setup = null;
        Client.game = null;
        Client.builder = null;

        return Client;
    }

    static run() {
        Client._client.connect(Options.credentials);
        return Client;
    }

    static _createClient() {
        var events = Discordie.Events;
        Client._client = new Discordie();
        Client._client.Dispatcher.on(events.GATEWAY_READY, (evt) => Client.onReady(evt.data));
        Client._client.Dispatcher.on(events.DISCONNECTED, (evt) => Client.onDisconnected(evt.error));
        Client._client.Dispatcher.on(events.MESSAGE_CREATE, (evt) => Client.onMessageCreate(evt.message));
        Client._client.Dispatcher.on(events.MESSAGE_DELETE, (evt) => Client.onMessageUpdate(evt.messageId, evt.channelId, evt.message, null));
        Client._client.Dispatcher.on(events.MESSAGE_UPDATE, (evt) => Client.onMessageUpdate(evt.data.id, evt.data.channel_id, evt.message, evt.data.content));
        //Client._client.Dispatcher.on(events.PRESENCE_MEMBER_INFO_UPDATE, (evt) => Client.onUserUpdate(evt.old, evt.new));
        //Client._client.Dispatcher.on(events.GUILD_MEMBER_ADD, (evt) => Client.onUserJoin(evt.member));
        //Client._client.Dispatcher.on(events.GUILD_MEMBER_REMOVE, (evt) => Client.onUserPart(evt.user));
    }

    static _createStructure() {
        Client.commands = [
            require('./Command/Setup'),
            require('./Command/Subscribe'),
            require('./Command/Vote')
        ];
        Client.allowedSetups = {
            dethy: require('./Setup/Dethy')
        };
    }

    static _handleCommands(commands, message) {
        for (var command of commands) {
            if (command.accepts(message)) {
                command.execute(message);
                return true;
            }
        }
    }

    static getChannelBy(key, value) {
        return Client._client.Channels.getBy(key, value);
    }

    static getGuildBy(key, value) {
        return Client._client.Guilds.getBy(key, value);
    }

    static getUserBy(key, value) {
        return Client._client.Users.getBy(key, value);
    }

    static onReady(connectionData) {
        try {
            var gameid = parseInt(fs.readFileSync(process.env.OPENSHIFT_DATA_DIR + '/data/game.id', 'utf8'));
            var data = JSON.parse(fs.readFileSync(process.env.OPENSHIFT_DATA_DIR + '/data/' + gameid + '.json'));
            var _class = require(data.class);
            Client.game = new _class(data);
            Client.channel = Client._client.Channels.getBy('name', 'scum');
        } catch (e) { }
    }

    static onDisconnected(error) {
        if (error.message === 'Disconnected from primary gateway') {
            setTimeout(() => { Client.run() }, 15000);
        }
        console.log(error.message);
    }

    static onMessageCreate(message) {
        if (message.author.id == Client._client.User.id) return;

        if (Client.builder && Client.builder.user_id == message.author.id){
            message = new Message(message, 0)
            Client.builder.executeBuilder(message);
        }

        if (message.content.startsWith(Options.command.prefix)) {
            message = new Message(message, Options.command.prefix.length);

            if (
                Client._handleCommands(Client.commands, message));
            else if(message.player &&
                Client._handleCommands(message.player.role.commands, message));
        }
    }

    static onMessageUpdate(messageId, channelId, oldMessage, newContent) { /* TODO */ }
    static onUserUpdate(oldUser, newUser) { /* TODO */ }
    static onUserJoin(user) { /* TODO */ }
    static onUserPart(user) { /* TODO */ }
};

module.exports.create();
