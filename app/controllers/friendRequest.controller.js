const db = require("../models");
const FriendRequest = db.friendrequests;
const { sendJSONResponse, sendBadRequest } = require("../utils/handle")

exports.createFriendRequest = async (req, res) => {
    try {
        let request = await FriendRequest.create({
            senderId: req.userId,
            receiverId: req.body.id
        });

        return sendJSONResponse(res, 200, "Request has been created", request);
    } catch (err) {
        return sendBadRequest(res, 404, 'Error while creating friend request ' + err.message);
    }
}

exports.acceptFriendRequest = async (req, res) => {
    try {
        let request = await FriendRequest.update({
            status: 2
        }, {
            where: {
                senderId: req.body.id,
                receiverId: req.userId
            }
        });

        request = await FriendRequest.findOne({
            where: {
                senderId: req.userId,
                receiverId: req.body.id
            }
        });

        if(request) {
            request.status = 2;

            await request.save();
        } else {
            request = await FriendRequest.create({
                senderId: req.userId,
                receiverId: req.body.id,
                status: 2
            });
        }

        return sendJSONResponse(res, 200, "Friend request has been accepted", request);
    } catch (err) {
        return sendBadRequest(res, 404, "Request not found");
    }
}

exports.updateFriendRequest = async (req, res) => {
    try {
        let request = await FriendRequest.update({
            status: req.body.status
        }, {
            where: {
                receiverId: req.userId,
                senderId: req.body.id
            }
        });

        return sendJSONResponse(res, 200, "Friend request status altered", request);
    } catch (err) {
        return sendBadRequest(res, 404, 'Error while updating friend request ' + err.message);
    }
}

exports.deleteFriendRequest = async (req, res) => {
    try {
        let request = await FriendRequest.destroy({
            where: {
                receiverId: req.userId,
                senderId: req.body.id
            }
        });

        return sendJSONResponse(res, 200, "Friend request deleted", request);
    } catch (err) {
        return sendBadRequest(res, 404, 'Error while removing friend request ' + err.message);
    }
}

exports.listFriendRequest = async (req, res) => {
    try {
        const {status} =  req.query;
        const requests = await FriendRequest.findAll({
            where: {
                status: status,
                receiverId: req.userId
            }  
        });
        return sendJSONResponse(res, 200, "Friend requests found", requests);
    } catch (err) {
        return sendBadRequest(res, 404, 'Error while finding friend request list ' + err.message);
    }
};