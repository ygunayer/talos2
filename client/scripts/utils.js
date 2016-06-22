
var debounce = function(timeout, fn) {
    var t;
    return function() {
        var args = arguments;
        clearTimeout(t);
        t = setTimeout(function() {
            fn.apply(fn, Array.prototype.slice.call(args));
        }, timeout);
    };
};

var ellipsis = function(text, length, suffix) {
    suffix = suffix || '...';
    text = (text || '').toString();
    if (text.length < length) {
        return text;
    }
    return text.substring(0, length - suffix.length) + suffix;
}

module.exports = {
    debounce: debounce,
    ellipsis: ellipsis
};
