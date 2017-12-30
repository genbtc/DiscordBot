var AuthDetails = require("../data/auth.json");

function SpotifySearchPlugin() {
    this.spotify = require('./Spotify');
    this.spotify.setClientId(AuthDetails.spotify_client_id);
    this.spotify.setClientSecret(AuthDetails.spotify_client_secret);
    this.spotify.obtainToken(function(err, data) {
        if ( err ) {
            console.log("¯\\_(ツ)_/¯");
            return;
        }
        console.log(JSON.stringify(data));
    });
    this.spotify.login(function(err, data) {
        if ( err ) {
            console.log("¯\\_(ツ)_/¯");
            return;
        }
        // Print any Spotify Login Authentication Errors:
        console.log(JSON.stringify(data));
    });
};

SpotifySearchPlugin.prototype.respond = function(query, channel, bot) {
    this.spotify.search({ type: 'track', query: query }, function(err, data) {
        if ( err ) {
            channel.sendMessage("¯\\_(ツ)_/¯");
            return;
        }
        // Do something with 'data', print out the result
        channel.sendMessage(JSON.stringify(data));
    });
};

module.exports = SpotifySearchPlugin;
