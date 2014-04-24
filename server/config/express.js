var
expressJwt = require('express-jwt'),
secret     = require('./secret.json').secret;

module.exports = function (express, app) {

    // We are going to protect /api routes with JWT
    app.use('/api', expressJwt({secret: secret}));

    app.use(express.json());
    app.use(express.urlencoded());
    app.use('/', express.static(__dirname + '/../../'));

    app.use(function(err, req, res, next){
      if (err.constructor.name === 'UnauthorizedError') {
        res.send(401, 'Unauthorized');
      }
    });

}

