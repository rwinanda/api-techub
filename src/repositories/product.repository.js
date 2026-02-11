export const insertProduct = async (data, client) => {
    const productsQuery = "INSERT INTO products (id_category, name_product, description, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id_product, name_product" 
            
    const values = [
        data.id_category, data.name_product, data.description, data.is_active
    ]
    
    const result = await client.query(productsQuery, values)
    return result.rows[0]
}