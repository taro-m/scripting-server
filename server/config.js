// vim:set ts=8 sts=4 sw=4 tw=0:

exports.DEBUG = true;

exports.VENDOR = 'Me'

exports.PORT = 8080;

exports.getXName = function(name) {
    return 'X-' + exports.VENDOR + '-' + name;
}
