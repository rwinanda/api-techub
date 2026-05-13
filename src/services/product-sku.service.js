import { insertProductSku, updateProductSkuById } from "../repositories/product-sku.repository.js"
import { ValidationError } from "../utils/error.js";

export const addProductSkuService = async (idProduct, payload, client) => {
    const { sku, price, stock, sku_image_url, weight, is_active_sku } = payload
    
    // Variable to check if any required field is missing
    const isInValid = sku === undefined || price === undefined || stock === undefined || sku_image_url === undefined || weight === undefined || is_active_sku === undefined;

    // Variable to check if any field has empty data
    const isEmpty = (sku === '' || sku_image_url === '') || (price === '' || stock === '' || weight === '') || is_active_sku === '';

    // validation for required fields
    if (isInValid) throw new ValidationError('sku fields are required', '12');

    // validation for empty fields
    if (isEmpty) throw new ValidationError('some sku fields cannot be empty', '13');

    return insertProductSku({id_product: idProduct, sku, price, stock, sku_image_url, weight, is_active: is_active_sku}, client);
}

export const updateProductSkuService = async (idProduct, payload, client) => {
    const fields = {};

    // Invalid data type check
    if (payload.price !== undefined && isNaN(Number(payload.price))) throw new ValidationError('price must be a number', '05');
    if (payload.stock !== undefined && isNaN(Number(payload.stock))) throw new ValidationError('stock must be a number', '06');
    if (payload.weight !== undefined && isNaN(Number(payload.weight))) throw new ValidationError('weight must be a number', '07');

    if (payload.sku !== undefined) fields.sku = payload.sku
    if (payload.price !== undefined) fields.price = payload.price;
    if (payload.stock !== undefined) fields.stock = payload.stock;
    if (payload.sku_image_url !== undefined) fields.sku_image_url = payload.sku_image_url;
    if (payload.weight !== undefined) fields.weight = payload.weight;
    if (payload.is_active_sku !== undefined) fields.is_active = payload.is_active_sku;

    // No SKU fields sent — skip update
    if (Object.keys(fields).length === 0) return null;
    
    return updateProductSkuById(idProduct, fields, client);
}