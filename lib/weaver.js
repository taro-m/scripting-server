// vim:set ts=8 sts=4 sw=4 tw=0:

var util = require('util');
var UglifyJS = require('uglify-js');

exports.WeaveError = WeaveError

function WeaveError(err) {
    if ('line' in err && 'col' in err) {
        this.message = util.format('%s [%d,%d]',
                err.message, err.line, err.col);
    } else {
        this.message = err.message;
        //console.log(err.stack);
    }
}
WeaveError.prototype = new Error();

exports.weave = function(script, keyfunc) {
    try {
        return weave(script, keyfunc);
    } catch (err) {
        throw new WeaveError(err);
    }
}

function weave(script, keyfunc) {
    var ast = UglifyJS.parse(script, { toplevel: ast });
    var tt = new UglifyJS.TreeTransformer(null, function(node) {
	if (node instanceof UglifyJS.AST_Block) {
	    var body = [];
	    for (var i = 0; i < node.body.length; ++i) {
		body.push(UglifyJS.parse(keyfunc + '();'));
		body.push(node.body[i]);
	    }
	    if (body.length == 0) {
		body.push(UglifyJS.parse(keyfunc + '();'));
	    }
	    node.body = body;
	    return node;
	} else if (node instanceof UglifyJS.AST_StatementWithBody
		&& !(node.body instanceof UglifyJS.AST_Block)) {
	    node.body = UglifyJS.parse(
		'{' + keyfunc + '();'+node.body.print_to_string()+'}');
	    return node;
	}
    });
    var ast2 = ast.transform(tt);
    return ast2.print_to_string({ beautify: false });
}
