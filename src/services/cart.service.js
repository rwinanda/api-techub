import { deleteCartItemByUser, getAllCartByIdUser, getCartByUserId, getCartItemByCartIdAndSkuId, getCartItemByIdAndCartId, insertCart, insertCartItem, updateCartItemQuantity } from "../repositories/cart.repository.js";
import { getProductSkuById } from "../repositories/product-sku.repository.js";
import { NotFoundError, ValidationError } from "../utils/error.js";

export const addToCartService = async (client, userId, id_product_sku, quantity) => {
    // Check if product sku exists
    const productSku = await getProductSkuById(id_product_sku, client);
    if (!productSku) throw new NotFoundError(`Product SKU with id ${id_product_sku} not found`, "04");

    // Check if product sku is active
    if (!productSku.is_active) throw new ValidationError("Product is not available", "05");

    // Check stock
    if (productSku.stock === 0) throw new ValidationError("Product is out of stock", "06");

    // Get or Create Cart for user
    let cart = await getCartByUserId(userId, client);

    if (!cart) {
        cart = await insertCart(userId, client);
    }

    // Check if same SKU already exists in cart
    const existingCartItem = await getCartItemByCartIdAndSkuId(cart.id_cart, id_product_sku, client);
    console.log("Existing Cart Item => ", existingCartItem);

    if (existingCartItem){
        const existingQuantity = parseInt(existingCartItem.quantity, 10);
        const newQuantity = existingQuantity + quantity;

        // Check new quantity doesn't exceed stock
        if (newQuantity > productSku.stock) throw new ValidationError(
            `Not enough stock. Available stock: ${productSku.stock}`, "07"
        );

        return updateCartItemQuantity(existingCartItem.id_cart_item, newQuantity, client);
    } else {
        if (quantity > productSku.stock) throw new ValidationError(
            `Not enough stock. Avaiable stok: ${productSku.stock}`, "07"
        );
    }
    
    return insertCartItem(cart.id_cart, id_product_sku, quantity, client);
}

export const getCartByUserIdService = async (client, idUser) => {
    // Check if cart exists for user
    const cart = await getCartByUserId(idUser, client);
    console.log("Cart => ", cart)
    if (!cart) throw new NotFoundError("Cart Not Found", "01");
    
    // Get All cart items with product details
    const cartItems = await getAllCartByIdUser(cart.id_cart, client);

    // Calculate total price per item and grand total price
    const items = cartItems.map(item => ({
        id_cart_item: item.id_cart_item,
        id_product_sku: item.id_product_sku,
        product_name: item.name_product,
        picture_url: item.picture_url,
        price: item.price,
        quantity: item.quantity,
        total_price: item.price * item.quantity
    }));

    const grandTotal = items.reduce((totalPrice, item) => totalPrice + item.total_price, 0);

    return {
        id_cart: cart.id_cart,
        items,
        grandTotal: grandTotal
    };
}

export const deleteCartByUserIdService = async (client, idUser, id_cart_item) => {
    // Check if cart exist for user
    const cart = await getCartByUserId(idUser, client);
    
    if (!cart) throw new NotFoundError("Cart Not Found", "02");

    // Check if cart item exist in cart
    const cartItem = await getCartItemByIdAndCartId(id_cart_item, cart.id_cart, client);

    if (!cartItem) throw new NotFoundError("Item not Found", "03");

    // Delete Item in Cart
    await deleteCartItemByUser(cartItem.id_cart_item, client);
}