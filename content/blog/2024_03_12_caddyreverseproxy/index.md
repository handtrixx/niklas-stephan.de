+++
title = 'Caddy als Reverse Proxy für Docker Compose Container'
slug = 'caddy-docker'
image = '01_caddy.png'
date = 2024-03-12
lastmod = 2024-03-12
draft = false
tags = ['deutsch']
+++

Heute beschreibe ich was ein Reverse Proxy ist und warum er in deiner Docker Landschaft nicht fehlen darf.
Nachdem ich mehrere Jahre lang sowohl Traefik, 
als auch den Nginx Proxy Manager als Reverse Proxy für meine Docker Container 
genutzt habe, bin ich nun bei Caddy gelandet. Am Nginx Proxy Manager störte mich, 
dass zur Konfiguration ausschließlich die Web UI zur Verfügung steht. 
Das hat mich in Backup/Restore Szenarien öfter an die Grenzen gebracht, 
was zum Schluss dazu führte jedes Mal aufs neue eine Klickorgie zu veranstalten. 
An Traefik störte mich wiederum die aufgeblähte Konfiguration, 
sowie die vielen Labels die an jedem zu berücksichtigenden Container ergänzt 
werden müssen. Caddy bietet mit einer CLI und einer API, 
die gewünschte Flexibilität und lässt sich auch einfach sichern/wiederherstellen.

![Logo](02_caddy-open-graph.jpg)

## Warum ein Reverse Proxy für Docker Container?

Die Nutzung eines sogenannten Reverse Proxies für die eigene (Docker) Container 
Landschaft soll zum einen Flexibilität als zum anderen auch erhöhte 
Sicherheit bieten. Das (virtuelle) Netzwerk der Container wird in verschiedene 
Zonen aufgeteilt, so dass z.B. Datenbankinstanzen nicht direkt aus dem Internet 
erreichbar sind. Auch können so z.B. mehrere WordPress Installationen parallel betrieben werden, 
ohne dass sie sich irgendwie in die „Quere“ kommen. Beides wird in folgender Darstellung illustriert:

![Schema](01_caddy.png)

Außerdem soll der Zugriff auf die selbst gehosteten Webseiten auschließlich über das verschlüsselte 
HTTPS Protokoll funktionieren. Die dafür benötigten Zertifikate verwaltet und aktualisiert eine moderne Rerverse 
Proxy Lösung für uns voll automatisch. 

## Wie installiere und betreibe ich Caddy als Reverse Proxy?

Zunächst richten wir und ein dediziertes Netzwerk für Caddy und die Container die öffentlich erreichbar 
sein sollen unter einem gewünschten Namen (hier „Caddy“) mit folgendem Befehl ein: ```docker network create caddy``` . 
Diesen Namen siehst nur du in deinen Konfigurationsdateien und in Docker.

Caddy selbst stellen wir ebenfalls über einen Docker Container zur Verfügung, auf dem wir die Ports 80 und 443 exponieren. 
Eine mögliche Docker Compose Datei „compose.yml“ dazu kann so aussehen:

```yaml
services:
  caddy:
    container_name: caddy
    image: caddy:latest
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - ./site:/srv
      - ./caddy_data:/data
      - ./caddy_config:/config
    logging:
        options:
          max-size: "10m"
          max-file: "3"
    networks:
        - caddy
volumes:
  caddy_data:
  caddy_config:
networks:
    caddy:
        external: true
```

Bevor wir den Container starten, legen wir im gleichen Verzeichnis eine Datei „Caddyfile“ an. 
Diese musst du auf deine Bedürfnisse anpassen und orientiert sich hier am oben gezeigten Beispiel:

```js
{
    # TLS Options
    email deine.email@provider.com
}

(wordpress) {
    header {
        Cache-Control "public, max-age=3600, must-revalidate"
    }
}

quickscot.de, www.quickscot.de {
    import wordpress
    reverse_proxy wordpresscontainer1:80
}

niklas-stephan.de, www.niklas-stephan.de {
    import wordpress
    reverse_proxy wordpresscontainer3:80
}
```

Nun können wir den Container mit folgendem Befehl starten: ``` docker compose up -d ```.
Falls irgendetwas nicht funktioniert hilft eine Überprüfung der Logdatei mit: ```docker compose logs ```.

Bei Problemen hilft auch ein Blick in die Caddy Community, die viele Problembehandlungen und Konfigurationsbeispiele 
bereitstellt: https://caddy.community/.

Falls ihr Änderungen/Ergänzungen an dem Caddyfile vornehmt müsst ihr nicht jedes Mal den kompletten Container 
durchstarten und könnt so Dowtimes durch folgenden Befehl, der die Konfiguration live neu läd, aktualisieren:

```bash
docker compose exec -w /etc/caddy caddy caddy reload
```

Nun gilt es noch unsere Applikationen im Caddy Netzwerk sichtbar zu machen. 
Hier ein Beispiel einer WordPress Installation in der der Applikationsserver von Caddy aus erreicht werden kann, 
aber nicht der Datenbankserver:

```yaml
services:
    wordpresscontainer1:
        container_name: wordpresscontainer1
        depends_on:
            - wordpresscontainer1-db
        image: wordpress:latest
        logging:
            options:
              max-size: "10m"
              max-file: "3"
        volumes:
            - ./data:/var/www/html
            - /etc/localtime:/etc/localtime:ro
        restart: unless-stopped
        environment:
            WORDPRESS_DB_HOST: wordpresscontainer1-db:3306
            WORDPRESS_DB_USER: EUERUSER
            WORDPRESS_DB_PASSWORD: EUERSUPERPASSWORT  
        networks:
            - default
            - caddy
    wordpresscontainer1-db:
        container_name: wordpresscontainer1-db
        image: mysql:5.7
        logging:
            options:
              max-size: "10m"
              max-file: "3"
        volumes:
            - ./db:/var/lib/mysql
        restart: unless-stopped
        environment:
            MYSQL_ROOT_PASSWORD: ROOTSUPERPASSWORT
            MYSQL_DATABASE: wordpress
            MYSQL_USER: EUERUSER
            MYSQL_PASSWORD: EUERSUPERPASSWORT
        networks:
            - default
volumes:
    data:
    db:
networks:
    caddy:
        external: true
```
 ## Fazit

 Bis jetzt ist Caddy genau der Kompromiss nach dem ich suchte. 
 Die Konfiguration über eine einzelne Datei lässt sich super einfach sichern und bei Bedarf wiederherstellen. 
 Bei Wunsch nach mehr, stellt Caddy alternativ auch die Konfiguration über eine API als Option bereit. 
 Ein Blick in die technische Dokumentation unter https://caddyserver.com/docs/ offenbart, 
 dass Caddy auch noch viel mehr kann als das gezeigte. Noch nicht herausgefunden habe ich, 
 ob ich ähnlich wie bei Traefik auch zusätzliche Module/Plugins wie Crowdsec, für eine erweiterte Sicherheit 
 aktivieren kann. Generell würde ich nie wieder zurück zum Nginx Proxy Manager wechseln, 
 halte aber Traefik bei komplizierteren Szenarien, evtl. für die bessere Wahl. 
 Für den Hobby Fullstack Entwickler wie mich, ist Caddy aber erstmal eine beinah rundum glücklich Lösung.

 ## Update 12.03.2025

 Ich nutze immernoch Caddy und bin nach wie vor absolut damit zufrieden. Ein wechsel z.B. zu Traefik ist auch nach 
 vielen Monaten nicht nötig.