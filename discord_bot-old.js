// Get the email and password of the account,and other info.
var ConfigFile = require("./config.json");

//Include relevant requires:
var yt = require("./youtube_plugin");
var youtube_plugin = new yt();

var gi = require("./google_image_plugin");
var google_image_plugin = new gi();

var gi2 = require("./google_csapi_image_plugin");
var google_image_plugin2 = new gi2();

var wa = require("./wolfram_plugin");
var wolfram_plugin = new wa();

var gs = require("./google_plugin");
var google_plugin = new gs();

var querystr = require("querystring");
var htmlToText = require('html-to-text');

//https://api.imgflip.com/popular_meme_ids
var memes = require("./memes.json");

//variables to store the temporary flood protection data in
var global_lastmsgnameandtime = {};
var global_commandcount = {};

//Instantiate the discord.js and create the bot client
var Discord = require("discord.js");
var bot = new Discord.Client();

//#dreamers "<#98469019455074304>"
var commands = {
    "airhorn": {
        usage: "DUMMY COMMAND",
        description: "ignore airhorn messages",
        process: function(bot,msg,suffix){
            null
        }
    },
    "johncena": {
        usage: "DUMMY COMMAND",
        description: "ignore johncena messages",
        process: function(bot,msg,suffix){
            null
        }
    },    
    "ss": {
        usage: "<message>",
        description: "bot says message",
        process: function(bot,msg,suffix){ 
            if (msg.author.username == 'genBTC'){
                //bot.sendMessage(msg.channel.server.channels.get("name","dreamers"),suffix,true);
                bot.sendMessage(msg.client.channels.get("name","general"),suffix,true);
            }
        }
    },    
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
			youtube_plugin.respond(suffix,msg.channel,bot);		   }
	},
	"yt": {
		usage: "<video tags>",
		description: "alias for youtube",
		process: function(bot,msg,suffix){
			youtube_plugin.respond(suffix,msg.channel,bot);		   }
	},    
	"sc": {
		usage: "<google searches soundcloud>",
		description: "gets first result off SC through google",
		process: function(bot,msg,suffix){
			google_plugin.respond("site:soundcloud.com " + suffix,msg.channel,bot);		}
	},    
	"ud": {
		usage: "<google searches urbandictionary>",
		description: "gets first result off UD through google",
		process: function(bot,msg,suffix){
			google_plugin.respond("site:urbandictionary.com " + suffix,msg.channel,bot);		}
	},	  
	"google": {
		usage: "<google search>",
		description: "gets first result from google",
		process: function(bot,msg,suffix){
			google_plugin.respond(suffix,msg.channel,bot);		  }
	},
	"image-oldapi": {
		usage: "<image tags>",
		description: "gets image matching tags from google",
		process: function(bot,msg,suffix){ 
			google_image_plugin.respond(suffix,msg.channel,bot);	}
	},
	"image": {
		usage: "<image tags>",
		description: "gets image matching tags from google",
		process: function(bot,msg,suffix){ 
			google_image_plugin2.respond(suffix,msg.channel,bot);	}
	},
    "img": {
		usage: "<image tags>",
		description: "alias for image",
		process: function(bot,msg,suffix){ 
			google_image_plugin2.respond(suffix,msg.channel,bot);	}
	},
	"meme": {
		usage: 'memename "top text" "bottom text"',
		description: "Generates a meme image (Quotes are required). For Help: type !meme to list available memes (long).",
		process: function(bot,msg,suffix) {
            //check if command was blank. give help messages if blank.
			if(!suffix) {
                var i = 1;
				bot.sendMessage(msg.author,"Currently available memes:");
                var str = "Page" + i + ":\n";
                //iterate list of memes
				Object.keys(memes).forEach(function(key) {
                    //make sure message length does not exceed 2000 chars
                    //in this case, 1100 splits my list in half evenly.
					if(str.length + key.length + 2 < 1100){
                        str += key + "\n";
                    }else{
                        //use multiple messages for any overly long messages.
                        bot.sendMessage(msg.author,str);
                        i++;
                        str = "Page" + i + ":\n";
                        str += key + "\n";                        
                    }
				});
				bot.sendMessage(msg.author,str);
                bot.sendMessage(msg.author,'example: !meme Doge "Top-Text" "Bottom-Text"');                
                return;
			}
			var tags = msg.content.toLowerCase().split('"');
			var memetype = tags[0].split(" ")[1];
            var memeid = 0;
            Object.keys(memes).forEach(function(key) {
                if (memetype == key.toLowerCase()){
                    memeid = memes[key];
                }
            });
            if (memeid == 0){
                bot.sendMessage(msg.channel,"Error: Meme Name Not Found!");
                return;
            }
			var Imgflipper = require("imgflipper");
			var imgflipper = new Imgflipper(ConfigFile.imgflip_username, ConfigFile.imgflip_password);
			imgflipper.generateMeme(memeid, tags[1]?tags[1]:"", tags[3]?tags[3]:"", function(err, image){
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

bot.on("ready", function () {
	//loadFeeds();
    var str = "";
    for(var i=0;i<bot.channels.length;i++){
        str += "#" + bot.channels[i].name + ":" + bot.channels[i].id + ", ";
    }
    console.log("Channels: " + str + "...");
	console.log("Ready! Begin serving in " + bot.channels.length + " channels...");    
});

bot.on("disconnected", function () {
	console.log("Disconnected!");
	process.exit(1); //exit node.js with an error
	//when not running in a batch file with infinite loop, use this command below to reconnect.
	//bot.login(ConfigFile.email, ConfigFile.password);
});

//Log user status changes (online,idle,offline)
/* 
bot.on("presence", function(user,status,gameid) {
	console.log(user.username+" went "+status);
});

bot.on("warn", function(message) {
	console.log("Warning: "+message);
});
bot.on("debug", function(message) {
	console.log("Debug: "+message);
}); 
*/
var triggerlists = [];
/* old triggers
    ["Izzoh","bruh","__***Disclaimer: WARNING, Brosplaining Detected! Not suitable for those with fuccboi allergies***__"],
    ["doot doot","sexy","http://i.qkme.me/3q7nj6.jpg"],
    ["doot doot","sick","https://dahliasent.files.wordpress.com/2015/07/mean-girls-i-cant-go-out-im-sick-meme-main.jpg"],
    ["doot doot","asian","http://s2.quickmeme.com/img/04/0479b2bb2ff45d108f62efeff35edcc7afcb0e5e7bd58d320c855d4354e21277.jpg"],    
        ["memoryruins","florida","http://images1.miaminewtimes.com/imager/a-florida-man-movie-exists-but-it/u/blog/6529585/floridamanmovie.jpg"],
            ["rudedudeowns","laptop","http://i.imgflip.com/un3aj.jpg"],
["","triggered","http://cdn.makeagif.com/media/8-17-2015/KAJCag.gif"],            


var triggerlists = [
    ["","tranny","__***WARNING, possible Tranny detected! Not suitable for anyone else besides <@99676085565800448>. ***__"],
    
    ["","objection","http://vignette1.wikia.nocookie.net/sonicfanon/images/7/75/Objection.gif"],
    ["TomSuns","potato","http://images.rapgenius.com/19e39361c54679cfa3fa205a1af4dbf2.616x446x1.png"],
    ["Izzoh","proof","http://memeguy.com/photos/thumbs/i-have-to-point-this-out-way-too-often-around-here-22613.jpg"],
    ["GDIBass"," ex ","__**Ex talk Detected! Please seek help**__ @  __www.professional-counselling.com/getting-over-a-relationship.html__ "],
    ["ungineer","idgaf","http://cdn.meme.am/instances/60732665.jpg & https://giphy.com/gifs/people-vtKkmj9I1DNK"],
    ["ungineer","dgaf","http://cdn.memegenerator.net/instances/53928498.jpg"],
    ["ungineer","give a fuck","https://memecrunch.com/meme/1PH5/don-t-give-a-fuck/image.jpg"],
    ["ungineer","triggered","http://cdn.meme.am/instances/61541029.jpg"],
    ["ungineer","laid back","http://i.imgur.com/nYzYZIV.jpg"],
    ["rudedudeowns","kys","http://i1.kym-cdn.com/entries/icons/original/000/011/113/killyourselves.png"],
    ["rudedudeowns","squat","https://41.media.tumblr.com/3cc74236150098d65afcb9b1e43d1f68/tumblr_nazuoyvoCF1qmbxsmo1_400.jpg"],
    ["rudedudeowns","chicken","http://www.eattoperform.com/wp-content/uploads/2015/08/chicken-and-rice-meme.jpg"],
    ["dnytm","tinder","http://www.brobible.com/wp-content/uploads/2015/03/ap1wu.jpg"],
    ["dnytm","sister","http://cdn.meme.am/instances/400x/53343409.jpg"],
    ["tehsma","reverb","http://s2.quickmeme.com/img/2b/2b787aea2af0566218a05925f148772288ea31e195394c4142b5631a7fb14b98.jpg"],
    ["rld","viola","http://i.imgflip.com/una2l.jpg"],
    ["Fick","school","http://s2.quickmeme.com/img/b2/b23ca78926ee04d7be2a8ce0b3ccc08dffb9896245b0ffe346b744b473d87489.jpg"],
    ["Fick","wifi","http://i.imgflip.com/unee0.jpg"],
    ["scattrbrain","sancocho","http://images1.phoenixnewtimes.com/imager/u/original/6538999/mambossancocho.jpg"],
    ["Oliver","snsd","http://memecrunch.com/meme/36NM6/you-should-be-studying-taeyeon/image.jpg"],
    ["memoryruins",":^)","https://www.youtube.com/watch?v=FdghRwWfaOQ"]
    
];
*/

bot.on("message", function (msg) {
	//msg.content = msg.content.toLowerCase();
    //check if message is a command    
	if(msg.author.id != bot.user.id && msg.content[0] === '!'){// || msg.content.indexOf(bot.user.mention()) == 0)){
		console.log(msg.author.username + " " + msg.content);
		var cmdTxt = msg.content.split(" ")[0].substring(1).toLowerCase();
		var suffix = msg.content.substring(cmdTxt.length+2);//add one for the ! and one for the space
		if(msg.content.indexOf(bot.user.mention()) == 0){
			cmdTxt = msg.content.split(" ")[1].toLowerCase();
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
			//if current command is within the floodprot_ratelimitspan (POSSIBLY too soon since last message)
			if(msg.timestamp < (ConfigFile.floodprot_ratelimitspan*1000 + global_lastmsgnameandtime[author])){
				//if the global_commandcount is LESS than the ratelimit
				if(global_commandcount[author] < ConfigFile.floodprot_cmdratelimit)
					cmd.process(bot,msg,suffix);	//process their command
				//if its equal or over (>=) (includes = because count starts at 0, and is incremented AFTER the condition).
				else {
					//dont process the command, and instead send them a message saying rate-limited.
					var ratestring = " (" + ConfigFile.floodprot_cmdratelimit + " messages per " + ConfigFile.floodprot_ratelimitspan + "seconds)";
					bot.sendMessage(msg.channel,"Rate Limit exceeded by " + msg.author.username + ratestring + 
									". Please wait " + ConfigFile.floodprot_ratelimitspan + " seconds.");
				}
				global_commandcount[author]++;		//increment the count
			}
			//or else they've waited for enough time, so
			else {
				cmd.process(bot,msg,suffix);	//process their command
				global_commandcount[author] = 1;	//reset count to 1, since we just processed a command. (or could be the first message).
			}
			global_lastmsgnameandtime[author] = msg.timestamp; //always store the timestamp regardless .
			//End Flood Protecton
        } else if (cmdTxt !== ""){
            console.log(cmdTxt + ".");
			bot.sendMessage(msg.channel, "Invalid command: " + cmdTxt);
        }
	} else {
		//if message isn't a command or it is from bot, drop our own messages to prevent feedback loops
		if(msg.author == bot.user){
			return;
		}
        //TRIGGER WORD LIST PROCESSING.
        for(var i=0;i<triggerlists.length;i++){
            if(msg.author.username.indexOf(triggerlists[i][0]) > -1){
                if(msg.content.toLowerCase().indexOf(triggerlists[i][1]) > -1){
                    bot.sendMessage(msg.channel,triggerlists[i][2]);
                    console.log("Trigger:" + triggerlists[i][0] + ", " + triggerlists[i][1]);
                    break;
                }
            }
        }
		//BOT responds when @mentioned
		if (msg.author != bot.user && msg.isMentioned(bot.user)) {
            bot.sendMessage(msg.channel, msg.author + " you said what about me?");
		}
	}
});

//******************************************************************
//                  Auxiliary Functions:
//******************************************************************
function get_gif(tags, func) {
	var request = require('request');
	//limit=1 will only return 1 gif
	var params = {
		"api_key": ConfigFile.giphy_api_key,
		"rating": ConfigFile.giphy_rating,
		"format": "json",
		"limit": 1
	};
	var query = querystr.stringify(params);

	if (tags !== null) {
		query += "&q=" + tags.join('+')
	}

	request(ConfigFile.giphy_url + "?" + query, function (error, response, body) {
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

//******************************************************************
//           Log In at the End so all events are all ready
//******************************************************************
bot.login(ConfigFile.email, ConfigFile.password);
