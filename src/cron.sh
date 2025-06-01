#!/bin/bash

ENVIRONMENT=${ENVIRONMENT:-production}
echo "Running in environment: $ENVIRONMENT"

URL=${URL:-"https://niklas-stephan.de"}
echo "Using URL: $URL"

if [ "$ENVIRONMENT" = "production" ]; then
    cd /hugo
    hugo --environment production --destination /hugo/dist --cleanDestinationDir --baseURL $URL --minify
fi
