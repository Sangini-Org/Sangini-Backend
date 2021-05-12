const querystring = require("querystring");
const axios = require("axios");

const getTokens = async (options) => {
    const url = "https://oauth2.googleapis.com/token";
    const values = {
        code: options.code,
        client_id: options.clientId,
        client_secret: options.clientSecret,
        redirect_uri: options.redirectUrl,
        grant_type: "authorization_code"
    };

    return axios.post(url, querystring.stringify(values), {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
    })
    .then((res) => res.data)
    .catch((error) => {
        throw new Error(error.message);
    });
}

exports.getGoogleUserData = async (code) => {
    const { id_token, access_token } = await getTokens({
        code,
        clientId: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        redirectUrl: `${process.env.SERVER_URL}/${process.env.REDIRECT_URI}`
    });
    console.log(access_token);
  
    return axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
        {
            headers: {
                Authorization: `Bearer ${id_token}`
            }
        }
    )
    .then((res) => res.data)
    .catch((error) => {
        throw new Error(err.message);
    });
}