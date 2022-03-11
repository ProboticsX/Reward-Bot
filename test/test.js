var chai   = require('chai');
const { option } = require('yargs');
var assert = chai.assert,
    expect = chai.expect;

process.env.NODE_ENV = 'test'
var bot = require('../index');
var dbPath = 'test/test_data.json';
var Sentiment = require('sentiment');
console.log = function(){};

function randomName(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}



describe("RewardBot Tests", function() {

    this.timeout(5000);

    it("ensures that rewardForGithubActivity() returns false on a Github activity which is not commit or issue closed", function() {
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

        let returnValue = bot.rewardForGithubActivity(message, dbPath);
        assert(returnValue === false);
    });

    it("ensures that rewardForGithubActivity() correctly update the points when an issue is closed", function() {
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
                author: {name : "sbabbar"},
                provider: null,
                footer: null
              }
          ]}

        
        let returnValue = bot.rewardForGithubActivity(message, dbPath);
        assert(returnValue["author"] ==  message.embeds[0].author.name && returnValue["points"] == 5)
        
    });

    it("ensures that rewardForGithubActivity() correctly creates a new author if it doesnt exist", function() {
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

        
        let returnValue = bot.rewardForGithubActivity(message, dbPath);
        assert(returnValue["author"] ==  message.embeds[0].author.name && returnValue["points"] == 5)
        
    });



    //For updatePoints()
    it("ensures that calculatePoints() returns 10 points for an issue", function() {
        
        type = "issue"
        let returnValue = bot.calculatePoints(type);
        assert(returnValue === 10);

    });

    

    it("ensures that calculatePoints() returns 10 points for an issue", function() {
        
        type = "issue"
        let returnValue = bot.calculatePoints(type);
        assert(returnValue === 10);

    });

    it("ensures that calculatePoints() returns 5 points for an commit", function() {
        
        type = "commit"
        let returnValue = bot.calculatePoints(type);
        assert(returnValue === 5);

    });

    it("ensures that calculatePoints() returns 0 points for neither an commit or commit", function() {
        
        type = ""
        let returnValue = bot.calculatePoints(type);
        assert(returnValue === 0);

    });

 

    it("ensures that positiveMessageAnalysis() makes an entry when author isn't present in the database", function() {
        //bot.getServerMembers();
        message = {"author": {"username": randomName(6)}, "content": "Awesome", "channelId": "1234"};
        //console.log(message.author.username, message.content, message.channelId);
        let returnValue = bot.positiveMessageAnalysis(message, dbPath);
        var sentiment = new Sentiment();
        var result = sentiment.analyze(message.content);
        //console.log("From test : ", returnValue["points"]);
        assert(returnValue["points"] === result.score);
    });
    
    it("ensures that positiveMessageAnalysis() returns false on empty input - 1", function() {
        message = {"author": {"username": "test"}, "content": "", "channelId": "1234"};
        //console.log(message.author.username, message.content, message.channelId);
        let returnValue = bot.positiveMessageAnalysis(message, dbPath);
        assert(returnValue === false);
    });

    it("ensures that positiveMessageAnalysis() add the points when author is already present in the database", function() {
            //bot.getServerMembers();
            message = {"author": {"username": "test"}, "content": "Awesome", "channelId": "1234"};
            //console.log(message.author.username, message.content, message.channelId);
            let returnValue = bot.positiveMessageAnalysis(message, dbPath);
            var sentiment = new Sentiment();
            var result = sentiment.analyze(message.content);
            //console.log("From test : ", returnValue["points"]);
            assert(returnValue["points"] === result.score);
    });

    it("Ensures that writeFile() updates the points in database", function() {
        msg = {"test":{"commit":0,"issue":0,"pr":{"1234":140},"total":140}}
        var result = bot.writeFile(dbPath, msg)
        assert(result == true);
    });

    
});


