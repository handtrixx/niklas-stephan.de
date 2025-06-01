#!/bin/bash

hugo --environment production --destination /hugo/build --baseURL $URL --cleanDestinationDir --minify

# Check if /hugo/dist exists and is a git repository
if [ ! -d "/hugo/dist" ] || [ ! -d "/hugo/dist/.git" ]; then
    echo "Initializing dist folder from repository..."
    cd /hugo/dist
    git clone $REPO .
else
    cd /hugo/dist
    
    # Fetch latest changes from remote without merging
    git fetch origin
    
    # Check for changes specifically in the dist folder (current directory)
    CHANGES=$(git diff HEAD origin/main --name-only . | wc -l)
    
    if [ "$CHANGES" -gt 0 ]; then
        echo "Changes detected in dist folder, pulling updates..."
        git pull
    else
        echo "No changes in dist folder, skipping pull."
    fi
fi