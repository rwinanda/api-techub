const fileUpload = require('express-fileupload');
const path = require('path');
const MB = 5 * 1024 * 1024; // 5 MB

exports.uploadFile = async(req, res) => {
    fileUpload({
        createParentPath: true
    });
};

exports.filesUploadImages = async(req, res, next) => {
    // Condition if file doesnt exist
    
    if (!req.files) {
        return res.status(400).json({
            status: 400,
            error: "No File Uploaded",
        });
    }
    
    let image = req.files.image;
    // console.log(image);

    // Allowed extension files
    const allowedExtensions = /jpeg|jpg|png/;
    const extName = path.extname(image.name).toLowerCase();

    // Condition if extension files is not allowed
    if(!allowedExtensions.test(extName)) {
        return res.status(400).json({
            status: 400,
            message: "Only .jpg, ,jpeg and .png files are allowed "
        });
    }

    // Condition if file size limit
    if(image > MB){
        return res.status(400).json({
            status: 400,
            message: "File must be less than 5MB"
        });
    }
    next();
}

// exports.filesPayloadExist = async(req, res, next) => {
//     if (!req.files) {
//         return res.status(400).json({
//             status: 400,
//             error: "No File Uploaded",
//         });
//     }
//     next();
// }

// exports.filesSizeLimit = async(req, res, next) => {
//     const files = req.files;
//     const fileOverLimit = [];

//     // Condition if file over limit
//     Object.keys(files).forEach(key => {
//         if (files[key].size > FILE_SIZE_LIMIT) {
//             fileOverLimit.push(files[key].name);
//         }
//     });

//     if (fileOverLimit.length) {
//         console.log(fileOverLimit);
//     }

//     next();
// }
