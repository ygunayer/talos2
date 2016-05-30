'use strict';

var config = global.config.elastic;
var _ = require('lodash');
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
    host: config.host
});

var ElasticService = function() {
    
};

ElasticService.prototype.formatResultSet = function(result) {
    var hits = (result && result.hits && result.hits.hits) || [];
    return hits.map(this.formatSingle);
};

ElasticService.prototype.formatSingle = function(data) {
    var item = _.pick(data._source, [ 'title', 'key', 'input', 'output', 'segments' ]);
    var segments = item.segments.reduce(function(acc, segment) {
        acc.encoded.push(segment.text || '<span class="highlight warning" title="' + segment.decodedText + '">' + segment.encodedText + '</span>');
        acc.decoded.push(segment.text || '<span class="highlight success" title="' + segment.encodedText + '">' + segment.decodedText + '</span>');
        return acc;
    }, { encoded: [], decoded: [] });

    if (data.highlight) {
        item.highlights = data.highlight;
    }

    return _.extend(item, {
        encoded: segments.encoded.join(' '),
        decoded: segments.decoded.join(' ')
    });
};

ElasticService.prototype.get = function(id, callback) {
    var that = this;
    client.get({
        index: config.indexName,
        type: config.documentType,
        id: id
    }).then(function(result) {
        callback(null, that.formatSingle(result));
    }).catch(callback);
};

ElasticService.prototype.search = function(term, callback) {
    var that = this;
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
                pre_tags: [ '<mark>' ],
                post_tags: [ '</mark>' ],
                fields: {
                    title: {},
                    input: {},
                    output: {}
                }
            }
        }
    }).then(function(result) {
        callback(null, that.formatResultSet(result));
    }).catch(callback);
};

ElasticService.prototype.findAll = function(callback) {
    var that = this;
    client.search({
        index: config.indexName,
        type: config.documentType,
        size: 300
    }).then(function(result) {
        callback(null, that.formatResultSet(result));
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
