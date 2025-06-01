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
if [ "$ENVIRONMENT" = "production" ]; then
    cd /hugo
    hugo --environment production --destination /hugo/dist --cleanDestinationDir --baseURL $URL --minify
fi
