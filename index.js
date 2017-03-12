try {
  var defaultCo = require('co');
} catch (err) {}

module.exports = function wrap(gen, co) {
  if (!co) co = defaultCo.wrap;

  var fn = co(gen);

  if (gen.length === 4) {
    return function(err, req, res, next) {
      var isParam = !(err instanceof Error);
      var callNextRoute = next;
      if (isParam) {
        callNextRoute = res;
      }
      return fn(err, req, res, next).catch(e => setImmediate(() => {
	    if(callNextRoute.called) callNextRoute.called = false; // Prevent issue with Restify's once(next)
	    callNextRoute(e);
	  }));
    }
  }

  return function(req, res, next) {
    return fn(req, res, next).catch(e => setImmediate(() => {
	  if(next.called) next.called = false; // Prevent issue with Restify's once(next)
	  next(e);
	}));
  };
};
