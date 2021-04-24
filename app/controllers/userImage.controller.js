const db = require("../models");
const { cloudinary } = require('../utils/cloudinary');
const { sendJSONResponse, sendBadRequest } = require("../utils/handle")

const userImage = db.userImages;

exports.addUserImage = async (req, res) => {
  try {
    const { type } = req.body;
    const file = req.files.image;
    await cloudinary.uploader.upload(file.tempFilePath, async (err, result) => {
      if (err) {
        return sendBadRequest(res, 404, 'Error while uploading file to cloudinary' + err);
      }
      else {
        const image = await userImage.create({
          publicId: result.public_id,
          url: result.secure_url,
          imgType: type,
          userId: req.userId
        });
      }
    });
    return sendJSONResponse(res, 200, "Image uploaded successfully");
  }
  catch (err) {
    return sendBadRequest(res, 500, `${err.message}`)
  }
};

exports.getUserImage = async (req, res) => {
  try {
    const { type } = req.query;
    const images = await userImage.findAll({
      where: {
        imgType: type
      }
    })
    if (images) {
      res.send(images);
    } else {
      return sendBadRequest(res, 404, "Users Not Found");
    }
  }
  catch (err) {
    return sendBadRequest(res, 500, 'Error while getting users list ' + err.message)
  }
};

exports.updateUserImage = async (req, res) => {
  try {
    const { publicId } = req.body;
    const file = req.files.image;
    await cloudinary.uploader.upload(file.tempFilePath, { public_id: publicId }, async (err, result) => {
      if (err) {
        return sendBadRequest(res, 404, 'Error while updating file to cloudinary' + err);
      }
      else {
        const image = await userImage.update({
          url: result.secure_url,
        }, {
          where: { publicId: publicId }
        });
      }
    });
    return sendJSONResponse(res, 200, "Image updated successfully");
  }
  catch (err) {
    return sendBadRequest(res, 500, `${err.message}`)
  }
};

exports.deleteUserImage = async (req, res) => {
  try {
    const { publicId } = req.body;
    await cloudinary.uploader.destroy( publicId,(result,err)=>{
       userImage.destroy({
        where: {
          publicId: publicId,
          userId: req.userId,
        }
      });
    });
    return sendJSONResponse(res, 200, "Image deleted");
  } catch (err) {
    return sendBadRequest(res, 404, err.message);
  }
}
