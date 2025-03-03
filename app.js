const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const Database = require('./src/db/client');  
const productRoutes = require('./src/routes/products'); 
const orderRoutes = require('./src/routes/orders');
const userRoutes = require('./src/routes/users');
const categoryRoutes = require('./src/routes/categories');
// const sessionLogin = require('./src/services/sessionAuth');
const cookieParser = require('cookie-parser');

// Handling database authentication
async function authenticateDatabase() {
    try {
        await Database.db.connect();
        console.log('Database Connected');
    } catch (err) {
        console.error('Connection Error:', err.message);
        process.exit(1);
    }
}

// Call authenticate when server is start
authenticateDatabase();

// Log http request in the 'dev' format
app.use(morgan('dev'));

// Handling body-parse
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Handling CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Origin', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

// Configurasion library session
// app.use(sessionLogin);

app.use(cookieParser());

// Route handle request
app.use('/users', userRoutes);
app.use('/orders', orderRoutes);
app.use('/users', productRoutes);
app.use('/users', categoryRoutes);
    
// Customize error log
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;