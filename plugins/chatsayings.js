var bot = module.parent.exports;

// Lists
var memes = require("./data/meme.json");
var balls = require("./data/8ball.json");

var seedrandom = require('seedrandom');
var fs = require('fs');

// Commands
exports.commands = {
    "!ping": {
        exec: function (command, message) {
            message.channel.send("pong");
        }
    },
    "!ding": {
        exec: function (command, message) {
            message.channel.send("dong", {tts: true});
        }
    },
    approve: {
        commands: ["!approve", "!y", "!yes", "!ye"], // yeeee
        description: "YES",
        requirements: [bot.requirements.guild],
        exec: function (command, message) {
            message.delete();
            message.channel.send(message.member.displayName + " approves. :thumbsup:");
        }
    },
    "!boop": {
        description: "Boop a nose",
        requirements: [bot.requirements.guild],
        exec: function (command, message) {
            message.delete(); // Remove the sender's message
            if (command.arguments.length > 0) {
                message.channel.send("- " + message.member.displayName + " boops " + command.arguments.join(" ") + " on the nose. - :heart:");
            } else {
                message.channel.send("- " + message.member.displayName + " wishes someone would boop them on the nose. -");
            }
        }
    },
    boopsnoot: {
        commands: ["!boopsnoot", "!snoot"],
        description: "Boop a snoot",
        requirements: [bot.requirements.guild],
        exec: function (command, message) {
            message.delete(); // Remove the sender's message
            if (command.arguments.length > 0) {
                message.channel.send("- " + message.member.displayName + " boops " + command.arguments.join(" ") + " on the snoot. - :heart:");
            } else {
                message.channel.send("- " + message.member.displayName + " wishes someone would boop them on the snoot. -");
            }
        }
    },
    disapprove: {
        commands: ["!disapprove", "!n", "!no", "!na"],
        description: "NO",
        requirements: [bot.requirements.guild],
        exec: function (command, message) {
            message.delete();
            message.channel.send(message.member.displayName + " disapproves. :thumbsdown:");
        }
    },
    "!deflower": {
        exec: function (command, message) {
            message.delete();
            if (command.arguments.length > 0) {
                message.channel.send('"' + command.arguments.join(" ") + '" ' + "(⊙‿⊙✿)");
            } else {
                message.channel.send("(⊙‿⊙✿)");
            }
        }
    },
    emergencyjackblack: {
        commands: ["!emergencyjackblack", "!stop", "!ejb"],
        description: ["For when you need him the most"],
        exec: function (command, message) {
            message.delete();
            fs.existsSync("images/jbstop.png")
                ? message.channel.send(new bot.MessageAttachment("images/jbstop.png", "jbstop.png"))
                : message.channel.send("stop it. get some help.");
        }
    },
    fuckmarrykill: {
        commands: ["!fuckmarrykill", "!fmk"],
        description: "Fuck, marry, kill",
        requirements: [bot.requirements.guild],
        exec: function (command, message) {
            var members = message.guild.members.cache;
            
            //no bots or same user allowed
            members = members.filter(member => member !== message.member && !member.user.bot);
            
            var users = members.random(3);

            if (users.filter(Boolean).length < 3)
                message.channel.send("Not enough users to do that with. Sad.");
            else 
                message.channel.send("Fuck, marry, kill:\n_" + users[0].displayName + ", " + users[1].displayName + ", " + users[2].displayName + "_");
        }
    },
    fuckmarrykill2: {
        commands: ["!fuckmarrykill2", "!fmk2"],
        description: "Fuck, marry, kill - Shotgun wedding edition",
        requirements: [bot.requirements.guild],
        exec: function (command, message) {
            var members = message.guild.members.cache;
            
            //no bots or same user allowed
            members = members.filter(member => member !== message.member && !member.user.bot);
            
            var users = members.random(3);

            if (users.filter(Boolean).length < 3)
                message.channel.send("Not enough users to do that with. Sad.");
            else 
                message.channel.send("Fuck _" + users[0].displayName + "_, marry _" + users[1].displayName + "_, kill _" + users[2].displayName + "_.");
        }
    },
    lemon: {
        commands: ["!lemon", "!lemonpls"],
        description: ["ugh"],
        exec: function (command, message) {
            message.delete();
            message.channel.send(":lemon: pls");
        }
    },
    me: {
        commands: ["!me", "!me2", "!mebot", "!self", "!mee"],
        description: "Do a thing",
        usage: "<thing to do>",
        requirements: [bot.requirements.guild],
        exec: function (command, message) {
            message.delete(); // Remove the sender's message
            if (command.arguments.length > 0) {
                message.channel.send("- " + message.member.displayName + " " + command.arguments.join(" ") + " -");
            } else {
                message.channel.send("You, " + message.member.displayName + ". Yes, you.");
            }
        }
    },
    ratewaifu: {
        commands: ["!ratewaifu", "!rate", "!rw"],
        description: "IT'S GARBAGE DAY!",
        exec: function (command, message) {
            Math.seedrandom(command.arguments.join(" "));
            var rating = 10 * Math.random();
            if (rating < 9.5) {
                message.channel.send(command.arguments.join(" ") + " is decidedly trash.");
            } else {
                message.channel.send(command.arguments.join(" ") + " is a " + Math.round(rating * 10) / 10 + "/10. Acceptable.");
            }
        }
    },
    motivate: {
        commands: ["!motivate", "!motivation", "!diy"],
        description: "Get motivation",
        exec: function (command, message) {
            message.delete(); // Remove the sender's message
            fs.existsSync("images/foxtato.png")
                ? message.channel.send(new bot.MessageAttachment("images/foxtato.png", "foxtato.png"))
                : message.channel.send("ah belev in u");
        }
    },
    "8ball": {
        commands: ["!8ball", "🎱"],
        usage: "[question]",
        description: "Ask me anything",
        exec: function (command, message) {
            var ballRandNum = Math.floor(Math.random() * balls.length);
            message.channel.send(balls[ballRandNum]);
        }
    },
    "!meme": {
        description: "Get a dank meme, useful in any situation",
        exec: function (command, message) {
            var newMeme = "";
            for (var i = 0; i < 5; i++) {
                index = Math.floor(Math.random() * memes.length);
                newMeme += memes[index] + " ";
            }
            message.channel.send(newMeme);
        }
    },
    whoisthebest: {
        commands: ["!whoisthebest", "!whosthebest", "!dabest", "!dabes", "!thebest", "!whodabest"],
        requirements: [bot.requirements.guild],
        description: "Find out once and for all",
        exec: function (command, message) {
            var best = message.guild.members.cache.random();
            if (best.id === message.author.id) {
                fs.existsSync("images/udabest.png")
                    ? message.channel.send(new bot.MessageAttachment("images/udabest.png", "udabest.png"))
                    : message.channel.send("it u");
            } else {
                message.channel.send(best.displayName + " is the best.");
            }
        }
    },
    dancingyeah: {
        commands: ["!dance", "!danceparty", "!dancingyeah", "!celebrate", "!dp"],
        description: "Celebrate good times, come on!",
        exec: function (command, message) {
            let danceDuration = 0;
            let danceParty = false;
            let maxDances = 10;
            
            //1% chance of dance party cuz calvin wanted that
            if (Math.floor(Math.random() * 100) == 0) {
                danceParty = true;
                danceDuration = maxDances;
            } else {
                danceDuration = Math.floor(Math.random() * maxDances);
            }
            
            var left = "\\o)";
            var right = "(o/";
            var finisher = "\\o/";
            
            if (danceParty) {
                left = left+"<a:kawaiiDanceParty:604103260676292628>";
                right = "<a:kawaiiDanceParty:604103260676292628>"+right;
                finisher = finisher+"<a:kawaiiDanceParty:604103260676292628>"+finisher;
                message.channel.send("DANCE PARTY!!!");
            }               
                
            for(var count = 0; count < danceDuration; count++){
                if (count % 2 == 0){
                    setTimeout(() => message.channel.send(left), 2000 * count);
                } else {
                    setTimeout(() => message.channel.send(right), 2000 * count);
                }
                if (count + 1 == danceDuration){
                    setTimeout(() => message.channel.send(finisher), 2000 * (count + 1));
                }
            }
            
        }
    },
    "/o/": {
        description: "\\o\\",
        exec: function (command, message) {
            message.channel.send("\\o\\");
        }
    },
    "\\o\\": {
        description: "/o/",
        exec: function (command, message) {
            message.channel.send("/o/");
        }
    },
    "\\o)": {
        description: "(o/",
        exec: function (command, message) {
            message.channel.send("(o/");
        }
    },
    "(o/": {
        description: "\\o)",
        exec: function (command, message) {
            message.channel.send("\\o)");
        }
    }
};
