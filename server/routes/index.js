'use strict';

var express = require('express');

var router = express.Router();

var api = require('./api');
var web = require('./web');

router.use('/api', api);
router.use('/', web);

module.exports = router;
