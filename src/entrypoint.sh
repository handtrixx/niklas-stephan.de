#!/bin/bash
ENVIRONMENT=${ENVIRONMENT:-production}
echo "Running in environment: $ENVIRONMENT"

URL=${URL:-"https://niklas-stephan.de"}
echo "Using URL: $URL"

#cleanup dist folder
if [ "$ENVIRONMENT" = "production" ]; then
    rm -rf /hugo/dist/*
    hugo --environment production --destination /hugo/dist --baseURL $URL --minify
    
else 
    hugo server --environment development --bind 0.0.0.0 --baseURL http://localhost
fi
tail -f /dev/null


