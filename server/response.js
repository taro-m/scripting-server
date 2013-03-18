// vim:set ts=8 sts=4 sw=4 tw=0:

var config = require('./config');

exports.Response = function() {
    this.name = 'Response';
    this.code = 0;
    this.head = {
        'Content-Type': 'application/json',
    };
    this.body = null;

    this.addHeader = function(name, value) {
        this.head[name] = value;
    }
}

exports.OK = function() {
    this.name = 'OK';
    this.code = 200;
    this.body = null;
}
exports.OK.prototype = new exports.Response;

exports.Error = function() {
    this.name = 'Error';
    this.code = 500;
}
exports.Error.prototype = new exports.Response;

exports.UnexpectedError = function(cause) {
    this.name = 'UnexpectedError';
    this.cause = cause;
}
exports.UnexpectedError.prototype = new exports.Error;

exports.InvalidRequestError = function() {
    this.name = 'InvalidRequestError';
    this.code = 400;
}
exports.InvalidRequestError.prototype = new exports.Error;

exports.InvalidMethodError = function() {
    this.name = 'InvalidMethodError';
    this.code = 400;
}
exports.InvalidMethodError.prototype = new exports.Error;

exports.ScriptCompileError = function(err) {
    this.name = 'ScriptCompileError';
    this.code = 400;
    this.body = {
        'Message': err.message,
    };
}
exports.ScriptCompileError.prototype = new exports.Error;

exports.ScriptAdded = function(id) {
    this.name = 'ScriptAdded';
    this.code = 201;
    this.body = {
        'ID': id,
    };
    this.addHeader(config.getXName('ScriptID'), id);
}
exports.ScriptAdded.prototype = new exports.Response;

exports.ScriptNotFoundError = function(id) {
    this.name = 'ScriptNotFoundError';
    this.code = 404;
    this.body = {
        'ID': id,
    };
}
exports.ScriptNotFoundError.prototype = new exports.Error;

exports.ScriptExecuteError = function(err, id) {
    this.name = 'ScriptExecuteError';
    this.code = 400;
    this.body = {
        'Message': err.message,
        'ID': id,
    };
}
exports.ScriptExecuteError.prototype = new exports.Error;

exports.ScriptExecuted = function(id, retval) {
    this.name = 'ScriptExecuted';
    this.code = 200;
    this.body = {
        'ID': id,
        'return': retval,
    };
}
exports.ScriptExecuted.prototype = new exports.Response;
