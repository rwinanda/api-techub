import path from "path";
// import path from '../../app.js';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import { fileURLToPath } from "url";

export const addPicture = async (req, res) => {
    const image = req.files.image;
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    // if file uploads directory doesn't exist, create new file
    const uploadDir = path.join(
        __dirname, 
        "../", 
        process.env.UPLOAD_DIR || "upload_temp"
    );
    if (!fs.existsSync(uploadDir)) {
        await fsPromises.mkdir(uploadDir, { recursive: true });
    }


    // 💥 Check if img and img.name exist
    if (!image) {
        console.warn("Invalid image file detected, skipping...");
    }

        // TODO: Change image name to unique
        // "image_upload_{millis}_{index}"


        // Middleware for extansion image
        // filesUploadImages(img.name)

    // Generate a unique filename to prevent overwriting
    console.log("Image name => ", image.name)
    const fileExtension = path.extname(image.name); // .jpg
    const baseName = path.basename(image.name, fileExtension); // iphone 15_
    let counter = 1;

    // upload file to path
    let imageName = image.name;
    let uploadPath = path.join(uploadDir, imageName);

    // Check for duplicate file name and rename it
    while (fs.existsSync(uploadPath)) {
        imageName = `${baseName}_${counter}${fileExtension}`;
        uploadPath = path.join(uploadDir, imageName);
        counter++;
    }

    console.log("upload path => ", uploadPath)

    const baseURL = `${process.env.BASE_URL || "http://localhost:3000"}/upload_temp/${imageName}`
    console.log(baseURL)

    try {
        // Move the file (mv requires a callback function)
        await new Promise((resolve, reject) => {
            image.mv(uploadPath, (err) => {
                // condition if upload failed
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
        
        return res.status(201).json({
            status: 201,
            message: "Photo has been uploaded",
            data: baseURL
        })
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Failed",
            error: error.message
        })
    }
}