'use strict';
var CopHeadstart = require('../Mechanic/CopHeadstart');
var Setup = require('../Setup');
var Game = require('../Model/Game');
var Player = require('../Model/Player');

var constraints = Object.freeze({
    timeout: {
        numericality: {
            onlyInteger: true,
            greatherThan: 0,
        }
    }
});

module.exports =
class Dethy extends Setup {
    get constraints() { return constraints; }

    constructor(channel) {
        super(channel);
        this.playerMin = 5;
        this.playerMax = 5;

        this.name = 'Dethy';
        this.rules = 'Players: 5\n' +
            'Roles:\n' +
            '- 1 Mafia Goon\n' +
            '- 1 Sane Cop\n' +
            '- 1 Insane Cop\n' +
            '- 1 Paranoid Cop\n' +
            '- 1 Naive Cop\n' +
            'Dethy games inherently favor the Town. ' +
            'Even with optimal play by the Mafia it is ' +
            'impossible for it to come down to more than ' +
            'a 50/50 chance of a mafia win at Endgame. ' +
            'With a town that is skilled in analysis, ' +
            'their chances decrease significantly.';
    }

    onReady(options) {
        return super.onReady(options) || (() => {
            // TODO
        })();
    }

    onDone() {
        var game = new Game({
            channel: this.channel,
            name: 'Dethy',
            mechanics: [CopHeadstart]
        });

        var roles = Setup.shuffle([
            require('../Model/Role/Goon'),
            require('../Model/Role/SaneCop'),
            require('../Model/Role/InsaneCop'),
            require('../Model/Role/ParanoidCop'),
            require('../Model/Role/NaiveCop')
        ]);

        for (var index in this.players) {
            var player = new Player({
                user: this.players[index].id,
                role: new roles[index]().id
            });
            game.players.push(player);
        }

        return game;
    }
}
