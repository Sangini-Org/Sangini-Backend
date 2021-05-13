const db = require('../models')
const UserTrack = db.usertracks;
const User = db.users;
const { Op } = require('sequelize');
const { sendJSONResponse, sendBadRequest } = require('../utils/handle');

exports.getMatchingUsersByTracks = async (req, res) => {
    try {
        const { skip, offlimit, recommend } = req.query;
        let offset = skip ? skip : 0;
        let limit = offlimit ? offlimit : 5;
        let max= recommend?recommend:3;
        const user = await UserTrack.findOne({
            where: {
                userId: req.userId
            }
        })
        let recommendedUserFromOwn = {};
        let recommendedUserFromOther = {};
        let finalRecommendUser = [];
        const currentUserTracks = user.dataValues.tracklist;
        let totalUsers;
        do {
            const users = await User.findAndCountAll({ limit, offset, attributes: ['id'] });
            totalUsers = users.count;
            let userskip = 0;
            for (let user of users.rows) {
                if (user.id == req.userId) {
                    continue;
                }
                const otherUserTracks = await UserTrack.findOne({ where: { userId: user.id } });
                let count=0;
                for (let track of currentUserTracks) {
                    if (otherUserTracks.tracklist.includes(track)) {
                        count++;
                    }
                }
                recommendedUserFromOwn[user.id] = count*(100 / currentUserTracks.length);
                recommendedUserFromOther[user.id] = count*(100 / otherUserTracks.tracklist.length);

                if (recommendedUserFromOwn[user.id] > 5 && recommendedUserFromOther[user.id] > 5) {
                    let singleRecommendUser = {}
                    singleRecommendUser[user.id] = recommendedUserFromOwn[user.id].toFixed(2);
                    finalRecommendUser.push(singleRecommendUser);
                }
                userskip++;
                if (finalRecommendUser.length == max) {
                    break;
                }
            }
            offset = Number(offset) + Number(userskip);
        } while ((finalRecommendUser.length < recommend) && (totalUsers > offset))

        console.log(recommendedUserFromOwn);
        console.log(recommendedUserFromOther);
        console.log(finalRecommendUser);
        return sendJSONResponse(res, 200, 'recommended users by tracks', {
            'totalUsers': totalUsers,
            'currentOffset': offset,
            'finalRecommendUser': finalRecommendUser
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

exports.getMatchingUsers = async (req, res) => {
    try {
        const { skip, offlimit, recommend } = req.query;
        let max = recommend ? recommend : 5;
        let offset = skip ? skip : 0;
        let limit = offlimit ? offlimit : 5;
        const currentUser = await UserTrack.findOne({
            where: {
                userId: req.userId
            }
        })
        let recommendUserBytrack = {};
        let recommendUserByartist = {};
        let finalRecommendUser = [];
        let totalUsers;

        do {
            const users = await User.findAndCountAll({ limit, offset, attributes: ['id'] });
            totalUsers = users.count;
            let userskip = 0;
            for (let user of users.rows) {
                userskip++;
                if (user.id == req.userId) { continue; }
                const otherUser = await UserTrack.findOne({ where: { userId: user.id } });
                let count = 0;
                for (let field of currentUser.tracklist) {
                    if (otherUser.tracklist.includes(field)) {
                        count++;
                    }
                }
                let MatchPercentageFromOwn = count * (100 / currentUser.tracklist.length);
                let MatchPercentageFromOther = count * (100 / otherUser.tracklist.length);
                if (MatchPercentageFromOwn >= 25 && MatchPercentageFromOther >= 25) {
                    recommendUserBytrack[user.id] = MatchPercentageFromOwn.toFixed(2);
                }

                count = 0;
                for (let field of currentUser.artistlist) {
                    if (otherUser.artistlist.includes(field)) {
                        count++;
                    }
                }
                MatchPercentageFromOwn = count * (100 / currentUser.artistlist.length);
                MatchPercentageFromOther = count * (100 / otherUser.artistlist.length);
                if (MatchPercentageFromOwn >= 25 && MatchPercentageFromOther >= 25) {
                    recommendUserByartist[user.id] = MatchPercentageFromOwn.toFixed(2);
                }

                let percentage;
                if ((recommendUserBytrack[user.id] != undefined) && (recommendUserByartist[user.id] != undefined)) {
                    percentage = (Number(recommendUserBytrack[user.id]) + Number(recommendUserBytrack[user.id])) / 2;
                } else if ((recommendUserBytrack[user.id] != undefined)) {
                    percentage = recommendUserBytrack[user.id];
                }
                else if ((recommendUserByartist[user.id] != undefined)) {
                    percentage = recommendUserByartist[user.id];
                }
                if (percentage) {
                    finalRecommendUser.push({ [user.id]: percentage });
                }
                if (finalRecommendUser.length == max) {
                    break;
                }
            }
            offset = Number(offset) + Number(userskip);
        } while ((finalRecommendUser.length < max) && (totalUsers > offset))

        console.log(recommendUserBytrack);
        console.log(recommendUserByartist);
        console.log(finalRecommendUser);
        return sendJSONResponse(res, 200, 'recommended users', {
            'totalUsers': totalUsers,
            'currentOffset': offset,
            'finalRecommendUser': finalRecommendUser
        });
    }
    catch (err) {
        return sendBadRequest(res, 500, `${err.message}`)
    }

}