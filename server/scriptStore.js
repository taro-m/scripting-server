// vim:set ts=8 sts=4 sw=4 tw=0:

var vm = require('vm');
var crypto = require('crypto');
var response = require('./response');
var config = require('./config');

var scriptTable = {};

exports.register = function(rawScript, callback) {
    var id = getHash(rawScript);
    var script;
    try {
        script = vm.createScript(convertScript(rawScript));
    } catch (err) {
        if (err instanceof SyntaxError) {
            throw new response.ScriptCompileError(err);
        }
    }
    scriptTable[id] = script;
    process.nextTick(function() {
        callback(new response.ScriptAdded(id));
    });
}

exports.invoke = function(id, arg, callback) {
    var script = scriptTable[id];
    if (!script) {
        throw new response.ScriptNotFoundError(id);
    }
    var context = {
        '_arg': arg,
        '_retval': {},
        'API': getAPI(),
    }
    try {
        script.runInNewContext(context);
    } catch (err) {
        throw new response.ScriptExecuteError(err, id);
    }
    process.nextTick(function() {
        callback(new response.ScriptExecuted(id, context._retval));
    });
}

function getHash(data) {
    var shasum = crypto.createHash('sha1');
    shasum.update(data);
    return shasum.digest('hex');
}

function convertScript(rawScript) {
    // TODO:
    return '_retval=(function(ARG){' + rawScript + '})(_arg)';
}

function getAPI() {
    // TODO: return API functions.
    return {
    };
}
