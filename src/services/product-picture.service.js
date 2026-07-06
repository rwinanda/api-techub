import { deletePicturesByProductId, insertPictureProduct } from "../repositories/product-pictures.repository.js";
import { ValidationError } from "../utils/error.js";

export const addPictureProductService = async (idProduct, picsList, client) => {
    // Validation for empty array
    if (picsList.length === 0) throw new ValidationError('image_url field must containt at least 1 object', '05');

    const picsResp = [];
    for (let i = 0; i < picsList.length; i++) {
        const picture = picsList[i];

        // Validation for picture_url field
        // if (!picture.picture_url || !picture.is_primary) throw new ValidationError('this field is required', '06');
        
        // Data type validation
        if (typeof picture.picture_url !== 'string') throw new ValidationError('picture_url must be a string', '07');
        if (picture.is_primary !== undefined && typeof picture.is_primary !== 'boolean') throw new ValidationError('is_primary must be a boolean', '08');

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

export const updatePictureProductService = async (idProduct, picsList, client) => {
    await deletePicturesByProductId(idProduct, client);

    return addPictureProductService(idProduct, picsList, client);
}