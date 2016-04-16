'use strict';

var express = require('express');
var services = require('../services');

var SearchService = services.SearchService;
var router = express.Router();

router.use('/search', function(req, res) {
    console.log(req.query);
    SearchService.search(req.query.term, function(err, results) {
        if (err) {
            console.error('Error searching for term', req.query.term, err);
            res.status(500);
            return res.send({
                error: err.message || 'An error has occurred'
            });
        }

        res.send(results);
    });
});

module.exports = router;
