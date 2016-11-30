'use strict';

var express = require('express');
var services = require('../services');

var ElasticService = services.ElasticService;
var router = express.Router();

router.get('/search', function(req, res) {
    ElasticService.search(req.query.term, req.query.page, req.query.pageSize, function(err, results) {
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

router.use(function(req, res) {
    res.status(404).json({
        error: 'Not Found'
    });
})

module.exports = router;
