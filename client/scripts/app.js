'use strict';

var angular = require('angular');

var app = angular.module('talos', []);

app.controller('MainController', function($scope) {
    $scope.meme = 'HELLO';
});

module.exports = app;
