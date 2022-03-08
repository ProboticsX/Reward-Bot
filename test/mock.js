const chai = require("chai");
const expect = chai.expect;
const nock = require("nock");

const main = require("./mock_main.js");

// Load mock data
const data = require("./mock_data.json")

process.env.NODE_ENV = 'test'

describe('Mock Testing', function () {

  //MOCK SERVICE
  var mockService = nock("https://api.github.com")
    .persist() 
    .get("/db/servermembers")
    .reply(200, JSON.stringify(data.db))


  describe('#findCommitPoints()', function () {
    it('should find the reward details of the commits made by user', async function () {
      let points = await main.findCommitPoints("sshubha");
      expect(points).to.equal(46);
    });
  });

  describe('#findIssuePoints()', function () {
    it('should find the reward details of the issues closed by user', async function () {
      let points = await main.findIssuePoints("sshubha");
      expect(points).to.equal(2);
    });
  });

  describe('#findPRPoints()', function () {
    it('should find the reward details of the positve statements on a particular channel by user', async function () {
      let points = await main.findPRPoints("sshubha", "949414533905154108");
      expect(points).to.equal(7);
    });
  });

  describe('#findTotalPoints()', function () {
    it('should find the total of all the reward collected by a user', async function () {
      let points = await main.findTotalPoints("sshubha");
      expect(points).to.equal(58);
    });
  });

});
