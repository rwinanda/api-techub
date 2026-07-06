import { insertProductSkuVariantValue } from "../repositories/product-sku-variant-value.repository.js";
import { insertProductSku } from "../repositories/product-sku.repository.js";

export const productSkuVariantService = async (combination, respValue, respSkuVal, skuVariantList, idProduct, client) => {
    for (let i = 0; i < combination.length; i++) {
        const foundValues = combination[i].map(idValue => 
            respValue.find(value => value.id_value === idValue)
        );

        const skuName = foundValues.map(value => value.name_value).join('-');

        const skuVarTemp = {
            sku: skuName,
            price: skuVariantList[i].price,
            stock: skuVariantList[i].stock,
            sku_image_url: skuVariantList[i].sku_image_url,
            weight: skuVariantList[i].weight,
            is_active: skuVariantList[i].is_active_sku
        };

        // insert in SKU product 
        const skuValue = await insertProductSku({
            id_product: idProduct,
            ...skuVarTemp
        }, client);

        // Insert SKU Variant Value for every id_value in combination
        for (let j = 0; j < combination[i].length; j++) {
            const productSkuVar = await insertProductSkuVariantValue({
                id_product_sku: skuValue.id_product_sku,
                id_value: combination[i][j]
            }, client);

            respSkuVal.push({
                id_product_sku: productSkuVar.id_product_sku,
                id_value: productSkuVar
            })
        }
    }
}