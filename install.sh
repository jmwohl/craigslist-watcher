#!/bin/bash
#
# Install script for craigslist-watcher
# Needs to be run with root access

npm update
if [[ $? -ne 0 ]] ; then
  echo "npm encountered an error. craigslist-watcher failed to install."
  exit 1
fi
mkdir -p /usr/local/craigslist-watcher
cp -r * /usr/local/craigslist-watcher
if [[ -e '/usr/local/bin/craigslist-watcher' ]] ; then
  rm /usr/local/bin/craigslist-watcher
fi
ln -s /usr/local/craigslist-watcher/craigslist-watcher.sh /usr/local/bin/craigslist-watcher
echo "craigslist-watcher installed successfully"
