// vim:set ts=8 sts=4 sw=4 tw=0:

var port = 8080;

var http = require('http');
var vm = require('vm');
var crypto = require('crypto');

var server = http.createServer();
server.addListener('request', processRequest);
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

function respondError(res, what) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    if (what) {
        res.end('Not found: ' + what + '\n');
    } else {
        res.end('Not found\n');
    }
}

function processRequest(req, res) {
    var m;
    if (req.url === '/scripts' || req.url === '/scripts/') {
        processRegister(req, res);
    } else if ((m = req.url.match(/^\/scripts\/([^\/]+)$/))) {
        processInvoke(req, res, m[1]);
    } else {
        respondError(res, 'entry point');
    }
}

function processRegister(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    if (req.method === 'PUT') {
        var body = '';
        req.on('data', function(chunk) {
            body += chunk;
        });
        req.on('end', function() {
            try {
                var id = registerScript(body);
                if (id) {
                    res.writeHead(201, {
                        'Content-Type': 'text/plain',
                        'Location': getURL('/scripts/' + id),
                    });
                    res.end('Registered as ' + id + '\n');
                } else {
                    respondError(res, 'valid Script ID');
                }
            } catch (e) {
                respondError(res, e);
            }
        });
    } else {
        respondError(res, 'valid method in processRegister');
    }
}

function registerScript(str) {
    var id = getHash(str);
    var script = vm.createScript(
            '_retval = (function(ARG){' + str + '})(_arg);');
    scriptTable[id] = script;
    return id;
}

function processInvoke(req, res, sid) {
    if (sid in scriptTable) {
        var script = scriptTable[sid];
        if (req.method === 'POST') {
            var body = '';
            req.on('data', function(chunk) {
                body += chunk;
            });
            req.on('end', function(end) {
                try {
                    var arg = JSON.parse(body);
                    invokeScript(res, script, arg);
                } catch (e) {
                    respondError(res, e);
                }
            });
        } else if (req.method === 'GET') {
            invokeScript(res, script, null);
        } else {
            respondError(res, 'valid method');
        }
    } else {
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
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(context._retval, null, 2));
    } catch (e) {
        respondError(res, e);
    }
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
