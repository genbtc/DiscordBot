var AuthDetails = require("../data/auth.json");

function GoogleCustomSearchPlugin() {
    this.google = require('googleapis');
};

const CX = AuthDetails.google_customsearch_id;
const API_KEY = AuthDetails.google_api_key;

GoogleCustomSearchPlugin.prototype.respond = function(query, channel, bot) {
    this.google.customsearch('v1').cse.list({
        cx: CX,
        auth: API_KEY,
        q: query,
        searchType: "image",
        enableImageSearch: "true",
        defaultToImageSearch: "true",
        disableWebSearch: "true",
        safe: "off",
        num: 10
    }, function(err, resp) {
        if (err) {
            console.log('An error occured', err);
            return;
        }
        // Got the response from custom search
        //console.log('Result: ' + resp.searchInformation.formattedTotalResults);
        if (resp.items && resp.items.length > 0) {
            bot.sendMessage(channel, resp.items[0].title + "\n" + resp.items[0].link);
        }
    });
};


module.exports = GoogleCustomSearchPlugin;
