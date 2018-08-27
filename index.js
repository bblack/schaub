var http = require('http');
var https = require('https');
var superagent = require('superagent');
var cheerio = require('cheerio');

var POLL_INTERVAL = 30 * 1000;
var lastActivity;

function log(s) {
  console.log((new Date()).toISOString() + ": " + s);
}

function postActivity(activity){
  log('posting to slack...');
  superagent
    .post('https://hooks.slack.com/services/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')
    .type('json')
    .send({text: activity})
    .then((res) => {
      log("Posted to slack: " + res.status);
    })
    .catch((e) => {
      log("ERROR posting to slack: " + e.message);
    });
}

function doIt(){
  log('fetching activity...');
  http.get('http://games.espn.com/ffl/leagueoffice?leagueId=420354&seasonId=2018', (res) => {
    var body = '';
    res.on('data', (chk) => body += chk);
    res.on('end', () => {
      var $ = cheerio.load(body);
      var activity = $("ul#lo-recent-activity-list>li")
        .toArray()
        .map((e) => {
          $(e).find('br').replaceWith('\n'); // MODIFIES IN-PLACE!
          var desc = $(e).find('.recent-activity-description').text();
          var descMore = $(e).find('.recent-activity-fulldesc').text();
          return desc + (descMore ? ('\n' + descMore) : '');
        });
      log('fetched activity');
      if (activity[0] != lastActivity) {
        if (lastActivity) {
          postActivity(activity[0]);
        }
        lastActivity = activity[0];
      }
      setTimeout(doIt, POLL_INTERVAL);
    });
  }).on('error', (e) => {
    log('error: ' + e.message);
    setTimeout(doIt, POLL_INTERVAL);
  });
}

doIt();
