import bcryptjs from "bcryptjs";
import { checkEmailExist, getUserByEmail, insertUser } from "../repositories/user.repository.js";
import { AuthorizationError, ConflictError } from "../utils/error.js";
import jwt from "jsonwebtoken";


export const userSignupService = async (payload, client) => {
    const { name, email, role, password, password_confirm } = payload;

    const user = await checkEmailExist(email, client);

    // Condition if the email already exist
    if (user.length > 0) throw new ConflictError('Email already exist', '02');
    
    // Condition if password doesn't match
    if (password != password_confirm) throw new ConflictError("Password doesn't match", '03');

    const hashedPassword = await bcryptjs.hash(password, 10);

    return await insertUser({
            name, email, role
        }, 
        client, 
        hashedPassword 
    );
}

export const userSigninService = async (payload, client) => {
    const { email, password } = payload;

    const user = await getUserByEmail(email, client);

    // Condition if account doesn't exist
    if (user.length < 1) throw new AuthorizationError("AUTH FAILED: Account doesn't exist, Please Register!!!", "01");

    const userData = user[0];

    // Use promise for bcrypt compare
    const isMatch  = await bcryptjs.compare(password, userData.password);

    // Condition if email or password incorrect
    if (!isMatch) {
        throw new AuthorizationError("AUTH FAILED: Email or Password is incorrect", "02");
    };

    const token = jwt.sign(
        { email: userData.email, userId: userData.id_user, role: userData.role },
        process.env.JWT_KEY,
        { expiresIn: '120m' } // this is not being applied correctly
    );

    return {
        userData,
        token
    }
}