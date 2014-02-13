process.chdir(__dirname);

// If the config file is not at ./config, it should be specified as the first argument to the script
var configPath = process.argv[2] || './config';

// Modules
var craigslistscraper = require('./craigslist-scraper'),
  fs = require('node-fs'),
  async = require('async'),
  nodemailer = require('nodemailer'),
  config = require(configPath);

// Variables
var baseUrl = '',
  mailSenderEmail = config.from.email,
  mailSenderPass = config.from.pass,
  notifyEmail = config.to.email,
  queries = [], // Search string,
  queryResultSets = [],
  dataPath = '',
  dataDirName = 'craigslist-watcher',
  dataFileName = 'data',
  dataFilePath = '',
  filename = __filename.replace(/.*\//, ''),
  usage = '\ncraigslist-watcher - check Craigslist for new posts based on search terms and email new posts\n';


usage = usage + 'Usage: craigslist-watcher [options] CONFIG_PATH';

// Functions

function isEmpty(str) {
  return (!str || 0 === str.length);
}

/**
 * Given a result object, create some html of the results.
 * @param  {Array} results
 * @return {String}
 */
function createResultHtml(termResultSet) {
  var html = '<h2>Results for <span style="color:#000099">' 
              + termResultSet.term + '</span> in <span style="color:#000099">' 
              + termResultSet.location + '</span></h2>';

  for (var i = 0; i < termResultSet.rows.length; i++) {
    html += '<p>' + termResultSet.rows[i].date + ' - ' + '<a href="' + termResultSet.rows[i].href + '">' + termResultSet.rows[i].text + '</a> - ';
    html += termResultSet.rows[i].price + ' ' + termResultSet.rows[i].loc + '</p>';
  }

  return html;
}

/**
 * Email the new result sets to the specified user.
 * @param  {Array} resultSets The array of result sets
 */
function emailResults(resultSets) {
  var emailMessage = 'The following craigslist posts are new:\n',
    mailOptions = {
      from: mailSenderEmail, // sender address
      to: notifyEmail, // list of receivers
      subject: 'Craigslist Updates',
    },
    transportOptions = {
      service: 'Gmail',
      auth: {
        user: mailSenderEmail,
        pass: mailSenderPass
      }
    },
    smtpTransport = nodemailer.createTransport('SMTP', transportOptions);

  // Create email string
  for (var i = 0; i < resultSets.length; i++) {
    if (resultSets[i].rows.length > 0) {
      emailMessage += createResultHtml(resultSets[i]);
    }
  }

  // add html to mail options
  mailOptions.html = emailMessage;

  // email results. If email fails, do not add results to data file
  smtpTransport.sendMail(mailOptions, function(error, response) {
    if (error) {
      console.log('Message failed: ' + error);
    } else {
      console.log('Message sent: ' + response.message);
      updateDataFile(resultSets);
    }
    smtpTransport.close(); // shut down the connection pool, no more messages
  });
}


function updateDataFile(resultSets) {
  var datafile = fs.readFileSync(dataFilePath, 'utf8'),
    dataArr = (isEmpty(datafile) ? [] : JSON.parse(datafile));
    // add new results to datafile
  for (var i = 0; i < resultSets.length; i++) {
    var resultSetRows = resultSets[i].rows;
    for (var j = 0; j < resultSetRows.length; j++) {
      dataArr.push(resultSetRows[j]);
    }
    var jsonResults = JSON.stringify(dataArr);
    fs.writeFileSync(dataFilePath, jsonResults);
  }
}

// Searches for each query in data file and compiles results
function processResults() {
  console.log('Processing results...');

  var datafile = fs.readFileSync(dataFilePath, 'utf8'),
    dataArr = (isEmpty(datafile) ? [] : JSON.parse(datafile)),
    finalResults = [],
    mailIt = false;

  // 1. Loop through each queryResult object
  // 2. Loop through each interior results array
  // 3. If the result is already in the data file, remove it from the results
  // 4. If there are > 0 results left, shoot the email out

  // Loop through each queryResult
  for (var i = 0; i < queryResultSets.length; i++) {
    var match = false,
      result = {
        term: queryResultSets[i].term,
        location: queryResultSets[i].location,
        rows: []
      };

    finalResults.push(result);

    // Loop through each row in each query result
    for (var k = 0; k < queryResultSets[i].rows.length; k++) {

      // see if this record is in the data file
      for (var j = 0; j < dataArr.length; j++) {
        if (queryResultSets[i].rows[k].href === dataArr[j].href) {
          match = true;
          break;
        }
      }

      // if it hasn't been found in the data file, include it in the results and set mailIt to true
      if (!match) {
        mailIt = true;
        result.rows.push(queryResultSets[i].rows[k]); // no match so add to results
      }
    }
  }


  if (mailIt) {
    // console.log('Found ' + results.length + 'new results');
    emailResults(finalResults);
  } else {
    console.log('No new results');
  }
}



// Check search data file and create if it doesn't exist
// TODO: error handling
if (!isEmpty(process.env.XDG_DATA_HOME)) { // try XDG
  dataPath = process.env.XDG_DATA_HOME + '/' + dataDirName;
} else {
  if (!isEmpty(process.env.HOME)) {
    dataPath = process.env.HOME + '/.local/share/' + dataDirName;
  } else {
    console.error('No home directory specified. Exiting...');
    process.exit(1);
  }
}
dataFilePath = dataPath + '/' + dataFileName;
var exists = fs.existsSync(dataPath);
if (!exists) {
  console.log('No data folder! Creating one...');
  fs.mkdirSync(dataPath, 0700, true);
} else {
  console.log('Found data folder.');
}

// Check data file existence
exists = fs.existsSync(dataFilePath);
if (!exists) {
  console.log('No data file! Creating one...');
  fs.writeFileSync(dataFilePath, '');
} else {
  console.log('Found data file.');
}



// Run queries with craigslistscraper
async.each(config.searches, function(search, callback) {
  var baseUrl = 'http://' + search.location + '.craigslist.org',
    // default to not include nearby
    includeNearby = search.nearby || false,
    // default to for sale categories
    category = search.category || "sss",
    results = [];

  queryResultSets.push({
    term: search.term,
    location: search.location,
    rows: results
  });

  craigslistscraper.query(baseUrl, category, search.term, includeNearby, function(result) {
    // console.log(result);
    results.push(result);
  }, callback);

}, function(err) {
  if (!isEmpty(err)) {
    console.error('Error while querying:' + err);
  } else {
    console.log('Queries completed successfully.');
    processResults();
  }
});