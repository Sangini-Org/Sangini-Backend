const db = require("../models");
const { cloudinary } = require('../utils/cloudinary');
const { sendJSONResponse, sendBadRequest } = require("../utils/handle")

const Image = db.images;

exports.addImage = async (req, res) => {
    try {
        const {type } = req.body;
        console.log(req.userId)
        const file = req.files.photo;
        await cloudinary.uploader.upload(file.tempFilePath, async (err, result) =>{
            if (err) {
                return sendBadRequest(res, 404, 'Error while uploading file to cloudinary' + err);
            }
            else {
                  let image = await Image.create({
                    publicId: result.public_id,
                    url: result.secure_url,
                    imgType: type,
                    userId: req.userId
                });
            }
        });
        return sendJSONResponse(res, 200, "Image updated successfully");
    }
    catch (err) {
        return sendBadRequest(res, 500, `${err.message}`)
    }
};
