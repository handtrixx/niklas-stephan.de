+++
title = 'Visual Studio Code im Webinterface mit Docker und Caddy'
slug = 'vscode-web'
image = '01_vscode.png'
date = 2024-05-12
lastmod = 2024-05-12
draft = false
tags = ['deutsch']
+++

Microsofts <a href="https://code.visualstudio.com/" target="_blank">Visual Studio Code</a> hat sich über die letzten Jahre als Quasi-Standard, 
nicht nur für das editieren von Quellcode in allen möglichen (Programmier-)Sprachen, 
sondern auch für eine Vielzahl weiterer Operationen etabliert.

Einer der Kritikpunkte bleibt die durch den Editor verursachte realtiv hohe Systemlast, 
die zwar begründet ist aber für einen „Texteditor“ doch etwas merkwüdig erschenint. 
Ein anderer Kritikpunkt ist, dass für das beliebte „Remote SSH“ Plugin, 
welches es ermöglicht auf einen beliebigen über SSH erreichbaren Server mit VS Code zu arbeiten, 
ziemlich viele dynamische Ports geöffnet werden und auch generell einige Firewalls hier Probleme machen können.

Nun <a href="https://en.wikipedia.org/wiki/Visual_Studio_Code">basiert VS Code selbst auf dem Electron Framework</a>, welches wiederum auf JavaScript aufbaut. 
Warum also nicht die VS Code Installation auf einem Server hosten und per Webinterface zur Verfügung stellen? 
Das haben sich offensichtlich viele gefragt und deshalb ist dies mit Hilfe von Docker und Caddy schnell bewerkstelligt.

## Installation

Zur Installation verlassen wir uns wieder auf Docker Compose für die Verwaltung unserer Containers und Caddy als Reverse Proxy. 
Ein passendes und regelmäßig aktualisiertes VS Code Image finden wir von Linuxserver.io auf <a href="https://hub.docker.com/r/linuxserver/code-server" target="_blank">Docker Hub</a>.

Unsere „compose.yml“ Datai kann dann so aussehen:
```yaml
---
version: "2.1"
services:
  code-server:
    image: lscr.io/linuxserver/code-server:latest
    container_name: code-server
    environment:
      - PUID=1001
      - PGID=1001
      - TZ=Etc/UTC
      - PASSWORD=PASSWORT
      #- HASHED_PASSWORD=#optional
      #- SUDO_PASSWORD=#optional
      #- SUDO_PASSWORD_HASH=#optional
      #- PROXY_DOMAIN=#optional
      - DEFAULT_WORKSPACE=ORDNERCONTAINER #optional
    volumes:
      - ./config:/config
      - /ORDNERHOST:/ORDNDERCONTAINER
    restart: unless-stopped
    logging:
      options:
        max-size: "10m"
        max-file: "3"
    networks:
        - caddy
volumes:
    data:
    db:
networks:
    caddy:
        external: true
```

Die wichtigsten Parameter hier kurz erläutert:
- environment – PUID: Die Prozess ID die möglichst der ID eures Benutzers entsprechen sollte, damit ihr später Berechtigungsproblemen beim editieren von Dateien aus dem Wege gehen könnt. Eure eigene ID bekommt ihr einfach über die Linux Kommandozeile mit dem Befehl „id“ heraus.
- environment – PGID: Das Gleiche wie für die PUID, nur das hier die Gruppen ID gemeint ist.
- environment – PASSWORD: Das Passwort was abgefragt wird, wenn man die URL des containers aufruft. Da nichtmal ein User gesetzt wird, ist das nicht besonders sicher und es sollte eine zusätzliche Sicherheitsstufe z.B. über den Reverse Proxy geschaffen werden. Siehe Kapitel „Härtung“.
- environment – SUDO_PASSWORD: Hier lässt sich das sudo password für den Container setzen. Nach möglichkeit sollte dies vermieden werden, da man in einem Container nach Security Best Practices nie als root arbeiten sollte.
- environment – HASHED_PASSWORD und SUDO_PASSWORD_HASH: Beide Parameter sollen dabei helfen, dass keine Passwörter im Klartext in der „docker-compose.yml“ abgelegt werden müssen. Wie man solch einen Hash Wert generiert ist auf der Projektseite erläutert, hat aber zumindest für mich so nicht funktioniert. Auch deshalb ist eine zusätzliche „Härtung“ wie nachfolgend beschrieben erforderlich.
- environment – DEFAULT_WORSPACE: Hier geben wir den Pfad auf dem Container an, der nachfolgend unter Volumes spezifiert ist. Diesen sehen wir dann als Workspace/Ordner in VS Code.
- volumes – /ORDNERHOST:/ORDNDERCONTAINER: Wenn gewünscht können wir hier einen Pfad auf unserem Host(Server) spezifizieren der in VS Code auftaucht. Die Variable ORDNERCONTAINER ersetzen wir wiederum durch den Wert den wir als „DEFAULT_WORKSPACE“ angegeben haben.

Nun können wir den Container mit „docker compose up -d“ starten.

## Härtung und Reverse Proxy Konfiguration

In unserem Caddyfile unseres Rerverse Proxy ergänzen wir einen Block für die neue VS Code Instanz. Das kann so aussehen:
```js
code.handtrixxx.com {
    basicauth {
        USER HASHWERT
    }
    reverse_proxy code-server:8443
}
```

Man beachte die Werte in den geschweiften Klammern hinter „basicauth“. 
Diese bringen zusätzlichem Schutz vor möglichen Angreifern, in dem sie ein weitere Anmeldung bereitstellen, 
sobald jemand die URL öffnet. Als USER könnten ihr einen Namen euerer Wahl festlegen während man für die 
Generierung des Hashwerts auf der Kommandoziele in den Docker Compose Ordener von Caddy wechselt 
und dort folgendes Kommando ausführt: ```docker compose exec -w /etc/caddy caddy caddy hash-password``` 

Den aus der Abfrage resultierenden Wert kopiert ihr einfach in das Caddyfile als HASHWERT.

Nachdem wir die Konfiguration von Caddy neu geladen haben, ist VS Code unter der angegebenen URL 
erreichbar und die eine zusätzliche Sicherheitsschicht aktiviert.
