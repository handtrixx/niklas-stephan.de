# niklas-stephan.de

Code Repository for the website of Niklas Stephan.

## Quickstart

Create a new folder on your docker host and create a .env file with the following content:
```bash
### General ###
TIMEZONE=Europe/Berlin
### Hugo ###
HUGO_BASEURL=http://localhost
### Outline ###
OUTLINE_API_URL=
OUTLINE_API_TOKEN=
OUTLINE_BLOG_COLLECTION_ID=
OUTLINE_WIKI_COLLECTION_ID=
OUTLINE_WEBHOOK_SUBSCRIPTION_ID=
```

and a compose.yml with following content:
```yaml
services:
  niklas-stephan.de:
    image: handtrixx/niklas-stephan.de:latest
    env_file:
      - .env
```

then you can start the container with:
```bash
docker compose up -d
```
Which will expose the static pages on port 80.

## Technology
- Linux
- Docker
- Hugo
- Outline
- Bash
- HTML5
- Go

## Build your own image

### Prerequisites
To be able to build for arm64 on amd64 you need to install QEMU emulators:

```
docker run --privileged --rm tonistiigi/binfmt --install all
docker buildx ls
```

### Build
then you can build the image with:
```
docker compose build
```

It will not contain any secrets or environment variables, since they are loaded from the .env file on container startup and used afterwards only.

## Development

### Code on GitHub
```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/handtrixx/niklas-stephan.de.git
git push -u origin main
```

### Docker Image on GitHub

Login if not done already:
```bash
docker logout ghcr.io
```
```bash
echo "YOUR_NEW_TOKEN" | docker login ghcr.io -u YOUR_USER --password-stdin
```
Tage the image if not done already
```bash
docker tag ghcr.io/handtrixx/niklas-stephan.de:latest ghcr.io/handtrixx/niklas-stephan.de:latest
```
Push the image:
```bash
docker compose build --push
```

## Outline

### Get a collections UUID

```bash
curl -X POST "$OUTLINE_API_URL/collections.info" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OUTLINE_API_TOKEN" \
    --data-binary "{\"id\":\"blog-w799qAJN55\"}"
```

### Get documents of a collection

```bash
curl -X POST "$OUTLINE_API_URL/documents.list" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OUTLINE_API_TOKEN" \
    --data-binary "{\"limit\": 100, \"collectionId\": \"$OUTLINE_BLOG_COLLECTION_ID\"}"
```

### Get Webhook Subscription ID

It seems the self hosted version of Outline does not provide a way to list webhook subscriptions via the API. So we need to query the database directly.

```bash
docker exec -it outline-postgres psql -U outuser -d outland -c "SELECT id, name, url FROM webhook_subscriptions;"
```

### Test Webhook Listener

With curl:
```bash
curl -i -X POST "http://localhost/api/v1/listener/webhook" \
  -H "Content-Type: application/json" \
  --data '{"webhookSubscriptionId":"YOUR_OUTLINE_WEBHOOK_SUBSCRIPTION_ID"}'
```
or with wget:
```bash
wget -S -O- --post-data='{"webhookSubscriptionId":"YOUR_OUTLINE_WEBHOOK_SUBSCRIPTION_ID"}' \
  --header="Content-Type: application/json" \
  "http://localhost/api/v1/listener/webhook"

```

## Scripts

### fetch.sh
To fetch the structure of a given Collection execute
```bash
./fetch.sh --name blog --collection-id "$OUTLINE_BLOG_COLLECTION_ID"
./fetch.sh --name wiki --collection-id "$OUTLINE_WIKI_COLLECTION_ID"
```
