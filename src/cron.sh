#!/bin/bash
cd /hugo
hugo --environment production --destination /hugo/dist --baseURL $URL --minify
