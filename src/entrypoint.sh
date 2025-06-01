#!/bin/bash
#cleanup dist folder
rm -rf /hugo/dist/*
hugo server --environment development --bind 0.0.0.0 --baseURL http://localhost
tail -f /dev/null