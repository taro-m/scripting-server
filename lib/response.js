// vim:set sts=2 sw=2 tw=0 et:

var util = require('util');

module.exports = {
  OK: OK,
  ScriptAdded: ScriptAdded,
  ScriptExecuted: ScriptExecuted,

  Error: Error,
  UnexpectedError: UnexpectedError,
  InvalidRequestError: InvalidRequestError,
  InvalidMethodError: InvalidMethodError,
  ScriptCompileError: ScriptCompileError,
  ScriptNotFoundError: ScriptNotFoundError,
  ScriptExecuteError: ScriptExecuteError,
}

function Base(name)
{
  this.name = null;
  this.code = 0;
  this.head = {
    'Content-Type': 'application/json',
  };
  this.body = null;
}

Base.prototype.init = function(name, code)
{
  if (arguments.length >= 1) {
    this.name = arguments[0];
  }
  if (arguments.length >= 2) {
    this.code = arguments[1];
  }
}

////////////////////////////////////////////////////////////////////////////
// SUCCESS RESPONSE

util.inherits(OK, Base);

function OK()
{
  Base.call(this);
  this.init('OK', 200);
}

util.inherits(ScriptAdded, OK);

function ScriptAdded(id)
{
  OK.call(this)
  this.init('ScriptAdded', 201);
  this.head['X-ScriptID'] = id;
}

util.inherits(ScriptExecuted, OK);

function ScriptExecuted(id, retval)
{
  OK.call(this)
  this.init('ScriptExecuted', 200);
  this.body = {
    id: id,
    'return': retval,
  }
}

////////////////////////////////////////////////////////////////////////////
// FAILURE RESPONSE

util.inherits(Error, Base);

function Error()
{
  Base.call(this, 'Error', 500);
}

util.inherits(UnexpectedError, Error);

function UnexpectedError(err)
{
  Error.call(this)
  this.init('UnexpectedError', 500);
  this.body = {
    message: err ? err.message : undefined,
  };
}

util.inherits(InvalidRequestError, Error);

function InvalidRequestError()
{
  Error.call(this)
  this.init('InvalidRequestError', 400);
}

util.inherits(InvalidMethodError, Error);

function InvalidMethodError()
{
  Error.call(this)
  this.init('InvalidMethodError', 401);
}

util.inherits(ScriptCompileError, Error);

function ScriptCompileError(err)
{
  Error.call(this)
  this.init('ScriptCompileError', 400);
  this.body = {
    message: err ? err.message : undefined,
  };
}

util.inherits(ScriptNotFoundError, Error);

function ScriptNotFoundError(id)
{
  Error.call(this)
  this.init('ScriptNotFoundError', 404);
  this.body = {
    id: id,
  };
}

util.inherits(ScriptExecuteError, Error);

function ScriptExecuteError(err, id)
{
  Error.call(this)
  this.init('ScriptExecuteError', 400);
  this.body = {
    message: err ? err.message : undefined,
    id: id,
  };
}
