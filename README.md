craigslist-watcher
==================
 
```
Usage: craigslist-watcher CITY_SUBDOMAIN SENDER_EMAIL SENDER_PASS NOTIFY_EMAIL SEARCH_STRINGS...
```

A way to keep track of new Craigslist postings without ever having to check Craigslist manually.  
This tool is a simple node.js script you can run from the terminal to keep track of new Craigslist posting based off of a list of search terms. When a new posting is found, an email is sent to a chosen recipient. This gives Craigslist buyers the advantage of finding out about good deals sooner than other buyers without having to refresh search pages constantly.

### WARNING

I am not responsible for any harm occured while using this code. There may be legal consequences of using it in an improper way.

### Some current limitations

I'm not entirely sure if the SENDER_EMAIL field will work with email addresses not using gmail. If someone could let me know what works or doesn't work for them that would be appreciated.

### Installation

You can run:

```
npm install -g craigslist-watcher
```

or you can clone this git repo and run the install.sh script with root privileges to place the installation in /usr/local and a symlink in /usr/local/bin.

### How I use it (for maximum effectivness)

craigslist-watcher is not a daemon, so you must use some kind of scheduling tool to run it every once in a while. I use cron to run craigslist-watcher every 5 minutes.  
One annoying thing about cron is that it doesn't always keep your environment so you will likely have to place the following line before the command:

```export PATH=$PATH:/usr/local/bin;```

so that the path to the craigslist-watcher binary is available to cron.

Here's an example crontab setup. First, run ```crontab -e``` and you'll add a line like this:

```
*/5 * * * * /usr/local/bin/craigslist-watcher export PATH=$PATH:/usr/local/bin; tulsa example@example.com password123 notifyaddress@example.com "ford f-150" "inspiron" "condenser microphone" "yamaha keyboard"
```

### Bugs and Features

Please report any bugs or any requested features here:  
https://github.com/thehodapp/craigslist-watcher/issues
