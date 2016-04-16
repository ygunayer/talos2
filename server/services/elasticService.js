'use strict';

var config = global.config.elastic;
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
    host: config.host
});

var ElasticService = function() {
    
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

module.exports = ElasticService;
