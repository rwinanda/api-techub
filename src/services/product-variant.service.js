import { insertProductVariantValue } from "../repositories/product-variant-value.repository.js";
import { insertProductVariant } from "../repositories/product-variant.repository.js"

// export const addProductVariantService = async (idProduct, variantName, client) => {
export const addProductVariantService = async (idProduct, variantList, client) => {
    // Response for json
    const respVariant = []
    const respValue = []
    
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
            const valuesResult = await insertProductVariantValue({
                    id_variant: variantResult.id_variant,
                    value_name: values.value_name
                },
                client
            )
            respValue.push(valuesResult)
        }
    }
    
    return {
        "respVariant": respVariant,
        "respValue": respValue,
    }
}