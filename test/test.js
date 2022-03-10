var chai   = require('chai');
const { option } = require('yargs');
var assert = chai.assert,
    expect = chai.expect;

process.env.NODE_ENV = 'test'
var bot = require('../index');
var dbPath = 'test/test_data.json';
var Sentiment = require('sentiment');


describe("RewardBot Tests", function() {

    this.timeout(5000);

    it("ensures that positiveMessageAnalysis() makes an entry when author isn't present in the database", function() {
        //bot.getServerMembers();
        message = {"author": {"username": "test_2"}, "content": "Awesome", "channelId": "1234"};
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

    
});






