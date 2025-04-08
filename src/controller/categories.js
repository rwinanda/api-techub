const Database = require('../db/client');

exports.addCategory = async (req, res, next) => {
    try {
        const { category_name } = req.body;
        const created_at = new Date().toISOString();
        const updated_at = created_at;
        const category = await Database.db.query(
            "INSERT INTO categories (category_name, created_at, updated_at) VALUES ($1, to_timestamp($2, 'YYYY-MM-DD\"T\"HH24:MI:SS.MSZ'), to_timestamp($3, 'YYYY-MM-DD\"T\"HH24:MI:SS.MSZ')) RETURNING *", [category_name, created_at, updated_at]
        );
    
        return res.status(201).json({
            status: 201,
            message: 'Success created category',
            data: category.rows[0]
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Failed',
            error: error.message
        });
    }
    
}

exports.getCategory = async (req, res, next) => {
    try {
        const category = await Database.db.query("SELECT * FROM categories");
        return res.status(200).json({
            message: "Success get category",
            status: 200,
            data: category.rows
        });
    } catch (error) {
        return res.status(500).json({
            message:"Failed",
            status: 500,
            error: error.message
        });
    }
}

exports.getCategoryId = async(req, res, next) => {
    try {
        const category_id  = req.params.categoryId;
        const category = await Database.db.query(
            "SELECT ct.category_id, ct.category_name, pr.name_product FROM categories ct LEFT JOIN products pr ON ct.category_id = pr.category_id WHERE ct.category_id = $1", [category_id]
        );

        if (category.rows.length < 1) {
            return res.status(404).json({
                status: 404,
                message: "Category Id is not found"
            });
        }

        const categoryProducts = {
            category_id: category.rows[0].category_id,
            category_name: category.rows[0].category_name,
            products: []
        }

        const categoryMap = new Map();

        for (let i = 0; i < category.rows.length; i++) {
            categoryMap.set(i,{
                product_name: category.rows[i].name_product
            });
        }

        categoryProducts.products = Array.from(categoryMap.values())

        return res.status(200).json({
            status: 200,
            message: 'Success to get category_id',
            data: categoryProducts
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Failed',
            error: error.message
        });   
    }
}