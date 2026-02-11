import { body } from "express-validator";
import jwt from "jsonwebtoken";

class AuthMiddleware {
  // ✅ Validation for signup
    static signupValidation = [
        body("email").isEmail().withMessage("Invalid email format"),
        body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
        body("name").notEmpty().withMessage("Name is required!"),
    ];

  // ✅ Check Auth Middleware
    static checkAuth(req, res, next) {
        try {
            const token = req.cookies.SessionID;

            if (!token) {
                return res.status(401).json({
                status: 401,
                message: "Please login first",
                });
            }

            jwt.verify(token, process.env.JWT_KEY);
            next();
        } catch (error) {
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
}

export default AuthMiddleware;
