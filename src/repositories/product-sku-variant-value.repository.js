export const insertProductSkuVariantValue = async (data, client) => {
    const skuVariantValueQuery = "INSERT INTO sku_variant_values (id_product_sku, id_value) VALUES ($1, $2) RETURNING id_product_sku, id_value";

    const values = [
        data.id_product_sku,
        data.id_value
    ];

    const result = await client.query(skuVariantValueQuery, values);

    return result.rowCount;
}

export const deleteSkuVariantValuesByProductId = async (idProduct, client) => {
    const query = `DELETE FROM sku_variant_values
        WHERE id_product_sku IN (
            SELECT id_product_sku FROM product_skus WHERE id_product = $1)`;
    
    await client.query(query, [idProduct]);
}