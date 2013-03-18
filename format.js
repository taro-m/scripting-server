// vim:set ts=8 sts=4 sw=4 tw=0:

var fs = require('fs');
var UglifyJS = require('uglify-js');

var file = process.argv[2];

var code = fs.readFileSync(file, 'utf-8');
var ast = UglifyJS.parse(code, {
    filename: file,
    toplevel: ast
});

var strings = {};

function newStatemnt(node) {
    return UglifyJS.parse('$("'+node.constructor.name+'");');
}

var tt = new UglifyJS.TreeTransformer(null, function(node) {
    if (node instanceof UglifyJS.AST_Block) {
        var body = [];
        body.push(newStatemnt(node));
        for (var i = 0; i < node.body.length; ++i) {
            body.push(newStatemnt(node.body[i]));
            body.push(node.body[i]);
        }
        body.push(newStatemnt(node));
        node.body = body;
        return node;
    }
});
var ast2 = ast.transform(tt);

console.log(ast2.print_to_string({ beautify: true }));
