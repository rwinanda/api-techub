import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { AuthorizationError } from "../utils/error.js";

class AuthMiddleware {
  // ✅ Validation for signup
    static signupValidation = [
        body("email").isEmail().withMessage("Invalid email format"),
        body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
        body("name").notEmpty().withMessage("Name is required!"),
    ];

    // ✅ Check Auth Middleware - pass as reference
    static checkAuth(req, res, next) {
        try {
            const token = req.cookies.SessionID;

            if (!token) throw new AuthorizationError("Please login first", "01");

            const decoded = jwt.verify(token, process.env.JWT_KEY);
            req.user = decoded;

            next();
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return next(new AuthorizationError("Session expired. Please login again.", "02"));
            }
            if (error.name === "JsonWebTokenError") {
                return next(new AuthorizationError("Invalid session. Please login again.", "03"));
            }
            return next(error);
        }
    }

    // Check Role users, ADMIN = 0 & CUSTOMER = 1
    static checkRole(...allowedRoles) {
        return (req, res, next) => {
            try {
            const userRole = req.user.role;
            
            if (!allowedRoles.includes(userRole)) {
                return next(new AuthorizationError('You are not authorized to access this resource', '04'));
            }

            next();
        } catch (error) {
            return next(error);
        }
        }
    }
}

export default AuthMiddleware;
