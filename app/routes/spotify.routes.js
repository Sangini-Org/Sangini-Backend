const controller = require("../controllers/spotify.controller");
console.log(controller)
module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
        );
        next();
      });

    app.get('/api/connect', controller.authorizeSpotify);
    app.get('/api/callback', controller.spotifyToken);

    app.get('/api/refreshtoken', controller.spotifyRefreshToken);
}   