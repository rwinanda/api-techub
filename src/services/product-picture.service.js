import { insertPictureProduct } from "../repositories/product-pictures.repository.js";


export const addPictureProductService = async (idProduct, picsList, client) => {
    const picsResp = [];
    for (let i = 0; i < picsList.length; i++) {
        const picture = picsList[i];
        const pictureResult = insertPictureProduct({
            id_product: idProduct,
            picture_url: picture.picture_url,
            is_primary: picture.is_primary
        }, client);
        picsResp.push(pictureResult);
    }

    return {
        picsResp
    };
}