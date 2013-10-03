#!/bin/bash
#
# Convenience script
cd $(dirname $(readlink -f $0))
node craigslist-watcher.js "$@"
