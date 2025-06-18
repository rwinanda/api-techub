const Database = require("../db/client");
const { createProductVariants, editProductVariants } = require("./product-variants");
const { uploadPictureProducts } = require("./product-pictures");
// const MB = 20 * 1024 * 1024;

exports.addProductsWithPicture = async (req, res) => {
  try {
    // Get Primary JSON
    const parsedDataArray = JSON.parse(req.body.data);

    if (!Array.isArray(parsedDataArray) || !parsedDataArray.length) {
      return res.status(400).json({
        status: 400,
        message: "Invalid data format: must be a non-empty array"
      });
    }

    const parsedData = parsedDataArray[0];
    const { 
      name_product, 
      description, 
      category_id, 
      stock, 
      price, 
      weight 
    } =
      parsedData;

    const created_at = new Date().toISOString();
    const updated_at = created_at;
    const image = req.files;
    console.log("image => ", image)
    // const image = req.files;


    // Store all uploaded image names for response
    const uploadedImages = [];
    // To save respon for insert data
    const respProdVar = [];
    const respVarValue = [];
    const respSkuValue = [];
    
    // Condition when image not uploaded
    if (!image) {
      return res.status(400).json({
        status: 400,
        message: "No image uploaded",
      });
    }

    // Condition if category is not inputed
    if(!category_id || !name_product || !description || !category_id || !stock || !price || !weight ){
      return res.status(400).json({
        status: 400,
        message: "You should fill the form body"
      });
    }

    // Step 1: Insert product first to get product_id
    const products = await Database.db.query(
      "INSERT INTO products (name_product, description, category_id, stock, price, weight, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, to_timestamp($7,'YYYY-MM-DD\"T\"HH24:MI:SS.MSZ'), to_timestamp($8, 'YYYY-MM-DD\"T\"HH24:MI:SS.MSZ')) RETURNING product_id, name_product",
      [
        name_product,
        description,
        category_id,
        stock,
        price,
        weight,
        created_at,
        updated_at,
      ]
    );

    const productId = products.rows[0].product_id; 

    // Step 2 Upload Picture Products
    await uploadPictureProducts(productId, image, uploadedImages, 'insert')

    const productArray = Array.isArray(parsedData) ? parsedData : [parsedData];

    // Step 3 Create Product Variant
    await createProductVariants(
      productArray, 
      productId, 
      respProdVar, 
      respSkuValue, 
      respVarValue, 
      req, 
      created_at, 
      updated_at
    )

    // Respon for Products and Pictures
    const productPics = {
      product: products.rows[0],
      image: uploadedImages
    };

    return res.status(201).json({
      status: 201,
      message: "Product and variants Created Successfuully",
      data: {
        productPics, 
        product_variant: respProdVar,
        variant_value: respVarValue,
        sku_value: respSkuValue
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "failed",
      error: error.message,
    });
  }
};

// Get All Data Product
exports.getProducts = async (req, res) => {
  try {
    const products = await Database.db.query("SELECT * FROM products");

    return res.status(200).json({
      status: 200,
      message: "Get Product Data",
      data: products.rows,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed",
      status: 500,
      error: err.message,
    });
  }
};

// Get Data Product by id
exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const productQuery = `
    SELECT 
    pr.product_id, pr.name_product, pr.description, 
    pv.variant_name, pv.variant_id, vv.value, ps.price, ps.stock
    FROM products pr
    LEFT JOIN product_variants pv ON pr.product_id = pv.product_id
    LEFT JOIN variant_values vv ON pv.variant_id = vv.variant_id
    LEFT JOIN product_sku ps ON vv.value_id = ps.value_id_1
    LEFT JOIN product_sku ps ON vv.value_id = ps.value_id_2
    WHERE pr.product_id = $1
    ORDER BY pv.variant_id ASC
    `;

    const products = await Database.db.query(productQuery, [productId]);

    // condition if product is not found
    if (products.rows.length < 1) {
      return res.status(404).json({
        status: 404,
        message: "product_id not found",
      });
    }

    // Object for product
    const productData = {
      productId: products.rows[0].product_id,
      name_product: products.rows[0].name_product,
      description: products.rows[0].description,
      product_variants: [],
    };

    // Create map for store variants
    const variantMap = new Map();

    // Looping for avoid dupplicate processing
    for (let i = 0; i < products.rows.length; i++) {
      // Check if the varian_id is exist
      if (!products.rows[i].variant_id) continue;

      // Mapping variant to variantMap
      if (!variantMap.has(products.rows[i].variant_id)) {
        variantMap.set(products.rows[i].variant_id, {
          variant_name: products.rows[i].variant_name,
          variant_value: [],
        });
      }

      // Push object to array variant_value
      variantMap.get(products.rows[i].variant_id).variant_value.push({
        value_name: products.rows[i].value,
        price_sku: products.rows[i].price,
        stock: products.rows[i].stock,
      });
    }

    // convert map to array
    productData.product_variants = Array.from(variantMap.values());

    return res.status(200).json({
      status: 200,
      message: "Success to get product by id",
      data: productData,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed",
      error: error.message,
    });
  }
};

// New Edit Product
exports.editProducts = async (req, res) => {
  try {
    
    const { productId } = req.params;
    const parsedDataArray = JSON.parse(req.body.data);
    const image = req.files;
    
    if (!Array.isArray(parsedDataArray) || !parsedDataArray.length) {
      return res.status(400).json({
        status: 400,
        message: "Invalid data format: must be a non-empty array"
      });
    }

    const parsedData = parsedDataArray[0] 
    const { name_product, description, category_id, stock, price, weight } =
      parsedData;
    const updated_at = new Date().toISOString();

    // To save respon for insert data
    const respProdVar = [];
    const respVarValue = [];
    const respSkuValue = [];
    const uploadedImages = [];

    const fields = [];
    const values = [];
    let index = 1;

    // Check which fields are sent by the client
    if (name_product !== undefined) {
      fields.push(`name_product = $${index}`);
      values.push(name_product);
      index++;
    }
    if (description !== undefined) {
      fields.push(`description = $${index}`);
      values.push(description);
      index++;
    }
    if (category_id !== undefined) {
      fields.push(`category_id = $${index}`);
      values.push(category_id);
      index++;
    }
    if (stock !== undefined) {
      fields.push(`stock = $${index}`);
      values.push(stock);
      index++;
    }
    if (price !== undefined) {
      fields.push(`price = $${index}`);
      values.push(price);
      index++;
    }
    if (weight !== undefined) {
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

    // Add for productId
    values.push(productId);
    console.log("value product => ", values)


    const updateQuery = `
      UPDATE products SET ${fields.join(", ")}
      WHERE product_id = $${index}
      RETURNING *;
    `;

    const products = await Database.db.query(updateQuery, values);

    // Condition when product_id is not found
    if (products.rows.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "Product is not found",
      });
    }

    const productResp = products.rows[0];

    // Update for Pictures product
    if(image) {
      await uploadPictureProducts(productId, image, uploadedImages, 'update');
    }

    const productArray = Array.isArray(parsedData) ? parsedData : [parsedData];

    // Edit for product variants
    await editProductVariants(
      productArray, 
      productId, 
      respProdVar, 
      respSkuValue, 
      respVarValue, 
      req,
      updated_at
    );

    return res.status(201).json({
      status: 201,
      message: "Product has been updated",
      data: {
        productResp,
        uploadedImages,
        respProdVar,
        respVarValue,
        respSkuValue
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Server Failed",
      error: error.message,
    });
  }
};

// Delete Product
exports.deleteProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Database.db.query(
      "DELETE FROM products WHERE product_id = $1 RETURNING *",
      [productId]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "Product is not found",
      });
    }

    return res.status(200).json({
      status: 200,
      message: `Product With an id = ${productId} has been deleted`,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

// Get Picture by id
exports.getPictureById = async (req, res) => {
  try {
    const { productId } = req.params;

    // Query for picture general
    const queryPictureGeneral = `SELECT pr.product_id, pr.name_product, pp.picture_url FROM products pr 
    JOIN product_pictures pp ON pr.product_id = pp.product_id WHERE pr.product_id = $1`;

    // Query for picture values
    const queryPictureValues = `SELECT pr.product_id, pr.name_product, vv.value, vv.picture_values FROM products pr LEFT JOIN product_variants pv ON pr.product_id = pv.product_id INNER JOIN variant_values vv ON pv.variant_id = vv.variant_id WHERE pr.product_id = $1`;

    const [generalResult, valueResult] = await Promise.all([
      Database.db.query(queryPictureGeneral, [productId]),
      Database.db.query(queryPictureValues, [productId]),
    ]);

    // condition if product is not found
    if (generalResult.rows.length < 1) {
      return res.status(404).json({
        status: 404,
        message: "pictures not found",
      });
    }

    // Object product pictures
    const productPictures = {
      productId: generalResult.rows[0].product_id,
      nameProduct: generalResult.rows[0].name_product,
      pictureGeneral: [],
      value: [],
    };

    // map for value
    const valueMap = new Map();

    // Looping for pictureGeneral
    for (let i = 0; i < generalResult.rows.length; i++) {
      productPictures.pictureGeneral.push(generalResult.rows[i].picture_url);
    }

    // Looping for pictureValues
    for (let a = 0; a < valueResult.rows.length; a++) {
      valueMap.set(a, {
        name_values: valueResult.rows[a].value,
        pictureValues: valueResult.rows[a].picture_values,
      });
    }

    // Convert Array to Map
    productPictures.value = Array.from(valueMap.values());

    return res.status(200).json({
      status: 200,
      message: "Success to get picture by id",
      data: productPictures,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
