'use strict';

var express = require('express');
var services = require('../services');
var _ = require('lodash');

var router = express.Router();

router.get('/about', function(req, res) {
    res.locals.activeNav = 'about';
    res.locals.title = 'About';
    res.render('about');
});

router.get('/file/:key', function(req, res) {
    res.locals.activeNav = 'about';
    res.locals.title = 'About';
    res.render('about');
});

router.get('/browse', function(req, res, next) {
    res.locals.activeNav = 'browse';
    services.ElasticService.getTree(function(err, tree) {
        if (err) {
            return next(err);
        }

        res.locals.tree = tree;
        res.render('browse');
    });
});

router.get('/', function(req, res) {
    res.locals.activeNav = 'home';
    res.locals.title = 'Home';
    res.render('index');
});

router.use(function(err, req, res, next) {
    console.error('ERROR:', req.method, req.url, err.message, err.stack);
    var status = (err && err.status) || 500;
    res.status(status).send({
        error: (err && err.message) || 'Unknown error',
        status: status
    });
});

module.exports = router;
