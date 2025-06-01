#!/bin/bash
 hugo --environment production --destination /hugo/build --baseURL $URL --cleanDestinationDir --minify

#Check for updates in 