const Database = require('../db/client');

// Create Product SKU
exports.createProductSku = async(req, res) => {
    try {
        const { product_id, value_id_1, value_id_2, sku_name, price, stock, weight } = req.body;
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;
        const productSku = await Database.db.query(
            "INSERT INTO product_sku (product_id, value_id_1, value_id_2, sku_name, price, stock, weight, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, to_timestamp($8, 'YYYY-MM-DD\"T\"HH24:MI:SS.MSZ'), to_timestamp($9, 'YYYY-MM-DD\"T\"HH24:MI:SS.MSZ')) RETURNING *", [product_id, value_id_1, value_id_2, sku_name, price, stock, weight, updatedAt, createdAt]
        );

        return res.status(201).json({
            status: 201,
            message: "Successfully Create Product SKU",
            data: productSku.rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            status:500,
            message: 'Failed',
            error: error.message
        });
    }
}

// Get All Product SKU
exports.getProductSku = async(req, res) => {
    try {
        // console.log("Fetching all product_sku data...");
        const products = await Database.db.query(
            "SELECT * FROM product_sku"
        );
        
        return res.status(200).json({
            status: 200,
            message: "Get Product Data",
            data: products.rows
        });
    } catch (error) {
        return res.status(500).json({
            status:500,
            message: 'Failed',
            error: error.message
        });
    }
}

// Get data product SKU by id
exports.getProductSkuById = async (req, res) => {
    try {
        const query = `
        SELECT pr.name_product, ps.price as price_sku, ps.stock as stock_sku, vv.value
        FROM products pr
        LEFT JOIN product_variants pv ON pr.product_id = pv.product_id
        INNER JOIN variant_values vv on pv.variant_id = vv.variant_id
        LEFT JOIN product_sku ps on vv.value_id = ps.value_id
        WHERE pr.product_id = 1
        `;

        const products = await Database.db.query(query)

        return res.status(200).json({
            status:200,
            message: "Success Get Data Product SKU by ID",
            data: products.rows
        })
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Failed",
            error: error.message
        });
    }
}   