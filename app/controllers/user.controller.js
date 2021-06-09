const db = require("../models");
const User = db.users;
const userImage = db.userImages;
const UserTrack = db.usertracks;
const Track = db.tracks;
const { sendJSONResponse, sendBadRequest } = require("../utils/handle")
const { getPagingData, getPagination } = require("../utils/paginate");

const Op = db.Sequelize.Op;

const checkProfile= async (userId) =>{
  try{
    const fields = ['firstName' , 'lastName', 'bio', 'state', 'city', 'gender', 'dob'];
    let status=false;
    const image = await userImage.findOne({ where: { userId: userId, imgType : 'profile'}});
    if(image){
     const count = await userImage.count({ where: { userId: userId, imgType : 'gallery'}});
      if (count>=2){ 
        status=true;
        const user = await User.findOne({where: { id: userId }, attributes: fields});
        for(let field of fields){
          if(user.dataValues[field] === null){
           status=false;
          }
        }
      }
    }
    User.update({ isProfileUpdated: status }, { where: { id: userId } });
  }
  catch(err){
    console.log("Error while checking profile update status "+err);
  }
}

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
    fields= { firstName, lastName, bio, state, city, gender ,dob};    
    const result = await User.update(
      fields, { where: { id: req.userId } 
    })
    checkProfile(req.userId);
    if(result==1){
      return sendJSONResponse(res, 200, "Info updated successfully ");
    }else{
      return sendBadRequest(res, 404, "Update Failed");
    }
  }
  catch (err) {
    return sendBadRequest(res, 500, `${err.message}`)
  }
};

exports.getAllUser = async (req, res) => {
  try {
    const { page, offlimit, city, gender, username, state, firstName } = req.query;
    var condition = {};
    const filters = { city, username, state, firstName };
    if(gender){
      condition.gender=gender;
    }
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
      return sendJSONResponse(res, 200, "Users", response)
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

exports.profileUpdateState = async (req, res) => {
  try {
    let state = req.body.updateState;
    if (state === 10) {
      await User.update({ isProfileUpdated: true }, { where: { id: req.userId } });
    }
    let result = await User.update({ updateState: state }, { where: { id: req.userId } });
    if (result) {
      return sendJSONResponse(res, 200, "status updated", {updateState: state});
    } else {
      return sendBadRequest(res, 404, "failed to update updateState");
    }
  }
  catch (err) {
    return sendBadRequest(res, 500, "Error while updating updateState " + err.message);
  }
};

exports.checkProfile= (userId)=>{
  return checkProfile(userId)
}