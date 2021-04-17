const { generateRandomString } = require("../utils/generateRandomString");
require('dotenv').config()
const request = require('request');
const querystring = require('querystring');
const { sendJSONResponse } = require("../utils/handle");
const stateKey = 'spotify_auth_state';

exports.authorizeSpotify = (req, res) => {
    console.log('working')
    const state = generateRandomString(16);
    console.log(process.env.CLIENT_ID, 'line 11')
    res.cookie(stateKey, state);
    const scope = 'user-read-private user-read-email playlist-modify-public';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: process.env.CLIENT_ID,
            scope: scope,
            redirect_uri: process.env.REDIRECT_URI,
            state: state
        }));
}

exports.spotifyToken = (req, res) => {

    const code = req.query.code || null;
    const state = req.query.state || null;
    const storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {
        res.clearCookie(stateKey);
        const authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: process.env.REDIRECT_URI,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'))
            },
            json: true
        };

        request.post(authOptions, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                const access_token = body.access_token,
                    refresh_token = body.refresh_token;
                const options = {
                    url: 'https://api.spotify.com/v1/me/playlists/',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
                };


                // use the access token to access the Spotify Web API
                request.get(options, function (error, response, body) {
                    const userId = body.items[0].owner.id;
                    console.log(access_token);
                    const form = {
                        name: 'sangini',
                        description: 'Sangini Matching Playlist - Do not delete if you are using sangini web app',
                        public: true
                    }
                    const createplaylistOptions = {
                        url: `https://api.spotify.com/v1/users/${userId}/playlists`,
                        headers: { 'Authorization': 'Bearer ' + access_token },
                        form: JSON.stringify(form)
                        // json: true
                    }
                    const sanginiPlaylistId;
                    const flag = body.items.find(item => item.name === "sangini");
                    if (!flag) {
                        request.post(createplaylistOptions, function (error, response, body) {
                            sanginiPlaylistId = body.id;
                        })

                    }

                    return sendJSONResponse(res, '200', 'Access Token', {
                        access_token: access_token,
                        refresh_token: refresh_token,
                        body: body
                    })
                });


            }
        });
    }
}


exports.spotifyRefreshToken = (req, res) => {
    const refresh_token = req.query.refresh_token;
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64')) },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            const access_token = body.access_token;
            res.send({
                'access_token': access_token
            });
        }
    });

}