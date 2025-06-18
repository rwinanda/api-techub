const Database = require('../db/client');
const { uploadPicturesValues } = require('./product-pictures');

exports.addVariantValues = async (variantId, value, created_at, updated_at, tempVar, respVarValue, files) => {
    let tempVal = [];    // Looping for value_variant
    for(let i = 0; i < value.length; i++) {
        const item = value[i];
        let value_name, picture_values;
        
        const pictureFile = files?.[`picture-value-${i}`];
        // Condition when using picture value
        if(item.picture){
            value_name = item.value_name;
            const imageName = await uploadPicturesValues(pictureFile)
            picture_values = imageName
            
        } else {
            value_name = item.value_name;
            picture_values = null;
        }
        
        const valueQuery = "INSERT INTO variant_values (variant_id, value, picture_values, created_at, updated_at) VALUES ($1, $2, $3, to_timestamp($4,'YYYY-MM-DD\"T\"HH24:MI:SS.MSZ'), to_timestamp($5, 'YYYY-MM-DD\"T\"HH24:MI:SS.MSZ')) RETURNING value_id" 
        const valueVariant = await Database.db.query(valueQuery, [variantId, value_name, picture_values, created_at, updated_at]);

        // Push to get respon for insert value_variant
        respVarValue.push(valueVariant.rows[0]);
        // Push to array value
        tempVal.push(valueVariant.rows[0].value_id)
    }
    // Push array value to array variant
    tempVar.push(tempVal);
    // Clear tempVal after push to tempVar
    tempVal = []
}

exports.addVariantSKU = async (tempVar, sku_value, created_at, updated_at, respSkuValue) => {
    let index = 0;
        // Step 3. Insert SKU
        for(let i = 0; i < tempVar[0].length; i++){
            for(let j = 0; j < tempVar[1].length; j++){
                const { price, weight, stock, sku_name } = sku_value[index];
                let value1 = tempVar[0][i]; // For value id 1
                let value2 = tempVar[1][j]; // For Value id 2

                // Insert to database
                const skuQuery = "INSERT INTO product_sku (value_id_1, value_id_2, price, stock, weight, sku_name, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, to_timestamp($7,'YYYY-MM-DD\"T\"HH24:MI:SS.MSZ'), to_timestamp($8, 'YYYY-MM-DD\"T\"HH24:MI:SS.MSZ')) RETURNING *" 
                const skuResult = await Database.db.query(skuQuery, [value1, value2, price, weight, stock, sku_name, created_at, updated_at]);

                respSkuValue.push(skuResult.rows[0]); // Save to array respon SKU Value
                index++
            }
        }
}

exports.editVariantValues = async(value, updated_at, respVarValue, image) => {
    for (let i = 0; i < value.length; i++) {
        const valueId = value[i].value_id;
        const valueName = value[i].value_name
        const pictureFile = image?.[`picture_${i}`];

        // console.log("value id ", i, " => ", valueId);

        // Condition when update value name
        if(valueName){
            const variantValue = await Database.db.query(
                `
                UPDATE variant_values SET value = $1, updated_at = to_timestamp($2, 'YYYY-MM-DD"T"HH24:MI:SS.MSZ') WHERE value_id = $3 RETURNING *;
                `,
                [valueName, updated_at, valueId]
            );
            
            // Respon for variant value
            respVarValue.push(variantValue.rows[0])
        }

        // Condition when update picture
        if (pictureFile) {
            const picValue = await uploadPicturesValues(pictureFile);
            const pictureQueries = await Database.db.query( `
            UPDATE variant_values SET picture_values = $1, updated_at = to_timestamp($2, 'YYYY-MM-DD"T"HH24:MI:SS.MSZ') WHERE value_id = $3 RETURNING *;
            `, [picValue, updated_at, valueId]);
            
            // Respon for variant value
            respVarValue.push(pictureQueries.rows[0])
        }
    }
}

exports.editVariantSKU = async(sku_value, updated_at, respSkuValue) => {
    for(let i = 0; i < sku_value.length; i++) {
        console.log("sku value => ", sku_value)
        const item = sku_value[i];

        const skuId = item.sku_id;
        const sku_name = item.sku_name;
        const price = item.price;
        const stock = item.stock;
        const weight = item.weight;

        const fields = []; // field for SET query
        const values = []; // for value 
        let index = 1; // index for query

        if (sku_name !== undefined){
            fields.push(`sku_name = $${index}`);
            values.push(sku_name);
            index++;
        }
        if (price !== undefined){
            fields.push(`price = $${index}`);
            values.push(price);
            index++
        }
        if (stock !== undefined){
            fields.push(`stock = $${index}`);
            values.push(stock);
            index++;
        }
        if (weight !== undefined){
            fields.push(`weight = $${index}`);
            values.push(weight);
            index++;
        }

        // Update for updated_at
        fields.push(
        `updated_at = to_timestamp($${index}, 'YYYY-MM-DD"T"HH24:MI:SS.MSZ')`
        );
        values.push(updated_at);
        index++;

        values.push(skuId)


        console.log("field => ", fields)
        console.log("index => ", index)
        console.log("values => ", values)

        const skuQuery = await Database.db.query(`
            UPDATE product_sku SET ${fields.join(", ")}
            WHERE sku_id = $${index} RETURNING *;
        `, values)

        respSkuValue.push(skuQuery.rows[0])

        console.log("query => ", skuQuery.rows);
    }
}
