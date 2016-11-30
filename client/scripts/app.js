'use strict';

var angular = require('angular');

require('./search');
require('./file-detail');

var app = angular.module('talos', [ 'talos.search', 'talos.fileDetail' ]);

app.filter('unsafe', function($sce) {
    return $sce.trustAsHtml;
});

app.controller('MainController', function($scope) {
    
});
