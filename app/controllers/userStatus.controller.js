const db = require("../models");
const Status = db.userStatus;
const User = db.users;
const { sendJSONResponse, sendBadRequest } = require("../utils/handle")
const { getPagingData, getPagination } = require("../utils/paginate");

exports.addStatus = async (req, res) => {
    try {
        const fields = { trackId, emoji, songLine } = req.body;
        fields.userId=req.userId;
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
        fields.like = 0;
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
      let userId;
      const { page, offlimit, username } = req.query;  
      const { limit, offset } = getPagination(page, offlimit);
      if(username){
        const user= await User.findOne({where :
         { username: username},attributes: ['id','city']
        });
        userId = user.id;
      }
      const condition= userId?{userId:userId}:null;
      const allStatus = await Status.findAndCountAll({
         where: condition
        , 
        order:[ 
          ['like', 'DESC'],
          ['updatedAt',  'DESC'], 
        ],limit, offset});
      
      if (allStatus) {
        const response = getPagingData(allStatus, page, limit);
        return sendJSONResponse(res, 200, "ALL Status found ",response);
      } else {
        return sendBadRequest(res, 404, " Not Found");
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
    let result = await Status.update({ like: update }, {
      where: { userId: req.userId }
    });
    if (result == 1) {
      return sendJSONResponse(res, 200, "Status Liked",);
    } else {
      return sendBadRequest(res, 404, 'Liking status failed ');
    }
  } catch (err) {
    return sendBadRequest(res, 500, 'Error while liking status' + err.message);
  }
}


exports.dislikeStatus = async (req, res) => {
  try {
    const { userId } = req.body;
    const status = await Status.findOne({
      where: { userId: userId },
      attributes: ['like']
    });
    let result = await Status.update({ like: status.like - 1 }, {
      where: { userId: req.userId }
    });
    if (result == 1) {
      return sendJSONResponse(res, 200, "Status Disliked",);
    } else {
      return sendBadRequest(res, 404, 'Disliking Status failed');
    }
  } catch (err) {
    return sendBadRequest(res, 500, 'Error while disliking status' + err.message);
  }
}
