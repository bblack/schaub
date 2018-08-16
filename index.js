var http = require('http');
var https = require('https');
var superagent = require('superagent');
var cheerio = require('cheerio');

var POLL_INTERVAL = 30 * 1000;
var lastActivity;

function postActivity(activity){
  console.log('posting to slack...');
  superagent
    .post('https://hooks.slack.com/services/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')
    .type('json')
    .send({text: activity})
    .then((res) => {
      console.log("Posted to slack: " + res.status);
    })
    .catch((e) => {
      console.error("ERROR posting to slack: " + e.message);
    });
}

function doIt(){
  console.log('fetching activity...');
  http.get('http://games.espn.com/ffl/leagueoffice?leagueId=420354&seasonId=2018', (res) => {
    var body = '';
    res.on('data', (chk) => body += chk);
    res.on('end', () => {
      var $ = cheerio.load(body);
      var activity = $("ul#lo-recent-activity-list>li .recent-activity-fulldesc")
        .toArray()
        .map((e) => $(e).text()); // newest first
      console.log('fetched activity');
      if (activity[0] != lastActivity) {
        lastActivity = activity[0];
        postActivity(lastActivity);
      }
      setTimeout(doIt, POLL_INTERVAL);
    });
  }).on('error', (e) => {
    console.error('error: ' + e.message);
  });
}

doIt();
