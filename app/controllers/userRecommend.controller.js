const db = require('../models')
const UserTrack = db.usertracks;
const { Op } = require('sequelize');
const { sendJSONResponse, sendBadRequest } = require('../utils/handle');

exports.getMatchingUsersByTracks = async (req, res) => {

    try {
        const { page, offlimit } = req.query;
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
            console.log(matchingTracks);
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
        console.log(recommendedUserFromOwn);
        console.log(recommendedUserFromOther);
        console.log(finalRecommendUser);
        return sendJSONResponse(res, 200, 'recommended users by tracks', finalRecommendUser);
    }
    catch (err) {
        return sendBadRequest(res, 500, `${err.message}`)
    }

}

exports.getMatchingUsersByArtists = async (req, res) => {
    try {
        const user = await UserTrack.findOne({
            where: {
                userId: req.userId
            }
        })
        let recommendedUserFromOwn = {};
        let recommendedUserFromOther = {};
        let finalRecommendUser = [];
        const currentUserArtistList = user.dataValues.artistlist;
        for (let artist of currentUserArtistList) {
            const matchingArtists = await UserTrack.findAll({
                where: {
                    artistlist: {
                        [Op.contains]: [artist]
                    }
                }
            })
            for (let user of matchingArtists) {
                if (recommendedUserFromOwn[user.dataValues.userId] !== undefined) {
                    recommendedUserFromOwn[user.dataValues.userId] += (100 / currentUserArtistList.length);
                    recommendedUserFromOther[user.dataValues.userId] += (100 / user.dataValues.artistlist.length);
                } else {
                    recommendedUserFromOwn[user.dataValues.userId] = (100 / currentUserArtistList.length);
                    recommendedUserFromOther[user.dataValues.userId] = (100 / user.dataValues.artistlist.length);
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
        console.log(recommendedUserFromOwn);
        console.log(recommendedUserFromOther);
        console.log(finalRecommendUser);
        return sendJSONResponse(res, 200, 'recommended users by artists', finalRecommendUser);

    } catch (err) {
        return sendBadRequest(res, 500, `${err.message}`);
    }

}