// Load modules

var Code = require('code');
var Lab = require('lab');
var BasicAuth = require('hapi-auth-basic');
var Hueniversity = require('../lib');


// Declare internals
var internals = {
    createAuth: function (username, password) {
        return 'Basic ' + (new Buffer(username + ':' + password)).toString('base64');
    }
};


// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.experiment;
var expect = Code.expect;
var it = lab.test;


describe('/private', function () {

    it('requests authentication', function (done) {

        Hueniversity.init(0, function (err, server) {

            expect(err).to.not.exist();

            server.inject('/private', function (res) {

                expect(res.statusCode).to.equal(401);

                server.stop(done);
            });
        });
    });

    it('rejects invalid credentials', function (done) {

        Hueniversity.init(0, function (err, server) {

            expect(err).to.not.exist();

            server.inject({
                url: '/private',
                headers: {
                    authorization: internals.createAuth('wrong', 'wrong')
                }
            }, function (res) {

                expect(res.statusCode).to.equal(401);

                server.stop(done);
            });
        });
    });

    it('accepts valid credentials', function (done) {

        Hueniversity.init(0, function (err, server) {

            expect(err).to.not.exist();

            server.inject({
                url: '/private',
                headers: {
                    authorization: internals.createAuth('test', 'test')
                }
            }, function (res) {

                expect(res.statusCode).to.equal(200);
                expect(res.result).to.equal('Hello, test!');

                server.stop(done);
            });
        });
    });

    it('forwards an error if the registration of its dependencies fails', function (done) {

        var originalRegister = BasicAuth.register;

        BasicAuth.register = function (server, options, next) {

            BasicAuth.register = originalRegister;
            return next(new Error('hapi-auth-basic failed to register.'));
        };

        BasicAuth.register.attributes = {
            name: 'hapi-auth-basic-fake'
        };

        Hueniversity.init(0, function (err) {

            expect(err).to.exist();
            expect(err.message).to.equal('hapi-auth-basic failed to register.');

            done();
        });
    });
});
