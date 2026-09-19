import Database from "../db/client.js"
import { createOrderService, handleWebhookService } from "../services/payment.service.js";
import { NotFoundError, ValidationError } from "../utils/error.js";

export const checkout = async (req, res, next) => {
    const client = await Database.connect();

    try {
        await client.query('BEGIN');

        const userId = req.user.userId;
        console.log("1")
        // Validate body
        if (!req.body || Object.keys(req.body).length === 0) {
            throw new ValidationError('Request body cannot be empty', '01');
        }

        const { cart_item_ids } = req.body;

        // Validate selected cart items
        if (!cart_item_ids || !Array.isArray(cart_item_ids || cart_item_ids.length === 0)) {
            throw new ValidationError('cart_item_ids must be a non-empty array', '02');
        }

        console.log("cart_item_ids =>", cart_item_ids);
        console.log("type =>", typeof cart_item_ids);
        console.log("isArray =>", Array.isArray(cart_item_ids));

        console.log("2")

        const result = await createOrderService(client, userId, cart_item_ids);
        
        await client.query('COMMIT');

        return res.status(201).json({
            status: 201,
            message: 'Order created succesfully',
            data: {
                id_order: result.id_order,
                snap_token: result.snap_token,
                payment_url: result.payment_url,
                total_price: result.total_price,
                status: result.status
            }
        })
    } catch (error) {
        await client.query('ROLLBACK')

        if (error instanceof ValidationError || error instanceof NotFoundError) {
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

export const webhook = async (req, res, next) => {
    const client = await Database.connect();
    try {
        console.log("test hook")
        await client.query('BEGIN');

        const notification = req.body;

        await handleWebhookService(notification, client);

        await client.query('COMMIT');

        res.status(200).json({
            status: 200,
            message: 'Webhook received successfully'
        });
    } catch (error) {
        next(error);
    }
}