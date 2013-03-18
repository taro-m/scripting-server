// vim:set ts=8 sts=4 sw=4 tw=0:

var http = require('http');
var domain = require('domain');
var response = require('./response');
var scriptStore = require('./scriptStore');
var config = require('./config');

var server = http.createServer();
server.addListener('request', handleRequest);
server.listen(config.PORT);
console.log('Server running at http://localhost:' + config.PORT + '/');

function handleRequest(req, res) {
    var d = domain.create();
    d.add(req);
    d.add(res);

    d.on('error', function(er) {
        handleError(d, er, req, res);
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

function respond(d, res, value) {
    res.writeHead(value.code, getHead(value));
    res.end(JSON.stringify(value.body, null, (config.DEBUG ? 2 : 0)));
    res.on('close', function() {
        d.dispose();
    });
}

function handleError(d, er, req, res) {
    try {
        if (!(er instanceof response.Error)) {
            console.error(er.stack);
            er = new response.UnexpectedError(er);
        }
        // respond with JSON style contents.
        respond(d, res, er);
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
        handleInvokeScript(d, req, res, m[1]);
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
    if (req.method !== 'PUT') {
        throw new response.InvalidMethodError;
    }
    readAll(req, d.bind(function(body) {
        scriptStore.register(body, d.bind(function(value) {
            respond(d, res, value);
        }));
    }));
}

function handleInvokeScript(d, req, res, id) {
    if (req.method !== 'POST') {
        throw new response.InvalidMethodError;
    }
    readAll(req, d.bind(function(body) {
        var arg = JSON.parse(body);
        scriptStore.invoke(id, arg, d.bind(function(value) {
            respond(d, res, value);
        }));
    }));
}
