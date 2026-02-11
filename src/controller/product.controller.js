import Database from "../db/client.js"
import { addPictureProductService } from "../services/product-picture.service.js";
import { addProductSkuService } from "../services/product-sku.service.js";
import { addProductVariantService } from "../services/product-variant.service.js";
import { addProductService } from "../services/products.service.js";

export const addProduct = async (req, res, next) => {
    const client = await Database.connect()

    try {
        await client.query('BEGIN');
        
        // Add Product
        const product = await addProductService(req.body, client);
        // Add Product SKU
        const productSku = await addProductSkuService(product.id_product, req.body, client);

        // JSON Picture 
        const picsList = req.body.image_url;

        // Add Picture
        const picture = await addPictureProductService(product.id_product, picsList, client);

        // JSON Body variant
        const variantList = req.body.product_variant;
        
        // Add Variant for Products
        const variant = await addProductVariantService(product.id_product, variantList, client);

        await client.query('COMMIT');

        return res.status(201).json({
            status: 201,
            message: 'Product created succesfully',
            data: {
                id_product: product.id_product,
                name_product: product.name_product,
                id_product_sku: productSku.id_product_sku,
                id_picture: picture.id_picture,
                id_variant: variant.respVariant,
                id_value: variant.respValue
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release()
    }
}

