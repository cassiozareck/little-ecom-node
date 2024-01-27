const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

require('dotenv').config();

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set');
    return res.status(500).send('Internal Server Error');
}

const app = express();
app.use(bodyParser.json());
app.use((req, res, next) => {
    console.log(req.method, req.url);   // Visualize the flux
    next();
})

// This checkLogin function will be a middleware who will check if the user is logged in
// by looking for Bearer headers for the JWT token. It will then use /validate-token endpoint
// to validate the token and retrieve the username (email) from it.
function checkLogin(req, res, next) {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).send('Unauthorized');
    }

    const [authType, token] = authorization.split(' ');
    if (authType !== 'Bearer') {
        return res.status(401).send('Unauthorized');
    }

    // Call the /validate-token endpoint
    fetch('http://localhost:3000/validate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
    })
        .then(response => response.json())
        .then(data => {
            // If the token is valid, the username (email) will be returned
            // We will then add it to the request object and call next()
            req.username = data.username;
            next();
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
}

// MySQL connection setup
const connection = mysql.createConnection({
    host: '172.17.0.2',
    user: 'cassio',
    password: '123123',
    database: 'ecom-db'
});

// Connect to MySQL
connection.connect(err => {
    if (err) throw err;
    console.log('Connected to the MySQL server.');
});

require('./backend.js')(app, connection, checkLogin);
require('./auth.js')(app, connection);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

