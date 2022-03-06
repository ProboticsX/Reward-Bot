const {Intents, Client } = require("discord.js");
const fs = require('fs');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
require('dotenv').config();
var Sentiment = require('sentiment');
var dbPath = 'db/user.json'


bot.login(process.env.DISCORDTOKEN);

bot.on('ready', () => {
    console.log("Online!!");
});

bot.on("message", message => {
    console.log("Message from ",message.author.username)
    if (message.author.username == "GitHub") {
        return rewardForGithubActivity(message);
    } else {
        positiveMessageAnalysis(message);
    }

});

function rewardForGithubActivity(message) {
    type = message.embeds[0].title;
    if(type.includes("Issue closed")) {
        type = "issue";
    } else if(type.includes("commit")) {
        type = "commit";
    }else{
        //If neither commit or issue, do nothing
        return false;
    }
    points = calculatePoints(type);
    if (points > 0)
    {
        author = message.embeds[0].author.name;
        updatePoints(author, type, points, "", dbPath);
        console.log("Awarded ", points, " to user ", author, " for ", type)
    }
    return true;
}

function calculatePoints(type) {
    if(type == "issue") {
        return 10;
    } else if(type == "commit") {
        return 5;
    }
    return 0;
}


function jsonReader(filePath, cb) {
    fs.readFile(filePath, 'utf-8', (err, fileData) => {
        if (err){
            return cb && cb(err);
        }
        try{
            const object = JSON.parse(fileData);
            return cb && cb(null,object);
        }catch(err){
            return cb && cb(err);
        }
    });
}

function writeFile(filePath, data) {
    fs.writeFile(filePath, JSON.stringify(data), err =>{
        if(err){
            console.log(err);
        }
        else{
            console.log('File successfully written!');
        }
    })
}

function updatePoints(author, type, points, channelId, fileName) {    
    jsonReader(fileName, (err, data) => {
        if(err) {
            console.log(err);
        } else {
            if(!(author in data)){
                console.log("Author does not Exists")
                data[author] = {
                    "commit":0,
                    "issue":0,
                    "pr": {},
                    "total":0
                }
            }
            if(type == "pr") {
                if(!(channelId in data[author][type])){
                    data[author][type][channelId] = 0;
                }
                data[author][type][channelId] += points;
            } 
            else {
                data[author][type] += points;
            }
            data[author]['total'] += points;
            writeFile(fileName, data)
        }
    })
}

function positiveMessageAnalysis(message) {
    author = message.author.username;
    content = message.content;
    channelId = message.channelId;

    var sentiment = new Sentiment();
    var result = sentiment.analyze(content);
    if (result.score > 0){
        updatePoints(author, "pr", result.score, channelId, dbPath)
    }

}

