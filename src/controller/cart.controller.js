import Database from "../db/client.js"
import { addToCartService, deleteCartByUserIdService, getCartByUserIdService } from "../services/cart.service.js";
import { NotFoundError, ValidationError } from "../utils/error.js";

export const addToCart = async (req, res, next) => {
    const client = await Database.connect();

    try {
        await client.query('BEGIN');

        // Get user id from jwt
        const userId = req.user.userId;
        const userDetail = req.user;
        console.log("detail => ", userDetail)

        if (!req.body || Object.keys(req.body).length === 0) throw new ValidationError('Request body cannot be empty', '01');
        
        const { id_product_sku, quantity } = req.body;

        // Validate require fields
        if (!id_product_sku) throw new ValidationError('id_product_sku is required', '02');
        if (quantity === undefined) throw new ValidationError('quantity is required', '03');
        if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
            throw new ValidationError('quantity must be a positive number', 'INVALID_QUANTITY');
        }

        const cartItem = await addToCartService(client, userId, id_product_sku, quantity);

        await client.query('COMMIT');

        return res.status(200).json({
            status: 200,
            message: 'Product added to cart successfully',
            errorCode: "00",
            data: {
                id_cart_item: cartItem.id_cart_item,
                id_cart: cartItem.id_cart,
                id_product_sku: cartItem.id_product_sku,
                quantity: cartItem.quantity
            }
        });
    } catch (error){
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
}

export const getCartByUserId = async (req, res, next) => {
    const client = await Database.connect();

    try {
        await client.query('BEGIN');

        // Get user id from jwt
        const userId = req.user.userId;
        console.log("role => ", req.user.role)

        const cart = await getCartByUserIdService(client, userId); 

        await client.query('COMMIT');

        return res.status(200).json({
            status: 200,
            message: 'Cart retrieved successfully',
            errorCode: "00",
            data: cart
        });
    } catch (error) {
        await client.query('ROLLBACK');
        
        if (error instanceof NotFoundError) {
            return res.status(error.status).json({
                status: error.status,
                errorCode: error.errorCode,
                message: error.message
            });
        }

        next(error);
    } finally {
        client.release();
    }
}

export const deleteCartItem = async (req, res, next) => {
    const client = await Database.connect();

    try {
        await client.query('BEGIN');

        // Get user id from jwt
        const userId = req.user.userId;
        const { id_cart_item } = req.params;

        if (!id_cart_item) throw new ValidationError('id_cart_item is required', '01');

        const cart = await deleteCartByUserIdService(client, userId, id_cart_item);

        await client.query('COMMIT');

        return res.status(200).json({
            status: 200,
            message: 'Delete Cart item successfully',
            errorCode: "00",
            data: cart
        });
    } catch (error) {
        await client.query('ROLLBACK');

        next(error);
    }
}