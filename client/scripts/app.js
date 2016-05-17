'use strict';

var angular = require('angular');

require('./search');

var app = angular.module('talos', [ 'talos.search' ]);

app.controller('MainController', function($scope) {
    
});
