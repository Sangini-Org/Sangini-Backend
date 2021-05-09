const db = require('../models')
const UserTrack = db.usertracks;
const { Op } = require('sequelize');
const { sendJSONResponse, sendBadRequest } = require('../utils/handle');


exports.getMatchingUsers = async (req, res) => {

    try {
        const user = await UserTrack.findOne({
            where: {
                userId: req.userId
            }
        })
        let recommendedUserFromOwn = {};
        let recommendedUserFromOther = {};
        let finalRecommendUser = [];
        const currentUserTracks = user.dataValues.tracklist;
        for (let track of currentUserTracks) {
            const matchingTracks = await UserTrack.findAll({
                where: {
                    tracklist: {
                        [Op.contains]: [track]
                    }
                }
            })
            for (let user of matchingTracks) {
                if (recommendedUserFromOwn[user.dataValues.userId] !== undefined) {
                    recommendedUserFromOwn[user.dataValues.userId] += (100 / currentUserTracks.length);
                    recommendedUserFromOther[user.dataValues.userId] += (100 / user.dataValues.tracklist.length);
                } else {
                    recommendedUserFromOwn[user.dataValues.userId] = (100 / currentUserTracks.length);
                    recommendedUserFromOther[user.dataValues.userId] = (100 / user.dataValues.tracklist.length);
                }
            }
        }
        Object.keys(recommendedUserFromOwn).map(user => {
            if (recommendedUserFromOwn[user] > 35 && recommendedUserFromOther[user] > 35) {
                let singleRecommendUser = {}
                singleRecommendUser[user] = recommendedUserFromOwn[user].toFixed(2);
                finalRecommendUser.push(singleRecommendUser);
            }
        })
        // console.log(recommendedUserFromOwn);
        // console.log(recommendedUserFromOther);
        return sendJSONResponse(res, 200, 'recommended users', finalRecommendUser);
    }
    catch (err) {

        return sendBadRequest(res, 500, `${err.message}`)

    }

}