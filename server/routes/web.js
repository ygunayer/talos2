'use strict';

var express = require('express');
var services = require('../services');

var SearchService = services.SearchService;
var router = express.Router();

router.use('/', function(req, res) {
    res.render('index', {
        baseUrl: '',
        title: 'Home'
    });
});

module.exports = router;
