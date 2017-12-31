var AuthDetails = require("../data/auth.json");

function SpotifySearchPlugin() {
    this.spotify = require('./Spotify');
    this.spotify.setClientId(AuthDetails.spotify_client_id);
    this.spotify.setClientSecret(AuthDetails.spotify_client_secret);
    this.spotify.login(function(err, data) {
        if ( err ) {
            console.log("¯\\_(ツ)_/¯");
            return;
        }
        console.log(JSON.stringify(data));
    });
    this.spotify.obtainToken(function(err, data) {
        if ( err ) {
            console.log("¯\\_(ツ)_/¯");
            return;
        }
        console.log(JSON.stringify(data));
    });
};

SpotifySearchPlugin.prototype.respond = function(query, channel, bot) {
    var args = query.split(" ");
    var qtype = "track"
    if (args[0] == qtype) {
        args.shift();
        query = args.join(" ");
    }
    this.spotify.search({ type: qtype, query: query }, function(err, data) {
        if ( err ) {
            channel.sendMessage("¯\\_(ツ)_/¯");
            return;
        }
        // Do something with 'data', print out the result
        //console.log(JSON.stringify(data));
        var output = JSON.stringify(data);
        var URL;
        if (data["tracks"]["total"] > 0) {
            URL = data.tracks.items[0].external_urls.spotify;
            console.log("URL WAS: " + URL);
        }
        console.log(output);
        channel.sendMessage(URL);
    });
};

module.exports = SpotifySearchPlugin;
