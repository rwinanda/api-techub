const Database = require('../db/client');

exports.createProductVariants = async(req, res, next) => {
    try {
        const {product_id, variant_name } = req.body;
        const created_at = new Date().toISOString();
        const updated_at = created_at;

        const product = await Database.db.query("INSERT INTO product_variants (product_id, variant_name, created_at, updated_at) VALUES ($1, $2, to_timestamp($3, 'YYYY-MM-DD\"T\"HH24:MI:SS.MSZ'), to_timestamp($4, 'YYYY-MM-DD\"T\"HH24:MI:SS.MSZ')) RETURNING *", [product_id, variant_name, created_at, updated_at]);

        return res.status(201).json({
            status: 201,
            message: "Successfully Created Product Variants",
            data: product.rows
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Failed",
            error: error.message
        });
    }
}

exports.getProductVariants = async(req, res, next) => {
    try {
        console.log("1");
        const product = await Database.db.query("SELECT * FROM product_variants");
        console.log("product => ", product);

        return res.status(200).json({
            status: 200,
            message: "Successfully Get All data from Product Variants",
            data: product.rows
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Failed",
            error: error.message
        });
    }
}