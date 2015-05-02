// Load modules
var BasicAuth = require('hapi-auth-basic');
var Util = require('util');
var Hoek = require('hoek');
var Users = require('./users.json');

// Declare internals

var internals = {
    validate: function (username, password, callback) {
        var account = Users.filter(function (user) {
            return user.username === username && user.password === password;
        });

        if (account.length) {
            return callback(null, true, account[0]);
        }

        return callback(null, false);
    }
};


exports.register = function (server, options, next) {

    server.register(BasicAuth, function (err) {

        if (err) {
            return next(err);
        }

        server.auth.strategy('simple', 'basic', { validateFunc: internals.validate });

        server.route({
            method: 'GET',
            path: '/private',
            config: {
                description: 'Returns a welcome message to the authenticated user',
                auth: 'simple',
                handler: function (request, reply) {
                    return reply(Util.format('Hello, %s!', Hoek.escapeHtml(request.auth.credentials.username)));
                }
            }
        });

        return next();

    });
};

exports.register.attributes = {
    name: 'private'
};
