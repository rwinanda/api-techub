import path from "path";
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import { fileURLToPath } from "url";

export const pictureService = async (image) => {
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

    const baseURL = `${process.env.BASE_URL || "http://localhost:4700"}/upload_temp/${imageName}`

    return {
        uploadPath,
        baseURL
    }
}