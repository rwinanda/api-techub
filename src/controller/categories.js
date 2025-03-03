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
            message: 'Success created category',
            data: category.rows[0],
            status: 201
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Failed',
            status: 500,
            error: error.message
        });
    }
    
}

exports.getCategory = async (req, res, next) => {
    try {
        const category = await Database.db.query("SELECT * FROM categories");
        console.log(category.rows);
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
        const { category_id } = req.params.categoryId;
        const category = await Database.db.query("SELECT * FROM categroies WHERE category_id = $1", [category_id]);
        console.log(category);

    } catch (error) {
        return res.status(500).json({
            message: 'Failed',
            status: 500,
            error: error.message
        });   
    }
}