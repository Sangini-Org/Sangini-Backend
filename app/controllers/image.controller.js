const db = require("../models");
const { cloudinary } = require('../utils/cloudinary');
const { sendJSONResponse, sendBadRequest } = require("../utils/handle")

const Image = db.images;

exports.addImage = (req, res) => {
    try {
        const { type } = req.body;
        const file = req.files.photo;
        cloudinary.uploader.upload(file.tempFilePath, (err, result) => {
            if (err) {
                return sendBadRequest(res, 404, 'Error while uploading file to cloudinary' + err);
            }
            else {
                   pImage.create({
                    public_id: result.public_id,
                    url: result.secure_url,
                    type: type
                });
               
            }
        });
        return sendJSONResponse(res, 200, "Image updated successfully");
    }
    catch (err) {
        return sendBadRequest(res, 500, `${err.message}`)
    }
};
