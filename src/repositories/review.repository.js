export const getExistingReview = async (userId, idProduct, idOrder, client) => {
    const query = `SELECT id_review FROM product_reviews WHERE id_user = $1 AND id_product = $2 AND id_order = $3 `;

    const result = await client.query(query, [userId, idProduct, idOrder]);
    return result.rows[0] || null;
}

export const insertReview = async (data, client) => {
    const query = `
        INSERT INTO product_reviews (id_user, id_product, id_order, rating, review, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING id_review, id_product, id_order, rating, review, created_at
    `;

    const result = await client.query(query, [data.id_user, data.id_product, data.id_order, data.rating, data.review]);

    return result.rows[0];
}

export const getReviewsByProductId = async (idProduct, limit, offset, orderBy, client) => {
    const query = `
        SELECT
            pr.id_review,
            u.name AS user_name,
            pr.rating,
            pr.review,
            pr.created_at
        FROM product_reviews pr
        JOIN users u ON pr.id_user = u.id_user
        WHERE pr.id_product = $1
        ORDER BY ${orderBy}
        LIMIT $2 OFFSET $3
    `;

    const result = await client.query(query, [idProduct, limit, offset]);
    return result.rows;
}

export const countReviewsByProductId = async (idProduct, client) => {
    const query = `
        SELECT COUNT(*) AS total FROM product_reviews WHERE id_product = $1`;
    
    const result = await client.query(query, [idProduct]);
    return result.rows[0].total;
}

export const getReviewsByUserId = async (userId, limit, offset, client) => {
    const query = `
        SELECT 
            pr.id_review,
            pr.id_product,
            p.name_product,
            pp.picture_url,
            pr.rating,
            pr.review,
            pr.created_at
        FROM product_reviews pr
        JOIN products p ON pr.id_product = p.id_product
        LEFT JOIN product_pictures pp ON p.id_product = pp.id_product AND pp.is_primary = true
        WHERE pr.id_user = $1
        ORDER BY pr.created_at DESC
        LIMIT $2 OFFSET $3
    `;

    const result = await client.query(query, [userId, limit, offset]);
    return result.rows;
}

export const countReviewsByUserId = async (userId, client) => {
    const query = `
        SELECT COUNT(*) AS total FROM product_reviews WHERE id_user = $1
    `;

    const result = await client.query(query, [userId]);
    return result.rows;
}