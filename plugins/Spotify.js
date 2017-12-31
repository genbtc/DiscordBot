var http = require('http');
var https = require('https');
var request = require('request'); // "Request" library
var querystring = require('querystring');
//var cookieParser = require('cookie-parser');
var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};
var stateKey = 'spotify_auth_state';

/**
 * Internal method for creating response hollabacks, should not be used on
 * its own
 */
function makeResponse(hollaback) {
    var chunks = '';

    return function (response) {
        response.setEncoding('utf8');

        response.on('data', function (chunk) {
            chunks += chunk;
        });

        response.on('end', function () {
            var err,
            json;

            try {
                json = JSON.parse(chunks);
            } catch (e) {
                err = e;
                console.log(e);
            }

            hollaback(err, json);
        });
    };
}
this._credentials = {};

module.exports = {
    setCredentials: function (credentials) {
        for (var key in credentials) {
            if (credentials.hasOwnProperty(key)) {
                this._credentials[key] = credentials[key];
            }
        }
    },

    getCredentials: function () {
        return this._credentials;
    },

    resetCredentials: function () {
        this._credentials = null;
    },

    setClientId: function (clientId) {
        this._setCredential('clientId', clientId);
    },

    setClientSecret: function (clientSecret) {
        this._setCredential('clientSecret', clientSecret);
    },

    setAccessToken: function (accessToken) {
        this._setCredential('accessToken', accessToken);
    },

    setRefreshToken: function (refreshToken) {
        this._setCredential('refreshToken', refreshToken);
    },

    setRedirectURI: function (redirectUri) {
        this._setCredential('redirectUri', redirectUri);
    },
    
    setState: function (redirectUri) {
        this._setCredential('state', redirectUri);
    },
    
    getState: function () {
        return this._getCredential('state');
    },
    
    getRedirectURI: function () {
        return this._getCredential('redirectUri');
    },

    getClientId: function () {
        return this._getCredential('clientId');
    },

    getClientSecret: function () {
        return this._getCredential('clientSecret');
    },

    getAccessToken: function () {
        return this._getCredential('accessToken');
    },

    getRefreshToken: function () {
        return this._getCredential('refreshToken');
    },

    resetClientId: function () {
        this._resetCredential('clientId');
    },

    resetClientSecret: function () {
        this._resetCredential('clientSecret');
    },

    resetAccessToken: function () {
        this._resetCredential('accessToken');
    },

    resetRefreshToken: function () {
        this._resetCredential('refreshToken');
    },

    resetRedirectURI: function () {
        this._resetCredential('redirectUri');
    },

    _setCredential: function (credentialKey, value) {
        this._credentials = this._credentials || {};
        this._credentials[credentialKey] = value;
    },

    _getCredential: function (credentialKey) {
        if (!this._credentials) {
            return;
        } else {
            return this._credentials[credentialKey];
        }
    },

    _resetCredential: function (credentialKey) {
        if (!this._credentials) {
            return;
        } else {
            this._credentials[credentialKey] = null;
        }
    },
    /**
     * Reverse-lookup a track, artist or album URI
     *
     * @param {Object} Options that should be used to do this query
     *                 `type` and `id` is required
     * @param {Function} The hollaback that'll be invoked once there's data
     */
    lookup: function (opts, hollaback) {
        var type = opts.type + 's';
        var query = '/v1/' + type + '/' + opts.id;
        this.get(query, hollaback);
    },

    /**
     * Search the Spotify library for a track, artist or album
     *
     * @param {Object} Options that should be used to do this query
     *                 `type` and `query` is required
     * @param {Function} The hollaback that'll be invoked once there's data
     */
    search: function (opts, hollaback) {
        var query = '/v1/search?type=' + opts.type + '&q=' + opts.query;
        this.get(query, hollaback);
    },

    login: function (hollaback) {
        var state = generateRandomString(16);
        this.setState(state);
        var apipath = "/authorize?";
        var apioptions = querystring.stringify({
                            code: 'code',
                            grant_type: 'authorization_code',
                            client_id: this.getClientId(),
                            state: state
                        });
        var opts = {
            host: "accounts.spotify.com",
            path: encodeURI(apipath + apioptions),
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": "Basic " + (new Buffer(this.getClientId() + ":" + this.getClientSecret()).toString('base64'))
            }
        },
        hrequest = https.request(opts, makeResponse(hollaback));
        hrequest.end();
        hrequest.on('error', function (err) {
            hollaback(err, {});
        });
    },
    obtainToken: function (hollaback) {
        var client_id = this.getClientId(); // Your client id
        var client_secret = this.getClientSecret(); // Your secret
        // your application requests authorization
        var authOptions = {
          url: 'https://accounts.spotify.com/api/token',
          headers: {
            'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
          },
          form: {
            grant_type: 'client_credentials'
          },
          json: true
        };

        request.post(authOptions, function(error, response, body) {
          if (!error && response.statusCode === 200) {
            // use the access token to access the Spotify Web API
            var token = body.access_token;
            module.exports.setAccessToken(token);
            console.log("TOKEN WAS: " + module.exports.getAccessToken(token));
          }
        });
    },    
    /**
     * Send a request to the Spotify web service API
     *
     * @param {String} The path for this query, see http://developer.spotify.com/en/metadata-api/overview/
     * @param {Function} The hollaback that'll be invoked once there's data
     */
    get: function (query, hollaback) {
        var token = this.getAccessToken();
        var opts = {
            host: "api.spotify.com",
            path: encodeURI(query),
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": "Bearer " + token
            }
        },
        hrequest = https.request(opts, makeResponse(hollaback));
        hrequest.end();
        hrequest.on(' error ', function (err) {
            hollaback(err, {});
        });
    }
};
