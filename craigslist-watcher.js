process.chdir(__dirname);

// Modules
var craigslistscraper = require('./craigslistscraper');
var fs = require('node-fs');
var async = require('async');
var mailer = require('./craigslistmailer');

// Variables
var baseUrl = '';
var mailSenderEmail = '';
var mailSenderPass = '';
var notifyEmail = '';
var queries = []; // Search strings
var queryResults = [];
var dataPath = '';
var dataDirName = 'craigslist-watcher';
var dataFileName = 'data';
var dataFilePath = '';
var filename = __filename.replace(/.*\//,'');
var usage = "\n" + filename + " - check Craigslist for new posts based on search terms and email new posts\n";
usage = usage + "Usage: " + filename + " [options] CITY_SUBDOMAIN SENDER_EMAIL SENDER_PASS NOTIFY_EMAIL SEARCH_STRINGS...";

// Parse arguments
if (process.argv.length < 7) {
  console.error(usage);
  process.exit(1);
}
baseUrl = 'http://' + process.argv[2] + '.craigslist.org';
mailSenderEmail = process.argv[3];
mailSenderPass = process.argv[4];
notifyEmail = process.argv[5];
for (i=6; i < process.argv.length; i++) {
  queries.push(process.argv[i]);
}

function isEmpty(str) {
  return (!str || 0 === str.length);
}

// Check search data file and create if it doesn't exist
// TODO: error handling

if (!isEmpty(process.env.XDG_DATA_HOME)) { // try XDG
  dataPath = process.env.XDG_DATA_HOME + '/' + dataDirName;
}
else {
  if (!isEmpty(process.env.HOME)) {
    dataPath = process.env.HOME + '/.local/share/' + dataDirName;
  }
  else {
    console.error("No home directory specified. Exiting...");
    process.exit(1);
  }
}
dataFilePath = dataPath + '/' + dataFileName;
var exists = fs.existsSync(dataPath);
if (!exists) {
  console.log("No data folder! Creating one...");
  fs.mkdirSync(dataPath, 0700, true);
} else {
  console.log("Found data folder.");
}

// Check data file existence
exists = fs.existsSync(dataFilePath);
if (!exists) {
  console.log("No data file! Creating one...");
  fs.writeFileSync(dataFilePath, '');
} else {
  console.log("Found data file.");
}

// Search for each query and compile results

var processResults = function() {
  var datafile = fs.readFileSync(dataFilePath, 'utf8');
  var dataArr = (isEmpty(datafile) ? [] : JSON.parse(datafile));
  var results = [];
  var emailMessage = "The following craigslist posts are new:\n";

  // Search for each query and compile results
  console.log("Processing results...");
  for (var i = 0; i < queryResults.length; i++) {
    var match = false;
    for (var j = 0; j < dataArr.length; j++) {
      if(queryResults[i].href === dataArr[j].href) {
        match = true;
        break;
      }
    }
    if (!match) {
      results.push(queryResults[i]); // no match so add to results
    }
  }

  if (results.length > 0) {
    // add new results to datafile (and email message) and write to disk
    for (var i = 0; i < results.length; i++) {
      dataArr.push(results[i]);
      emailMessage += '<p>' + results[i].date + ' - ' + '<a href="' + results[i].href + '">' + results[i].text + '</a> - ';
      emailMessage += results[i].price + ' ' + results[i].loc + '</p>';
    }
    var jsonResults = JSON.stringify(dataArr);
    fs.writeFileSync(dataFilePath, jsonResults);
  
    // setup e-mail data with unicode symbols
  
    mailOptions = {
      from: mailSenderEmail, // sender address
      to: notifyEmail, // list of receivers
      subject: "Craigslist Updates", // Subject line
      //text: emailMessage, // plaintext body
      html: emailMessage
    }

    transportOptions = {
      service: "Gmail",
      auth: {
        user: mailSenderEmail,
        pass: mailSenderPass
      }
    }
  
    // email results
    mailer.sendMyMail(mailOptions, transportOptions);
  }
}

async.each(queries, function(q, callback) {
  craigslistscraper.query(baseUrl, q, function(results) {
    queryResults.push({date: results.date, text: results.text, href: results.href, price: results.price, loc: results.loc});
  }, callback);
}, function(err) {
  if (!isEmpty(err)) {
    console.error("Error while querying:" + err);
  }
  else {
    console.log("Queries completed successfully.");
    processResults();
  }
});
