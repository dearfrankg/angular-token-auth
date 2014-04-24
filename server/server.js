var
express = require('express'),
app     = express(),
auth    = require('./controller/auth');
api     = require('./controller/api');

require('./config/express')(express, app);

// routes
// api routes protected -- see express config
app.post('/authenticate', auth.login);
app.get('/api/restricted', api.getName);



app.listen(8080, function () {
    console.log('listening on http://localhost:8080');
});
