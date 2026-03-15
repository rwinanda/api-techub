import Database from "../db/client.js";

export const insertProduct = async (data, client) => {
    const productsQuery = "INSERT INTO products (id_category, name_product, description, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id_product, name_product";
    
    const values = [
        data.id_category, data.name_product, data.description, data.is_active
    ]
    
    const result = await client.query(productsQuery, values)
    return result.rows[0]
}

export const viewProduct = async (limit, offset) => {
    const client = await Database.connect();

    const productsQuery = await client.query("SELECT * FROM products LIMIT $1 OFFSET $2", [limit, offset]);
    return productsQuery.rows;
}

export const pageProduct = async () => {
    const client = await Database.connect();

    const pageProductQuery = await client.query("SELECT COUNT(*) FROM products");
    console.log("total : ", pageProductQuery.rows[0].count)
    const totalPages = parseInt(pageProductQuery.rows[0].count);

    return totalPages;
}

export const viewProductById = async (productId) => {
    const client = await Database.connect();

    const products = `
    SELECT 
    pr.id_product, pr.name_product, pr.description, pr.is_active, ps.sku,
    pp.picture_url, pp.is_primary,
    ps.price, ps.stock, ps.weight, ps.is_active, pv.id_variant, pv.variant_name, 
    vv.id_value, vv.name_value 
    FROM products pr
    LEFT JOIN product_skus ps ON pr.id_product = ps.id_product
    LEFT JOIN product_pictures pp on pr.id_product = pp.id_product
    LEFT JOIN product_variants pv ON pr.id_product = pv.id_product
    LEFT JOIN variant_values vv ON pv.id_variant = vv.id_variant
    WHERE pr.id_product = $1
    `;
    
    const result = await client.query(products, [productId]);
    console.log("result : ", result.rows[0])
    return result.rows[0];
}