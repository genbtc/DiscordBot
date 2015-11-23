function GoogleSearchPlugin () {
    this.google = require('google');
    this.google.resultsPerPage = 25
    var nextCounter = 0
};

GoogleSearchPlugin.prototype.respond = function (query, channel, bot) {
    this.google(query, function (err, next, links){
        if (err)
            bot.sendMessage(channel, "¯\\_(ツ)_/¯");

        var i=0;
        while(links[i].link == null)
            i++;
        bot.sendMessage(channel,links[i].link);
    });
};
    
module.exports = GoogleSearchPlugin;