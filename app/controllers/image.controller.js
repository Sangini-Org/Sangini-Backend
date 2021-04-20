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

exports.getImage = async (req, res) => {
    try {
      const {type } = req.query;

      const images = await Image.findAll({
        where: {
            imgType:type
        } })
  
      if(images) {
          res.send(images);
      } else {
        return sendBadRequest(res, 404, "Users Not Found");
      }
    }
    catch (err) {
      return sendBadRequest(res, 500, 'Error while getting users list ' + err.message)
    }
  };