var chai   = require('chai');
const { option } = require('yargs');
var assert = chai.assert,
    expect = chai.expect;

process.env.NODE_ENV = 'test'
var bot = require('../index');
var dbPath = 'test/test_data.json';
var Sentiment = require('sentiment');
console.log = function(){};

const express = require('express')
const app = express()
var pg = require('pg')
var format = require('pg-format')
var table = 'testtable'
var pool = new pg.Pool(config)
var myClient
var server

var config = {
    user: process.env.PGUSER, // name of the user account
    database: process.env.PGDATABASE, // name of the database
    max: 10, // max number of clients in the pool
    password: process.env.PGPASSWORD, //Comment this line if password is not set up
    idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed
}

pool.connect(function (err, client, done) {
    if (err) console.log(err)
    server = app.listen(3000, function () {
        console.log("Connected to Test DB")
    });
    myClient = client
    var createTableQuery = format('CREATE TABLE IF NOT EXISTS '+ table +' (username VARCHAR(255) PRIMARY KEY,reward_info JSON);');
    var result = myClient.query(createTableQuery);
})

function randomName(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

describe("RewardBot Tests", function() {

    this.timeout(5000);

    it("ensures that rewardForGithubActivity() returns false on a Github activity which is not commit or issue closed", async function() {
        // CREATE TEST OBJECT

        message = { embeds: [
            MessageEmbed = {
              type: 'rich',
              title: '[sshinde3/Github-test] Issue opened: #16 test1',
              description: null,
              url: 'https://github.ncsu.edu/sshinde3/Github-test/issues/16',
              color: 15426592,
              timestamp: null,
              fields: [],
              thumbnail: null,
              image: null,
              video: null,
              author: [Object],
              provider: null,
              footer: null
            }
          ]}

        let returnValue = await bot.rewardForGithubActivity(message, myClient, table);
        assert(returnValue === false);
    });

    it("ensures that rewardForGithubActivity() correctly update the points when an issue is closed", async function() {
        // CREATE TEST OBJECT

        message = { embeds: [
            MessageEmbed = {
                type: 'rich',
                title: '[Github-test:main] 1 new commit',
                description: '[`f2448f8`](https://github.ncsu.edu/sshinde3/Github-test/commit/f2448f83ab738990b19c15d5a9dbf33707396a1d) Update README.md - sbabbar',
                url: 'https://github.ncsu.edu/sshinde3/Github-test/commit/f2448f83ab738990b19c15d5a9dbf33707396a1d',
                color: 7506394,
                timestamp: null,
                fields: [],
                thumbnail: null,
                image: null,
                video: null,
                author: {name : "test"},
                provider: null,
                footer: null
              }
          ]}

        let returnValue = await bot.rewardForGithubActivity(message, myClient, table);
        assert(returnValue["author"] ==  message.embeds[0].author.name && returnValue["points"] == 5)
    });

    
    it("ensures that rewardForGithubActivity() correctly creates a new author if it doesnt exist", async function() {
        // CREATE TEST OBJECT

        message = { embeds: [
            MessageEmbed = {
                type: 'rich',
                title: '[Github-test:main] 1 new commit',
                description: '[`f2448f8`](https://github.ncsu.edu/sshinde3/Github-test/commit/f2448f83ab738990b19c15d5a9dbf33707396a1d) Update README.md - sbabbar',
                url: 'https://github.ncsu.edu/sshinde3/Github-test/commit/f2448f83ab738990b19c15d5a9dbf33707396a1d',
                color: 7506394,
                timestamp: null,
                fields: [],
                thumbnail: null,
                image: null,
                video: null,
                author: {name : randomName(6)},
                provider: null,
                footer: null
              }
          ]}

        
        let returnValue = await bot.rewardForGithubActivity(message, myClient, table);
        assert(returnValue["author"] ==  message.embeds[0].author.name && returnValue["points"] == 5)
        
    });



    //For updatePoints()
    it("ensures that calculatePoints() returns 10 points for an issue", function() {
        
        type = "Issue"
        let returnValue = bot.calculatePoints(type);
        assert(returnValue === 10);

    });


    it("ensures that calculatePoints() returns 5 points for an commit", function() {
        
        type = "Commit"
        let returnValue = bot.calculatePoints(type);
        assert(returnValue === 5);

    });

    it("ensures that calculatePoints() returns 0 points for neither an commit or commit", function() {
        
        type = ""
        let returnValue = bot.calculatePoints(type);
        assert(returnValue === 0);

    });


    it("ensures that positiveMessageAnalysis() makes an entry when author isn't present in the database", function() {
        message = {"author": {"username": randomName(6)}, "content": "Awesome", "channelId": "1234"};
        let returnValue = bot.positiveMessageAnalysis(message, myClient, table);
        var sentiment = new Sentiment();
        var result = sentiment.analyze(message.content);
        assert(returnValue["points"] === result.score);
    });
    
    it("ensures that positiveMessageAnalysis() returns false on empty input - 1", function() {
        message = {"author": {"username": "test"}, "content": "", "channelId": "1234"};
        let returnValue = bot.positiveMessageAnalysis(message, myClient, table);
        assert(returnValue === false);
    });

    it("ensures that positiveMessageAnalysis() add the points when author is already present in the database", function() {
        message = {"author": {"username": "test"}, "content": "Awesome", "channelId": "1234"};
        let returnValue = bot.positiveMessageAnalysis(message, myClient, table);
        var sentiment = new Sentiment();
        var result = sentiment.analyze(message.content);
        assert(returnValue["points"] === result.score);
 
        setTimeout(function(){
            server.close(() => {
                console.log('Closed out remaining connections');
                process.exit(0);
            });
        }, 1000);
    });

    
});


