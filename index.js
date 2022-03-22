const {Intents, Client, Attachment, Message, MessageEmbed } = require("discord.js");
const fs = require('fs');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });
require('dotenv').config();
var Sentiment = require('sentiment');
var dbPath = 'db/user.json'
const express = require('express')
const app = express()
var pg = require('pg')
var format = require('pg-format')
var table = 'temp'
var pool = new pg.Pool(config)
var myClient

let data = require("./db/user.json")  
//const _ = require("underscore");   
const nock = require("nock");  
const github = require("./test/github.js");

var config = {
    user: process.env.PGUSER, // name of the user account
    database: process.env.PGDATABASE, // name of the database
    max: 10, // max number of clients in the pool
    idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed
  }


var mockGetService =  nock("https://api.github.com")
                        .persist()
                        .get("/db/servermembers")
                        .reply(200,
                            JSON.stringify(data.db)
                    );

var mockPostService = nock("https://api.github.com")
                        .persist() 
                        .post("/db/servermembers")
                        .reply(201, (uri, requestBody) => {
                        console.log("Writing data to Database");
                        writeFile(dbPath, JSON.parse(requestBody))
                     });

var serverMembers = {}
var embedData = {
    "commit" : {
        "iconURL" : 'https://w7.pngwing.com/pngs/72/974/png-transparent-computer-icons-merge-git-github-text-git-symbol-thumbnail.png',
        "desc" : ', I like the way you commit!📝',
        "thumbnailUrl" : 'https://cdn-icons-png.flaticon.com/512/4168/4168977.png'
    },
    "issue" : {
        "iconURL" : 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
        "desc" : ', you are the perfect Issue Solver ✅',
        "thumbnailUrl" : 'https://www.conquestgraphics.com/images/default-source/default-album/rewards.png?sfvrsn=a333198d_0'
    },
    "pr" : {
        "iconURL" : 'https://w7.pngwing.com/pngs/880/606/png-transparent-clapping-hands-emoji-clapping-emojipedia-sticker-applause-clap-hand-material-emoticon.png',
        "desc" : ', keep appreciating and helping others!!',
        "thumbnailUrl" : 'https://cdn-icons-png.flaticon.com/512/1426/1426735.png'
    },
}

async function main()
{
    bot.login(process.env.DISCORDTOKEN);
    bot.on('ready', () => {
        getServerMembers()
        console.log("Online!!");
    });
    bot.on("message", message => {
        var author_obj = new Object();
        if (message.author.username == "GitHub") {
            author_obj = rewardForGithubActivity(message, dbPath);
            if(author_obj["type"] == "issue"){
                sendMessageEmbed(author_obj["author"], author_obj["githubUrl"], author_obj["points"], author_obj["type"]);
            } else if(author_obj["type"] == "commit") {
                sendMessageEmbed(author_obj["author"], author_obj["githubUrl"], author_obj["points"], author_obj["type"]);
            }
        } else {
            author_obj = positiveMessageAnalysis(message, dbPath);
            sendMessageEmbed(author_obj["author"], null, author_obj["points"], "pr")
        }
    });
}   

function rewardForGithubActivity(message, dbPath) {
    
    // Received the message from github
    // message is in json format
    // Receives dbPath as argument, where the points need to be updated
    // only gives rewards for closed issues or commits
    // calls the calculatePoints() function which returns the number of points to be awarded
    // calls the updatePoints to update the database
    // returns a dict style object with author name, points, etc.


    type = message.embeds[0].title;
    githubUrl = message.embeds[0].url;
    var return_obj = new Object();
    return_obj["type"] = null;
    if(type.includes("Issue closed")) 
        type = "issue";
    else if(type.includes("commit")) 
        type = "commit";
    else
        return false;
    
    points = calculatePoints(type);
    if (points > 0)
    {
        author = message.embeds[0].author.name;
        updatePoints(author, type, points, "", dbPath);
        console.log("Awarded ", points, " to user ", author, " for ", type, " in db ",dbPath)
        return_obj["author"] = author;
        return_obj["githubUrl"] = githubUrl;
        return_obj["points"] = points;
        return_obj["type"] = type;  
    }
    return return_obj;
}

function calculatePoints(type) {

    // Gets type as argument
    // type can be either issue or commit
    // returns 5 points for commits 
    // return 10 points for issues
    // if type is neither issue or commit, returns 0

    if(type == "issue") 
        return 10;
    else if(type == "commit") 
        return 5;
    return 0;
}

function writeFile(filePath, data) {

    // Function to write json data to the provided database path
    // data -> The data to be written to the database
    // filePath -> dbpath where updates need to be made

    fs.writeFile(filePath, JSON.stringify(data), err =>{
        if(err)
            console.log(err);
        else 
            console.log('File successfully written!');
    });
    return true;
  }

async function getServerMemberDetailsFromDB() {
	let userdetails = await github.getServerMemberDetails(); 
	return userdetails[0];
}

async function postServerMemberDetailsFromDB(details) {
	let newdetails = { "db" : [  ] }
    let mp = {}
    for (var user in details) {
        mp[user] = details[user];
    }
    newdetails["db"].push(mp);
	await github.postServerMemberDetails(newdetails); 
}

async function updatePoints(author, type, points, channelId, fileName) {

    // Received the arguments: author, type, points, channelId, fileName
    // author -> author name
    // type -> issue, commit or pr
    // points -> number of points to be awarded
    // channelId: discord channel id
    // fileName: dbpath where updates need to be made


    let data = await getServerMemberDetailsFromDB(); 
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
        if(!(channelId in data[author][type]))
            data[author][type][channelId] = 0;
        data[author][type][channelId] += points;
    } 
    else 
        data[author][type] += points;

    data[author]['total'] += points;
    await postServerMemberDetailsFromDB(data);

}


function sendMessageEmbed(author, githubUrl, points, type) {
    let userId  = serverMembers[author].id
    bot.users.fetch(userId, false).then((user) => {
         const messageEmbed = new MessageEmbed()
         .setColor('#0099ff')
         .setTitle('Here is your Reward!🎁')
         .setAuthor({ name: "+"+points+" points", iconURL: embedData[type].iconURL, url: githubUrl })
         .setDescription(author + embedData[type].desc)
         .setThumbnail(embedData[type].thumbnailUrl)
         .setTimestamp()
         user.send({ embeds: [messageEmbed] });
 });
}

function getServerMembers(){
    const guild = bot.guilds.cache.get(process.env.GUILD_ID)
    guild.members.fetch()
     .then((members) => {
        members.forEach((member) => serverMembers[member.user.username] = member.user )   
     }); 
}

function positiveMessageAnalysis(message, dbPath) {

    // Received the arguments: message, dbPath
    // message -> message on the channel to be given a score
    // dbPath -> dbpath where updates need to be made
    // Sentiment library is used to determine the score of the message
    // Returns the object containing author and points

    author = message.author.username;
    content = message.content;
    channelId = message.channelId;
    var return_obj = new Object();
    if ((!author) || (!content) || (!channelId))
        return false;

    var sentiment = new Sentiment();
    var result = sentiment.analyze(content);
    let points = result.score;
    if (points > 0) {
        updatePoints(author, "pr", points, channelId, dbPath)
        return_obj["author"] = author;
        return_obj["points"] = points;
    }
    return return_obj;
}

(async () => {
    if (process.env.NODE_ENV != 'test') {
        await main();
    }
})()


module.exports.rewardForGithubActivity = rewardForGithubActivity;
module.exports.calculatePoints = calculatePoints;
module.exports.updatePoints = updatePoints;
module.exports.getServerMembers = getServerMembers;
module.exports.positiveMessageAnalysis = positiveMessageAnalysis;
module.exports.sendMessageEmbed = sendMessageEmbed;
module.exports.writeFile = writeFile;