// Get the email and password of the account
var AuthDetails = require("./auth.json");

var Discord = require("discord.js");

var yt = require("./youtube_plugin");
var youtube_plugin = new yt();

var gi = require("./google_image_plugin");
var google_image_plugin = new gi();

var wa = require("./wolfram_plugin");
var wolfram_plugin = new wa();

var gs = require("./google_plugin");
var google_plugin = new gs();

var qs = require("querystring");

var htmlToText = require('html-to-text');

var giphyconfig = {
    "api_key": "dc6zaTOxFJmzC",
    "rating": "r",
    "url": "http://api.giphy.com/v1/gifs/search",
    "permission": ["NORMAL"]
};

//https://api.imgflip.com/popular_meme_ids
var meme = {
	"brace": 61546,
	"mostinteresting": 61532,
	"fry": 61520,
	"onedoesnot": 61579,
	"yuno": 61527,
	"success": 61544,
	"allthethings": 61533,
	"doge": 8072285,
	"drevil": 40945639,
	"skeptical": 101711,
	"notime": 442575,
	"yodawg": 101716,
    "pepe": 33824827,
    "penguin": 39683168
};

var commands = {
	"gif": {
		usage: "<image tags>",
        description: "returns a random gif matching the tags passed",
		process: function(bot, msg, suffix) {
		    var tags = suffix.split(" ");
		    get_gif(tags, function(id) {
			if (typeof id !== "undefined") {
			    bot.sendMessage(msg.channel, "http://media.giphy.com/media/" + id + "/giphy.gif [Tags: " + (tags ? tags : "Random GIF") + "]");
			}
			else {
			    bot.sendMessage(msg.channel, "Invalid tags, try something different. [Tags: " + (tags ? tags : "Random GIF") + "]");
			}
		    });
		}
	},    
    "youtube": {
        usage: "<video tags>",
        description: "gets youtube video matching tags",
        process: function(bot,msg,suffix){
            youtube_plugin.respond(suffix,msg.channel,bot);        }
    },
    "ud": {
        usage: "<google searches urbandictionary>",
        description: "gets first result off UD through google",
        process: function(bot,msg,suffix){
            google_plugin.respond("site:urbandictionary.com " + suffix,msg.channel,bot);        }
    },    
    "google": {
        usage: "<google search>",
        description: "gets first result from google",
        process: function(bot,msg,suffix){
            google_plugin.respond(suffix,msg.channel,bot);        }
    },
    "image": {
        usage: "<image tags>",
        description: "gets image matching tags from google",
        process: function(bot,msg,suffix){ 
            google_image_plugin.respond(suffix,msg.channel,bot);    }
    },
    "meme": {
        usage: 'meme "top text" "bottom text"',
        description: "Generates a meme image (Quotes are required). Help: type !meme to list available memes.",
        process: function(bot,msg,suffix) {
            if(!suffix) {
                var str = "Currently available memes:\n"
                for (var m in meme){
                    str += m + "\n"
                }
                bot.sendMessage(msg.author,str);
            }        
            var tags = msg.content.split('"');
            var memetype = tags[0].split(" ")[1];
            var Imgflipper = require("imgflipper");
            var imgflipper = new Imgflipper(AuthDetails.imgflip_username, AuthDetails.imgflip_password);
            imgflipper.generateMeme(meme[memetype], tags[1]?tags[1]:"", tags[3]?tags[3]:"", function(err, image){
                bot.sendMessage(msg.channel,image);
            });
        }
    },
    "wiki": {
        usage: "<search terms>",
        description: "returns the summary of the first matching search result from Wikipedia",
        process: function(bot,msg,suffix) {
            var query = suffix;
            if(!query) {
                bot.sendMessage(msg.channel,"usage: !wiki search terms");
                return;
            }
            var Wiki = require('wikijs');
            new Wiki().search(query,1).then(function(data) {
                new Wiki().page(data.results[0]).then(function(page) {
                    page.summary().then(function(summary) {
                        var sumText = summary.toString().split('\n');
                        var continuation = function() {
                            var paragraph = sumText.shift();
                            if(paragraph){
                                bot.sendMessage(msg.channel,paragraph,continuation);
                            }
                        };
                        continuation();
                    });
                });
            },function(err){
                bot.sendMessage(msg.channel,err);
            });
        }
    },
    "reddit": {
        usage: "[subreddit]",
        description: "Returns the top post on reddit. Can optionally pass a subreddit to get the top psot there instead",
        process: function(bot,msg,suffix) {
            var path = "/.rss"
            if(suffix){
                path = "/r/"+suffix+path;
            }
            rssfeed(bot,msg,"https://www.reddit.com"+path,1,false);
        }
    }
};
try{
var rssFeeds = require("./rss.json");
function loadFeeds(){
    for(var cmd in rssFeeds){
        commands[cmd] = {
            usage: "[count]",
            description: rssFeeds[cmd].description,
            url: rssFeeds[cmd].url,
            process: function(bot,msg,suffix){
                var count = 1;
                if(suffix != null && suffix != "" && !isNaN(suffix)){
                    count = suffix;
                }
                rssfeed(bot,msg,this.url,count,false);
            }
        };
    }
}
} catch(e) {
    console.log("Couldn't load rss.json. See rss.json.example if you want rss feed commands. error: " + e);
}

function rssfeed(bot,msg,url,count,full){
    var FeedParser = require('feedparser');
    var feedparser = new FeedParser();
    var request = require('request');
    request(url).pipe(feedparser);
    feedparser.on('error', function(error){
        bot.sendMessage(msg.channel,"failed reading feed: " + error);
    });
    var shown = 0;
    feedparser.on('readable',function() {
        var stream = this;
        shown += 1
        if(shown > count){
            return;
        }
        var item = stream.read();
        bot.sendMessage(msg.channel,item.title + " - " + item.link, function() {
            if(full === true){
                var text = htmlToText.fromString(item.description,{
                    wordwrap:false,
                    ignoreHref:true
                });
                bot.sendMessage(msg.channel,text);
            }
        });
        stream.alreadyRead = true;
    });
}


var bot = new Discord.Client();

bot.on("ready", function () {
    //loadFeeds();
	console.log("Ready to begin! Serving in " + bot.channels.length + " channels");
});

bot.on("disconnected", function () {
	console.log("Disconnected!");
	process.exit(1); //exit node.js with an error
    //
    //bot.login(AuthDetails.email, AuthDetails.password);
});

var lastmsgnameandtime = {};
var commandcount = {};
var ratelimitnum = 5;
var ratelimitspan = 25;

bot.on("message", function (msg) {
	//check if message is a command
	if(msg.author.id != bot.user.id && msg.content[0] === '!'){// || msg.content.indexOf(bot.user.mention()) == 0)){
        console.log(msg.author.username + " " + msg.content);
		var cmdTxt = msg.content.split(" ")[0].substring(1);
        var suffix = msg.content.substring(cmdTxt.length+2);//add one for the ! and one for the space
        if(msg.content.indexOf(bot.user.mention()) == 0){
            cmdTxt = msg.content.split(" ")[1];
            suffix = msg.content.substring(bot.user.mention().length+cmdTxt.length+2);
        }
		var cmd = commands[cmdTxt];
        if(cmdTxt === "help"){
            //help is special since it iterates over the other commands
            for(var cmd in commands) {
                var info = "__**!" + cmd + "**__";
                var usage = commands[cmd].usage;
                if(usage){
                    info += " *" + usage + "*";
                }
                var description = commands[cmd].description;
                if(description){
                    info += "\n\t" + description;
                }
                bot.sendMessage(msg.author,info);
            }
        }
		else if(cmd) {
            //Begin Flood Protection
            var author = msg.author.username;
            //if current command is within the ratelimitspan (POSSIBLY too soon since last message)
            if(msg.timestamp < (ratelimitspan*1000 + lastmsgnameandtime[author])){
                //if the commandcount is LESS than the ratelimit
                if(commandcount[author] < ratelimitnum)
                    cmd.process(bot,msg,suffix);    //process their command
                //if its equal or over (>=) (includes = because count starts at 0, and is incremented AFTER the condition).
                else {
                    //dont process the command, and instead send them a message saying rate-limited.
                    var ratestring = " (" + ratelimitnum + " messages per " + ratelimitspan + "seconds)";
                    bot.sendMessage(msg.channel,"Rate Limit exceeded by " + msg.author.username + ratestring + 
                                    ". Please wait " + ratelimitspan + " seconds.");
                }
                commandcount[author]++;     //increment the count
            }
            //or else they've waited for enough time, so
            else {
                cmd.process(bot,msg,suffix);    //process their command
                commandcount[author] = 1;   //reset count to 1, since we just processed a command. (or could be the first message).
            }
            lastmsgnameandtime[author] = msg.timestamp; //always store the timestamp regardless .
            //End Flood Protecton
		} else
			bot.sendMessage(msg.channel, "Invalid command: " + cmdTxt);
	} else {
		//message isn't a command or is from us
        //drop our own messages to prevent feedback loops
        if(msg.author == bot.user){
            return;
        }
        if(msg.author.username == 'TomSuns'){
            if(msg.content.toUpperCase().indexOf('DNB') > -1) {
                bot.sendMessage(msg.channel,"__***DnB SPERG ALERT***__");
            }
        }
        if (msg.author != bot.user && msg.isMentioned(bot.user)) {
                bot.sendMessage(msg.channel, msg.author.mention() + " you said what about me?");
        }
    }
});
 

//Log user status changes (only shows online now)
bot.on("presence", function(user,status,gameid) {
	console.log(user.username+" went "+status);
});
//Log user status changes (only shows offline/idles now)
bot.on("userUpdate", function(user,presenceUser,status) {
	console.log(user.username+" went "+status);
});
bot.on("warn", function(message) {
	console.log("Warning: "+message);
});
bot.on("debug", function(message) {
	console.log("Debug: "+message);
});

function get_gif(tags, func) {
    var request = require('request');
    //limit=1 will only return 1 gif
    var params = {
        "api_key": giphyconfig.api_key,
        "rating": giphyconfig.rating,
        "format": "json",
        "limit": 1
    };
    var query = qs.stringify(params);

    if (tags !== null) {
        query += "&q=" + tags.join('+')
    }

    request(giphyconfig.url + "?" + query, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            console.error("giphy: Got error: " + body);
            console.log(error);
        }
        else {
            var responseObj = JSON.parse(body);
            if(responseObj.data.length){
                console.log("giphy: Url was: " + responseObj.data[0].url);
                func(responseObj.data[0].id);
            } else {
                console.log("giphy: gif not found?");
                func(undefined);
            }
        }
    }.bind(this));
}

bot.login(AuthDetails.email, AuthDetails.password);
