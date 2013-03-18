// vim:set ts=8 sts=4 sw=4 tw=0:

var PORT = 8080;
var DEBUG = true;

var http = require('http');
var domain = require('domain');
var vm = require('vm');

var server = http.createServer();
server.addListener('request', handleRequest);
server.listen(PORT);
console.log('Server running at http://localhost:' + PORT + '/');

function handleRequest(req, res) {
    var d = domain.create();
    d.add(req);
    d.add(res);
    var timeoutId = setTimeout(d.bind(function() {
        handleTimeout(d, req, res)
    }), 1000);

    d.on('error', function(er) {
        handleError(d, er, req, res);
        clearTimeout(timeoutId);
    });

    d.run(function() {
        handleMain(d, req, res);
        clearTimeout(timeoutId);
    });
}

function handleError(d, er, req, res) {
    try {
        res.writeHead(500);
        res.end('Error occured, sorry.: ' + er);
        res.on('close', function() {
            d.dispose();
        });
    } catch (er) {
        console.error('Error handling error', er, req.url);
        d.dispose();
    }
}

function handleTimeout(d, req, res) {
    console.log('#handleTimeout');
    res.writeHead(501);
    res.end('Timeout.');
    res.on('close', function() {
        d.dispose();
    });
}

function execFunc(func) {
    var r = func();
    if ('next' in r) {
    }
    return r;
}

var script = vm.createScript('while(true) { _loopHook(); }');

function handleMain(d, req, res) {
    console.log('#handleMain: #1');

    script.runInNewContext({
        '_loopHook': loopHook,
    });
    console.log('#handleMain: #2');

    res.writeHead(200);
    res.end('Completed.');
    res.on('close', function() {
        d.dipose();
    });
    console.log('#handleMain: #3');
}

function loopHook() {
}
