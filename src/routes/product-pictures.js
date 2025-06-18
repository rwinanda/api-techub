const express = require('express');
const router = express.Router();
const productPicturesController = require('../controller/product-pictures');
// const uploadFileMiddleware = require('../middleware/upload-file');
// const authMiddleware = require('../middleware/auth');

// router.post("/upload",  authMiddleware.checkAuth, uploadFileMiddleware.filesUploadImages, productPicturesController.uploadPicturesProduct);
// router.put("/upload/update/:pictureId", productPicturesController.updatePictures);
router.delete("/upload/delete/:pictureId", productPicturesController.deletePictures);

module.exports = router;