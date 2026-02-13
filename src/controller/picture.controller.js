import { pictureService } from "../services/picture.service.js";


export const addPicture = async (req, res) => {
    const images = req.files.image;

    const picture = await pictureService(images)

    try {
        // Move the file (mv requires a callback function)
        await new Promise((resolve, reject) => {
            images.mv(picture.uploadPath, (err) => {
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
            data: picture.baseURL
        })
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Failed",
            error: error.message
        })
    }
}