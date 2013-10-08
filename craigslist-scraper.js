var request = require("request");
var cheerio = require("cheerio");
var querystring = require("querystring");

exports.query = function(baseUrl, searchString, resultProcessor, callback) {
  var self = this;
  baseUrl = baseUrl.replace(/\/$/, '');
  searchUrl = baseUrl + '/search/sss?' + querystring.stringify({ query: searchString });

  request({
    uri: searchUrl
  }, function(error, response, body) {
    var $ = cheerio.load(body);

    $('#toc_rows p.row').each(function() {
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
      } else {
        return false;
      }
      resultProcessor({date: date, text: text, href: href, price: price, loc: loc});
    }); 
    callback();
//
//    $('#toc_rows p.row span.pl > a').each(function() {
//      var link = $(this);
//      var text = link.text();
//      var href = link.attr('href');
//
//      // check if href is relative
//      // for now, let's not include "Nearby area" results
//      // TODO: flag if nearby results should be included
//      if (href.match(/^(\/|\.\.\/)/)) {
//        href = baseUrl + href;
//      } else {
//        return false;
//      }
//      resultProcessor({text: text, href: href});
//    }); 
//    callback();
  });
}
