'use strict';

var search = angular.module('talos.search', []);

var utils = require('./utils');

search.service('SearchService', function($http) {
    return {
        search: function(term) {
            return $http({
                url: '/api/search',
                params: {
                    term: term
                }
            });
        }
    };
});

search.controller('SearchController', function($scope, SearchService) {
    $scope.term = $scope.initial || '';
    $scope.isLoading = false;

    var cleanupPatterns = [
        /^[\s\.\,]*/,
        /[\s\.\,]*$/,
        /[<]br[^>]*[>]/gi
    ];

    var startLoading = function() {
        $scope.isLoading = true;
        $scope.showResultsPane = true;
    };

    var stopLoading = function() {
        $scope.isLoading = false;
    };

    var formatHighlight = function(input) {
        return !input ? null : cleanupPatterns.reduce(function(acc, pattern) {
            return acc.replace(pattern, '');
        }, input);
    };

    var formatSingle = function(item) {
        item.url = '/file/' + item.key;

        var highlights = item.highlights || {};
        item.highlightedText = [ 'input', 'output' ].reduce(function(acc, key) {
            var highlight = highlights[key] || [ utils.ellipsis(item[key], 100) ];
            acc[key] = highlight.map(formatHighlight).join('<p>...</p>');
            return acc;
        }, {});

        return item;
    };

    var search = utils.debounce(300, function(term) {
        if (!term) {
            return;
        }

        $scope.results = null;

        startLoading();

        SearchService.search(term).then(function(response) {
            $scope.results = (response.data || []).map(formatSingle);
        }).finally(stopLoading);
    });

    $scope.$watch('term', search);
    $scope.clearSearch = function() {
        $scope.term = '';
        $scope.isLoading = false;
        $scope.showResultsPane = false;
        $scope.results = null;
    };
});

search.directive('searchForm', function() {
    return {
        restrict: 'E',
        controller: 'SearchController',
        templateUrl: 'widgets/search-form.html',
        scope: {
            initial: '@'
        }
    }
});

module.exports = search;
