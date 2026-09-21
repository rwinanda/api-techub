import Database from "../db/client.js"
import { getOrderDetailService, getOrderHistoryService } from "../services/order.service.js";

export const getOrderHistory = async (req, res, next) => {
    const client = await Database.connect();
    
    try {
        const userId = req.user.userId;

        const orders = await getOrderHistoryService(userId, client);

        return res.status(200).json({
            status: 200,
            message: 'Order history retrieved successfully',
            data: orders
        });

    } catch (error) {
        next(error)
    } finally {
        client.release();
    }
}

export const getOrderDetail = async (req, res, next) => {
    const client = await Database.connect();

    try {
        const userId = req.user.userId;

        const { id_order } = req.params;

        const orders = await getOrderDetailService(userId, id_order, client);

        return res.status(200).json({
            status: 200,
            errorCode: '00',
            message: 'Order detail retrieved successfully',
            data: orders
        })

    } catch (error) {
        next(error)
    } finally {
        client.release()
    }
}