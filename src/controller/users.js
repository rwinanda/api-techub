const Database = require('../db/client');

exports.userSignup = async (req, res, next) => {
    try {
        const email = req.body.email;
        console.log(email);
        const user = await Database.db.query('SELECT email FROM users WHERE email = $1', [email]);
        console.log(user.rows.length);

        if (user.rows.length > 0) {
            return res.status(409).json({
                message: 'Email already exist',
                status: 409
            });
        } else {
            return res.status(200).json({
                message: 'Email is available',
                status: 200
            });
        }
    } catch (err) {
        return res.status(500).json({
            message: 'Failed',
            status: 500,
            error: err.message
        });
    }
}