const db = require("../models");
const Status = db.userStatus;
const User = db.users;
const { sendJSONResponse, sendBadRequest } = require("../utils/handle")
const { getPagingData, getPagination } = require("../utils/paginate");
const Op = db.Sequelize.Op;

exports.addStatus = async (req, res) => {
    try {
        const { trackId, emoji, songLine } = req.body;
        let status = await Status.create({
          trackId: trackId,
          emoji: emoji,
          songLine: songLine,
          userId: req.userId,
          like: [],
        });
        return sendJSONResponse(res, 200, "Status has been created", status);
    } catch (err) {
        return sendBadRequest(res, 404, 'Error while creating Status ' + err.message);
    }
}

exports.updateStatus = async (req, res) => {
    try {
      if(JSON.stringify(req.body) === "{}"){
        return sendBadRequest(res, 404, 'Status update failed ');
      }
      else{
        const { trackId, emoji, songLine } = req.body;
      
        await Status.update({
          trackId: trackId,
          emoji: emoji,
          songLine: songLine,
          like: [],
          likeCount: 0
        },{
                where: { userId: req.userId }
            });
        return sendJSONResponse(res, 200, "Status updated",);
      }
    } catch (err) {
        return sendBadRequest(res, 500, 'Error while updating status' + err.message);
    }
}
exports.deleteStatus = async (req, res) => {
    try {
        await Status.destroy({
            where: {
                userId: req.userId 
            }
        });
        return sendJSONResponse(res, 200, "Status deleted");
    } catch (err) {
        return sendBadRequest(res, 404, 'Error while removing Status ' + err.message);
    }
}

exports.getAllStatus = async (req, res) => {
    try {
      let similarUsernameDetails = [];
      const { page, offlimit, username } = req.query;  
      const { limit, offset } = getPagination(page, offlimit);
      if(username){
        const usersDetails = await User.findAll({where :
         { username: {
          [Op.like]: `%${username}%`
         }},attributes: ['id', 'username']
        });
        if (!usersDetails.length) {
          return sendJSONResponse(res, 200, "user status not found by username", []);
        }  
        for (let user of usersDetails) {
          if(user.dataValues.id==req.id){continue;}
          similarUsernameDetails.push(user.dataValues.id)
        }   
      }
      const condition= similarUsernameDetails.length? {userId: similarUsernameDetails} : null  ;
      const allStatus = await Status.findAndCountAll({
         where: condition
        , 
        order:[ 
          ['like', 'DESC'],
          ['updatedAt',  'DESC'], 
        ],limit, offset});
      if (allStatus.rows.length) {
        const response = getPagingData(allStatus, page, limit);
        return sendJSONResponse(res, 200, "all status found ",response);
      } else {
        return sendBadRequest(res, 404, "Status not found");
      }
    }
    catch (err) {
      return sendBadRequest(res, 500, 'Error while getting all status ' + err.message)
    }
  };

  
exports.getStatusById = async (req, res) => {
    try {
        const status = await Status.findOne({
        where: {
          userId: req.params.id,
        }
      })
      if (!status) {
        return sendBadRequest(res, 404, "Status Not Found");
      }
      return sendJSONResponse(res, 200, "Status exists", {
        status
      })
    }
    catch (err) {
      return sendBadRequest(res, 500, 'error while getting status by id '+err.message)
    }
  };

  
exports.likeStatus = async (req, res) => {
  try {
    const { userId } = req.body;
    const status = await Status.findOne({
      where: { userId: userId },
      attributes: ['like','likeCount']
    });
    if(status){
       if (status.like.includes(req.userId)) {
          await Status.update({ 
          like: status.like.filter(userId => userId != req.userId),
          likeCount: status.likeCount - 1
         }, {
          where: { userId }
        });
        return sendJSONResponse(res, 200, "Status Unliked",);
      } else {
        await Status.update({ 
          like: status.like.concat([req.userId]),
          likeCount: status.likeCount + 1
         }, {
          where: { userId:userId }
        });
        return sendJSONResponse(res, 200, "Status Liked",)
      }
    }
    return sendBadRequest(res, 404, 'Status Not found');
  } catch (err) {
    return sendBadRequest(res, 500, 'Error while liking status' + err.message);
  }
}
