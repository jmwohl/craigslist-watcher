var request = require("request");
var cheerio = require("cheerio");
var querystring = require("querystring");

exports.query = function(baseUrl, category, searchString, includeNearby, resultProcessor, callback) {
  var self = this;
  baseUrl = baseUrl.replace(/\/$/, '');
  searchUrl = baseUrl + '/search/' + category + '?' + querystring.stringify({
    query: searchString
  });

  request({
    uri: searchUrl
  }, function(error, response, body) {
    var $ = cheerio.load(body);

    // console.log(body);
    var count = 0;
    // console.log($('#toc_rows h4.nearby').text());
    $('#toc_rows p.row').each(function() {
      count += 1;
      var row = $(this);
      var date = row.find('span.date').first().text();
      var link = row.find('span.pl > a').first();
      var text = link.text();
      var href = link.attr('href');
      var price = row.find('span.price').first().text();
      var loc = row.find('span.pnr small').first().text();

      // check if href is relative
      // for now, let's not include "Nearby area" results
      // TODO: flag if nearby results should be included
      if (href.match(/^(\/|\.\.\/)/)) {
        href = baseUrl + href;
      } else if (!includeNearby) {ƒ
        return false;
      }

      // console.log({date: date, text: text, href: href, price: price, loc: loc});
      resultProcessor({
        date: date,
        text: text,
        href: href,
        price: price,
        loc: loc
      });

    });

    console.log("TOTAL RESULTS: ", count);
    
    if (callback) {
      callback();     
    }
  });
}