import express from "express";
import { addPicture } from "../controller/picture.controller.js";

const picsRouter = express.Router();

picsRouter.post('/', addPicture)

export default picsRouter