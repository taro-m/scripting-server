// vim:set ts=8 sts=4 sw=4 tw=0:

var http = require('http');
var domain = require('domain');

var server = http.createServer();
server.addListener('request', handleRequest);
server.listen(8080);

function handleRequest(req, res) {
    var d = domain.create();
    d.add(req);
    d.add(req);
    d.on('error', function(er) { handleError(d, req, res, er); });
    d.run(function() {
        var timeoutId = setTimeout(d.bind(function() {
            handleTimeout(d, req, res)
        }), 1000);
        main(d, req, res);
        clearTimeout(timeoutId);
    });
}

function handleError(d, er, req, res) {
    try {
        res.writeHead(500);
        res.end('Error occured, sorry.');
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

function main(d, req, res) {
    console.log('#main: enter');
    while (true) {
    }
    res.writeHead(200);
    res.end('Completed.');
    res.on('close', function() {
        d.dipose();
    });
    console.log('#main: leave');
}
