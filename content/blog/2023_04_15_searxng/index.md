+++
title = 'Deine eigene Suchmaschine mit SearXNG'
slug = 'searxng'
image = '01_searx.png'
date = 2023-04-15
lastmod = 2023-04-15
draft = false
tags = ['deutsch']
+++

Wir alle wissen um die Macht des Konzerns Alphabet, der hinter der Google Suchmaschine steht: 
Wir suchen eine bestimmte Information im Internet und ein 
Algorithmus entscheidet intransparent für uns, 
welche Ergebnisse uns präsentiert werden. Natürlich könnte man auf eine andere 
Suchmaschine ausweichen, aber Google ist doch so schön bequem…

In diesem Artikel beschreibe ich, wie man sich mit SearXNG selbst eine 
(Meta-)Suchmaschine aufsetzen kann um dem Dilemma zumindest ein Stück weit zu entkommen.

## Suchmaschine, Suchindex, Meta-Suchmaschine

Das Herzstück einer jeden Suchmaschine ist ein Index, hier ein Verzeichnis aller 
bekannten Webseiten im Internet. Wie sich jeder vorstellen kann, ist der Aufbau eines 
Index für das Internet kein Leichtes unterfangen und die resultierende Datenbank 
gigantisch groß. Ebenso muss so ein Index ständig aktualisiert werden, 
damit es nicht zu toten Links in den Suchergebnissen kommt.

Der Betreiber einer echte Suchmaschine muss also einen eigenen Index aufbauen und 
diese dazu gehörigen Aufwände stemmen. Deshalb gibt es weit weniger echte Suchmaschinen 
mit eigenen Index, als man vielleicht denkt. Ein Blick auf den <a href="https://en.wikipedia.org/wiki/List_of_search_engines" target="_blank">entsprechenden Beitrag in 
Wikipedia</a> offenbart uns, dass weltweit nur um die 10 Betreiber eines öffentlich Index gibt. 
Reduziert auf die für uns relevanten bleiben Alphabets Google, 
Microsofts Bing und 1-2 Exoten.

Alleine einen eigenen Suchindex aufzubauen ist allerdings auch utopisch, 
weshalb jetzt Meta-Suchmaschinen ins Spiel kommen. Eine Meta-Suchmaschine 
nimmt unseren Suchbegriff, holt sich die Ergebnisse bei verschiedenen 
Suchmaschinenbetreibern ab und stellt uns die Ergebnisse übersichtlich dar.

## SearXNG

![searxng interface](02_searxngsearch.png)

<href="https://docs.searxng.org/" target="_blank">SearXNG</a> ist eine Open Source Projekt das uns eine Meta-Suchmaschine für den 
eigenen Betrieb oder in öffentlich gehosteten Implementierungen zur Verfügung stellt. 
Dadurch entsteht eben nicht nur der Vorteil der weniger limitierten Suchergebnisse, 
sondern zusätzlich auch ein zusätzlich grad an Anonymisierung. D.h. 
Google oder Microsoft können die Suchabfragen weder direkt eurem Benutzer 
als auch nicht eurer IP-Adresse zuordnen. Dieser Effekt wird umso größer, 
desto mehr Menschen die jeweilige SearXNG Instanz nutzen. 
Bei SearXNG handelt es sich um einen sogenannten Fork (Abspaltung/Vergabelung) 
von SearX, der aktiv gewartet und in vielen Punkten verbessert wurde.

## SearXNG in einer Docker Compose Umgebung betreiben

Jetzt wollen wir nicht länger warten und SearXNG auf unserem eigenen Server starten. 
Wir gehen davon aus, dass wir Docker und einen 
Reverse Proxy bereits installiert haben. Falls das bei euch nicht der 
Fall ist schaut euch zunächst die entsprechenden Anleitung an. 
Eine einfache Docker Compose Defintion in der "docker-compose.yml" 
kann dann wie folgt aussehen:

```yaml
services:
  search-redis:
    container_name: search-redis
    image: "redis:alpine"
    command: redis-server --save "" --appendonly "no"
    networks:
      - default
    tmpfs:
      - /var/lib/redis
    cap_drop:
      - ALL
    cap_add:
      - SETGID
      - SETUID
      - DAC_OVERRIDE
  search-searxng:
    container_name: search-searxng
    image: searxng/searxng:latest
    networks:
      - default
      - proxy
    volumes:
      - ./searxng:/etc/searxng:rw
    environment:
      - SEARXNG_BASE_URL=https://${SEARXNG_HOSTNAME:-search.handtrixxx.com}/
    restart: unless-stopped
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETGID
      - SETUID
      - DAC_OVERRIDE
    logging:
      options:
        max-size: "1m"
        max-file: "1"
networks:
    proxy:
        external: true
```

Nach dem hochfahren erhalten wir also 2 Contianer, 
einen Redis Cache und den Applikationsserver von SearXNG. 
Entgegen der <a href="https://github.com/searxng/searxng-docker/blob/master/docker-compose.yaml" target="_blank">offiziellen Beispieldokumentation</a> haben wir hier auf einen 
zusätzlichen Caddy Reverse Proxy verzichtet und auch keine Ports exponiert. 
Dafür liegt der Applikationscontainer zusätzlich im gleichen Netz (Proxy) 
wie unser generischer Reverse Proxy.

## Fazit

Wie aus der Konfiguration hervorgehen haben wir jetzt eine laufende Installation, 
welche über https://search.handtrixxx.com aus dem Internet erreichbar ist. 
Anschließend habe ich noch die Standardsuchengine in meinen lokalen 
Browsern so umgestellt, dass immer meine eigene Engine verwendet wird. 
Leider erlaubt Apple dies auf dem iPhone/iPad nicht. Gerne könnt ihr aber 
ebenfalls meine Instanz verwenden und so zur weiteren Anonymisierung 
beitragen oder euch eben selbst an einer Installation probieren.
