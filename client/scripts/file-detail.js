'use strict';

var fileDetail = angular.module('talos.fileDetail', []);

fileDetail.controller('FileDetailController', function($scope) {
    $scope.displayMode = 'both';
});

module.exports = fileDetail;
