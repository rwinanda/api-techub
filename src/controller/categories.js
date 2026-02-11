import Database from "../db/client.js";

// Add Category Data

export const addCategory = async (req, res) => {
    try {
        const { category_name } = req.body;
        const category = await Database.query(
            "INSERT INTO categories (category_name, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING *", [category_name]
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

// Get All Category Data
export async function getCategory(req, res){
    try {
        const category = await Database.query("SELECT * FROM categories");
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

// Get Category Data by Id
export async function getCategoryId(req, res){
    try {
        const category_id  = req.params.categoryId;
        const category = await Database.query(
            "SELECT ct.id_category, ct.category_name, pr.name_product FROM categories ct LEFT JOIN products pr ON ct.id_category = pr.id_category WHERE ct.id_category = $1", [category_id]
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

// Update category by id
export async function updateCategoryById(req, res){
    try {
        const {categoryId} = req.params;
        const {category_name} = req.body;
        const category = await Database.query("UPDATE categories SET category_name = $1 WHERE category_id = $2 RETURNING *", [category_name, categoryId]);

        console.log(category.rows);

        // if(category.rows.length === 0) {
        //     return res.status(401).json({
        //         status: 401,
        //         message: `Categroy with id ${categoryId} is not found`
        //     });
        // }

        return res.status(200).json({
            status: 200,
            message: `Category id ${categoryId} sucessfully update`,
            data: category.rows
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            error
        })
    }
}

// Delete Category by id
export async function deleteCategory(req, res){
    try {
        const {categoryId} = req.params;
        const category = await Database.query("DELETE FROM categories WHERE category_id = $1 RETURNING *", [categoryId]);

        // Condition if category id is not found
        if(category.rows.length === 0) {
            return res.status(401).json({
                status: 401,
                message: "Category id is not found"
            });
        }
        
        return res.status(200).json({
            status: 200,
            message: `Category with ${categoryId} Successfully deleted!!!` 
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Internal Server Error",
            error: error.message
        });   
    }
}