const Database = require('../db/client');
const fs = require('fs');
const path = require('path');

// Upload Pictures
exports.uploadPicturesProduct = async(req, res) => {
    try {  
        let image = req.files.image;
        let imageName = image.name

        const { product_id } = req.body;
        const uploadDir = path.join(__dirname, "../", process.env.UPLOAD_DIR || "uploads");
        
        // if file uploads directory doesn't exist, create new file
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generate a unique filename to prevent overwriting
        const fileExtension = path.extname(image.name); // .jpg
        const baseName = path.basename(image.name, fileExtension) // iphone 15_
        let counter = 1;
        
        // upload file to path
        let uploadPath = path.join(uploadDir, imageName);

        // Check for duplicate file name and rename it
        while(fs.existsSync(uploadPath)) {
            imageName = `${baseName}_${counter}${fileExtension}`;
            uploadPath = path.join(uploadDir, imageName);
            counter++;
        }

        // Move the file (mv requires a callback function)
        image.mv(uploadPath, (err) => {
            // condition if upload failed
            if (err) {
                return res.status(500).json({ 
                    message: "File upload failed", 
                    error: err.message 
                });
            }

            // Called Function insert picture to Database
            insertIntoDatabase(product_id, imageName, res)
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
}

// Insert to picture to database
const insertIntoDatabase = async(product_id, imageName, res) => {
    try {
        const insertQuery = `INSERT INTO product_pictures (product_id, picture_url) VALUES ($1, $2) RETURNING *;`;
        const values = [product_id, imageName];
        const result = await Database.db.query(insertQuery, values);
        console.log(result)

        return res.status(201).json({
            status: 201,
            message: "File Upload Successfully and store to database",
            data: result.rows[0]
        });

    } catch (dbError) {
        return res.status(500).json({
            status: 500,
            message: "Database insertion failed",
            error: dbError.message
        });
    }
}