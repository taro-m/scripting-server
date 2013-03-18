// vim:set ts=8 sts=4 sw=4 tw=0:

exports.Response = function() {
    this.name = 'Response';
    this.code = 0;
    this.head = {
        'Content-Type': 'application/json',
    };
    this.body = null;
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
