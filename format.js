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

function newStatemnt() {
    return UglifyJS.parse('$()');
}

var tt = new UglifyJS.TreeTransformer(null, function(node) {
    if (node instanceof UglifyJS.AST_Block) {
        var body = [];
        for (var i = 0; i < node.body.length; ++i) {
            body.push(newStatemnt());
            body.push(node.body[i]);
        }
        node.body = body;
        return node;
    } else if (node instanceof UglifyJS.AST_StatementWithBody
	    && !(node.body instanceof UglifyJS.AST_Block)) {
	node.body = UglifyJS.parse(
	    '{$();'+node.body.print_to_string()+'}');
	return node;
    }
});
var ast2 = ast.transform(tt);

console.log(ast2.print_to_string({ beautify: false }));
