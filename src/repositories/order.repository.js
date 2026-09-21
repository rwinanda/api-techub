
export const insertOrder = async (data, client) => {
    console.log(data)
    const query = `INSERT INTO orders (id_user, status, total_price, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id_order, id_user, status, total_price`;

    const result = await client.query(query, [data.id_user, data.status, data.total_price]);

    return result.rows[0];
}

export const insertOrderItems = async (id_order, cartItems, client) => {
    const values = [];
    const placeholders = cartItems.map((item, i) => {
        const base = i * 5;
        values.push(
            id_order,
            item.id_product_sku,
            item.quantity,
            item.price,
            item.price * item.quantity
        );
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, NOW(), NOW())`;
    });

    const query = `INSERT INTO order_items (id_order, id_product_sku, quantity, price, total_price, created_at, updated_at) VALUES ${placeholders.join(', ')}`;

    const result = await client.query(query, values);
    return result.rows;
}

export const updateOrderStatus = async (idOrder, data, client) => {
    const fields = [];
    const values = [];
    let index = 1;

    console.log(`data => `, data)
    console.log(`idOrder => ${idOrder}`)
    if (data.status !== undefined) {fields.push(`status = $${index++}`); values.push(data.status)};
    if (data.snap_token !== undefined) {fields.push(`snap_token = $${index++}`); values.push(data.snap_token)};
    if (data.payment_url !== undefined) {fields.push(`payment_url = $${index++}`); values.push(data.payment_url)};

    if (fields.length === 0) return null

    values.push(idOrder)
    console.log('Values => ', values)
    
    const query = `UPDATE orders SET ${fields.join(', ')}, updated_at = NOW() WHERE id_order = $${index}
    RETURNING id_order, status, snap_token, payment_url`;
    console.log(`wow repo 2 query`, query)
    console.log(`wow repo 2 field`, fields)

    const result = await client.query(query, values);
    
    console.log(`rowCount => `, result.rowCount);
    console.log(`result update order status -> `, result.rows[0])
    return result.rows[0];
}

export const getOrderBySnapToken = async (idOrder, client) => {
    // Get order with its item
    const orderQuery = `SELECT 
        o.id_order, o.id_user, o.status, o.total_price, o.snap_token, o.payment_url
        FROM orders o
        WHERE o.id_order = $1
    `;

    const orderResult = await client.query(orderQuery, [idOrder]);
    
    const order = orderResult.rows[0] || null;
    if(!order) return null;

    // Get from order items
    const itemQuery = `SELECT 
        id_order_item, id_product_sku, quantity, price, total_price
        FROM order_items
        WHERE id_order = $1 
    `;

    const itemResult = await client.query(itemQuery, [idOrder]);
    order.order_items = itemResult.rows;

    return order;
}

export const getOrdersByUserId = async (idUser, client) => {
    const query = `
        SELECT
            id_order,
            status,
            total_price,
            payment_url,
            created_at
        FROM orders
        WHERE id_user = $1
        ORDER BY created_at DESC
    `;

    const result = await client.query(query, [idUser]);

    return result.rows;
}

export const getOrdersById = async (idOrder, idUser, client) => {
    const query = `
        SELECT
            id_order,
            id_user,
            status,
            total_price,
            snap_token,
            payment_url,
            created_at
        FROM orders
        WHERE id_order = $1 AND id_user = $2
    `;

    const result = await client.query(query, [idOrder, idUser]);
    
    return result.rows[0] || null;  
}

export const getOrderItemsByOrderId = async (idOrder, client) => {
    const query = `
        SELECT
            oi.id_order_item,
            oi.id_product_sku,
            oi.quantity,
            oi.price,
            oi.total_price,
            p.name_product,
            pp.picture_url
        FROM order_items oi
        JOIN product_skus ps      ON oi.id_product_sku = ps.id_product_sku
        JOIN products p           ON ps.id_product = p.id_product
        LEFT JOIN product_pictures pp
            ON p.id_product = pp.id_product AND pp.is_primary = true
        WHERE oi.id_order = $1
        ORDER BY oi.created_at ASC
    `;

    const result = await client.query(query, [idOrder]);
    return result.rows;
}

// For Check if product SKU from this product was in the order
export const getOrderItemByProductAndOrder = async (idProduct, idOrder, client) => {
    console.log("masuk")
    // Check if product SKU from this product was in the order
    const query = `
        SELECT oi.id_order_item
        FROM order_items oi
        JOIN product_skus ps ON oi.id_product_sku = ps.id_product_sku
        WHERE ps.id_product = $1 AND oi.id_order = $2
        LIMIT 1
    `;
    const result = await client.query(query, [idProduct, idOrder]);
    return result.rows[0] || null;
}