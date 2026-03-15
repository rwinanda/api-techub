import { insertProductVariantValue } from "../repositories/product-variant-value.repository.js";
import { insertProductVariant } from "../repositories/product-variant.repository.js"
import { addProductSkuService } from "./product-sku.service.js";

export const addProductVariantService = async (idProduct, variantList, client) => {
    // Response for json
    const respVariant = []
    const respValue = []
    
    // Add Variant for Products
    for (let i = 0;  i < variantList.length; i++) {
        const variant = variantList[i];
        const variantResult = await insertProductVariant({
            id_product: idProduct,
            variant_name: variant.variant_name
        }, client)
        respVariant.push(variantResult);

        // Add Variant Value for Products
        for (let j = 0; j < variantList[i].value.length; j++) {
            const values = variantList[i].value[j];
            await insertProductVariantValue({
                    id_variant: variantResult.id_variant,
                    value_name: values.value_name
                },
                client
            )

            // Add SKU Value
            // const skuValue = await addProductSkuService({
            //     idProduct: idProduct,
                
            // })
            // respValue.push(valuesResult);
        }
    }
    
    return {
        "respVariant": respVariant,
        "respValue": respValue,
    }
}