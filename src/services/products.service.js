import { insertProduct, pageProduct, viewProduct, viewProductById } from "../repositories/product.repository.js";

export const addProductService = async (payload, client) => {

    const { id_category, name_product, description, is_active } = payload;

    return insertProduct({
            id_category, name_product, description, is_active
        },
        client
    );
}

export const getProductService = async (queryParam) => {
    const page = parseInt(queryParam.page) || 1 
    const limit = parseInt(queryParam.limit) || 10 // 10
    const offset = (page - 1) * limit // 0

    const products = await viewProduct(limit, offset);
    const totalPages = await pageProduct();

    return {
        products, totalPages
    }
}

export const getProductByIdService = async (data) => {
    const {productId} = data;
    return await viewProductById(productId);
}