'use strict';
var IChannel = require('discordie/lib/interfaces/IChannel');
var Client = require('../Client');
var Collection = require('./Collection');
var Emitter = require('./Emitter');
var Mechanic = require('../Mechanic');
var Model = require('../Model');
var Options = require('../Options')();
var Vote = require('./Vote');

const BaseGame = {
    class: __filename,
    /** @returns {String} */
    name: '<not defined>',
    /** @returns {String} */
    channel: null,
    /** @returns {Collection} */
    players: null,
    /** @returns {Number} */
    round: 1,
    /** @returns {String} */
    cycle: 'day',
    /** @returns {Collection} */
    votes: null,
    /** @returns {MechanicCollection} */
    mechanics: null
};

module.exports =
/**
 * Game management class.
 */
class Game extends Emitter {
    constructor(data) {
        super(Model.inherit(Mechanic(data), BaseGame));
        this._relation('players');
        this._relation('votes');
        this._relation('mechanics');
        this._relation('channel',
            (v) => Client.getChannelBy('id', v),
            (v) => v instanceof IChannel ? v.id : v);

        this.players = this.players || new Collection();
        this.votes = this.votes || new Collection();
        this.mechanics = this.mechanics || new Mechanic.Collection();
    }

    /**
     * Initialize this game and its players.
     */
    start() {
        this.players.forEach((player) => {
            player.initialize(this);
        });

        this.on('day.start', this, 'onDayStart');
        this.on('day.end', this, 'onCycleEnd');
        this.on('night.start', this, 'onNightStart');
        this.on('night.end', this, 'onCycleEnd');
        this.emit('game.start');
        this.emit(this.cycle + '.start');
    }

    /**
     * (event: day.start)
     * Send a message to channel and mention all players.
     */
    onDayStart() {
        this.channel.sendMessage('It\'s *Day* now!\n' + this.players.map((p) => p.mention).join(' '));
    }

    /**
     * (event: night.start)
     * Send a message to channel and tell each player its night commands.
     */
    onNightStart() {
        this.channel.sendMessage('It\'s *Night* now!');
        this.players.forEach((player) => {
            var privateCommands = player.role.commands.filter((c) => c.isPrivate === true).map((c) => Options.command.prefix + c.name);
            if (privateCommands.length) {
                player.sendPrivate('Commands Avaliable: `' + privateCommands.join('`, `') + '`')
            }
        });
    }

    /**
     * (event: day.end && night.end)
     * Kill a player and check victory condition.
     */
    onCycleEnd(kill) {
        if (kill) {
            this.channel.sendMessage(kill.mention + ' was killed! He was a ' + kill.role.publicName);
            this.players.delete(kill);
            kill.destroy();
        }

        var mafiaPlayers = this.players.filter((p) => p.isMafia);
        if(mafiaPlayers.length >= this.players.length/2) {
            this.channel.sendMessage('The *Mafia* Wins! Congratulations ' + mafiaPlayers.map((m) => m.mention).join(' '));
            Client.game = null;
            this.destroy();
            return;
        } else if (mafiaPlayers.length == 0) {
            this.channel.sendMessage('The *Town* Wins! Congratulations ' + this.players.map((m) => m.mention).join(' '));
            Client.game = null;
            this.destroy();
            return;
        }

        this.cycle = this.cycle == 'day' ? 'night' : 'day';
        if (this.cycle == 'day') this.round++;
        this.emit(this.cycle + '.start');
    }

    /**
     * Check all players are ready and end the cycle.
     */
    onCycleReady() {
        var ready = true;
        this.players.forEach((p) => {
            if (!p.role.cycleReady) ready = false;
        });
        if (!ready) return;


        var majority;
        var voteCount = this.countVotes();
        var halfCount = (this.cycle == 'day' ? this.players.length : this.players.filter((p) => p.isMafia).length) / 2;
        for (var i in voteCount) {
            if (voteCount[i] > halfCount) {
                majority = i;
            }
        }
        if (majority) {
            this.clearVotes();
            this.emit(this.cycle + '.end', this.players.getBy('id', majority));
        }
    }

    /**
     * Add a lynch vote.
     * @param {Player} player
     * @param {Player} target
     */
    setVote(player, target) {
        if (this.cycle == 'night' && !player.isMafia) return;

        var vote = this.votes.find((p) => p.player.id == player.id);
        if(target && vote) {
            vote.target = target;
        } else if (target) {
            this.votes.push(new Vote({
                player: player.id,
                target: target.id
            }));
        } else if (vote){
            this.votes.delete(vote);
        }

        this.onCycleReady();
    }

    /**
     * Count votes for each player, by its id.
     * @return {Object}
     */
    countVotes() {
        var votes = {};
        this.votes.forEach((v) => {
            votes[v.target.id] = (votes[v.target.id] || 0) + 1;
        });
        return votes;
    }

    /**
     * Clear all votes.
     */
    clearVotes() {
        this.votes.forEach((vote) => vote.destroy());
        this.votes.children = [];
    }

    /** @inheritdoc */
    destroy() {
        this.players.destroy(true);
        this.votes.destroy(true);
        super.destroy();
    }
}
