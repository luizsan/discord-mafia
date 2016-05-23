'use strict';
var extend = require('extend');
var path = require('path');
var Collection = require('./Model/Collection');

class MechanicCollection extends Collection {
    _instanceGetter(v) { return require(v); }
    _instanceSetter(v) {
        if (typeof v == 'function') {
            return v.class.startsWith('/')
                ? './' + path.relative(__dirname, v.class)
                : v.class;
        } return v;
    }
}

var mergedMechanic;
function Mechanic(data) {
    if (!data || !data.mechanics) return data;

    const Game = require('./Model/Game');
    mergedMechanic = {};
    data.mechanics.forEach((mechanic) => {
        var s = extend({}, mergedMechanic);
        mechanic(
            (k, v) => {
                mergedMechanic[k] = v;
            }, (t, k) => {
                var args = Array.prototype.slice.call(arguments, 2);
                (s[k] || Game.prototype[k]).apply(t, args);
            });
    });

    return extend(mergedMechanic, data);
}

Mechanic.Collection = MechanicCollection;
module.exports = Object.freeze(Mechanic);
