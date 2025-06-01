# niklas-stephan.de
![Logo](/theme/static/images/hero.webp)

Sources for the niklas-stephan.de website project. Feel free to copy or fork it to adopt it for your needs.

## Project Overview

### content

Sub Directory conatining the markup files with the blog posts

### dist

Directory containing the generated static files for deployment.

### src

Directory containing the source files for building the docker container

### theme

Hugo theme for niklas-stephan.de

## Usage

### Development

1. Clone the repository to your local machine
2. Edit the compose.yml and the hugo.toml according to your needs
3. Build and start the container with docker compose
4. Open your browser and navigate to http://localhost:1313

### Production

1. Clone the repository to your server
2. Edit the compose.yml and the hugo.toml according to your needs
3. Build and start the container with docker compose
4. Set your reverse proxy configuration to folder dist of your repsoitory
5. Open your browser and navigate to your public URL
