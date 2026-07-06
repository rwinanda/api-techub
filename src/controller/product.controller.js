import Database from "../db/client.js"
import { deleteProduct } from "../repositories/product.repository.js";
import { addPictureProductService, updatePictureProductService } from "../services/product-picture.service.js";
import { addProductSkuService, updateProductSkuService } from "../services/product-sku.service.js";
import { addProductVariantService, updateProductVariantService } from "../services/product-variant.service.js";
import { addProductService, getProductByIdService, getProductService, updateProductService } from "../services/products.service.js";
import { NotFoundError, ValidationError } from "../utils/error.js";

export const addProduct = async (req, res, next) => {
    const client = await Database.connect();

    try {
        await client.query('BEGIN');
        
        // JSON Body
        const picsList = req.body.image_url;
        const productSkuList = req.body
        const variantList = req.body.product_variant;
        const skuVariantList = req.body.sku_variant;

        // Service Product
        const product = await addProductService(req.body, client);
        const productId = product.id_product;

        if (!productId) throw new ValidationError('Product ID is required', '04')

        const picture = await addPictureProductService(productId, picsList, client); 
        
        let productSku = null;
        let variant = null

        // Condition when product have variant
        if (variantList && variantList.length > 0) {
            variant = await addProductVariantService(productId, variantList, skuVariantList, client);
        } else {
            productSku = await addProductSkuService(productId, productSkuList, client);
        }

        await client.query('COMMIT');

        return res.status(201).json({
            status: 201,
            message: 'Product created succesfully',
            errorCode: "00",
            data: {
                id_product: productId,
                name_product: product.name_product,
                id_picture: picture.id_picture,
                ...(productSku && { id_product_sku: productSku.id_product_sku }),
                ...(variant && {
                    id_variant: variant.respVariant,
                    id_value: variant.respValue
                })
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
}

export const updateProduct = async (req, res, next) => {
    const client = await Database.connect();

    try {
        await client.query('BEGIN');
        
        const { productId } = req.params;

        // Validate for productId
        if (!productId) throw new ValidationError('Product ID is required', "01");
        
        // Validation for empty body
        if (!req.body || Object.keys(req.body).length === 0) {
            throw new ValidationError('Request body cannot be empty', "02");
        }

        // JSON body (optional)
        const picsList = req.body.image_url;
        const variantList = req.body.product_variant;
        const skuVariantList = req.body.sku_variant;
        const skuProduct = req.body.sku;
        const price = req.body.price;
        const stock = req.body.stock;
        const weight = req.body.weight;
        const sku_image_url = req.body.sku_image_url;
        const is_active_sku = req.body.is_active_sku;

        // Update basic product info
        const product = await updateProductService(productId, req.body, client);

        // Validation for product not found
        if (!product) {
            throw new NotFoundError('Product not found', "03");
        };

        // Update images only
        let picture = null;
        if (picsList && picsList.length > 0) {
            picture = await updatePictureProductService(productId, picsList, client);
        }

        // Conflict check can't send variant and SKU at the same time
        const hasSkuFields = skuProduct !== undefined || price !== undefined || stock !== undefined || weight !== undefined || sku_image_url !== undefined || is_active_sku !== undefined;
        const hasVariantFields = variantList && variantList.length > 0;

        if (hasSkuFields && hasVariantFields) {
            throw new ValidationError('Cannot update SKU and product_variant fields at the same time. Please choose one to update.', "04");
        }

        // Update when condition with or without variant
        let variant = null;
        let productSku = null;

        if (hasVariantFields) {
            variant = await updateProductVariantService(productId, variantList, skuVariantList, client);
        } else if (hasSkuFields) {
            productSku = await updateProductSkuService(productId, { 
                sku: skuProduct,
                price: price, 
                stock: stock, 
                weight: weight, 
                sku_image_url:sku_image_url, 
                is_active_sku:is_active_sku
            }, client)
        }

        await client.query('COMMIT');

        return res.status(200).json({
            status: 200,
            message: 'Product updated succesfully',
            errorCode: "00",
            data: {
                id_product: productId,
                ...(product && { name_product: product.name_product}),
                ...(picture && {picsResp: picture.picsResp}),
                ...(productSku && { id_product_sku: productSku.id_product_sku }),
                ...(variant && {
                    id_variant: variant.respVariant,
                    id_value: variant.respValue
                })
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
}

export const deleteProductByID = async (req, res, next) => {
    const client = await Database.connect();

    try {
        await client.query('BEGIN');
        const { productId } = req.params;

        if (!productId) throw new ValidationError('productId is required', '02');

        const products = await deleteProduct(productId, client);

        if (!products) throw new NotFoundError('Product not found', "01");
        
        await client.query('COMMIT');

        return res.status(200).json({
            status: 200,
            message: 'Product deleted succesfully',
            errorCode: "00",
        });
    } catch (error) {
        next(error);
    }
}

export const getProduct = async (req, res, next) => {
    try {
        const productList = await getProductService(req.query);

        if (!productList) {
            return res.status(404).json({
                status: 404,
                message: "Products not found"
            })
        }

        return res.status(200).json({
            status: 200,
            data: {
                data: productList,
                pagination: productList.totalPages
            }
        })
    } catch (error) {
        next(error);
    } 
}

export const getProductById = async (req, res, next) => {
    try {
        const productDetail = await getProductByIdService(req.params);  

        if (!productDetail) {
            return res.status(404).json({
                status: 404,
                message: 'Product not found'
            });
        };

        return res.status(200).json({
            status: 200,
            data: productDetail
        })
    } catch (error) {
        next(error)
    }
}