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

export const getProductService = async (filters, page, limit, client) => {
    // Validate page & limit
    if (isNaN(page) || page < 1) {
        throw new ValidationError('Page must be a positive number', '01');
    }

    if (isNaN(limit) || limit < 1) {
        throw new ValidationError('Limit must be a positive number', '02');
    }

    // Validate price range
    if (filters.min_price && filters.max_price && filters.min_price > filters.max_price) {
        throw new ValidationError('min_price cannot be greater than max_price', 'INVALID_PRICE_RANGE');
    }

    const offset = (page - 1) * limit // 0

    const [products, totalData] = await Promise.all([
        viewProduct(filters, limit, offset, client),
        pageProduct(filters, client)
    ]);

    // Format response data
    const formattedProducts = products.map(product => ({
        id_product: product.id_product,
        name_product: product.name_product,
        picture_url: product.picture_url,
        product_price: parseInt(product.product_price) || 0,
        // max_price: parseInt(product.max_price) || 0,
        avg_rating: parseFloat(product.avg_rating) || 0,
        total_reviews: parseInt(product.total_reviews) || 0,
        total_sold: parseInt(product.total_sold) || 0
    }))


    return {
        products: formattedProducts, total_data: parseInt(totalData)
    }
}

export const getProductByIdService = async (data) => {
    const {productId} = data;
    return await viewProductById(productId);
}