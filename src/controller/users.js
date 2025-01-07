const Database = require("../db/client");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
require("dotenv").config();

// Validation for SIGNUP
exports.validatorSignup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation Failed",
      error: errors.array(),
    });
  }
  next();
};

// Function SIGNUP
exports.userSignup = async (req, res, next) => {
  try {
    const { name, email, password, password_confirm } = req.body;

    // Select email from database
    const user = await Database.db.query(
      "SELECT email FROM users WHERE email = $1",
      [email]
    );

    // Condition if the email already exist
    if (user.rows.length > 0) {
      return res.status(409).json({
        message: "Email already exist",
        status: 409,
      });
    }
    
    // Condition if password doesn't match
    if (password != password_confirm) {
      return res.status(409).json({
        message: "Password does not match",
        status:409
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // insert new user to database
    const createUser = await Database.db.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, hashedPassword]
    );
    console.log("created user: ", createUser.rows[0]);

    return res.status(201).json({
      message: "User registered succesfully",
      user: createUser.rows[0],
    });
  } catch (err) {
    if (err.code === "2305") {
      return res.status(409).json({
        message: "Duplicate key value violates unique constraint",
        status: 409,
        error: err.message,
      });
    }
    return res.status(500).json({
      message: "Failed",
      status: 500,
      error: err.message,
    });
  }
};

// Function Login
exports.userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await Database.db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    console.log(user.rows);

    // Condition if email is incorrect
    if (user.rows.length < 1) {
      return res.status(401).json({
        message: "AUTH FAILED: Email or Password is incorrect",
        status: 401,
      });
    } else {
      const userData = user.rows[0];
      console.log('user data: ', userData);
      console.log('Password User: ', userData.password);
      bcrypt.compare(password, userData.password, (err, result) => {
        // Condition if auth failed
        if (err) {
          return res.status(401).json({
            message: "Auth Failed",
            status: 401,
            error: err.message,
          });
        }

        if (result) {
          const token = jwt.sign(
            {
              email: userData.email,
              userId: userData._id
            },
            process.env.JWT_KEY,
            console.log('JWT KEY:', process.env.JWT_KEY)
          );
          return res.status(200).json({
            message: "Auth Success",
            status: 200,
            userId: userData._id,
            name: userData.name,
            token,
          });
        }
        return res.status(401).json({
          message: "AUTH FAILED: Email or Password is incorrect",
          status: 401,
        });
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Failed",
      status: 500,
      error: err.message,
    });
  }
};
