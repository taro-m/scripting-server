// vim:set sts=2 sw=2 tw=0 et:

exports.DEBUG = true;

exports.VENDOR = 'Me'

exports.PORT = 8080;

exports.MAX_STEP = 1000;

exports.getXName = function(name)
{
  return 'X-' + exports.VENDOR + '-' + name;
}

exports.getAPI = function(session)
{
  // TODO: return API functions.
  return {
  };
}
