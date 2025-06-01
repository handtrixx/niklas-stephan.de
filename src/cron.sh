#!/bin/bash
hugo --environment production --destination /hugo/dist --baseURL $URL --cleanDestinationDir --minify
