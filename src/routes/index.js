import productRouter from './products.js'; 
import userRouter from './users.js';
import categoryRouter from './categories.js';
import picsRouter from './pictures.js';
import cartRouter from './cart.js';

const apiRoutes = [
    { path: "/api/v1/product", route: productRouter },
    { path: "/api/v1/auth", route: userRouter },
    { path: "/api/v1/category", route: categoryRouter },
    { path: "/api/v1/upload", route: picsRouter },
    { path: "/api/v1/cart", route: cartRouter }
]

export default apiRoutes;