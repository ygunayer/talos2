'use strict';

var config = require('./config');
var express = require('express');
var app = express();

app.set('view engine', 'pug');
app.set('views', './server/views');

app.locals.navItems = [
    { href: '/', title: 'Search', label: 'Search', slug: 'search' },
    { href: '/browse', title: 'Browse', label: 'Browse', slug: 'browse' },
    { href: '/about', title: 'About', label: 'About', slug: 'about' }
];

app.use(function(req, res, next) {
    res.locals.baseUrl = '//' + req.get('host');
    next();
});

var routes = require('./server/routes');
app.use('/public', express.static('public'));
app.use('/', routes);

app.use(function(req, res, next) {
    res.status(404).render('404');
});

var port = config.port || 3000;
app.listen(port);
console.log('Listening on port', port);
