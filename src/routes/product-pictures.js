import express from 'express';
import { deletePictures } from '../controller/product-pictures.js';

const productPictureRouter = express.Router();
productPictureRouter.delete("/delete/:pictureId", deletePictures);

export default productPictureRouter;