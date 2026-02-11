import { insertProduct } from "../repositories/product.repository.js";

export const addProductService = async (payload, client) => {
    const { id_category, name_product, description, is_active } = payload;

    return insertProduct({
            id_category, name_product, description, is_active
        },
        client
    );
}