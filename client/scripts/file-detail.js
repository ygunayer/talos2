'use strict';

var fileDetail = angular.module('talos.fileDetail', []);

fileDetail.controller('FileDetailController', function($scope) {
    $scope.show = {
        encoded: true,
        decoded: true
    };

    $scope.toggleDisplay = function(what) {
        if (what != 'encoded' && what != 'decoded') {
            return;
        }

        $scope.show[what] = !$scope.show[what];
    };
});

module.exports = fileDetail;
