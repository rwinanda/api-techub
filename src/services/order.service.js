import { getOrderItemsByOrderId, getOrdersById, getOrdersByUserId } from "../repositories/order.repository.js";
import { NotFoundError } from "../utils/error.js";


export const getOrderHistoryService = async (userId, client) => {
    const orders = await getOrdersByUserId(userId, client);

    if (!orders || orders.length === 0) {
        throw new NotFoundError('No orders found', '01');
    }

    return orders.map(order => ({
        id_order: order.id_order,
        status: order.status,
        total_price: order.total_price,
        payment_url: order.payment_url,
        created_at: order.created_at
    }));
}

export const getOrderDetailService = async (userId, idOrder, client) => {
    // Check order exist
    const order = await getOrdersById (idOrder, userId, client);

    if(!order) throw new NotFoundError(`Order with id: ${idOrder} not found`, '01');

    // Get order item with product details
    const orderItems = await getOrderItemsByOrderId(idOrder, client);

    const items = orderItems.map(item => ({
        id_order_item: item.id_order_item,
        id_product_sku: item.id_product_sku,
        product_name: item.name_product,
        picture_url: item.picture_url,
        price: item.price,
        quantity: item.quantity,
        total_price: item.total_price
    }));

    return {
        id_order: order.id_order,
        status: order.status,
        total_price: order.total_price,
        snap_token: order.snap_token,
        payment_url: order.payment_url,
        created_at: order.created_at,
        items
    }
}