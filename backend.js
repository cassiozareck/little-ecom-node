module.exports = function(app, connection) {

    // GetProductByID endpoint
    app.get('/product/:id', (req, res) => {
        const id = req.params.id;
        // Validate that id is a number
        if (isNaN(parseInt(id, 10))) {
            return res.status(400).send('Invalid ID format');
        }
        // MySQL query to find the item
        const query = 'SELECT * FROM products WHERE id = ?';
        connection.query(query, [id], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }

            if (results.length === 0) {
                return res.status(404).send('Item not found');
            }

            const item = results[0];
            console.log('Item found', item);
            res.json(item);
        });
    })
}