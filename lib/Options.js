'use strict';
var extend = require('extend');
var fs = require('fs');

var options;

module.exports =
function(customs) {
    if (options) return options;
    if (!customs) customs = {};

    var defaults = {
        dir: {
            data: process.env.MAFIA_DATA_DIR || process.env.OPENSHIFT_DATA_DIR || './data',
        },
        /*
        server: {
            ip: process.env.MAFIA_SERVER_IP || process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
            port: process.env.MAFIA_SERVER_PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
        }
        */
    };

    var files = [];
    try {
        for (var file of customs[''] || ['options.json']){
            files.push(JSON.parse(fs.readFileSync(file)));
        }
    } catch (e) {
        console.log(e.message);
    } delete customs[''];

    return options = Object.freeze(extend(true, defaults, ...files, customs));
}
