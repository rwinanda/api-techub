const Database = require("../db/client");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
// require("dotenv").config();

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

    // Condition if account doesn't exist
    if (user.rows.length < 1) {
      return res.status(401).json({
        message: "AUTH FAILED: Account doesn't exist, Please Register!!!",
        status: 401,
      });
    } 

    // Condition if email or password incorrect
    if(!user) {
      return res.status(401).json({
        status: 401,
        message: "AUTH FAILED: Email Or Password is incorrect"
      });
    }
    else {
      const userData = user.rows[0];
      // Bcrycpt Password
      bcrypt.compare(password, userData.password, (err, result) => {
      // Condition if JWT Success
      if (result) {
        // JWT Token
        const token = jwt.sign(
          {
            email: userData.email,
            userId: userData._id,
          },
          process.env.JWT_KEY,
          {
            expiresIn: '2m'
          }
        );

        // Option for cookies
        let options = {
          maxAge: 4 * 60 * 1000, //4 min expires
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax"
        };
        res.cookie("SessionID", token, options); 
        return res.status(200).json({
          message: "Auth Success",
          status: 200,
          userId: userData._id,
          name: userData.name,
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

// Function Logout
exports.userLogout = async (req, res, next) => {
  try {

    // If Logout Failed
    if (!req.cookies["SessionID"]) {
      return res.status(400).json({
        status: 400,
        message: "Logout Failed: No Active Session Found"
      });
    };

    // Delete session
    res.cookie("SessionID", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      expires: new Date(0)
    });

    return res.status(200).json({
      status: 200,
      message: "Logout Sucessfull"
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: error.message
    });
  }
}

// Function Get All data users
exports.getUserLogin = async (req, res, next) => {
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
