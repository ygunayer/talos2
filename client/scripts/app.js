'use strict';

var angular = require('angular');

require('./search');

var app = angular.module('talos', [ 'talos.search' ]);

app.filter('unsafe', function($sce) {
    return $sce.trustAsHtml;
});

app.controller('MainController', function($scope) {
    
});
