import productRouter from './products.js'; 
import userRouter from './users.js';
import categoryRouter from './categories.js';
import productSkuRouter from './product-sku.js';
import productVariantRouter from './product-variants.js';
import variantValueRouter from './variant-values.js';
// import productPictureRouter from './product-pictures.js';
import picsRouter from './pictures.js';

const apiRoutes = [
    { path: "/api/v1/product", route: productRouter },
    { path: "/api/v1/auth", route: userRouter },
    { path: "/api/v1/category", route: categoryRouter },
    { path: "/api/v1/product_sku", route: productSkuRouter },
    { path: "/api/v1/product_variants", route: productVariantRouter },
    { path: "/api/v1/variant_values", route: variantValueRouter },
    { path: "/api/v1/upload", route: picsRouter }
]

export default apiRoutes