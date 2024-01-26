const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
module.exports = function(app, connection) {

    // Register endpoint will register a user
    // It uses bcrypt to hash the password
    // Also uses a regular expression to validate the email
    app.post('/register', async (req, res) => {
        try {
            console.log('Registering');

            // Validate the email
            if (!validateEmail(req.body.email)) {
                return res.status(400).send('Invalid email address');
            }

            // Verify if the account already exists
            const [rows] = await connection.promise().query(
                'SELECT username FROM account WHERE username = ?',
                [req.body.email]
            );
            if (rows.length > 0) {
                return res.status(400).send('Account already exists');
            }

            // Password length check
            if (req.body.password.length < 6) {
                return res.status(400).send('Password must be at least 6 characters long');
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(req.body.password, bcrypt.genSaltSync());

            // Insert the account into the database
            await connection.promise().query(
                'INSERT INTO account (username, password) VALUES (?, ?)',
                [req.body.email, hashedPassword]
            );

            res.status(201).send();
        } catch (err) {
            console.error(err);
            res.status(500).send('Error while processing request');
        }
    });

    // The login endpoints uses JWT to authenticate the user
    // It uses bcrypt to compare the password
    app.post('/login', async (req, res) => {
        try {
            console.log('Logging in');

            // Validate the email
            if (!validateEmail(req.body.email)) {
                return res.status(400).send('Invalid email address');
            }

            // Verify if the account exists
            const [rows] = await connection.promise().query(
                'SELECT * FROM account WHERE username = ?',
                [req.body.email]
            );
            if (rows.length === 0) {
                return res.status(400).send('Account does not exist');
            }

            // Check if the password matches
            const account = rows[0];
            const passwordMatch = await bcrypt.compare(req.body.password, account.password);
            if (!passwordMatch) {
                return res.status(400).send('Invalid password');
            }

            // Generate the JWT token
            const token = jwt.sign(
                { id: account.id, username: account.username },
                // retrieve the secret from the config file
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.json({ token });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error while processing request');
        }
    });

    // This endpoint will validate JWT tokens, returning the username (email)
    // if every conditions (valid exp. date, token...) is meet
    app.post('/validate-token', (req, res) => {
        console.log("Validating token");

        const { token } = req.body;

        if (!token) {
            return res.status(400).send('Token is required');
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const response = {
                username: decoded.username,
                exp: decoded.exp
            };

            res.json(response);
        } catch (err) {
            console.error(err);
            res.status(401).send('Invalid token');
        }
    });


}
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}