export const getCartByUserId = async (idUser, client) => {
    const query = `SELECT id_cart, id_user from carts WHERE id_user = $1`;

    const result = await client.query(query, [idUser]);
    return result.rows[0] || null; 
}

export const insertCart = async (idUser, client) => {
    const query = `INSERT INTO carts (id_user, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING id_cart`;

    const result = await client.query(query, [idUser]);
    return result.rows[0];
}

// check cart based on id_cart and id_product_sku
export const getCartItemByCartIdAndSkuId = async (idCart, idProductSku, client) => {
    const query = `SELECT id_cart_item, id_cart, id_product_sku, quantity FROM cart_items WHERE id_cart = $1 AND id_product_sku = $2`;

    const result = await client.query(query, [idCart, idProductSku]);
    return result.rows[0] || null;
}

export const insertCartItem = async (idCart, idProductSku, quantity, client) => {
    const query = `INSERT INTO cart_items (id_cart, id_product_sku, quantity, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id_cart_item, id_cart, id_product_sku, quantity`;

    const result = await client.query(query, [idCart, idProductSku, quantity]);
    return result.rows[0];
}

export const updateCartItemQuantity = async (idCart, quantity, client) => {
    const query = `
        UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id_cart_item = $2 RETURNING
        id_cart_item, id_cart, id_product_sku, quantity
    `;

    const result = await client.query(query, [quantity, idCart]);
    return result.rows[0];
}

export const getAllCartByIdUser = async (idCart, client) => {
    const query = `
        SELECT 
            ci.id_cart_item,
            ci.id_product_sku,
            ci.quantity,
            p.name_product,
            pp.picture_url,
            ps.price
        FROM cart_items ci
        JOIN product_skus ps ON ci.id_product_sku = ps.id_product_sku
        JOIN products p ON ps.id_product = p.id_product
        LEFT JOIN product_pictures pp on p.id_product = pp.id_product AND pp.is_primary = true
        WHERE ci.id_cart = $1
        ORDER BY ci.created_at ASC
    `;

    const result = await client.query(query, [idCart]);
    return result.rows;
}

// Check cart based on id_cart and id_cart_item
export const getCartItemByIdAndCartId = async (idCartItem, idCart, client) => {
    const query = `SELECT id_cart_item, id_cart, id_product_sku, quantity FROM cart_items WHERE id_cart = $1 AND id_cart_item = $2 `

    const result = await client.query(query, [idCart, idCartItem]);
    return result.rows[0];
}

export const deleteCartItemByUser = async (id_cart_item, client) => {
    const query = `DELETE FROM cart_items WHERE id_cart_item = $1 RETURNING id_cart_item`;

    const result = await client.query(query, [id_cart_item]);
    return result.rows[0];
}