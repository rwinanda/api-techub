import { deleteSkuVariantValuesByProductId } from "../repositories/product-sku-variant-value.repository.js";
import { deleteProductSkuById } from "../repositories/product-sku.repository.js";
import { insertProductVariantValue } from "../repositories/product-variant-value.repository.js";
import { deleteVariantsByProductId, insertProductVariant } from "../repositories/product-variant.repository.js"
import { ValidationError } from "../utils/error.js";
import { productSkuVariantService } from "./product-sku-variant.service.js";


const generateCombination = (tempVar) => {
    let result = [[]];

    for (let i = 0; i < tempVar.length; i++) {
        const temp = [];
        
        for (let j = 0; j < result.length; j++) {
            for (let k = 0; k < tempVar[i].length; k++) {
                const newCombo = [...result[j], tempVar[i][k]];
                temp.push(newCombo);
            }
        }
        result = temp;
    }

    return result;
}

export const addProductVariantService = async (idProduct, variantList, skuVariantList, client) => {
    // Response for json
    const respVariant = [];
    const respValue = [];
    const respSkuVal = [
        {
            id_product_sku: null,
            id_value: null
        }
    ];

    // save id value based on variant for generate combination
    let tempVar = [];

    // Empty array check for variant
    if (variantList.length === 0) throw new ValidationError('product_variant field must containt at least 1 variant', '09');
    
    // Add Variant for Products
    for (let i = 0;  i < variantList.length; i++) {
        const variant = variantList[i];

        // validation for variant name
        if (!variant.variant_name) throw new ValidationError('variant_name is required', '10');

        const variantResult = await insertProductVariant({
            id_product: idProduct,
            variant_name: variant.variant_name
        }, client)
        respVariant.push(variantResult);

        // Save id value
        let tempVal = [];

        // empty array check for variant value
        if (variant.value.length === 0) throw new ValidationError('value field in product_variant must contain at least 1 value', '11');

        // Add Variant Value for Products
        for (let j = 0; j < variant.value.length; j++) {
            const values = variant.value[j];

            // validation for variant value name
            if (!values.value_name) throw new ValidationError('value_name is required', '12')

            const valuesResult = await insertProductVariantValue(
                {
                    id_variant: variantResult.id_variant,
                    value_name: values.value_name
                },
                client
            )

            tempVal.push(valuesResult.id_value)
            respValue.push(valuesResult);
        }
        console.log("tempVal => ", tempVal)
        tempVar.push(tempVal);
    }

    // Combination of id variant value for SKU
    const combination = generateCombination(tempVar);
    
    // Insert product SKU based on Variant
    productSkuVariantService(combination, respValue, respSkuVal, skuVariantList, idProduct, client);

    return {
        "respVariant": respVariant,
        "respValue": respValue,
    }
}

export const updateProductVariantService = async (idProduct, variantList, skuVariantList, client) => {
    // Empty array check 
    if (variantList.length === 0) throw new ValidationError('product_variant field must containt at least 1 variant', '08');

    // Delete sku_variant_values first
    await deleteSkuVariantValuesByProductId(idProduct, client);
    await deleteVariantsByProductId(idProduct, client);
    await deleteProductSkuById(idProduct, client);

    // Re-insert new variant data
    return addProductVariantService(idProduct, variantList, skuVariantList, client);
}