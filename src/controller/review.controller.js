import Database from "../db/client.js"
import { addReviewService, getMyReviewsService, getProductReviewService } from "../services/review.service.js";
import { ValidationError } from "../utils/error.js";

export const addReview = async (req, res, next) => {
    const client = await Database.connect();
    try {
        await client.query('BEGIN');

        const userId = req.user.userId;
        const { productId } = req.params;

        // Validate
        if (!req.body || Object.keys(req.body).length === 0) {
            throw new ValidationError('Request body cannot be empty', '01');
        }

        const { id_order, rating, review } = req.body;

        // Validate for required fields
        if (!id_order) throw new ValidationError('id_order is required', '02');
        if (!rating) throw new ValidationError('rating is required', '03');

        // Validate rating range
        const parsedRating = parseInt(rating);
        if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            throw new ValidationError('Rating must be a number between 1 and 5', '04')
        }

        const result = await addReviewService({
            userId,
            idProduct: parseInt(productId),
            idOrder: parseInt(id_order),
            rating: parsedRating,
            review
        }, client);

        await client.query('COMMIT');

        return res.status(201).json({
            status: 201,
            message: 'Review added successfully',
            errorCode: '00',
            data: result
        });
    } catch (error) {
        next(error);
    }
}

export const getProductReviews = async (req, res, next) => {
    const client = await Database.connect();
    try {
        const {productId} = req.params;
        const {page = 1, limit = 10, sort = 'newest'} = req.query;

        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);

        // Validate sort value
        const allowedsorts = ['newest', 'highest', 'lowest'];
        if (!allowedsorts.includes(sort)) {
            throw new ValidationError(`sort must be one of: ${allowedsorts.join(', ')}`, '01');
        }

        const result = await getProductReviewService({
            idProduct: productId,
            page: parsedPage,
            limit: parsedLimit,
            sort
        }, client);

        return res.status(200).json({
            status: 200,
            message: 'Product reviews',
            data: result.reviews,
            pagination: {
                page: parsedPage,
                limit: parsedLimit,
                total_data: result.total_data,
                total_pages: Math.ceil(result.total_data / parsedLimit)
            }
        })

    } catch (error) {
        next(error);
    }
} 

export const getMyReviews = async (req, res, next) => {
    const client = await Database.connect();
    try {
        const userId = req.user.userId;
        const { page = 1, limit = 10 } = req.query;

        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);

        const result = await getMyReviewsService({
            userId,
            page: parsedPage,
            limit: parsedLimit
        }, client);

        return res.status(200).json({
            status: 200,
            message: 'My Reviews retrieved successfullt',
            data: result.reviews,
            pagination: {
                page: parsedPage,
                limit: parsedLimit,
                total_data: result.total_data,
                total_pages: Math.ceil(result.total_data / parsedLimit)
            }
        });
    } catch (error) {
        next(error);
    } finally {
        client.release();
    }
}