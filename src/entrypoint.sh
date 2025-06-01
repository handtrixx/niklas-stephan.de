#!/bin/bash
if [ -n "$ENVIRONMENT" ]; then
    echo "Environment variable is set to: $ENVIRONMENT"
else
    echo "Environment variable is not set"
    $ENVIRONMENT=production
    echo "Environment variable is now set to: $ENVIRONMENT"
fi
if [ -n "$URL" ]; then
    echo "URL variable is set to: $URL"
else
    echo "URL variable is not set"
    $URL=https://niklas-stephan.de
    echo "URL variable is now set to: $URL"
fi
#cleanup dist folder
if [ "$ENVIRONMENT" = "production" ]; then
    rm -rf /hugo/dist/*
    hugo --environment production --destination /hugo/dist --baseURL $URL --minify
    
else 
    hugo server --environment development --bind 0.0.0.0 --baseURL http://localhost
fi
tail -f /dev/null


