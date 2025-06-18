const Database = require('../db/client');
const fs = require('fs');
const fsPromises = require('fs').promises
const path = require('path');
const { filesUploadImages } = require('../middleware/upload-file');

// Upload Pictures

/**
 * Save or update product pictures.
 * @param {string} mode - 'insert' or 'update'
 */

exports.uploadPictureProducts = async (productId, image, uploadedImages, mode = 'insert') => {
    // if file uploads directory doesn't exist, create new file
    const uploadDir = path.join(__dirname, "../", process.env.UPLOAD_DIR || "uploads");
    if (!fs.existsSync(uploadDir)) {
        await fsPromises.mkdir(uploadDir, { recursive: true });
    }

    // Only process keys that start with `image_`
    const imageProduct = Object.entries(image).filter(([key]) => key.startsWith("image_"));
    
    // Loop each file for img
    for (const [imageKey, img] of imageProduct) {
        console.log("img => ", img);
        console.log("imageKey => ", imageKey)
        // 💥 Check if img and img.name exist
        if (!img || !img.name) {
            console.warn("Invalid image file detected, skipping...");
            continue;
        }

        // Middleware for extansion image
        filesUploadImages(img.name)

        // Generate a unique filename to prevent overwriting
        const fileExtension = path.extname(img.name); // .jpg
        const baseName = path.basename(img.name, fileExtension); // iphone 15_
        let counter = 1;

        // upload file to path
        let imageName = img.name;
        let uploadPath = path.join(uploadDir, imageName);

        // Check for duplicate file name and rename it
        while (fs.existsSync(uploadPath)) {
        imageName = `${baseName}_${counter}${fileExtension}`;
        uploadPath = path.join(uploadDir, imageName);
        counter++;
        }

        // Move the file (mv requires a callback function)
        await new Promise((resolve, reject) => {
        img.mv(uploadPath, (err) => {
            // condition if upload failed
            if (err) {
            return reject(err);
            }
            resolve();
        });
        });

        // Upload to database with condition insert or update
        if(mode === 'insert'){
            const insertPictureQuery = `INSERT INTO product_pictures (product_id, picture_url, image_key) VALUES ($1, $2, $3) RETURNING *;`;
            await Database.db.query(insertPictureQuery, [productId, imageName, imageKey]);
        } else if(mode === 'update') {
            const updatePicturequery = `
            UPDATE product_pictures SET picture_url = $1 WHERE product_id = $2 and image_key = $3 RETURNING *;
            `
            const picResult = await Database.db.query(updatePicturequery, [imageName, productId, imageKey]);

            // Condition if want to add new pictures (optional)
            if(picResult.rows.length === 0) {
            await Database.db.query(`
                INSERT INTO product_pictures (product_id, picture_url, image_key) VALUES ($1, $2, $3) RETURNING *;
                `, [productId, imageName, imageKey])
            }
        }

        // Push image name to array respon Images
        uploadedImages.push({imageName, imageKey})
    }
}

exports.uploadPicturesValues = async (filePics) => {
    try {
        // Check if image is exist
        if(!filePics) {
            return null; // Return null if no file is uploaded
        }
        let image = filePics
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

// Delete Pictures by id
exports.deletePictures = async(res, req) => {
    try {
        const {pictureId} = req.params;
        Database.db.query("DELETE FROM product_pictures WHERE picture_id = $1", [pictureId]);

        return res.status(200).json({
            status: 200,
            message: "Product Pictures has been deleted"
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Failed",
            error: error.message
        });
    }
}