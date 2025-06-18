// const fileUpload = require('express-fileupload');
const path = require('path');
const MB = 20 * 1024 * 1024; // 20 MB

exports.filesUploadImages = async(image, req, res) => {
    // Allowed extension files
     // Validasi ekstensi
    const allowedExtensions = /jpeg|jpg|png/;
    const extName = path.extname(image).toLowerCase();
    if (!allowedExtensions.test(extName)) {
        return res.status(400).json({ message: "Only .jpg, .jpeg and .png allowed" });
    }

    // Validasi size
    if (image.size > MB) {
        return res.status(400).json({ message: "File must be less than 20MB" });
    }
    
    // next();
}
