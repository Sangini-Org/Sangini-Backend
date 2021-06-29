const db = require("../models");
const StaticData = db.staticData;

const { sendJSONResponse, sendBadRequest } = require("../utils/handle");

exports.update = async (req, res) => {
  try {
    const { genres, genders, states, tags, hobbies } = req.body;
    const data = { genres, genders, states, tags, hobbies };
    
    let static = await StaticData.findOne({where:{row:"main"}});
    let result = 0;
    if (!static) {
      data.row = "main";
      result = await StaticData.create(data);
    } else {
      result = await StaticData.update(data,{where:{row:"main"}});
    }
    if (result) {
      return sendJSONResponse(res, 200, "staticData Updated Successfully");
    }
  } catch (err) {
    return sendBadRequest(res, 500, err.message);
  }
};

exports.getData = async (req, res) => {
  try {
    const { type } = req.query;
    let static = await StaticData.findOne({ where: {row: "main"} ,attribute: type });
    if (static ) {
      return sendJSONResponse(res, 200, { static });
    }
    return sendBadRequest(res, 404, "Failed to get static Data ");
  } catch (err) {
    return sendBadRequest(res, 500, err.message);
  }
};
