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

require('./backend.js')(app, connection);
require('./auth.js')(app, connection);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});