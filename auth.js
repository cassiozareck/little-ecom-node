const bcrypt = require('bcryptjs');
module.exports = function(app, connection) {
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
}
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}