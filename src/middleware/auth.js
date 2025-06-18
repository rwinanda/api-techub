const { body } = require('express-validator');
const jwt = require('jsonwebtoken');

// Validation for signup
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

// Middleware Auth
exports.checkAuth = (req, res, next) => {
    try {
        // Get token from cookies SessionID
        const token = req.cookies.SessionID

        // Condition if there is no cookies in headers
        if(!token) {
            console.log("cek 1")
            return res.status(401).json({
                status: 401,
                message: "Please login first"
            });
        } 
        jwt.verify(token, process.env.JWT_KEY);
        next();
    } catch (error) {
        console.log("error coding")
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                status: 401,
                message: "Session expired. Please login again.",
            });
        } else if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                status: 401,
                message: "Invalid session. Please login again.",
            });
        } else {
            return res.status(500).json({
                status: 500,
                message: "Internal Server Error",
                error: error.message,
            });
        }
    }
}

