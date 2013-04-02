// vim:set ts=8 sts=4 sw=4 tw=0:

var KEYFUNC = '_sys';

var vm = require('vm');
var crypto = require('crypto');
var response = require('./response.js');
var weaver = require('./weaver.js');

var scriptTable = {};

exports.DEBUG = false;
exports.register = function(rawScript, callback) {
    var id = getHash(rawScript);
    try {
	var weaved = weaver.weave(rawScript, KEYFUNC);
        var script = vm.createScript(weaved);
    } catch (err) {
        throw new response.ScriptCompileError(err);
    }
    if (exports.DEBUG) {
	console.log('Register id:' + id + ' script:' + weaved);
    }
    scriptTable[id] = script;
    process.nextTick(function() {
        callback(new response.ScriptAdded(id));
    });
}

exports.invoke = function(id, arg, options) {
    var script = scriptTable[id];
    if (!script) {
        throw new response.ScriptNotFoundError(id);
    }
    var context = {
        arg: arg,
        retval: {},
    };
    var step = 0;
    if ('max_step' in options) {
        var max = options.max_step;
        context[KEYFUNC] = function() {
            if (++step > max) {
                throw new Error("over count");
            }
        }
    }
    if ('on_init_context' in options) {
        options.on_init_context(context);
    }
    try {
        script.runInNewContext(context);
    } catch (err) {
        throw new response.ScriptExecuteError(err, id);
    }
    process.nextTick(function() {
        if ('on_finish' in options) {
            options.on_finish(
                new response.ScriptExecuted(id, context.retval));
        }
    });
}

function getHash(data) {
    var shasum = crypto.createHash('sha1');
    shasum.update(data);
    return shasum.digest('hex');
}
