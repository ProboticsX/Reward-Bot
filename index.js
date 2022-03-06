const {Intents, Client } = require("discord.js");
const fs = require('fs');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
require('dotenv').config();

bot.login(process.env.DISCORDTOKEN);

bot.on('ready', () => {
    console.log("Online!!");
});

bot.on("message", message => {
    console.log("Message from ",message.author.username)
    if (message.author.username == "GitHub") {
        rewardForGithubActivity(message);
    } else {
        queryFromUser(message);
    }

});

function rewardForGithubActivity(message) {
    type = message.embeds[0].title;
    if(type.includes("Issue closed")) {
        type = "issue";
    } else if(type.includes("commit")) {
        type = "commit";
    }
    points = calculatePoints(type);
    author = message.embeds[0].author.name;
    console.log("Awarded ", points, " to user ", author, " for ", type)
    if(points != 0) {
        updatePoints(author, type, points); 
    }
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

function updatePoints(author, type, points) {
    jsonReader('db/user.json', (err, data) => {
        if(err) {
            console.log(err);
        } else {
            if(!(author in data)){
                console.log("Author does not Exists")
                data[author] = {
                    "commit":0,
                    "issue":0,
                    "pr":0,
                    "total":0
                }
            } 
            data[author][type] += points;
            data[author]['total'] += points;
            writeFile('db/user.json', data)
        }
    })
}
   

function rewardForCommit(author, action) {


}

function rewardForClosingIssue(author, action) {
   
}

function  queryFromUser(message) {
    console.log("query")
}

