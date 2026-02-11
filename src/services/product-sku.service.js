import { insertProductSku } from "../repositories/product-sku.repository.js"

export const addProductSkuService = async (idProduct, payload, client) => {
    const { sku, price, stock, sku_image_url, weight, is_active_sku } = payload

    return insertProductSku({id_product: idProduct, sku, price, stock, sku_image_url, weight, is_active: is_active_sku}, client);
}