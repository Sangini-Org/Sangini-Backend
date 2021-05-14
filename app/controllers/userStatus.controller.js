const db = require("../models");
const Status = db.userStatus;
const User = db.users;
const { sendJSONResponse, sendBadRequest } = require("../utils/handle")
const { getPagingData, getPagination } = require("../utils/paginate");
const Op = db.Sequelize.Op;

exports.addStatus = async (req, res) => {
    try {
        const fields = { trackId, emoji, songLine } = req.body;
        fields.userId=req.userId;
        fields.like=[];
        let status = await Status.create(fields);
        return sendJSONResponse(res, 200, "Status has been created", status);
    } catch (err) {
        return sendBadRequest(res, 404, 'Error while creating Status ' + err.message);
    }
}

exports.updateStatus = async (req, res) => {
    try {
        const { trackId, emoji, songLine } = req.body;
        fields = { trackId, emoji, songLine};
        fields.like = [];
        let result = await Status.update(fields,{
                where: { userId: req.userId }
            });
        if (result == 1) {
        return sendJSONResponse(res, 200, "Status updated",);
        } else {
        return sendBadRequest(res, 404, 'Status update failed ');
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
        console.log(usersDetails)
        if (!usersDetails.length) {
          return sendJSONResponse(res, 200, "user status not found by username", []);
        }  
        for (let user of usersDetails) {
          if(user.dataValues.id==req.id){continue;}
          similarUsernameDetails.push(user.dataValues.id)
        }   
      }
      console.log(similarUsernameDetails)
      const condition= similarUsernameDetails.length? {userId: similarUsernameDetails} : null  ;
      const allStatus = await Status.findAndCountAll({
         where: condition
        , 
        order:[ 
          ['like', 'DESC'],
          ['updatedAt',  'DESC'], 
        ],limit, offset});
      
      if (allStatus) {
        const response = getPagingData(allStatus, page, limit);
        return sendJSONResponse(res, 200, "all status found ",response);
      } else {
        return sendBadRequest(res, 404, " not found");
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
      attributes: ['like']
    });
    if(status){
      console.log(status.like)
      if (status.like.includes(req.userId)) {
        let index = status.like.indexOf(req.userId);
        status.like.splice(index, 1);
        await Status.update({ like: status.like }, {
          where: { userId }
        });
        return sendJSONResponse(res, 200, "Status Unliked",);
      } else {
        await Status.update({ like: status.like.concat([req.userId]) }, {
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