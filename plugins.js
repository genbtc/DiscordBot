//edited by genBTC on Nov 13th to work with Compiled Node as a .exe package
var fs = require('fs'),
    path = require('path');
function getDirectories(srcpath) {
    return fs.readdirSync(srcpath).filter(function(file) {
        return fs.statSync(path.join(srcpath, file)).isDirectory();
    });
}

var plugin_directory = "./plugins/";
var plugin_folders = getDirectories(plugin_directory);
var exec_dir = path.dirname(process.execPath) + "/resources/default_app/"; //need to use this to change node prefix for npm installs

exports.init = function(){
    preload_plugins();
};

function createNpmDependenciesArray (packageFilePath) {
    var p = require(packageFilePath);
    if (!p.dependencies) return [];
    var deps = [];
    for (var mod in p.dependencies) {
        deps.push(mod + "@" + p.dependencies[mod]);
    }

    return deps;
}

function preload_plugins(){
    var deps = [];
    var npm = require("npm");
    for (var i = 0; i < plugin_folders.length; i++) {
        try{
            var pfd = plugin_directory + plugin_folders[i];
            require(pfd)
        } catch(e) {
            //console.log("Plugin folder is: " + pfd);
            deps = deps.concat(createNpmDependenciesArray(pfd + "/package.json"));
        }
    }
    if(deps.length > 0) {
        npm.load({
            loaded: false
        }, function (err) {
            npm.commands.install(deps, function (er, data) {
                if(er){
                    console.log(er);
                }
                console.log("Plugin preload complete");
                load_plugins()
            });

            if (err) {
                console.log("preload_plugins: " + err);
            }
        });
    } else {
        load_plugins()
    }
}

function load_plugins(){
    var dbot = require("./discord_bot.js");
    var commandCount = 0;
    for (var i = 0; i < plugin_folders.length; i++) {
        var plugin;
        try{
            plugin = require(plugin_directory + plugin_folders[i])
        } catch (err){
            console.log("Improper setup of the '" + plugin_folders[i] +"' plugin. : " + err);
        }
        if (plugin){
            if("commands" in plugin){
                for (var j = 0; j < plugin.commands.length; j++) {
                    if (plugin.commands[j] in plugin){
                        dbot.addCommand(plugin.commands[j], plugin[plugin.commands[j]])
                        commandCount++;
                    }
                }
            }
        }
    }
    console.log("Loaded " + dbot.commandCount() + " chat commands")
}
