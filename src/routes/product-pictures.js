const express = require('express');
const router = express.Router();
const productPicturesController = require('../controller/product-pictures');
const uploadFileMiddleware = require('../middleware/upload-file');
const authMiddleware = require('../middleware/auth');

router.post("/upload", uploadFileMiddleware.filesUploadImages, productPicturesController.uploadPicturesProduct)

module.exports = router;