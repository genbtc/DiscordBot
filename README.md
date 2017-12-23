# FuccBot - a genBTC production - based off of <a href="https://github.com/chalda/DiscordBot">Chalda's DiscordBot</a>
A chat bot for discord app using the <a href="https://github.com/hydrabolt/discord.js/">discord.js</a> v10.0 framework.

# Commands added by genBTC:
- Works on Discord.JS 10.0 now.
- !google query => search google and return the first result
- !alias command1 command2 params => 
- !aliases => list all the stored aliases from alias.json
- !seen user => returns the time a user was last online (from seen.json)
- !messageBox => leaves  messages for users while logged out so they can read it when they come back online.
- !ud query => search google with site:urbandictionary and returns the first result (works fine)
- !rimage => returns a random image
- !rgif => random gif
- !ss => owner can make bot speak
# Features added by genBTC:
- Responds perfectly in a private message, and also any !help commands get responded to in PM to not clutter chat.
- FLOOD PROTECTION
- Rate Limit/Flood Protection. Variables are in data/config.json Defaults =   "floodprot_cmdratelimit": 5,  "floodprot_ratelimitspan": 10
- The Rate limit will trigger if the same person has issued more than (X) commands in (Y) seconds. If they exceed this limit, they will have to wait for (Y) seconds. If they issue another command, the waiting period resets and they have to wait an additional full (Y) seconds.
- TEXT TRIGGERS
# Original Features:
- !gif query => returns a gif example !gif cute cats doing stuff (from giphy)
- !image query => returns 1 image (careful, no adult filter)
- !youtube query => returns 1 youtube link
- !wiki query => returns the summary of the first search result on Wikipedia
- !reddit query => returns the top post on reddit for the given subreddit (or blank for front-page)
- !meme memetype "text1" "text2" => Meme Generator. returns a URL to an image. (notice the quotes around text, they are CRUCIAL, very important.)
- !meme => with no arguments, prints a list of available memes to use for the meme generator.
- !help => prints all commands with usage and description;
- @botname => responds when @mentioned
- !uptime => how long the bot has been running
- !myid => returns the ID of the sender (from discord API)
## Notes
### RSS:
    NOTE: feeds are commented out @ Line 202 of discord_bot.js - loadFeeds()
    you can create an rss.json file adding rss feeds as commands. See rss.json.example for details
### 1.
unused-commands[2].txt contain all of the original commands that I had commented out because I don't need. (except !stock, i deleted that one
### 2.
When a "Disconnected" event is received, you can choose to process.exit() or re-login. I chose process.exit() because the bot is running inside a batch file called Launch.bat which was provided, and that will just re-launch the bot if it dies.
### 3.
Windows has no way to fork, so anything that executes local programs through the shell is out.
 accidentally).
### 4. You can queue messages for deletion after sending them using this:  

# Instructions

requires node (confirmed using v7.1.0)

git clone this repo

edit auth.json: Bot_token, email/password(deprecated), youtube API key, google search custom API key, imgflip username/password , etc..

npm install

node discord_bot.js

# For non-technical users:

1) google and download "node.js msi download" 

2) go through the installer, this tutorial might help http://blog.teamtreehouse.com/install-node-js-npm-windows

3) once installed download this project as a zip from github

4) unpack and navigate to the project on your PC

5) create a file "auth.json" exactly like the auth.json.example that is provided. Replace the information in there with your own.  You can even use your own credentials, itll respond from your name. Or create a new account and add it to your server. The new file should be placed right along side everythign else.

6) Open cmd prompt (hit windows + q and type in cmd). Test that node works, npm -v and node -v should return something.

7) Navigate to wherever you extracted the project with cd. "cd C:\Users\genBTC\Downloads\DiscordBot\"

8) Download requirements with "npm install" 
	- it seems a lot of people have problems with this step, please follow this guide: http://stackoverflow.com/questions/21365714/nodejs-error-installing-with-npm

9) Run the bot with "node discord_bot.js"
