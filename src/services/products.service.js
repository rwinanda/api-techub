import { insertProduct, pageProduct, updateProductById, viewProduct, viewProductById } from "../repositories/product.repository.js";
import { ValidationError } from "../utils/error.js";

export const addProductService = async (payload, client) => {

    const { id_category, name_product, description, is_active } = payload;

    // Validation field for data type
    if (id_category !== undefined && isNaN(Number(id_category))) throw new ValidationError('id_category must be a number', '01');
    if ((name_product !== undefined && typeof name_product !== 'string') || (description !== undefined && typeof description !== 'string')) throw new ValidationError('name_product and description field must be a string', '02');
    if (is_active !== undefined && typeof is_active !== 'boolean') throw new ValidationError('is_active must be a boolean', '03');

    return insertProduct({
            id_category, name_product, description, is_active
        },
        client
    );
}

export const updateProductService = async (idProduct, payload, client) => {
    const { id_category, name_product, description, is_active } = payload;

    // Validation field for data type
    if (id_category !== undefined && isNaN(Number(id_category))) throw new ValidationError('id_category must be a number', '01');
    if ((name_product !== undefined && typeof name_product !== 'string') || (description !== undefined && typeof description !== 'string')) throw new ValidationError('this field must be a string', '02');
    if (is_active !== undefined && typeof is_active !== 'boolean') throw new ValidationError('is_active must be a boolean', '03');
    
    const fields = {};
    if (id_category !== undefined) fields.id_category = id_category;
    if (name_product !== undefined) fields.name_product = name_product;
    if (description !== undefined) fields.description = description;
    if (is_active !== undefined) fields.is_active = is_active;

    // no fields update
    if (Object.keys(fields).length === 0) return null;
    
    return updateProductById(idProduct, fields, client);
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