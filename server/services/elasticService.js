'use strict';

var config = global.config.elastic;
var _ = require('lodash');
var elasticsearch = require('elasticsearch');

var defaultPageSize = 10;
var maxPageSize = 50;

var client = new elasticsearch.Client({
    host: config.host
});

var ElasticService = function() {
    
};

var simplify = function(item) {
    if (Array.isArray(item) && item.length < 1) {
        item = item[0];
    }
    return item;
};

var tpl = {
    raw: {
        bool: function(type) {
            return function(queries) {
                var ret = { bool: {} }
                ret.bool[type] = queries;
                return ret;
            };
        },
        match: function(type) {
            return function(value) {
                return function(key, props) {
                    key = simplify(key);

                    if (Array.isArray(key)) {
                        return {
                            'multi_match': Object.assign({
                                query: value,
                                fields: key
                            }, props)
                        };
                    }

                    var qry = Object.assign({}, props || {}, { query: value });
                    var ret = { };
                    ret[type] = {};
                    ret[type][key] = qry;
                    return ret;
                };
            };
        }
    },
    term: function(value) {
        return function(key, props) {
            value = simplify(value);
            key = simplify(key);

            if (Array.isArray(value)) {
                return tpl.bool.should(value.map(function(val) {
                    return tpl.term(val)(key);
                }), props);
            }

            if (Array.isArray(key)) {
                return tpl.bool.should(key.map(function(k) {
                    return tpl.term(val)(k);
                }), props);
            }

            var ret = { term: {} };
            ret.term[key] = Object.assign({}, props || {}, { value: value });
            return ret;
        };
    },
    match: function() {
        return tpl.raw.match('match').apply(tpl, Array.prototype.slice.call(arguments));
    },
    matchPhrase: function() {
        return tpl.raw.match('match_phrase').apply(tpl, Array.prototype.slice.call(arguments));
    },
    bool: {
        should: function(queries) {
            return tpl.raw.bool('should')(queries);
        },
        must: function(queries) {
            return tpl.raw.bool('must')(queries);
        },
        mustNot: function(queries) {
            return tpl.raw.bool('must_not')(queries);
        }
    },
    range: function(value) {
        return function(key, props) {
            key = simplify(key);

            if (Array.isArray(key)) {
                return tpl.bool.should(key.map(function(k) {
                    return tpl.range(val)(k);
                }), props);
            }

            var ret = { range: {} };
            ret.range[key] = Object.assign({}, props || {}, value);
            return ret;
        }
    }
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

ElasticService.prototype.search = function(term, page, pageSize, callback) {
    page = Math.max(0, page || 0);
    pageSize = Math.min(pageSize || defaultPageSize, maxPageSize);

    var that = this;
    var query = tpl.bool.should([
        // match the exact filename or title
        tpl.match(term)([ 'key', 'title' ], { analyzer: 'keyword', boost: 100, _name: 'exact' }),

        // match the filename prefix
        tpl.match(term)([ 'key.prefix', 'title.prefix' ], { boost: 90 }),

        // match the encoded pattern
        tpl.matchPhrase(term)('input', { boost: 80 }),

        // loosely match anything
        tpl.match(term)([ 'key', 'title', 'output', 'input' ], { boost: 30 }),

        // try to match anything
        tpl.bool.should([
            tpl.match(term)([ 'key.prefix^10', 'output.prefix', 'input.prefix' ]),
            tpl.match(term)([ 'key.ngram', 'output.ngram', 'input.ngram' ])
        ], { boost: 10 }),

        // most desperate cases, forgive typos up to 2 characters in either input or output without overdoing it
        tpl.match(term)([ 'output', 'input' ], { minimum_should_match: '80%', fuzziness: 2 })
    ]);

    client.search({
        index: config.indexName,
        type: config.documentType,
        body: {
            from: page * pageSize,
            size: pageSize,
            query: query,
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
        size: 1000
    }).then(function(result) {
        callback(null, that.formatResultSet(result));
    }).catch(callback);
};

ElasticService.prototype.getTree = function(callback) {
    this.findAll(function(err, hits) {
        if (err) {
            return callback(err);
        }

        hits.forEach(function(hit) {
            hit.relativeKey =  hit.key.replace('TermDlg.FoundTexts.', '');
            hit.parentKey = hit.relativeKey.substring(0, hit.relativeKey.lastIndexOf('.'));
            hit.selfKey = hit.relativeKey.substring(hit.relativeKey.lastIndexOf('.') + 1);
        });

        var tree = _.groupBy(hits, 'parentKey');

        callback(null, tree);
    });
};

module.exports = ElasticService;
