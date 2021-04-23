const db = require("../models");
const { cloudinary } = require('../utils/cloudinary');
const { sendJSONResponse, sendBadRequest } = require("../utils/handle")

const userImage = db.userImages;

exports.addUserImage = async (req, res) => {
    try {
        const userId = req.userId
        const {type } = req.body;
        const file = req.files.image;
        await cloudinary.uploader.upload(file.tempFilePath, async (err, result) =>{
          if (err) {
            return sendBadRequest(res, 404, 'Error while uploading file to cloudinary' + err);
          }
          else {
              console.log(userId)
                const image =   await userImage.create({
                    publicId: result.public_id,
                    url: result.secure_url,
                    imgType: type,
                });
            }
        });
        return sendJSONResponse(res, 200, "Image updated successfully");
    }
    catch (err) {
        return sendBadRequest(res, 500, `${err.message}`)
    }
};

exports.getUserImage = async (req, res) => {
    try {
      const {type } = req.query;

      const images = await userImage.findAll({
        where: {
            imgType:type
        } })
        
      console.log(images);
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