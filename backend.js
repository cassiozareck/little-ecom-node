module.exports = function(app, connection, checkLogin) {

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

    // GetProducts will return all products
    app.get('/products', (req, res) => {
        const query = 'SELECT * FROM products';
        connection.query(query, (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }

            console.log('Found', results.length, 'items');
            res.json(results);
        });
    });

    // UpdateProduct will update a product by its ID
    app.put('/product/:id', checkLogin, (req, res) => {
        const id = req.params.id;
        const { price, name } = req.body;

        // Validate the product data
        if (price < 0 || price > 99999 || name === '') {
            return res.status(400).send('Invalid product data');
        }

        const query = 'UPDATE product SET price = ?, name = ? WHERE id = ?';
        connection.query(query, [price, name, id], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }

            if (results.affectedRows === 0) {
                return res.status(404).send('Item not found');
            }

            console.log('Item updated');
            res.status(204).send();
        });
    });

    // BuyProduct will buy a product by its ID
    app.post('/product/:id/buy', checkLogin, (req, res) => {
        const id = req.params.id;
        const query = 'DELETE FROM product WHERE id = ?';
        connection.query(query, [id], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }

            if (results.affectedRows === 0) {
                return res.status(404).send('Item not found');
            }

            console.log('Item deleted');
            res.status(204).send();
        });
    });

    // AddProduct endpoint will be protected by checkLogin middleware
    app.post('/product', checkLogin, (req, res) => {
        const owner = req.username.split('@')[0];
        const { price, name} = req.body;

        // Validate the product data
        if (price < 0 || price > 99999 || name === '') {
            return res.status(400).send('Invalid product data');
        }

        const query = "INSERT INTO product (owner, name, price) VALUES (?, ?, ?)";
        connection.query(query, [owner, name, price], (error, results, fields) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).send('Internal Server Error');
            }
            res.status(201).send({ id: results.insertId, owner, name, price });
        });
    });

    // RemoveProduct will remove a product by its ID
    app.delete('/product/:id', checkLogin, (req, res) => {
        const id = req.params.id;
        const query = 'DELETE FROM product WHERE id = ?';
        connection.query(query, [id], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }

            if (results.affectedRows === 0) {
                return res.status(404).send('Item not found');
            }

            console.log('Item deleted');
            res.status(204).send();
        });
    });

}