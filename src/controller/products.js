const Database = require("../db/client");

// Create New Product
exports.addProducts = async (req, res, next) => {
  try {
    const { name_product, description, category_id, stock, price } = req.body;

    const created_at = new Date().toISOString();
    const updated_at = created_at;
    const products = await Database.db.query(
      "INSERT INTO products (name_product, description, category_id, stock, price, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, to_timestamp($6,'YYYY-MM-DD\"T\"HH24:MI:SS.MSZ'), to_timestamp($7, 'YYYY-MM-DD\"T\"HH24:MI:SS.MSZ')) RETURNING *",
      [
        name_product,
        description,
        category_id,
        stock,
        price,
        created_at,
        updated_at,
      ]
    );

    return res.status(201).json({
      status: 201,
      message: "Product Created Successfuully",
      data: products.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "failed",
      error: error.message,
    });
  }
};

// Get All Product
exports.getProducts = async (req, res, next) => {
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

// Get Product by id
exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    // const productQuery = `
    //     SELECT 
    //     pr.product_id, pr.name_product, pr.description, 
    //     pv.variant_name, pv.variant_id, vv.value
    //     FROM products pr
    //     LEFT JOIN product_variants pv ON pr.product_id = pv.product_id
    //     LEFT JOIN variant_values vv ON pv.variant_id = vv.variant_id
    //     WHERE pr.product_id = $1
    //     ORDER BY pv.variant_id ASC
    //     `;

    const productQuery =  `
    SELECT 
    pr.product_id, pr.name_product, pr.description, 
    pv.variant_name, pv.variant_id, vv.value, ps.price, ps.stock
    FROM products pr
    LEFT JOIN product_variants pv ON pr.product_id = pv.product_id
    LEFT JOIN variant_values vv ON pv.variant_id = vv.variant_id
    LEFT JOIN product_sku ps ON vv.value_id = ps.value_id
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
      variantMap
        .get(products.rows[i].variant_id)
        .variant_value.push(
          {
            value_name: products.rows[i].value,
            price_sku: products.rows[i].price,
            stock: products.rows[i].stock
          }
        );
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
      Database.db.query(queryPictureValues, [productId])
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
        value: []
    };

    // map for value
    const valueMap = new Map();

    // Looping for pictureGeneral
    for(let i = 0; i < generalResult.rows.length; i++) {
        productPictures.pictureGeneral.push(generalResult.rows[i].picture_url);
    }

    // Looping for pictureValues
    for(let a = 0; a < valueResult.rows.length; a++) {
      valueMap.set(a, {
        name_values: valueResult.rows[a].value,
        pictureValues: valueResult.rows[a].picture_values
      });
    }

    // Convert Array to Map
    productPictures.value = Array.from(valueMap.values());

    return res.status(200).json({
      status: 200,
      message: "Success to get picture by id",
      data: productPictures
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


