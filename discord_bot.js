//Documentation @ https://discord.js.org/#/docs/main/stable/class/TextChannel?scrollTo=fetchMessage
//Discord Bot originally written by Chalda
//genBTC modified it a long time ago and now it is this as of November 13, 2017.
//Style/Formatted/Re-Edited December 22,2017
//Requires Discord.JS Version 10
try {
    var fs = require('fs');    
    var Discord = require("discord.js");
} catch (e) {
    console.log(e.stack);
    console.log(process.version);
    console.log("Please run npm install and ensure it passes with no errors!");
    process.exit();
}
//Start Bot
var startTime = Date.now(); //used for uptime calculation
console.log("Starting DiscordBot\nNode version: " + process.version + "\nDiscord.js version: " + Discord.version);
var bot = new Discord.Client();
//Load AuthDetails from config file :
try {
    var AuthDetails = require("./data/auth.json");
} catch (e) {
    console.log("Please create an auth.json like auth.json.example with a bot token.\n" + e.stack);
    process.exit();
}
//Using Auth Details, Start Logging in...:
if (AuthDetails.bot_token) {
    console.log("Logging in with bot token...");
    bot.login(AuthDetails.bot_token);
} else {
    console.log("Logging in as a user account, for now.\n But Discord officially requires a BOT account + token instead!");
    bot.login(AuthDetails.email, AuthDetails.password);
}
//Load Accessory Plugins:
try {
    var eightball = require('8ball');
} catch (e) {
    console.log("couldn't load 8ball plugin!\n" + e.stack);
}
try {
    var urban = require("urban");
} catch (e) {
    console.log("couldn't load urban plugin!\n" + e.stack);
}
try {
    var leet = require("leet");
} catch (e) {
    console.log("couldn't load leet plugin!\n" + e.stack);
}
try {
    var yt = require("./plugins/youtube_plugin");
    var youtube_plugin = new yt();
} catch (e) {
    console.log("couldn't load youtube_plugin plugin!\n" + e.stack);
}
try {
    var gs = require("./plugins/google_plugin");
    var google_plugin = new gs();
} catch (e) {
    console.log("couldn't load google_plugin plugin!\n" + e.stack);
}
try {
    var wa = require("./plugins/wolfram_plugin");
    var wolfram_plugin = new wa();
} catch (e) {
    console.log("couldn't load wolfram plugin!\n" + e.stack);
}
try {
    var qs = require("querystring");
} catch (e) {
    console.log("couldn't load querystring plugin!\n" + e.stack);
}
try {
    var d20 = require("d20");
} catch (e) {
    console.log("couldn't load d20 plugin!\n" + e.stack);
}
try {
    var htmlToText = require('html-to-text');
} catch (e) {
    console.log("couldn't load html-to-text plugin!\n" + e.stack);
}

// Load Custom Permissions config file:
var dangerousCommands = ["eval", "pullanddeploy", "setUsername"];
var Permissions = {};
try {
    Permissions = require("./data/permissions.json");
} catch (e) {
    Permissions.global = {};
    Permissions.users = {};
}
for (var i = 0; i < dangerousCommands.length; i++) {
    var cmd = dangerousCommands[i];
    if (!Permissions.global.hasOwnProperty(cmd)) {
        Permissions.global[cmd] = false;
    }
}
Permissions.checkPermission = function(user, permission) {
    try {
        var allowed = true;
        try {
            if (Permissions.global.hasOwnProperty(permission)) {
                allowed = Permissions.global[permission] === true;
            }
        } catch (e) {}
        try {
            if (Permissions.users[user.id].hasOwnProperty(permission)) {
                allowed = Permissions.users[user.id][permission] === true;
            }
        } catch (e) {}
        return allowed;
    } catch (e) {}
    return false;
}
Permissions.saveFile = function() {
    fs.writeFile("./permissions.json",JSON.stringify(Permissions,null,2), (err) => {
        if(err) console.error(err);
    });
}

//load custom Config data from file:
var Config = {};
try {
    Config = require("./data/config.json");
} catch (e) { //no config file, use defaults
    Config.debug = false;
    Config.commandPrefix = '!';
    Config.saveFile = function() {
        fs.writeFile("./data/config.json",JSON.stringify(Config,null,2), (err) => {
            if(err) console.error(err);
        });
    }
    try {
        if (fs.lstatSync("./data/config.json").isFile()) {
            console.log("WARNING: config.json found but we couldn't read it!\n" + e.stack);
        }
    } catch (e2) {
        Config.saveFile();
    }
}
if (!Config.hasOwnProperty("commandPrefix")) {
    Config.commandPrefix = '!';
}

//Giphy Config
var giphy_config = {
    "api_key": "dc6zaTOxFJmzC",
    "rating": "r",
    "url": "http://api.giphy.com/v1/gifs/random",
    "permission": ["NORMAL"]
};

//Meme Config: ( https://api.imgflip.com/popular_meme_ids )
try {
    var meme = require("./data/memes.json");
} catch (e) {
    meme = {};  //No Memes defined
}

//Alias Setup:
try {
    var aliases = require("./data/alias.json");
} catch (e) {
    aliases = {};   //No aliases defined
}
aliases.saveFile = function() {
    fs.writeFile("./data/alias.json",JSON.stringify(aliases,null,2), (err) => {
        if(err) console.error(err);
    });
}

//Stored Message Mailbox setup
try {
    var messagebox = require("./data/messagebox.json");
} catch (e) {
    messagebox = {};    //no stored messages
}
messagebox.saveFile = function() {
    fs.writeFile("./data/messagebox.json",JSON.stringify(messagebox,null,2), (err) => {
        if(err) console.error(err);
    });
}

//Seen Setup:
try {
    var seen = require("./data/seen.json");
} catch (e) {
    seen = {};   //No seen defined
}
seen.saveFile = function() {
    fs.writeFile("./data/seen.json",JSON.stringify(seen,null,2), (err) => {
        if(err) console.error(err);
    });
}
//Globals:
var lastBotsentMSGID = -1;
//variable to store the temporary flood protection data in
var global_lastmsgnameandtime = {};
var global_commandcount = {};

//Commands to interact with the bot:
var commands = {
    "google": {
        usage: "<google search>",
        description: "gets first result from google",
        process: function(bot, msg, suffix) {
            google_plugin.respond(suffix, msg.channel, bot);
        }
    },
    "aliases": {
        description: "Lists all Stored Aliases",
        process: function(bot, msg, suffix) {
            var text = "List of Current Aliases:\n";
            for (var a in aliases) {
                if (typeof a === 'string')
                    text += a + "\n";
            }
            msg.channel.sendMessage(text);
        }
    },
    "gif": {
        usage: "<image tags>",
        description: "returns a random gif matching the tags passed",
        process: function(bot, msg, suffix) {
            var tags = suffix.split(" ");
            get_gif(tags, function(id) {
                if (typeof id !== "undefined") {
                    msg.channel.sendMessage("http://media.giphy.com/media/" + id + "/giphy.gif [Tags: " +
                        (tags ? tags : "Random GIF") + "]");
                } else {
                    msg.channel.sendMessage("Invalid tags, try something different. [Tags: " + (tags ?
                        tags : "Random GIF") + "]");
                }
            });
        }
    },
    "ping": {
        description: "responds pong, useful for checking if bot is alive",
        process: function(bot, msg, suffix) {
            msg.channel.sendMessage(msg.author + " pong!");
            if (suffix) {
                msg.channel.sendMessage("note that !ping takes no arguments!");
            }
        }
    },
    "myid": {
        description: "returns the user id of the sender",
        process: function(bot, msg) {
            msg.channel.sendMessage(msg.author.id);
        }
    },

    "youtube": {
        usage: "<video tags>",
        description: "gets youtube video matching tags",
        process: function(bot, msg, suffix) {
            youtube_plugin.respond(suffix, msg.channel, bot);
        }
    },
    "taobao": {
        usage: "<message>",
        description: "print taobao search string",
        process: function(bot, msg, suffix) {
            msg.channel.sendMessage("https://s.taobao.com/search?q=" + encodeURIComponent(suffix));
        }
    },
    "ss": {
        usage: "<message>",
        description: "owner makes bot say message",
        process: function(bot, msg, suffix) {
            if (msg.author.id == '100558336721711104') //genBTC owner
                msg.channel.sendMessage(suffix);
        }
    },
    "delete": {
        usage: "do not abuse or it will be removed",
        description: "bot deletes its own last message",
        process: function(bot, msg, suffix) {
            if (lastBotsentMSGID != -1) {
                msg.channel.fetchMessage(lastBotsentMSGID)
                    .then(message => {
                        msg.channel.sendMessage("Your wish is my command. Deleting!")
                            .then(delmsg => {
                                delmsg.delete(1000);
                                lastBotsentMSGID = -1;
                            });
                        message.delete(100);
                        lastBotsentMSGID = -1;
                    });
            }
        }
    },
    "announce": {
        usage: "<message>",
        description: "bot says message with text to speech",
        process: function(bot, msg, suffix) {
            msg.channel.sendMessage(suffix, {
                tts: true
            });
        }
    },
    "meme": {
        usage: 'meme "top text" "bottom text"',
        description: function() {
            var str = "Currently available memes:\n"
            for (var m in meme) {
                str += "\t\t" + m + "\n"
            }
            return str;
        },
        process: function(bot, msg, suffix) {
            var tags = msg.content.split('"');
            var memetype = tags[0].split(" ")[1];
            //msg.channel.sendMessage(tags);
            var Imgflipper = require("imgflipper");
            var imgflipper = new Imgflipper(AuthDetails.imgflip_username, AuthDetails.imgflip_password);
            imgflipper.generateMeme(meme[memetype], tags[1] ? tags[1] : "", tags[3] ? tags[3] : "", function(
                err, image) {
                //console.log(arguments);
                msg.channel.sendMessage(image);
            });
        }
    },
    "wiki": {
        usage: "<search terms>",
        description: "returns the summary of the first matching search result from Wikipedia",
        process: function(bot, msg, suffix) {
            var query = suffix;
            if (!query) {
                msg.channel.sendMessage("usage: " + Config.commandPrefix + "wiki search terms");
                return;
            }
            var Wiki = require('wikijs');
            new Wiki().search(query, 1).then(function(data) {
                var url = 'https://en.wikipedia.org/wiki/' + encodeURI(data.results[0]);
                new Wiki().page(data.results[0]).then(function(page) {
                    page.summary().then(function(summary) {
                        msg.channel.sendMessage(url, summary.toString());
                    });
                });
            }, function(err) {
                msg.channel.sendMessage(err);
            });
        }
    },
    "stock": {
        usage: "<stock to fetch>",
        process: function(bot, msg, suffix) {
            var yahooFinance = require('yahoo-finance');
            yahooFinance.snapshot({
                symbol: suffix,
                fields: ['s', 'n', 'd1', 'l1', 'y', 'r'],
            }, function(error, snapshot) {
                if (error) {
                    msg.channel.sendMessage("couldn't get stock: " + error);
                } else {
                    //msg.channel.sendMessage(JSON.stringify(snapshot));
                    msg.channel.sendMessage(snapshot.name +
                        "\nprice: $" + snapshot.lastTradePriceOnly);
                }
            });
        }
    },
    "wolfram": {
        usage: "<search terms>",
        description: "gives results from wolframalpha using search terms",
        process: function(bot, msg, suffix) {
            if (!suffix) {
                msg.channel.sendMessage("Usage: " + Config.commandPrefix + "wolfram <search terms> (Ex. " +
                    Config.commandPrefix + "wolfram integrate 4x)");
            }
            msg.channel.sendMessage("*Querying Wolfram Alpha...*").then(message => {
                wolfram_plugin.respond(suffix, msg.channel, bot, message);
            });
        }
    },
    "rss": {
        description: "lists available rss feeds",
        process: function(bot, msg, suffix) {
            /*var args = suffix.split(" ");
            var count = args.shift();
            var url = args.join(" ");
            rssfeed(bot,msg,url,count,full);*/
            msg.channel.sendMessage("Available feeds:").then(function() {
                for (var c in rssFeeds) {
                    msg.channel.sendMessage(c + ": " + rssFeeds[c].url);
                }
            });
        }
    },
    "reddit": {
        usage: "[subreddit]",
        description: "Returns the top post on reddit. Can optionally pass a subreddit to get the top psot there instead",
        process: function(bot, msg, suffix) {
            var path = "/.rss"
            if (suffix) {
                path = "/r/" + suffix + path;
            }
            rssfeed(bot, msg, "https://www.reddit.com" + path, 1, false);
        }
    },
    "seen": {
        usage: "<person>",
        description: "Finds out when the person was last seen online, and what they said",
        process: function(bot, msg, suffix) {
            var args = suffix.split(" ");
            var name = args.shift();
            if (!name) {
                msg.channel.sendMessage(Config.commandPrefix + "alias " + this.usage + "\n" + this.description);
            } else {
                var result = seen[name];
                var said = result[0];
                var when = new Date(result[1]);
                msg.channel.sendMessage(name + " said: " + said + " @ " + when);
            }
        }
    },
    "alias": {
        usage: "<name> <actual command>",
        description: "Creates command aliases. Useful for making simple commands on the fly",
        process: function(bot, msg, suffix) {
            var args = suffix.split(" ");
            var name = args.shift();
            if (!name) {
                msg.channel.sendMessage(Config.commandPrefix + "alias " + this.usage + "\n" + this.description);
            } else if (commands[name] || name === "help") {
                msg.channel.sendMessage("overwriting commands with aliases is not allowed!");
            } else {
                var command = args.shift();
                aliases[name] = [command, args.join(" ")];
                //now save the new alias
                aliases.saveFile();
                msg.channel.sendMessage("created alias " + name);
            }
        }
    },
    "userid": {
        usage: "[user to get id of]",
        description: "Returns the unique id of a user. This is useful for permissions.",
        process: function(bot, msg, suffix) {
            if (suffix) {
                var users = msg.channel.guild.members.filter((member) => member.user.username == suffix).array();
                if (users.length == 1) {
                    msg.channel.sendMessage("The id of " + users[0].user.username + " is " + users[0].user.id)
                } else if (users.length > 1) {
                    var response = "multiple users found:";
                    for (var i = 0; i < users.length; i++) {
                        var user = users[i];
                        response += "\nThe id of <@" + user.id + "> is " + user.id;
                    }
                    msg.channel.sendMessage(response);
                } else {
                    msg.channel.sendMessage("No user " + suffix + " found!");
                }
            } else {
                msg.channel.sendMessage("The id of " + msg.author + " is " + msg.author.id);
            }
        }
    },
    "topic": {
        usage: "[topic]",
        description: 'Sets the topic for the channel. No topic removes the topic.',
        process: function(bot, msg, suffix) {
            msg.channel.setTopic(suffix);
        }
    },
    "8ball": {
        usage: "[question]",
        description: 'Asks the magic 8-ball a question.',
        process: function(bot, msg, suffix) {
            var response = eightball();
            msg.channel.sendMessage(response);
        }
    },
    "roll": {
        usage: "[# of sides] or [# of dice]d[# of sides]( + [# of dice]d[# of sides] + ...)",
        description: "roll one die with x sides, or multiple dice using d20 syntax. Default value is 10",
        process: function(bot, msg, suffix) {
            if (suffix.split("d").length <= 1) {
                msg.channel.sendMessage(msg.author + " rolled a " + d20.roll(suffix || "10"));
            } else if (suffix.split("d").length > 1) {
                var eachDie = suffix.split("+");
                var passing = 0;
                for (var i = 0; i < eachDie.length; i++) {
                    if (eachDie[i].split("d")[0] < 50) {
                        passing += 1;
                    };
                }
                if (passing == eachDie.length) {
                    msg.channel.sendMessage(msg.author + " rolled a " + d20.roll(suffix));
                } else {
                    msg.channel.sendMessage(msg.author + " tried to roll too many dice at once!");
                }
            }
        }
    },
    "msg": {
        usage: "<user> <message to leave user>",
        description: "leaves a message for a user the next time they come online",
        process: function(bot, msg, suffix) {
            var args = suffix.split(' ');
            var user = args.shift();
            var message = args.join(' ');
            if (user.startsWith('<@')) {
                user = user.substr(2, user.length - 3);
            }
            var target = msg.channel.guild.members.find("id", user);
            if (!target) {
                target = msg.channel.guild.members.find("username", user);
            }
            messagebox[target.id] = {
                channel: msg.channel.id,
                content: target + ", " + msg.author + " said: " + message
            };
            messagebox.saveFile();
            msg.channel.sendMessage("message saved.")
        }
    },
    "ud": {
        usage: "<word>",
        description: "looks up a word on Urban Dictionary",
        process: function(bot, msg, suffix) {
            var targetWord = suffix == "" ? urban.random() : urban(suffix);
            targetWord.first(function(json) {
                if (json) {
                    var message = "Urban Dictionary: **" + json.word + "**\n\n" + json.definition;
                    if (json.example) {
                        message = message + "\n\n__Example__:\n" + json.example;
                    }
                    msg.channel.sendMessage(message);
                } else {
                    msg.channel.sendMessage("No matches found");
                }
            });
        }
    },
    "leet": {
        usage: "<message>",
        description: "converts boring regular text to 1337",
        process: function(bot, msg, suffix) {
            msg.channel.sendMessage(leet.convert(suffix));
        }
    },
    "twitch": {
        usage: "<stream>",
        description: "checks if the given stream is online",
        process: function(bot, msg, suffix) {
            require("request")("https://api.twitch.tv/kraken/streams/" + suffix,
                function(err, res, body) {
                    var stream = JSON.parse(body);
                    if (stream.stream) {
                        msg.channel.sendMessage(suffix +
                            " is online, playing " +
                            stream.stream.game +
                            "\n" + stream.stream.channel.status +
                            "\n" + stream.stream.preview.large)
                    } else {
                        msg.channel.sendMessage(suffix + " is offline")
                    }
                });
        }
    },
    "xkcd": {
        usage: "[comic number]",
        description: "displays a given xkcd comic number (or the latest if nothing specified",
        process: function(bot, msg, suffix) {
            var url = "http://xkcd.com/";
            if (suffix != "")
                url += suffix + "/";
            url += "info.0.json";
            require("request")(url, function(err, res, body) {
                try {
                    var comic = JSON.parse(body);
                    msg.channel.sendMessage(
                        comic.title + "\n" + comic.img,
                        function() {
                            msg.channel.sendMessage(comic.alt)
                        });
                } catch (e) {
                    msg.channel.sendMessage(
                        "Couldn't fetch an XKCD for " + suffix);
                }
            });
        }
    },
    "watchtogether": {
        usage: "[video url (Youtube, Vimeo)",
        description: "Generate a watch2gether room with your video to watch with your little friends!",
        process: function(bot, msg, suffix) {
            var watch2getherUrl = "https://www.watch2gether.com/go#";
            msg.channel.sendMessage(
                "watch2gether link").then(function() {
                msg.channel.sendMessage(watch2getherUrl + suffix)
            })
        }
    },
    "uptime": {
        usage: "",
        description: "returns the amount of time since the bot started",
        process: function(bot, msg, suffix) {
            var now = Date.now();
            var msec = now - startTime;
            console.log("Uptime is " + msec + " milliseconds");
            var days = Math.floor(msec / 1000 / 60 / 60 / 24);
            msec -= days * 1000 * 60 * 60 * 24;
            var hours = Math.floor(msec / 1000 / 60 / 60);
            msec -= hours * 1000 * 60 * 60;
            var mins = Math.floor(msec / 1000 / 60);
            msec -= mins * 1000 * 60;
            var secs = Math.floor(msec / 1000);
            var timestr = "";
            if (days > 0) {
                timestr += days + " days ";
            }
            if (hours > 0) {
                timestr += hours + " hours ";
            }
            if (mins > 0) {
                timestr += mins + " minutes ";
            }
            if (secs > 0) {
                timestr += secs + " seconds ";
            }
            msg.channel.sendMessage("**Uptime**: " + timestr);
        }
    }
};

if (AuthDetails.hasOwnProperty("client_id")) {
    commands["invite"] = {
        description: "generates an invite link you can use to invite the bot to your server",
        process: function(bot, msg, suffix) {
            msg.channel.sendMessage("invite link: https://discordapp.com/oauth2/authorize?&client_id=" +
                AuthDetails.client_id + "&scope=bot&permissions=470019135");
        }
    }
}

//RSS Setup:
try {
    var rssFeeds = require("./data/rss.json");
} catch (e) {
    console.log("Couldn't load rss.json. See rss.json.example if you want rss feed commands. error: " + e);
}
function loadFeeds() {
    for (var cmd in rssFeeds) {
        commands[cmd] = {
            usage: "[count]",
            description: rssFeeds[cmd].description,
            url: rssFeeds[cmd].url,
            process: function(bot, msg, suffix) {
                var count = 1;
                if (suffix != null && suffix != "" && !isNaN(suffix)) {
                    count = suffix;
                }
                rssfeed(bot, msg, this.url, count, false);
            }
        };
    }
}
function rssfeed(bot, msg, url, count, full) {
    var FeedParser = require('feedparser');
    var feedparser = new FeedParser();
    var request = require('request');
    request(url).pipe(feedparser);
    feedparser.on('error', function(error) {
        msg.channel.sendMessage("failed reading feed: " + error);
    });
    var shown = 0;
    feedparser.on('readable', function() {
        var stream = this;
        shown += 1
        if (shown > count) {
            return;
        }
        var item = stream.read();
        msg.channel.sendMessage(item.title + " - " + item.link, function() {
            if (full === true) {
                var text = htmlToText.fromString(item.description, {
                    wordwrap: false,
                    ignoreHref: true
                });
                msg.channel.sendMessage(text);
            }
        });
        stream.alreadyRead = true;
    });
}

//Bot is Ready.
bot.on("ready", function() {
    loadFeeds();
    console.log("Logged in! Serving in " + bot.guilds.array().length + " servers");
    require("./plugins.js").init();
    //console.log("type "+Config.commandPrefix+"help in Discord for a commands list.");
    bot.user.setStatus("online", Config.commandPrefix + "help");
    var str = "";
    for (var i = 0; i < bot.channels.length; i++) {
        str += "#" + bot.channels[i].name + ":" + bot.channels[i].id + ", ";
    }
    console.log("Channels: " + str + "...");
    console.log("Ready! Begin serving in " + bot.channels.length + " channels...");
});

bot.on("disconnected", function() {
    console.log("Disconnected!");
    process.exit(1); //exit node.js with an error
});

bot.on("warn", function(e) {
    console.log(e);
});

bot.on("debug", function(e) {
    console.log(e);
});

function checkMessageForCommand(msg, isEdit) {
    //check if message is a command (and not from ourself)
    if (msg.author.id != bot.user.id && (msg.content[0] === Config.commandPrefix)) {
        //Print debug log of all users / commands out to console.
        console.log(msg.author.username + " " + msg.content);
        var cmdTxt = msg.content.split(" ")[0].substring(1).toLowerCase();
        var suffix = msg.content.substring(cmdTxt.length + 2); //add one for the ! and one for the space
        if (msg.isMentioned(bot.user)) {
            try {
                cmdTxt = msg.content.split(" ")[1].toLowerCase();
                suffix = msg.content.substring(bot.user.mention().length + cmdTxt.length + 2);
            } catch (e) { //no command (also unreachable code)
                msg.channel.sendMessage("Yes?")
                .then((message => message.delete(5000)));
                return;
            }
        }
        alias = aliases[cmdTxt];
        if (alias) {
            console.log(cmdTxt + " is an alias, constructed command is " + alias.join(" ") + " " + suffix);
            cmdTxt = alias[0];
            suffix = alias[1] + " " + suffix;
        }
        var cmd = commands[cmdTxt];
        //Help Text Handler.
        if (cmdTxt === "help") {
            //help is special since it iterates over the other commands
            if (suffix) {
                var cmds = suffix.split(" ").filter(function(cmd) {
                    return commands[cmd]
                });
                var info = "";
                for (var i = 0; i < cmds.length; i++) {
                    var cmd = cmds[i];
                    info += "**" + Config.commandPrefix + cmd + "**";
                    var usage = commands[cmd].usage;
                    if (usage) {
                        info += " " + usage;
                    }
                    var description = commands[cmd].description;
                    if (description instanceof Function) {
                        description = description();
                    }
                    if (description) {
                        info += "\n\t" + description;
                    }
                    info += "\n"
                }
                msg.channel.sendMessage(info);
            //Print all available commands.
            } else {
                msg.author.sendMessage("**Available Commands:**").then(function() {
                    var batch = "";
                    var sortedCommands = Object.keys(commands).sort();
                    for (var i in sortedCommands) {
                        var cmd = sortedCommands[i];
                        var info = "**" + Config.commandPrefix + cmd + "**";
                        var usage = commands[cmd].usage;
                        if (usage) {
                            info += " " + usage;
                        }
                        var description = commands[cmd].description;
                        if (description instanceof Function) {
                            description = description();
                        }
                        if (description) {
                            info += "\n\t" + description;
                        }
                        var newBatch = batch + "\n" + info;
                        if (newBatch.length > (1024 - 8)) { //limit message length
                            msg.author.sendMessage(batch);
                            batch = info;
                        } else {
                            batch = newBatch
                        }
                    }
                    if (batch.length > 0) {
                        msg.author.sendMessage(batch);
                    }
                });
            }
        //Process any valid commands, after checking permissions
        } else if (cmd) {
			//Begin Flood Protection
			var author = msg.author.username;
            var flooded = false;
			//if current command is within the floodprot_ratelimitspan (POSSIBLY too soon since last message)
			if(msg.createdTimestamp < (Config.floodprot_ratelimitspan*1000 + global_lastmsgnameandtime[author])){
				//if the global_commandcount is LESS than the ratelimit
				if(global_commandcount[author] < Config.floodprot_cmdratelimit)
					flooded = false;
				//if its equal or over (>=) (includes = because count starts at 0, and is incremented AFTER the condition).
				else {
					//dont process the command, and instead send them a message saying rate-limited.
					var ratestring = " (" + Config.floodprot_cmdratelimit + " messages per " + Config.floodprot_ratelimitspan + " seconds)";
                    msg.channel.sendMessage("Rate Limit exceeded by " + author + ratestring + 
									". Please wait an additional " + Config.floodprot_ratelimitspan + " seconds.")
                                    .then((message => message.delete(Config.floodprot_ratelimitspan*1000)));
                    flooded = true;
				}
				global_commandcount[author]++;		//increment the count
			}
			//or else they've waited for enough time, so
			else {
				flooded = false;
				global_commandcount[author] = 1;	//reset count to 1, since we just processed a command. (or could be the first message).
			}
			global_lastmsgnameandtime[author] = msg.createdTimestamp; //always store the timestamp regardless .
			//End Flood Protecton
            //Permissions Start
            if (Permissions.checkPermission(msg.author, cmdTxt)) {
                try {
                    if (!flooded)
                        cmd.process(bot, msg, suffix, isEdit);
                } catch (e) {
                    var msgTxt = "command " + cmdTxt + " failed :(";
                    if (Config.debug) {
                        msgTxt += "\n" + e.stack;
                    }
                    msg.channel.sendMessage(msgTxt);
                }
            } else {
                msg.channel.sendMessage("Permissions Error: You are not allowed to run " + cmdTxt + "!")
                .then((message => message.delete(5000)));
            }   //Permissions End
        }
        //Command Not Recognized -> print message and delete after 5 sec timeout.
        else {
            msg.channel.sendMessage(cmdTxt + " not recognized as a command!")
            .then((message => message.delete(5000)));
        }
    } else {
        //message isn't a command or is from us
        //drop our own messages to prevent feedback loops
        if (msg.author == bot.user) {
            lastBotsentMSGID = msg.id;
            return;
        //when we are mentioned, respond, but only if they are NOT another bot.
        } else if (msg.isMentioned(bot.user) && !msg.author.bot) {
            msg.channel.sendMessage(msg.author + ", don't use my name in vain.");
       //Default,  Write seen user's commands into seen.json
        } else {
            seen[msg.author.username] = [msg.content, Date.now()];
            seen.saveFile();
        }
    }
}

//Check messages for commands - Run the function above.
bot.on("message", (msg) => checkMessageForCommand(msg, false));
bot.on("messageUpdate", (oldMessage, newMessage) => {
    checkMessageForCommand(newMessage, true);
});

//Log user status changes
bot.on("presence", function(user, status, gameId) {
    console.log(user + " went " + status);
    try {
        if (status != 'offline') {
            if (messagebox.hasOwnProperty(user.id)) {
                console.log("found message for " + user.id);
                var message = messagebox[user.id];
                var channel = bot.channels.get("id", message.channel);
                delete messagebox[user.id];
                messagebox.saveFile();
                bot.sendMessage(channel, message.content);
            }
        }
    } catch (e) {}
});

//Giphy gif function
function get_gif(tags, func) {
    //limit=1 will only return 1 gif
    var params = {
        "api_key": giphy_config.api_key,
        "rating": giphy_config.rating,
        "format": "json",
        "limit": 1
    };
    var query = qs.stringify(params);

    if (tags !== null) {
        query += "&tag=" + tags.join('+')
    }

    request(giphy_config.url + "?" + query, function(error, response, body) {
        //console.log(arguments)
        if (error || response.statusCode !== 200) {
            console.error("giphy: Got error: " + body);
            console.log(error);
            //console.log(response)
        } else {
            try {
                var responseObj = JSON.parse(body)
                func(responseObj.data.id);
            } catch (err) {
                func(undefined);
            }
        }
    }.bind(this));
}

//Exports: (necessary, for plugins to be able to add commands)
exports.addCommand = function(commandName, commandObject) {
    try {
        commands[commandName] = commandObject;
    } catch (err) {
        console.log(err);
    }
}
exports.commandCount = function() {
    return Object.keys(commands).length;
}
