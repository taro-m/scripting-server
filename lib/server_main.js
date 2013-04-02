// vim:set ts=8 sts=4 sw=4 tw=0:

var http = require('http');
var domain = require('domain');
var response = require('./response.js');
var scriptStore = require('./scriptStore.js');
var config = require('./config.js');

if (config.DEBUG) {
    scriptStore.DEBUG = true;
}

var server = http.createServer();
server.addListener('request', handleRequest);
server.listen(config.PORT);
console.log('Server running at http://127.0.0.1:' + config.PORT + '/');

function handleRequest(req, res) {
    var d = domain.create();
    d.add(req);
    d.add(res);

    d.on('error', function(err) {
        handleError(d, err, req, res);
    });

    d.run(function() {
        handleMain(d, req, res);
    });
}

function getHead(value) {
    var head = JSON.parse(JSON.stringify(value.head));
    if (config.DEBUG) {
        head[config.getXName('ResponseName')] = value.name;
    }
    return head;
}

function getSessionId(req) {
    return req.headers[config.getXName('SessionID').toLowerCase()];
}

function respond(d, res, value) {
    res.writeHead(value.code, getHead(value));
    res.end(JSON.stringify(value.body, null, (config.DEBUG ? 2 : 0)));
    res.on('close', function() {
        d.dispose();
    });
}

function handleError(d, err, req, res) {
    try {
        if (!(err instanceof response.Error)) {
            console.error(err.stack);
            err = new response.UnexpectedError(err);
        }
        // respond with JSON style contents.
        respond(d, res, err);
    } catch (er2) {
        console.error('Error handling error', er2, req.url);
        d.dispose();
    }
}

function handleMain(d, req, res) {
    var m;
    if (req.url === '/scripts' || req.url === '/scripts/') {
        handleRegisterScript(d, req, res);
    } else if ((m = req.url.match(/^\/scripts\/([^\/]+)$/))) {
        var scriptId = m[1];
        var sessionId = getSessionId(req);
        handleInvokeScript(d, req, res, scriptId, sessionId);
    } else {
        throw new response.InvalidRequestError;
    }
}

function readAll(stream, callback) {
    var body = '';
    if ('read' in stream) {
        stream.on('readable', function() {
            body += stream.read();
        });
    } else {
        stream.on('data', function(chunk) {
            body += chunk;
        });
    }
    stream.on('end', function() {
        callback(body);
    });
}

function handleRegisterScript(d, req, res) {
    if (req.method === 'PUT') {
        readAll(req, d.bind(function(body) {
            scriptStore.register(body, d.bind(function(value) {
                respond(d, res, value);
            }));
        }));
    } else {
        throw new response.InvalidMethodError;
    }
}

function handleInvokeScript(d, req, res, scriptId, sessionId) {
    if (req.method === 'POST') {
        readAll(req, d.bind(function(body) {
            var arg = JSON.parse(body);
            scriptStore.invoke(scriptId, arg, {
                max_step: config.MAX_STEP,
                on_init_context: d.bind(function(context) {
                    initContext(sessionId, context);
                }),
                on_finish: d.bind(function(value) {
                    respond(d, res, value);
                }),
            });
        }));
    } else {
        throw new response.InvalidMethodError;
    }
}

function initContext(sessionId, context) {
    context.API = config.getAPI(sessionId);
    //context.eval = function() { throw new Error('eval is not defined'); }
}
