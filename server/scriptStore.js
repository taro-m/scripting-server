// vim:set ts=8 sts=4 sw=4 tw=0:

var response = require('./response');

exports.register = function(rawScript, callback) {
    // TODO:
    process.nextTick(function() {
        callback(new response.OK);
    });
}

exports.invoke = function(id, arg, callback) {
    // TODO:
    process.nextTick(function() {
        callback(new response.OK);
    });
}
