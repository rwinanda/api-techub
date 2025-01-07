const { body } = require('express-validator');
const jwt = require('jsonwebtoken');

exports.signupValidation = [
    // requirement for signup
    body('email')
        .isEmail()
        .withMessage('Invalid email format'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least need 6 characters'),
    body('name')
        .notEmpty()
        .withMessage('Name is required!'),
];

exports.checkAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        console.log(decoded);
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'AUTH FAILED: Need Login First!',
            status: 401,
            error: error.message
        });
    }
}

