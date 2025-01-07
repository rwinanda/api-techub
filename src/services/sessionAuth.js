const session = require('express-session');

const sessionLogin = session({
        resave: false,
        saveUninitialized: false,
        secret: 'seslog',
        name: 'secretName',
        cookie: {
            httpOnly: true,
            maxAge: 6000
        }
});



module.exports = sessionLogin;