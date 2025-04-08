const Database = require('../db/client');
const fs = require('fs');
const path = require('path');

exports.createVariantValues = async(req, res) => {
    try {

        // Function for upload image
        const imageName = await uploadPicturesValues(req);

        const { variant_id, value } = req.body;
        const created_at = new Date().toISOString();
        const updated_at = created_at;

        const variant = await Database.db.query("INSERT INTO variant_values (variant_id, value, picture_values, created_at, updated_at) VALUES ($1, $2, $3, to_timestamp($4, 'YYYY-MM-DD\"T\"HH24:MI:SS.MSZ'), to_timestamp($5, 'YYYY-MM-DD\"T\"HH24:MI:SS.MSZ')) RETURNING *", [variant_id, value, imageName, updated_at, created_at]);

        return res.status(201).json({
            status: 201,
            message: "Successfully created variant values",
            data: variant.rows
        })

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Failed",
            error: error.message
        });   
    }
}

async function uploadPicturesValues(req)  {
    try {
        let image = req.files.image;
        let imageName = image.name

        const uploadDir = path.join(__dirname, "../", process.env.UPLOAD_DIR || "uploads");
                
        // if file uploads directory doesn't exist, create new folder
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
        await image.mv(uploadPath);

        return imageName; // return the new filename

    } catch (error) {
        console.error("Error uploading file:", error.message);
        throw new Error("File upload failed");
    }
}