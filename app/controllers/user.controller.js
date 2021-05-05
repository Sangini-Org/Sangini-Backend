const db = require("../models");
const User = db.users;
const UserTrack = db.usertracks;
const Track = db.tracks;
const { sendJSONResponse, sendBadRequest } = require("../utils/handle")
const { getPagingData, getPagination } = require("../utils/paginate.js");
const { checkImageCount } = require("../controllers/userImage.controller");

const Op = db.Sequelize.Op;

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.params.id,
      },
      attributes: { exclude: ['password'] },
    })
    if (!user) {
      return sendBadRequest(res, 404, "User Not Found");
    }
    return sendJSONResponse(res, 200, "User exists", {
      user
    })
  }
  catch (err) {
    return sendBadRequest(res, 500, `${err.message}`)
  }
};

exports.editUser = async (req, res) => {
  try {
    const { firstName, lastName, bio, state, city, gender ,dob} = req.body;
    const fields = { firstName, lastName, bio, state, city, gender, dob };
    var updateState = true;
    
    await User.update(
      fields, { where: { id: req.userId } 
    }).then(async (result) => {
        
      const user = await User.findOne({
        where: { id: req.userId },
        attributes: { exclude: ['password'] }
        });
     
      Object.keys(user.dataValues).forEach(key => {
        if ((key in fields) && (user.dataValues[key] == null)) {
           updateState = false;
          }
      });
    }); 
    const imageStatus = await checkImageCount(req.userId);
    if(imageStatus== false){
      updateState = false;
    }   
    User.update({ isProfileUpdated: updateState }, { where: { id: req.userId } }); 
   
    if(updateState==false){
    return sendJSONResponse(res, 400, "Please complete your profile ");
    }
    return sendJSONResponse(res, 200, "Profile updated successfully ");
  }
  catch (err) {
    return sendBadRequest(res, 500, `${err.message}`)
  }
};

exports.getAllUser = async (req, res) => {
  try {
    const { page, offlimit, city, gender, username, state, firstName } = req.query;
    var condition = {};
    const filters = { city, gender, username, state, firstName };

    Object.entries(filters).forEach(filter => {
      Object.assign(condition, filter[1] ? { [filter[0]]: { [Op.like]: `%${filter[1]}%` } } : null);
    })

    const { limit, offset } = getPagination(page, offlimit);
    const users = await User.findAndCountAll({
      where: condition, limit, offset,
      attributes: { exclude: ['password'] }
    })

    if (users) {
      const response = getPagingData(users, page, limit);
      res.send(response);
    } else {
      return sendBadRequest(res, 404, "Users Not Found");
    }
  }
  catch (err) {
    return sendBadRequest(res, 500, 'Error while getting users list ' + err.message)
  }
};

exports.getPlaylist = async (req, res) => {
  try {
    const trackslist = [];
    const alltracks = await UserTrack.findOne({
      where: { userId: req.params.id }
    });
    if (!alltracks) {
      return sendJSONResponse(res, 200, 'user playlist', trackslist);
    }
    alltracks.tracklist.forEach(async trackId => {
      const track = await Track.findOne({
        where: { trackId: trackId }
      });
      trackslist.push({ trackName: track.trackName, trackId: trackId });
      if (trackslist.length == alltracks.tracklist.length) {
        return sendJSONResponse(res, 200, "user playlist", trackslist)
      }
    });
  }
  catch (err) {
    return sendBadRequest(res, 500, 'Error while getting playlist ' + err.message)
  }
};
