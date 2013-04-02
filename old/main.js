// vim:set ts=8 sts=4 sw=4 tw=0:

var port = 8080;

var http = require('http');
var vm = require('vm');
var crypto = require('crypto');

var server = http.createServer();
server.addListener('request', handleRequest);
server.listen(port);

var scriptTable = {};

function getURL(path) {
    // FIXME:
    return 'http://127.0.0.1:' + port + path;
}

function getHash(data) {
    var shasum = crypto.createHash('sha1');
    shasum.update(data);
    return shasum.digest('hex');
}

function readAll(stream, callback) {
    var body = '';
    stream.on('data', function(chunk) {
        body += chunk;
    });
    stream.on('end', function() {
        callback(body);
    });
}

function respondError(res, what) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    if (what) {
        res.end('Not found: ' + what + '\n');
    } else {
        res.end('Not found\n');
    }
}

function handleRequest(req, res) {
    var m;
    if (req.url === '/scripts' || req.url === '/scripts/') {
        handleRegister(req, res);
    } else if ((m = req.url.match(/^\/scripts\/([^\/]+)$/))) {
        handleInvoke(req, res, m[1]);
    } else {
        respondError(res, 'entry point');
    }
}

function handleRegister(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    if (req.method === 'PUT') {
        readAll(req, function(body) {
            var id;
            try {
                id = registerScript(body);
            } catch (e) {
                // ERROR: script compilation error.
                respondError(res, e);
                return;
            }
            res.writeHead(201, {
                'Content-Type': 'text/plain',
                'Location': getURL('/scripts/' + id),
                'X-Kii-ScriptID': id
            });
            res.end('Registered as ' + id + '\n');
        });
    } else {
        // ERROR: unsupported HTTP method.
        respondError(res, 'valid method in handleRegister');
    }
}

function registerScript(str) {
    var id = getHash(str);
    var script = vm.createScript(
            '_retval = (function(ARG){' + str + '})(_arg);');
    scriptTable[id] = script;
    return id;
}

function handleInvoke(req, res, sid) {
    if (sid in scriptTable) {
        var script = scriptTable[sid];
        if (req.method === 'POST') {
            readAll(req, function(body) {
                var arg = {}
                try {
                    arg = JSON.parse(body)
                } catch (e) {
                    // ERROR: invalid argument as JSON.
                    respondError(res, e);
                    return;
                }
                invokeScript(res, script, arg);
            });
        } else {
            // ERROR: unsupported HTTP method.
            respondError(res, 'valid method');
        }
    } else {
        // ERROR: script is not registered.
        respondError(res, 'valid script');
    }
}

function invokeScript(res, script, arg) {
    var context = {
        '_arg': arg,
        '_retval': {},
        'API': {
            'createObject': API_createObject,
            'average': API_average
        },
    };
    try {
        script.runInNewContext(context);
    } catch (e) {
        // ERROR: script execution error.
        respondError(res, e);
        return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(context._retval, null, 2));
}

function API_createObject(data) {
    return 'OBJECT_ID-' + data;
}

function API_average(dataset) {
    var NUM = dataset.length;
    var sum = 0;
    for (var i = 0; i < NUM; ++i) {
        sum += dataset[i] - 0;
    }
    return sum / NUM;
}

console.log('Server running at http://localhost:' + port + '/');
