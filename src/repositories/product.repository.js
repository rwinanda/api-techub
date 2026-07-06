import Database from "../db/client.js";

export const insertProduct = async (data, client) => {
    const productsQuery = "INSERT INTO products (id_category, name_product, description, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id_product, name_product";
    
    const values = [
        data.id_category, data.name_product, data.description, data.is_active
    ]
    
    const result = await client.query(productsQuery, values)
    return result.rows[0];
}

export const updateProductById = async (idProduct, fields, client) => {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    values.push(idProduct);

    const productQuery = `UPDATE products 
        SET ${setClause}, updated_at = NOW() 
        WHERE id_product = $${values.length} 
        RETURNING id_product, name_product`;

    const result = await client.query(productQuery, values);
    return result.rows[0];
}

export const deleteProduct = async (idProduct, client) => {
    const query = `DELETE FROM products WHERE id_product = $1 RETURNING *`;

    const result = await client.query(query, [idProduct]);
    return result.rows[0];
}

export const viewProduct = async (limit, offset) => {
    const client = await Database.connect();

    const productsQuery = await client.query("SELECT * FROM products LIMIT $1 OFFSET $2", [limit, offset]);
    return productsQuery.rows;
}

export const pageProduct = async () => {
    const client = await Database.connect();

    const pageProductQuery = await client.query("SELECT COUNT(*) FROM products");
    const totalPages = parseInt(pageProductQuery.rows[0].count);

    return totalPages;
}

export const viewProductById = async (productId) => {
    const client = await Database.connect();

    const products = `
    SELECT 
        pr.id_product, pr.name_product, pr.description, pr.is_active,
        
        -- Aggregate pictures jadi array
        json_agg(DISTINCT jsonb_build_object(
            'picture_url', pp.picture_url,
            'is_primary', pp.is_primary
        )) AS pictures,
        
        -- Aggregate SKUs
        json_agg(DISTINCT jsonb_build_object(
            'sku', ps.sku,
            'price', ps.price,
            'stock', ps.stock,
            'weight', ps.weight,
            'is_active', ps.is_active
        )) AS skus,

        -- Aggregate variants beserta values-nya
        json_agg(DISTINCT jsonb_build_object(
            'id_variant', pv.id_variant,
            'variant_name', pv.variant_name,
            'id_value', vv.id_value,
            'name_value', vv.name_value
        )) AS variants

    FROM products pr
    LEFT JOIN product_skus ps ON pr.id_product = ps.id_product
    LEFT JOIN product_pictures pp ON pr.id_product = pp.id_product
    LEFT JOIN product_variants pv ON pr.id_product = pv.id_product
    LEFT JOIN variant_values vv ON pv.id_variant = vv.id_variant
    WHERE pr.id_product = $1
    GROUP BY pr.id_product, pr.name_product, pr.description, pr.is_active
    `;
    
    const result = await client.query(products, [productId]);
    return result.rows[0];
}