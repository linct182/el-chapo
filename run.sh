#!/bin/bash
pm2 restart 0 > /dev/null;
RUNLEVEL=$?;
if [ $RUNLEVEL = 0 ]; then
    exit 0;
fi
pm2 start ./app.js;
exit 0;