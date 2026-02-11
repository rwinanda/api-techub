export const insertProductSku = async (data, client) => {
    const skuQuery = "INSERT INTO product_skus (id_product, sku, price, stock, sku_image_url, weight, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING id_product_sku";

    const values = [
        data.id_product, data.sku, data.price, data.stock, data.sku_image_url, data.weight, data.is_active
    ]

    const result = await client.query(skuQuery, values);
    return result.rows[0]
}   