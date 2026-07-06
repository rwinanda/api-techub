import Database from "../db/client.js";
// import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import { userSigninService, userSignupService } from "../services/user.service.js";
import { ConflictError, ValidationError } from "../utils/error.js";

// Validation for SIGNUP
export const validatorSignup = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const firstError = errors.array()[0].msg;
		return next(new ValidationError(firstError, '01'));
	}
	next();
};

export const userRegist = async (req, res, next) => {
	const client = await Database.connect();

    try {
        const user = await userSignupService(req.body, client);

        return res.status(201).json({
            message: "User registered succesfully",
            data: {
              "id_user": user.id_user,
              "email": user.email,
              "role": user.role
            }
        });

    } catch (err) {
        if (err.code === "2305") throw new ConflictError('Duplicate key value violates unique constraint', '06');
    
		await client.query('ROLLBACK');
        next(err);
    }
};

export const userLogin = async (req, res, next) => {
    const client = await Database.connect();

    try {
        const TOKEN_EXPIRY_MS = 10 * 60 * 1000; // Minutes

        const user = await userSigninService(req.body, client);

        const options = {
            maxAge: TOKEN_EXPIRY_MS,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        };

        res.cookie("SessionID", user.token, options);
        return res.status(200).json({
            message: "Auth Success",
            status: 200,
            data: {
              userId: user.userData.id_user,
              name: user.userData.name,
              role: user.userData.role,
              token: user.token
            }
      });
    } catch (err) {
        next(err);
    } finally {
		client.release();
    }
};

export const userLogout = async (req, res, next) => {
    try {
        res.clearCookie("SessionID", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        });

        return res.status(200).json({
            message: "Logout Success",
            status: 200
        });
    } catch (error) {
        next(error);
    }
}

// Function Get All data users
export const getUserLogin = async (req, res) => {
  try {
    const user = await Database.db.query(
      "SELECT * FROM users ORDER BY id ASC"
    );
    console.log(user.rows);

    if (user.rows) {
      return res.status(200).json({
        message: "Get User Data",
        status: 200,
        data: user.rows
      });
    } 
    
  } catch (err) {
    return res.status(500).json({
      message: "Failed",
      status: 500,
      error: err.message,
    });
  }
}