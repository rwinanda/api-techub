export const insertPictureProduct = async (data, client) => {
    const picQuery = await client.query(`INSERT INTO product_pictures (
        id_product, picture_url, is_primary, created_at, updated_at
        ) VALUES (
            $1, $2, $3, NOW(), NOW()
            ) RETURNING id_picture`, [data.id_product, data.picture_url, data.is_primary]);

    return picQuery.rows[0]
}