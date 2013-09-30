craigslist-watcher
==================

    Usage: craigslist-watcher CITY_SUBDOMAIN SENDER_EMAIL SENDER_PASS NOTIFY_EMAIL SEARCH_STRINGS...

A way to keep track of new Craigslist postings without ever having to check Craigslist manually.

This tool is a simple node.js script you can run from the terminal to keep track of new Craigslist posting based off of a list of search terms. When a new posting is found, an email is sent to a chosen recipient. This gives Craigslist buyers the advantage of finding out about good deals sooner than other buyers without having to refresh search pages constantly.

### WARNING ###

I am not responsible for any harm occured while using this code. There may be legal consequences of using it in an improper way.

### How I use it (for maximum effectivness) ###

craigslist-watcher is not a daemon, so you must use some kind of scheduling tool to run it every once in a while. I use cron to run craigslist-watcher every 5 minutes.
