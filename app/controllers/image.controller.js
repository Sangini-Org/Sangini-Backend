const db = require("../models");
const { cloudinary } = require('../utils/cloudinary');
const { sendJSONResponse, sendBadRequest } = require("../utils/handle")

const Image = db.image;
console.log(Image);

exports.addImage = async (req, res) => {
    try {
        const { userId, type } = req.body;
        const file = req.files.photo;
        cloudinary.uploader.upload(file.tempFilePath, (err, result) => {
            if (err) {
                return sendBadRequest(res, 404, 'Error while uploading file to cloudinary' + err);
            }
            else {
                Image.update({
                    public_id: result.public_id,
                    url: result.secure_url,
                    type: type,
                    userId: userId
                });
                
            }
        });
        return sendJSONResponse(res, 200, "Image updated successfully")
    }
    catch (err) {
        return sendBadRequest(res, 500, `${err.message}`)
    }
};
