'use strict';

var angular = require('angular');

require('angulartics');
require('angulartics-google-analytics');

require('./search');
require('./file-detail');

var app = angular.module('talos', [ 'angulartics', 'angulartics.google.analytics', 'talos.search', 'talos.fileDetail' ]);

app.filter('unsafe', function($sce) {
    return $sce.trustAsHtml;
});

app.controller('MainController', function($scope) {
    
});
