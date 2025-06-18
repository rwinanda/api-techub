const Database = require("../db/client");
const { addVariantValues, addVariantSKU, editVariantValues, editVariantSKU } = require("./variant-values");

// Create Product Variant
exports.createProductVariants = async (
    parsedData, product_id, respProdVar, respSkuValue, respVarValue, req,  created_at, updated_at
) => {    
    // Array for SKU Value
    const tempVar = []; // [[128GB, 256GB], [Red, Blue]]

    for(const prodVar of parsedData){
        const { product_variant, sku_value } = prodVar; // value

        // Skip the fuction when without product variant
        if (!product_variant) {
            continue;
        }

        // Array product_variant
        for(const variant of product_variant) {
            const {variant_name, value} = variant; // value

            // Step 1. Insert Product Variant to get variant_id
            try {
                const productVariant = await Database.db.query(
                    "INSERT INTO product_variants (product_id, variant_name, created_at, updated_at) VALUES ($1, $2, to_timestamp($3,'YYYY-MM-DD\"T\"HH24:MI:SS.MSZ'), to_timestamp($4, 'YYYY-MM-DD\"T\"HH24:MI:SS.MSZ')) RETURNING variant_id, variant_name",
                    [product_id, variant_name, created_at, updated_at]
                );
                // Return variant_id
                const variantId = productVariant.rows[0].variant_id;
                // Push to array to get respon for insert product_variant
                respProdVar.push(variantId);
                
                // Step 2 Add Value Variant
                await addVariantValues(variantId, value, created_at, updated_at, tempVar, respVarValue, req.files)
            } catch (error) {
                console.log("Database error => ", error.message)
            }
        }
        // Step 3 Add Variant SKU
        await addVariantSKU(tempVar, sku_value, created_at, updated_at, respSkuValue);
    }
};

exports.editProductVariants = async (parsedData, productId, respProdVar, respSkuValue, respVarValue, req, updated_at) => {
    for(const prodVar of parsedData){
        const { product_variant, 
            sku_value 
        } = prodVar; // value

        if (product_variant) {   
            // Array product_variant
            for(const variant of product_variant) {
                const {
                    variant_id,
                    variant_name, 
                    value
                } = variant; // value

                // Edit Product Variant 
                try {
                    const productVariant = await Database.db.query(
                        `
                        UPDATE product_variants SET variant_name = $1, 
                        updated_at = to_timestamp($2, 'YYYY-MM-DD"T"HH24:MI:SS.MSZ')
                        WHERE product_id = $3 AND variant_id = $4 RETURNING *;
                        `, [variant_name, updated_at, productId, variant_id]
                    );

                    console.log("rows => ", productVariant.rows)
                    // Push to array to get respon for insert product_variant
                    respProdVar.push(productVariant.rows);
                    
                    // Edit Value Variant
                    await editVariantValues(value, updated_at, respVarValue, req.files)
                } catch (error) {
                    console.log("Database error => ", error.message)
                }
            }
        }

        if(sku_value){
        // Step Edit Variant SKU
        await editVariantSKU(sku_value, updated_at, respSkuValue);
    }
    }
}

exports.getProductVariants = async (req, res) => {
    try {
    const product = await Database.db.query("SELECT * FROM product_variants");
    return res.status(200).json({
        status: 200,
        message: "Successfully Get All data from Product Variants",
        data: product.rows,
    });
    } catch (error) {
    return res.status(500).json({
        status: 500,
        message: "Failed",
        error: error.message,
    });
    }
};