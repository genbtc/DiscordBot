function GoogleSearchPlugin() {
    this.google = require('google');
    this.google.resultsPerPage = 10;
    var nextCounter = 0
};

GoogleSearchPlugin.prototype.respond = function(query, channel, bot) {
    this.google(query, function(err, response) {
        var i = 0;
	if (err) { 
            console.log(err);
            channel.sendMessage("The Bot is banned from Google. This is your fault");
            return;
        }
        if (response.links === undefined || response.links[i] === undefined) {
            channel.sendMessage("¯\\_(ツ)_/¯");
            return;
        }
        while (response.links[i].link === undefined || response.links[i].link == null)
            i++;
        channel.sendMessage(response.links[i].link);
    });
};

module.exports = GoogleSearchPlugin;
