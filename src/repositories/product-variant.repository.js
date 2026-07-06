export const insertProductVariant = async (data, client) => {
    const variantQuery = await client.query("INSERT INTO product_variants (id_product, variant_name, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING id_variant, variant_name", [data.id_product, data.variant_name]);

    return variantQuery.rows[0];
}

export const deleteVariantsByProductId = async (idProduct, client) => {
    const query = `DELETE FROM product_variants WHERE id_product = $1`;
    await client.query(query, [idProduct]);
}