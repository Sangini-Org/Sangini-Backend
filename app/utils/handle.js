const crypto = require("crypto");

const sendJSONResponse = (res, status, message, data) => {
    const jsonResponse = {
        metadata: {
            status,
            message,
        },
        data,
    };

    res.status(status);
    return res.send(jsonResponse);
}

const sendBadRequest = (res, status, errMsg) => {
    return sendJSONResponse(res, status, errMsg);
}

const generateRandomString = (type, size = 15) => {
  return crypto.randomBytes(size).toString(type).slice(0, size);
}

const handle={
    sendJSONResponse: sendJSONResponse,
    sendBadRequest: sendBadRequest,
    generateRandomString: generateRandomString
}

module.exports=handle;
