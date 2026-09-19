import { snap } from "../config/midtrans.js";
import { getCartItemByCartItemIds } from "../repositories/cart.repository.js";
import { getOrderBySnapToken, insertOrder, insertOrderItems, updateOrderStatus } from "../repositories/order.repository.js";
import { reduceProductSkuStock } from "../repositories/product-sku.repository.js";
import { getUserById } from "../repositories/user.repository.js"
import { NotFoundError, ValidationError } from "../utils/error.js";
import { deleteCartItemByIds } from "./cart.service.js";

export const createOrderService = async(client, userId, cartItemIds) => {
    // Get user data for midtrans
    const user = await getUserById(userId, client);
    if (!user) throw new NotFoundError('User not found', '03');


    // Get selected cart items
    const cartItems = await getCartItemByCartItemIds(cartItemIds, userId, client);
    console.log("cart items => " , cartItems)
    if (!cartItems || cartItems.length === 0) {
        throw new NotFoundError('No cart items found', '04');
    }

    // Validate all selected cart item ids exist
    if (cartItems.length !== cartItemIds.length) {
        throw new ValidationError('Some cart items are invalid or do not belong to you', '05');
    }

    // Check stock for each item
    for (const item of cartItems) {
        if (item === 0) {
            throw new ValidationError(`Product "${item.name_product}" is out of stock`, '06');
        }

        if (item.quantity > item.stock) {
            throw new ValidationError(`Not enough stock for "${item.name_product}". Available: ${item.stock}`, '07');
        }
    }

    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create order in DB first (status: pending)
    const order = await insertOrder({
        id_user: userId,
        total_price: totalPrice,
        status: 'pending'
    }, client);

    // Insert order items (snapshot price at time or order)
    await insertOrderItems(order.id_order, cartItems, client);

    // Create midtrans section
    const midtransParams = {
        transaction_details: {
            order_id: `ORDER-${order.id_order}-${Date.now()}`,
            gross_amount: totalPrice
        },
        item_details: cartItems.map(item => ({
            id: item.id_product_sku,
            price: item.price,
            quantity: item.quantity,
            name: item.name_product
        })),
        customer_details: {
            email: user.email,
            first_name: user.name
        }
    }

    const midtransTransaction = await snap.createTransaction(midtransParams);

    // Save snap token and payment URL to order
    await updateOrderStatus(order.id_order, {
        status: 'pending',
        snap_token: midtransTransaction.token,
        payment_url: midtransTransaction.redirect_url
    }, client);

    return {
        id_order: order.id_order,
        snap_token: midtransTransaction.token,
        payment_url: midtransTransaction.redirect_url,
        total_price: totalPrice,
        status: 'pending'
    };
}

export const handleWebhookService = async (notification, client) => {
    // Verify notification from midtrans
    const statusResponse = await snap.transaction.notification(notification);
    const {
        order_id,
        transaction_status,
        fraud_status
    } = statusResponse

    // Find order by snap token / order_id
    const idOrder = order_id.split('-')[1];
    const order = await getOrderBySnapToken(idOrder, client); 

    if(!order) throw NotFoundError(`Order ${idOrder} not found`, '03');

    // Determine payment status
    let newStatus = order.status;

    if (transaction_status === 'capture') {
        newStatus = fraud_status === 'accept' ? 'paid' : 'cancelled';
    } else if (transaction_status === 'settlement') {
        newStatus = 'paid';
    } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
        newStatus = 'cancelled';
    } else if (transaction_status === 'pending') {
        newStatus = 'pending'
    }

    // Update order status
    await updateOrderStatus(order.id_order, { status: newStatus }, client);

    console.log("New status after updated => ", newStatus);

    // if paid - reduce stock and clear cart items
    if (newStatus === 'paid') {
        // Reduce stock and clear cart items
        for (const item of order.order_items) {
            await reduceProductSkuStock(item.id_product_sku, item.quantity, client)
        }

        // Deleted purchased item from cart
        const productSkuIds = order.order_items.map(item => parseInt(item.id_product_sku));

        await deleteCartItemByIds(order.id_user, productSkuIds, client);
    }
}