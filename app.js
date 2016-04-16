'use strict';

var config = require('./config');
var express = require('express');
var app = express();

app.set('view engine', 'pug');
app.set('views', './server/views');

var routes = require('./server/routes');
app.use('/public', express.static('public'));
app.use('/', routes);

var port = config.port || 3000;
app.listen(port);
console.log('Listening on port', port);
