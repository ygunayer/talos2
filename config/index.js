'use strict';

var _ = require('lodash');
var argv = require('optimist').argv;

if (argv.config && _.isString(argv.config)) {
    global.CONFIG_DIR = argv.config;
} else {
    global.CONFIG_DIR = __dirname;
}

module.exports = global.config = require(global.CONFIG_DIR + '/config.json');
