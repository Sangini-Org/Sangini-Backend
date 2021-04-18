const { generateRandomString } = require("../utils/generateRandomString");
require("dotenv").config();
const request = require("request");
const querystring = require("querystring");
const { sendJSONResponse, sendBadRequest } = require("../utils/handle");
const stateKey = "spotify_auth_state";
const db = require("../models");
const { access } = require("fs");
const User = db.users;
const userPlaylist = db.userPlaylist;

exports.authorizeSpotify = (req, res) => {
  console.log("working");
  const state = generateRandomString(16);
  console.log(process.env.CLIENT_ID, "line 11");
  res.cookie(stateKey, state);
  const scope = "user-read-private user-read-email playlist-modify-public";
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: process.env.CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.REDIRECT_URI,
        state: state,
      })
  );
};

// login or connect spotify
exports.spotifyToken = (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect(
      "/#" +
        querystring.stringify({
          error: "state_mismatch",
        })
    );
  } else {
    res.clearCookie(stateKey);
    const authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: "authorization_code",
      },
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
          ).toString("base64"),
      },
      json: true,
    };

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        console.log(body)
        const access_token = body.access_token,
          refresh_token = body.refresh_token;
        const options = {
          url: "https://api.spotify.com/v1/me/playlists/",
          headers: { Authorization: "Bearer " + access_token },
          json: true,
        };

        // use the access token to access the Spotify Web API
        request.get(options, async function (error, response, body) {
          try {
            const userId = body.items[0].owner.id;
            console.log(access_token);
            const form = {
              name: "sangini",
              description:
                "Sangini Matching Playlist - Do not delete if you are using sangini web app",
              public: true,
            };
            const createplaylistOptions = {
              url: `https://api.spotify.com/v1/users/${userId}/playlists`,
              headers: { Authorization: "Bearer " + access_token },
              form: JSON.stringify(form),
              // json: true
            };
            let sanginiPlaylistId = "";
            const flag = body.items.find((item) => item.name === "sangini");
            if (!flag) {
              request.post(
                createplaylistOptions,
                function (error, response, body) {
                  sanginiPlaylistId = body.id;
                }
              );
            } else {
              sanginiPlaylistId = flag.id;
            }
            console.log(sanginiPlaylistId);
            await User.update(
              {
                isSpotifyConnected: true,
                spotifyPlaylistId: sanginiPlaylistId,
                spotifyRefreshToken: refresh_token,
              },
              {
                where: {
                  id: req.userId,
                },
              }
            );
            return sendJSONResponse(
              res,
              "200",
              "spotify playlist created/added to your profile",body
            );
          } catch (err) {
            return sendBadRequest(res, 500, `${err.message}`);
          }
        });
      }
    });
  }
};


//for sync spotify playlist
exports.spotifyPlaylistSync = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        id: 'd56f9d2e-a92f-4ba7-9171-e909251fc5cd',
      },
      attributes: { exclude: ["password"] },
    });
    const refresh_token = user.dataValues.spotifyRefreshToken;
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
           access_token = body.access_token;
           const options = {
            url: `https://api.spotify.com/v1/playlists/${user.dataValues.spotifyPlaylistId}/tracks`,
            headers: { Authorization: "Bearer " + access_token },
            json: true,
          };
      
          request.get(options, function (error, response, body) {
            console.log(body.items)
              for( let item of body.items){
                  userPlaylist.create({
                    userId: req.userId,
                    trackId: item.track?.id,
                    trackImg: item.track?.name,
                    trackPreview: item.track?.preview_url,
                    trackImg: item.track.album[0]?.images[0]?.url,
                    playlistId: user.dataValues.spotifyPlaylistId,
                  })   
              }
              return sendJSONResponse(res,200,"playlist synced")
          });
      }
  });
  } catch (err) {
    return sendBadRequest(res,500, `${err.message}`)
  }
};
