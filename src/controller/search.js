const Database = require("../db/client");

exports.searchProduct = async(req, res) => {
    try {
        const { query } = req.query;
        // Query search by name product
        const searchQuery = `
        SELECT * FROM products WHERE name_product ILIKE $1
        `;

        // Query search by category product
        const searchByCategory = `
        SELECT pr.name_product
        FROM categories ct
        LEFT JOIN products pr ON ct.category_id = pr.category_id
        WHERE ct.category_name ILIKE $1
        `

        // query paramater
        const values = [`%${query}%`];

        const [products, categories] = await Promise.all([
            Database.db.query(searchQuery, values),
            Database.db.query(searchByCategory, values)
        ]);

        const searchProd = {
            data: []
        };

        // Looping to get data by name products
        for(let x=0; x < products.rows.length; x++) {
            searchProd.data.push(products.rows[x]);
        }

        // Looping to get data by category name
        for(let x=0; x < categories.rows.length; x++) {
            searchProd.data.push(categories.rows[x]);
        }

        // Condition if product not found
        if (searchProd.data.length < 1) {
            return res.status(404).json({
                status: 404, 
                message: "Product is not found"
            });
        }

        return res.status(200).json({
            status: 200,
            message: "Success search product",
            data: searchProd
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Failed',
            error: error.message
        });
    }
}