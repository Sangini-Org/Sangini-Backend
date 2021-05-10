const db = require('../models')
const UserTrack = db.usertracks;
const User = db.users;
const { Op } = require('sequelize');
const { sendJSONResponse, sendBadRequest } = require('../utils/handle');
const { getPagination } = require("../utils/paginate");

exports.getMatchingUsersByTracks = async (req, res) => {

    try {
        const { page, offlimit } = req.query;
        const { limit, offset } = getPagination(page, offlimit); //default (1,5)
        const user = await UserTrack.findOne({
            where: {
                userId: req.userId
            }
        })
        let recommendedUserFromOwn = {};
        let recommendedUserFromOther = {};
        let finalRecommendUser = [];
        const currentUserTracks = user.dataValues.tracklist;
        const users = await User.findAndCountAll({attributes:['id'],limit, offset});
        for(let user of users.rows){
            recommendedUserFromOwn[user.id]=0;
            recommendedUserFromOther[user.id]=0;
            const otherUserTracks = await UserTrack.findOne({where: {userId: user.id}} );
            for (let track of currentUserTracks) {
                if(otherUserTracks.tracklist.includes(track)){
                recommendedUserFromOwn[user.id] += (100 / currentUserTracks.length);
                recommendedUserFromOther[user.id] += (100 / otherUserTracks.tracklist.length); 
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
        return sendJSONResponse(res, 200, 'recommended users by tracks', { 
                'totalUsers': users.count,
                'totalIteration': Math.ceil(users.count / limit),
                'currentIteration': Math.ceil(offset / limit)+1,
                'recommendUserFound':finalRecommendUser.length,
                'finalRecommendUser':finalRecommendUser
        });
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