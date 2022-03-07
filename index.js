const {Intents, Client, Attachment, Message, MessageEmbed } = require("discord.js");
const fs = require('fs');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });
require('dotenv').config();
var Sentiment = require('sentiment');
var dbPath = 'db/user.json'
var serverMembers = {}


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
                rewardForClosingIssue(author, githubUrl, points);
            } else if(author_obj["type"].includes("commit")) {
                rewardForCommit(author, githubUrl, points);
            }
        } else {
            author_obj = positiveMessageAnalysis(message, dbPath);
            rewardForPositiveMessages(author_obj["author"], author_obj["points"]);
        }
    });
}   

function rewardForGithubActivity(message, dbPath) {
    type = message.embeds[0].title;
    githubUrl = message.embeds[0].url;
    var return_obj = new Object();

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
        return_obj["author"] = author;
        return_obj["githubUrl"] = githubUrl;
        return_obj["points"] = points;
        return_obj["type"] = type;

    }
    return return_obj;
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
        if (err) {
            return cb && cb(err);
        }
        try {
            const object = JSON.parse(fileData);
            return cb && cb(null,object);
        } catch(err) {
            return cb && cb(err);
        }
    });
}

function writeFile(filePath, data) {
    fs.writeFile(filePath, JSON.stringify(data), err =>{
        if(err){
            console.log(err);
        } else {
            console.log('File successfully written!');
        }
    });
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


function rewardForCommit(author, githubUrl, points) {
    let userId  = serverMembers[author].id
    bot.users.fetch(userId, false).then((user) => {
         const messageEmbed = new MessageEmbed()
         .setColor('#0099ff')
         .setTitle('Here is your Reward!🎁')
         .setAuthor({ name: "+"+points+" points", iconURL: 'https://w7.pngwing.com/pngs/72/974/png-transparent-computer-icons-merge-git-github-text-git-symbol-thumbnail.png', url: githubUrl })
         .setDescription(author+', i like the way you commit!📝')
         .setThumbnail('https://cdn-icons-png.flaticon.com/512/4168/4168977.png')
         .setTimestamp()
         user.send({ embeds: [messageEmbed] }); 
 });
 }

function rewardForClosingIssue(author, githubUrl, points) {
   let userId  = serverMembers[author].id
   bot.users.fetch(userId, false).then((user) => {
        const messageEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Here is your Reward!🎁')
        .setAuthor({ name: "+"+points+" points", iconURL: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png', url: githubUrl })
        .setDescription(author+', you are the perfect Issue Solver ✅')
        .setThumbnail('https://www.conquestgraphics.com/images/default-source/default-album/rewards.png?sfvrsn=a333198d_0')
        .setTimestamp()
        user.send({ embeds: [messageEmbed] }); 
});
}

function rewardForPositiveMessages(author, points) {
    let userId  = serverMembers[author].id
    bot.users.fetch(userId, false).then((user) => {
         const messageEmbed = new MessageEmbed()
         .setColor('#0099ff')
         .setTitle('Here is your Reward!✨')
         .setAuthor({ name: "+"+points+" points", iconURL: 'https://w7.pngwing.com/pngs/880/606/png-transparent-clapping-hands-emoji-clapping-emojipedia-sticker-applause-clap-hand-material-emoticon.png' })
         .setDescription(author+', keep appreciating and helping others!!')
         .setThumbnail('https://cdn-icons-png.flaticon.com/512/1426/1426735.png')
         .setTimestamp()
         user.send({ embeds: [messageEmbed] }); 
 });
 }


function getServerMembers(){
    const guild = bot.guilds.cache.get(process.env.GUILD_ID)
    guild.members.fetch()
     .then((members) => {
        members.forEach((member) => serverMembers[member.user.username] = member.user )   
     }
     );
    
}

function positiveMessageAnalysis(message, dbPath) {
    author = message.author.username;
    content = message.content;
    channelId = message.channelId;
    var return_obj = new Object();

    if ((!author) || (!content) || (!channelId))
    {
        return false
    }

    var sentiment = new Sentiment();
    var result = sentiment.analyze(content);
    let points = result.score;
    if (points > 0){
        updatePoints(author, "pr", points, channelId, dbPath)
        return_obj["author"] = author;
        return_obj["points"] = points;
        
    }
    return return_obj;

}

(async () => 
{
    if (process.env.NODE_ENV != 'test') {
        await main();
    }
})()


module.exports.rewardForGithubActivity = rewardForGithubActivity;
module.exports.calculatePoints = calculatePoints;
module.exports.jsonReader = jsonReader;
module.exports.writeFile = writeFile;
module.exports.updatePoints = updatePoints;
module.exports.rewardForCommit = rewardForCommit;
module.exports.rewardForClosingIssue = rewardForClosingIssue;
module.exports.rewardForPositiveMessages = rewardForPositiveMessages;
module.exports.getServerMembers = getServerMembers;
module.exports.positiveMessageAnalysis = positiveMessageAnalysis;