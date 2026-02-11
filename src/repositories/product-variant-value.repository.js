export const insertProductVariantValue = async (data, client) => {
    const varValueQuery = await client.query(`INSERT INTO variant_values (
            id_variant, name_value, created_at, updated_at
        ) VALUES (
            $1, $2, NOW(), NOW()
        ) RETURNING id_value`, [data.id_variant, data.value_name]);
    return varValueQuery.rows[0]
}