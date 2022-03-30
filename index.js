const {Intents, Client, Attachment, Message, MessageEmbed } = require("discord.js");
const fs = require('fs');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });
require('dotenv').config();
var Sentiment = require('sentiment');
const express = require('express')
const app = express()
var pg = require('pg')
var format = require('pg-format')
var table = 'reward'
var pool = new pg.Pool(config)
var myClient

var config = {
    user: process.env.PGUSER, // name of the user account
    database: process.env.PGDATABASE, // name of the database
    max: 10, // max number of clients in the pool
    password: process.env.PGPASSWORD, //Comment this line if password is not set up
    idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed
  }

  pool.connect(function (err, client, done) {
    if (err) console.log(err)
    app.listen(3000, function () {
      console.log('Connected to DB')
    })
    myClient = client
    var createTableQuery = format('CREATE TABLE IF NOT EXISTS '+ table +' (username VARCHAR(255) PRIMARY KEY,reward_info JSON);');
    var result = myClient.query(createTableQuery);
  })

var serverMembers = {}
var embedData = {
    "Commit" : {
        "iconURL" : 'https://w7.pngwing.com/pngs/72/974/png-transparent-computer-icons-merge-git-github-text-git-symbol-thumbnail.png',
        "desc" : ', I like the way you commit!📝',
        "thumbnailUrl" : 'https://cdn-icons-png.flaticon.com/512/4168/4168977.png'
    },
    "Issue" : {
        "iconURL" : 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
        "desc" : ', you are the perfect Issue Solver ✅',
        "thumbnailUrl" : 'https://www.conquestgraphics.com/images/default-source/default-album/rewards.png?sfvrsn=a333198d_0'
    },
    "pr" : {
        "iconURL" : 'https://w7.pngwing.com/pngs/880/606/png-transparent-clapping-hands-emoji-clapping-emojipedia-sticker-applause-clap-hand-material-emoticon.png',
        "desc" : ', keep appreciating and helping others!!',
        "thumbnailUrl" : 'https://cdn-icons-png.flaticon.com/512/1426/1426735.png'
    },
    "self-stats" : {
        "iconURL" : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTayx-mmozSk2BKJyPvPq6WEpgzfUOsQV2tzintsyAMRm3NaWMp3JbtF7_3odfaf9xaZzk&usqp=CAU',
        "thumbnailUrl" : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmcNU267IuEYJTD8nJ4E8iMs62B7iaahHscCHAm2JmhtHvch3BKmX2t4zCPgOrNepDRM4&usqp=CAU' 
    },
    "leaderboard" : {
        "iconURL" : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTayx-mmozSk2BKJyPvPq6WEpgzfUOsQV2tzintsyAMRm3NaWMp3JbtF7_3odfaf9xaZzk&usqp=CAU',
        "thumbnailUrl" : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmcNU267IuEYJTD8nJ4E8iMs62B7iaahHscCHAm2JmhtHvch3BKmX2t4zCPgOrNepDRM4&usqp=CAU' 
    }
}

async function main()
{
    bot.login(process.env.DISCORDTOKEN);
    bot.on('ready', () => {
        getServerMembers()
        console.log("Online!!");
    });
    bot.on("message", async message => {
        var author_obj = new Object();
        if (message.author.username == "GitHub") {
            author_obj = rewardForGithubActivity(message);
            if(author_obj["type"] == "Issue"){
                sendMessageEmbed(author_obj["author"], author_obj["githubUrl"], author_obj["points"], author_obj["type"]);
            } else if(author_obj["type"] == "Commit") {
                sendMessageEmbed(author_obj["author"], author_obj["githubUrl"], author_obj["points"], author_obj["type"]);
            }
        } else if(message.content == "?self-stats") {
            author_obj = await getSelfStatistics(message);
            sendMessageEmbedForSelfStatistics(author_obj["author"], author_obj["desc"], author_obj["type"]);           
        } 
        else if(message.content == "?leaderboard") {
            author_obj = await getLeaderboardDetails(message);
            sendMessageEmbedForLeaderboard(author_obj["author"], author_obj["desc"], author_obj["type"]);

        }
        else {
            author_obj = positiveMessageAnalysis(message);
            if (author_obj["points"])
            sendMessageEmbed(author_obj["author"], null, author_obj["points"], "pr")
        }
    });
}   

async function getLeaderboardDetails(message) {
    let author = message.author.username;
    var return_obj = new Object();
    let type = "leaderboard"
    var selectQuery = format("SELECT username, reward_info->>'Total' as total from " + table);
    var res = await myClient.query(selectQuery );
    console.log("hello")
    console.log(res)

    if(res != undefined) {
        // console.log(res.rows);

        desc = ''

        var user_data = []

        for (var row in res.rows){
            var username = res.rows[row]['username']
            var total = Number(res.rows[row]['total'])
            user_data.push([username, total])
            
        }

        console.log(user_data)

        user_data.sort((a, b) => b[1] - a[1])

        console.log(user_data)

        for (var row in user_data){

            // console.log(row)
            desc += user_data[row][0] + ': ' + user_data[row][1] + '\n'

        }

        console.log(desc)

        return_obj["author"] = author
        return_obj["desc"] = desc
        return_obj["type"] = type
        return return_obj
    }
}

function sendMessageEmbedForLeaderboard(author, desc, type) {
    let userId  = serverMembers[author].id;
    bot.users.fetch(userId, false).then((user) => {
        const messageEmbed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Leaderboard:')
                .setAuthor({ name: "Leaderboard", iconURL: embedData[type].iconURL })
                .setDescription(desc)
                .setThumbnail(embedData[type].thumbnailUrl)
                .setTimestamp()
        user.send({ embeds: [messageEmbed] });
    });
}

function rewardForGithubActivity(message) {
    
    // Received the message from github
    // message is in json format
    // only gives rewards for closed issues or commits
    // calls the calculatePoints() function which returns the number of points to be awarded
    // calls the updatePoints to update the database
    // returns a dict style object with author name, points, etc.


    type = message.embeds[0].title;
    githubUrl = message.embeds[0].url;
    var return_obj = new Object();
    return_obj["type"] = null;
    if(type.includes("Issue closed")) 
        type = "Issue";
    else if(type.includes("commit")) 
        type = "Commit";
    else
        return false;
    
    points = calculatePoints(type);
    if (points > 0)
    {
        author = message.embeds[0].author.name;
        updatePoints(author, type, points, "");
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

    if(type == "Issue") 
        return 10;
    else if(type == "Commit") 
        return 5;
    return 0;
}

async function getServerMemberDetailsFromDB(author) {
    var selectQuery = format('SELECT * from ' +table+ ' where username = %L', author);
    var res = await myClient.query(selectQuery );
	return res.rows[0];
}

async function postServerMemberDetailsFromDB(data, author) {
    var updateQuery = format('UPDATE ' +table+ ' SET reward_info = %L where username = %L', data, author);
    var res = await myClient.query(updateQuery);
}

async function updatePoints(author, type, points, channelId) {

    // Received the arguments: author, type, points, channelId
    // author -> author name
    // type -> issue, commit or pr
    // points -> number of points to be awarded
    // channelId: discord channel id

    let data = await getServerMemberDetailsFromDB(author);
    if(typeof(data) == "undefined"){
        console.log("User does not exist... Generating record")
        data = {
            "Commit":0,
            "Issue":0,
            "pr": {},
            "Total":0
        }
        var insertQuery = format('INSERT INTO ' +table+ ' VALUES (%L, %L)', author, data);
        var res = await myClient.query(insertQuery);        
    } else 
        data = data['reward_info'];

    if(type == "pr") {
        if(!(channelId in data[type]))
            data[type][channelId] = 0;
        data[type][channelId] += points;
    } 
    else 
        data[type] += points;

    data['Total'] += points;
    await postServerMemberDetailsFromDB(data, author);
    console.log("Awarded ", points, " to user ", author, " for ", type);

}

async function getSelfStatistics(message) {
    let author = message.author.username;
    
    var return_obj = new Object();
    let reward_info = await getServerMemberDetailsFromDB(author);
    if(reward_info != undefined) {
        reward_info = reward_info["reward_info"];
        let type = "self-stats";
        let desc = "";
        for(var key in reward_info) {
            if (key == "pr"){
                let sum = 0;
                for(var channel in reward_info[key]){
                    sum += reward_info[key][channel];
                }
                desc += "Positive Reinforcement Points : " + sum + "\n";
            } else if(key != "Total") {
                desc += key + " Points : " + reward_info[key] + "\n";
            }
        }
        desc += "Total Points : " + reward_info["Total"] + "\n";
        return_obj["author"] = author
        return_obj["desc"] = desc
        return_obj["type"] = type
        return return_obj
    }
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

function sendMessageEmbedForSelfStatistics(author, desc, type) {
    let userId  = serverMembers[author].id;
    bot.users.fetch(userId, false).then((user) => {
        const messageEmbed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Here are your self-statistics')
                .setAuthor({ name: "Self Statistics", iconURL: embedData[type].iconURL })
                .setDescription(desc)
                .setThumbnail(embedData[type].thumbnailUrl)
                .setTimestamp()
        user.send({ embeds: [messageEmbed] });
    });
}

function getServerMembers() {
    const guild = bot.guilds.cache.get(process.env.GUILD_ID)
    guild.members.fetch()
     .then((members) => {
        members.forEach((member) => serverMembers[member.user.username] = member.user )   
     }); 
}

function positiveMessageAnalysis(message) {

    // Received the arguments: message
    // message -> message on the channel to be given a score
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
        updatePoints(author, "pr", points, channelId);
    } else {
        points = 0
    }
    return_obj["author"] = author;
    return_obj["points"] = points;
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
