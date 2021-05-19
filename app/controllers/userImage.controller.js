const db = require("../models");
const { cloudinary } = require('../utils/cloudinary');
const { sendJSONResponse, sendBadRequest } = require("../utils/handle")
const { checkProfile } = require("../controllers/user.controller");

const User = db.users;
const userImage = db.userImages;
const Op = db.Sequelize.Op;
 
exports.addUserImage = async (req, res) => {
  try {
    const { type } = req.body;
    const file = req.files.image;
    const image =await cloudinary.uploader.upload(file.tempFilePath,async (err, result) => {
      if (err) {
        return sendBadRequest(res, 404, 'Error while uploading file to cloudinary' + err);
      }
      else {
        await userImage.create({
          publicId: result.public_id,
          url: result.secure_url,
          imgType: type,
          userId: req.userId
        })
         checkProfile(req.userId);    
      }
    });
    return sendJSONResponse(res, 200, "Image uploaded successfully",image.public_id);
  }
  catch (err) {
    return sendBadRequest(res, 500, `${err.message}`)
  }
};

exports.getUserImage = async (req, res) => {
  try {
    const { type } = req.query;
    let condition = {userId : req.params.id};
    if(type){
      condition.imgType = type;
    }
    const user = await User.findOne({where: {id:req.params.id?req.params.id:null}})
    const images = await userImage.findAll({
      where: condition
    })
    if (user) {
      return sendJSONResponse(res, 200,"user images", images)
    } else {
      return sendBadRequest(res, 404, "User Not Found");
    }
  }
  catch (err) {
    return sendBadRequest(res, 500, 'Error while getting user images ' + err.message)
  }
};

exports.updateUserImage = async (req, res) => {
  try {
    const { publicId } = req.body;
    const file = req.files.image;
    await cloudinary.uploader.upload(file.tempFilePath, { public_id: publicId },  (err, result) => {
      if (err) {
        return sendBadRequest(res, 404, 'Error while updating file to cloudinary' + err);
      }
      else {
        userImage.update({
          url: result.secure_url,
        }, {
          where: { 
            publicId: publicId,
            userId: req.userId
           }
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
    if(publicId){
      await cloudinary.uploader.destroy( publicId,async (result,err)=>{
      await userImage.destroy({
        where: {
          publicId: publicId,
          userId: req.userId,
        }
      })
       checkProfile(req.userId);
     });
    return sendJSONResponse(res, 200, "Image deleted");
  }else{
    return sendBadRequest(res, 404, "publicId missing");
  }
  } catch (err) {
    return sendBadRequest(res, 500, err.message);
  }
}