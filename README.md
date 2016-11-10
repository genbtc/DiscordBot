# FuccBot - based off of <a href="https://github.com/chalda/DiscordBot">Chalda's DiscordBot</a>
A chat bot for discord app based off <a href="https://github.com/hydrabolt/discord.js/">discord.js</a>

# Original Features:
Upgraded core to run with Discord.Js 5.0
- !gif query => returns a gif example !gif cute cats doing stuff (from giphy)
- !image query => returns an image (careful, no adult filter)
- !youtube query => returns a youtube link
- !wiki query => returns the summary of the first search result on Wikipedia
- !reddit query => returns the top post on reddit for the given subreddit (or blank for front-page)
- !meme memetype "text1" "text2" => Meme Generator. returns a URL to an image. notice the quotes around text, they are CRUCIAL, very important.
- !meme => with no arguments, prints a list of available memes to use for the meme generator.
- !help => prints all commands with usage and description;
- @botname => responds when @mentioned
Commands added by genBTC:
- !google query => search google and return the first result
- !ud query => search google with site:urbandictionary and returns the first result (works fine)
# Features added by genBTC:
- Responds perfectly in a private message, and also any !help commands get responded to in PM to not clutter chat.
- Rate Limit/Flood Protection. Variables are shown in Line 215 ratelimitnum (X),Line 216 ratelimitspan (Y). 
- The Rate limit will trigger if the same person has issued more than (X) commands in (Y) seconds. If they exceed this limit, they will have to wait for (Y) seconds. If they issue another command, the waiting period resets and they have to wait an additional full (Y) seconds.
# Channel Specific/Personal Features (remove if you aren't me):
- DNB Sperg Alert for Suns, any message with "DNB" in it will cause the bot to give a channel-wide text alert.
- Tranny Alert for Emmet Brown
- Bruh Alert for Izzoh

Notes: When a "Disconnected" event is received, you can choose to process.exit() or re-login. I chose process.exit() because the bot is running inside a batch file called Launch.bat which was provided, and that will just re-launch the bot if it dies.

Notes: unused-commands.txt contain all of the original commands that I had commented out because I don't need. (except !stock, i deleted that one accidentally).
## Todo:
    Add a Config.js File containing all the variables, just as a re-factoring/seperation/isolation decision.

## RSS:
    NOTE: feeds are commented out @ Line 202 of discord_bot.js - loadFeeds()
    you can create an rss.json file adding rss feeds as commands. See rss.json.example for details

# Instructions

requires node (probably 0.12)

pull repo

add auth.json: email/password, youtube API key, username/password for imgflip (example provided)

npm install

node discord_bot.js

# For non-technical users:

1) google and download "node.js msi download" 

2) go through the installer, this tutorial might help http://blog.teamtreehouse.com/install-node-js-npm-windows

3) once installed download this project as a zip from github

4) unpack and navigate to the project on your PC

5) create a file "auth.json" exactly like the auth.json.example that is provided. Replace the information in there with your own.  You can even use your own credentials, itll respond from your name. Or create a new account and add it to your server. The new file should be placed right along side everythign else.

6) Open cmd prompt (hit windows + q and type in cmd). Test that node works, npm -v and node -v should return something.

7) Navigate to wherever you extracted the project with cd. "cd C:\Users\Alex\Downloads\DiscordBot\"

8) Download requirements with "npm install" 
	- it seems a lot of people have problems with this step, please follow this guide: http://stackoverflow.com/questions/21365714/nodejs-error-installing-with-npm

9) Run the bot with "node discord_bot.js"
