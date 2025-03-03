const Database = require('../db/client');

// Create New Product
exports.addProducts = async (req, res, next) => {
    try {
        const {name_product, description, category_id } = req.body;
        const created_at = new Date().toISOString();
        const updated_at = created_at;
        const products = await Database.db.query(
            "INSERT INTO products (name_product, description, category_id, created_at, updated_at) VALUES ($1, $2, $3, to_timestamp($4, 'YYYY-MM-DD\"T\"HH24:MI:SS.MSZ'), to_timestamp($5, 'YYYY-MM-DD\"T\"HH24:MI:SS.MSZ')) RETURNING *", [name_product, description, category_id, created_at, updated_at]
        );
        
        return res.status(201).json({
            status: 201,
            message: 'Product Created Successfuully',
            data: products.rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'failed',
            error: error.message
        });
    }
}

// Get All Product
exports.getProducts = async (req, res, next) => {
    try {
        const products = await Database.db.query(
            "SELECT * FROM products"
        );

        return res.status(200).json({
            status: 200,
            message: "Get Product Data",
            data: products.rows
        })
    } catch(err) {
        return res.status(500).json({
            message: 'Failed',
            status: 500,
            error: err.message
        });
    }
}