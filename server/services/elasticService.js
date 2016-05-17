'use strict';

var config = global.config.elastic;
var _ = require('lodash');
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
    host: config.host
});

var ElasticService = function() {
    
};

ElasticService.prototype.get = function(id, callback) {
    client.get({
        index: config.indexName,
        type: config,
        id: id
    }).then(function(result) {
        callback(null, result);
    }).catch(callback);
};

ElasticService.prototype.search = function(term, callback) {
    client.search({
        index: config.indexName,
        type: config.documentType,
        body: {
            query: {
                bool: {
                    should: [
                        { query_string: { fields: [ 'title', 'key' ], query: '*' + term + '*' } },
                        { term: { input: term } },
                        { term: { output: term } }
                    ]
                }
            },
            highlight: {
                pre_tags: [ '<em class="highlight">' ],
                post_tags: [ '</em>' ],
                fields: {
                    title: {},
                    input: {},
                    output: {}
                }
            }
        }
    }).then(function(result) {
        callback(null, result);
    }).catch(callback);
};

ElasticService.prototype.findAll = function(callback) {
    client.search({
        index: config.indexName,
        type: config.documentType,
        size: 300
    }).then(function(result) {
        var hits = (result.hits && result.hits.hits) || [];
        hits = hits.map(hit => _.pick(hit._source, [ 'title', 'key', 'input', 'output', 'segments' ]));
        callback(null, hits);
    }).catch(callback);
};

ElasticService.prototype.getTree = function(callback) {
    this.findAll(function(err, hits) {
        if (err) {
            return callback(err);
        }

        var tree = hits.reduce(function(acc, item) {
            var parts = _.compact(item.key.replace('TermDlg.FoundTexts.', '').split('.'));
            var parent = acc;
            while (parts.length > 0) {
                var part = parts.splice(0, 1);
                parent = parent.children[part] = parent.children[part] || { children: {} };
            }
            parent.item = item;
            return acc;
        }, { children: {}, root: true });

        callback(null, tree);
    });
};

module.exports = ElasticService;
