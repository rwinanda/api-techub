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

const buildWhereClause = (filters) => {
    const conditions = [];
    const values = [];
    let index = 1;

    if (filters.search) {
        conditions.push(`p.name_product ILIKE $${index++}`);
        values.push(`%${filters.search}%`);
    }

    if (filters.id_category !== undefined) {
        conditions.push(`p.id_category = $${index++}`);
        values.push(filters.id_category);
    }

    if (filters.min_price !== undefined) {
        conditions.push(
            `(SELECT MIN(ps.price) FROM product_skus ps WHERE ps.id_product = p.id_product) 
            >= $${index++}`
        );
        values.push(filters.min_price);
    }

    if (filters.max_price !== undefined) {
        conditions.push(
            `(SELECT MIN(ps.price) FROM product_skus ps WHERE ps.id_product = p.id_product) <= $${index++}`
        );
        values.push(filters.max_price);

    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND')}` : '';

    return {
        whereClause,
        values
    };
}

export const viewProduct = async (filters, limit, offset, client) => {
    const { whereClause, values } = buildWhereClause(filters);

    values.push(limit);
    values.push(offset);
    const query = `
        SELECT
            p.id_product,
            p.name_product,
            pp.picture_url,
            (SELECT MIN(ps.price) FROM product_skus ps WHERE ps.id_product = p.id_product) AS product_price,
            -- Average rating from product_reviews
            COALESCE(
                ROUND(
                    (SELECT AVG(pr.rating) FROM product_reviews pr WHERE pr.id_product = p.id_product)::numeric, 1
                ), 0
            ) AS avg_rating,
            -- Total reviews count
            (SELECT COUNT(*) FROM product_reviews pr WHERE pr.id_product = p.id_product) AS total_reviews,
            -- Total sold from paid orders
            COALESCE(
                (SELECT SUM(oi.quantity)
                FROM order_items oi
                JOIN orders o ON oi.id_order = o.id_order
                JOIN product_skus ps ON oi.id_product_sku = ps.id_product_sku
                WHERE ps.id_product = p.id_product
                AND o.status = 'paid'), 0
            ) AS total_sold
        FROM products p
        LEFT JOIN product_pictures pp
            ON p.id_product = pp.id_product AND pp.is_primary = true
        ${whereClause}
        ORDER BY p.created_at DESC
        LIMIT $${values.length - 1} OFFSET $${values.length}
    `

    // const productsQuery = await client.query("SELECT * FROM products LIMIT $1 OFFSET $2", [limit, offset]);
    const result = await client.query(query, values);
    return result.rows;
}

export const pageProduct = async (filters, client) => {
    const { whereClause, values } = buildWhereClause(filters);

    const query = `
        SELECT COUNT(*) AS total
        FROM products p 
        LEFT JOIN categories c ON p.id_category = c.id_category
        ${whereClause}
    `;

    const result = await client.query(query, values);
    return result.rows[0].total;    
}

// Detail product by id
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

// check product by id
export const getProductById = async (idProduct, client) => {
    const query = `SELECT id_product, name_product FROM products WHERE id_product = $1`;

    const result = await client.query(query, [idProduct]);

    return result.rows[0] || null
}