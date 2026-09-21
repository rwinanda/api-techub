import { getOrderItemByProductAndOrder, getOrdersById } from "../repositories/order.repository.js";
import { getProductById } from "../repositories/product.repository.js"
import { countReviewsByProductId, countReviewsByUserId, getExistingReview, getReviewsByProductId, getReviewsByUserId, insertReview } from "../repositories/review.repository.js";
import { NotFoundError, ValidationError } from "../utils/error.js";

export const addReviewService = async ({userId, idProduct, idOrder, rating, review}, client) => {
    // Check product exist
    const products = await getProductById(idProduct, client);
    if (!products) throw new NotFoundError(`Product with id ${idProduct} not found`, '05');

    // check order exists and belongs to this user
    const order = await getOrdersById(idOrder, userId, client);
    if (!order) throw new NotFoundError(`Order with id ${idOrder} not found`, '06');

    // check order status is 'done'
    if (order.status !== 'done') {
        throw new ValidationError(`Cannot review product, order status is "${order.status}"`, '07');
    }

    // check product was actually in this order
    console.log(`id product: ${idProduct} \n id order: ${idOrder}`)
    const orderItem = await getOrderItemByProductAndOrder(idProduct, idOrder, client);
    console.log("item order = ", orderItem)
    if (!orderItem) {
        throw new ValidationError('This product was not part of the specified order', '08')
    }

    // check if already reviewed
    const existingReview = await getExistingReview(userId, idProduct, idOrder, client);
    if (existingReview) {
        throw new ValidationError('You have already reviewed this product for this order', '09');
    }

    // insert review
    const result = await insertReview({
        id_user: userId,
        id_product: idProduct,
        id_order: idOrder,
        rating,
        review: review || null
    }, client);
    
    return {
        id_review: result.id_review,
        id_product: result.id_product,
    }
}

export const getProductReviewService = async ({idProduct,  page, limit, sort}, client) => {
    // Validate page & limit
    if (isNaN(page) || page < 1) {
        throw new ValidationError('Page must be a positive number', '02')
    }

    if (isNaN(limit) || limit < 1) {
        throw new ValidationError('Limit must be a positive number', '03')
    }

    // Check product exist
    const product = await getProductById(idProduct, client);
    if (!product) throw new NotFoundError(`Product with id ${idProduct} not found`, '04');

    const offset = (page - 1) * limit;

    // Map sort option to SQL ORDER BY clause
    const sortMap = {
        newest: 'pr.created_at DESC',
        highest: 'pr.rating DESC',
        lowest: 'pr.rating ASC'
    };
    const orderBy = sortMap[sort];

    const [reviews, totalData] = await Promise.all([
        getReviewsByProductId(idProduct, limit, offset, orderBy, client),
        countReviewsByProductId(idProduct, client)
    ]);

    return {
        reviews: reviews.map(r => ({
            id_review: r.id_review,
            user_name: r.user_name,
            rating: r.rating,
            review: r.review,
            created_at: r.created_at
        })),
        total_data: parseInt(totalData)
    };
}

export const getMyReviewsService = async ({userId, page, limit}, client) => {
    // Validate page & limit
    if (isNaN(page) || page < 1) throw new ValidationError('Page must be a positive number', '02');
    if (isNaN(limit) || limit < 1) throw new ValidationError('Limit must be a positive number', '03');

    const offset = (page - 1) * limit;

    const [reviews, totalData] = await Promise.all([
        getReviewsByUserId(userId, limit, offset, client),
        countReviewsByUserId(userId, client)
    ]);

    if (!reviews || reviews.length === 0) throw new NotFoundError('No reviews found', '04');

    return {
        reviews: reviews.map(r => ({
            id_review: r.id_review,
            id_product: r.id_product,
            product_name: r.product_name,
            picture_url: r.picture_url,
            rating: r.rating,
            review: r.review,
            created_at: r.created_at
        })),
        total_data: parseInt(totalData)
    };
}