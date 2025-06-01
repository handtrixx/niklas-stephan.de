+++
title = 'Web Analytics selbstgemacht mit Matomo'
slug = 'matomo'
image = 'matomo.webp'
date = 2024-08-05
lastmod = 2024-08-05
draft = false
tags = ['deutsch']
+++

Jeder, der sich mit Internetauftritten beschäftigt, hat sicherlich schon von Google Analytics (https://de.wikipedia.org/wiki/Google_Analytics) gehört. Damit kann man u.a. sehen von wo, unter welchen technischen Bedingungen, wann auf welche Seiten eben dieser zugegriffen wird. Matomo (https://matomo.org/) steht nicht für ein Mozarella-Sandwich mit Mayonaise und Tomaten, sondern ist ein Open Source Tool mit dem sich gleiches und teilweise sogar mehr erreichen lässt. In diesem Artikel gehe ich auf die Vorteile bei der Nutzung von Matomo ein und liefere auch gleich ein Beispiel, wie es sich schnell nutzen lässt.

## Datenkrake – aber besucherfreundlich

Der wesentliche Vorteil bei der Nutzung von Matomo besteht darin, dass man es selbst betreiben (https://hub.docker.com/_/matomo) kann, und man so die volle Kontrolle darüber hat welche Daten vom Besucher wo gespeichert werden. Ich selbst nutze das Tool nun schon seit vielen Jahren und habe nur positives darüber zu berichten. Es lässt sich ganz Datenschutzkonform (https://www.it-recht-kanzlei.de/matomo-richtig-verwenden-dsgvo.html) und trotzdem granular einstellen, welche Informationen gespeichert werden. Für aussagekräftige Analysen braucht man z.B. nicht die komplette IP-Addresse des Besuchers zu speichern, um nur eine der vielen Optionen zu nennen. Auch setzen Tools wie Google Analytics stark auf den Einsatz von digitalen Fingerabdrücken (Cookies), dazu gleich mehr. Aber so viel vorab: mit Matomo lässt sich der Einsatz von Cookies auf Wunsch sogar komplett deaktivieren!

## Wie installiere und benutze ich den Matomo?

1. Die Matomo Cloud – so verdient der Anbieter von Matomo, neben zusätzlichen erwerbsfähigen Plugins, sein Geld. Analog zu Google Analytics, vertraue ich die Daten meiner Benutzer einem Drittanbieter an. Irgendwie ja das, was wir genau nicht wollen.

2. Integriert als Plugin in ein Web Content Management System (WCMS) – Für WordPress und andere gibt es eine komplette Installation von Matomo als Plugin, welches sich über den jeweilig verfügbaren Markplatz hinzufügen lässt. Hier haben wir keine Möglichkeit der Trennung von Webseiten-Content und Analytics. Das ist deshalb auch nicht besonders performant und nur für kleinere Installationen geeignet. Außerdem geht das natürlich nur, wenn man eines der unterstützten WCMS einsetzt.

3. Selbst Hosten – Das ist was ich hier beschreibe und mittels einem von Matomo selbst vorgefertigtem Container (https://hub.docker.com/_/matomo) auch ganz einfach geht.

Eine “saubere” Möglichkeit Matomo zu installieren ist also über Docker Compose Container. Im Appendix habe ich eine entsprechende Beispieldatei angehangen. Was ich hier abermals unterschlage ist die Konfiguration des Reverse-Proxies samt seiner Konfiguration. Wir gehen einfach davon aus, dass ich für meine Subdomain stats.handtrixxx.com mit dem Nginx Reverse Proxy Manager die benötigten Einstellungen vorgenommen habe und auch von dort aus ein entsprechendes Zertifikat von Let’s Encrypt bekommen habe.

Nachdem das alles eingestellt und hochgefahren ist (Dauer ca. 20 Minuten), können wir uns and der Weboberfläche von Matomo für die initiale Konfiguration anmelden. Wie das funktioniert, ist ausführlich und gut hier https://matomo.org/docs/installation/ beschrieben. Dank Docker Container können wir den ersten Teil der Anleitung komplett überspringen und setzten ungefähr an der Stelle “Super User” an.

## Wie binde ich Matomo nun in meine Web-Seite/App ein?

Wie, wenn wir auf https://matomo.org/docs/installation/ ein bisschen gescrollt haben, an gleicher Stelle beschrieben lässt sich nun der Einsatz auf einer ersten Website durchführen. Damit wird auch deutlich, dass mit einer einzelnen Matomo Installationen auch mehrere Websites/Apps getrennt voneinander oder zusammen anbindbar sind.

Zur Einbindung in eine Website lässt sich, wie im Standard vorgeschlagen, entweder ein JavaScript Snippet verwenden oder aber ein “unsichtbares” Bild über den sogenannten Image Tracker einfügen. Auf diese Art lässt sich nun auch einstellen, dass KEIN Cookie beim Anwender zum Tracking genutzt werden soll. Prima!

## Wartung

Abschließend ein paar Tipps zur Wartung unserer Installation. Wie ihr, falls ihr selbst eine Installation vorgenommen habt, evtl. schon gesehen habt wird die Verfügbarkeit eines Updates von Matomo direkt in der Web-GUI angezeigt und kann auch von dort aus durchgeführt werden.

Um die Container selbst auch aktuell zu halten, reicht das gelegentliche und auch automatisierbare Ausführen von docker-compose pull , mit anschließendem docker-compose up -d aus dem Stammverzeichnis eurer Docker Compose Umgebung heraus.

Das ist einfach.

## Fazit

Definitiv hat das Schreiben dieses Artikels länger gedauert als eine Matomo Installation. Außerdem konnte ich hoffentlich verdeutlichen, dass es im Vergleich zu anderen Web-Analytic Tools mit Matomo keine wesentlichen Einschränkungen, aber jede Menge Vorteile gibt. Ein kleiner Wermutstropfen ist vielleicht, dass sich die Art der Reports in der Web-GUI nicht besonders “verbiegen” lässt. Wahrscheinlich wäre das aber auch nur für größere Unternehmen überhaupt wünschenswert. Außerdem gibt es dafür, vielleicht als abschließender Lichtblick, eine großartige API die es uns erlaubt die über Matomo erfassten Daten in einer Applikation unserer Wahl zu verwenden! Siehe: https://developer.matomo.org/api-reference/reporting-api. Eigentlich war der Artikel nur als “kurze” Ergänzung zu einem Vorherigen (Mehr als nur Performance King – Headless CMS, APIs und IoT für die Website) gedacht, bei dem es u.a. um das Aufsetzen einer Website mit einem Headless CMS ging. Es ist aber nun doch “etwas” länger geworden. Ich bitte die vielen Fachbegriffe zu entschuldigen. Aufgrund des heterogenen Zielpublikums ist die Wortwahl nicht immer ganz einfach.

## Appendix

Hier ein Beispiel einer compose.yml zur einfachen Inbetriebnahme von Matomo.

```yaml
services:
    stats-db:
        image: mysql:5.7
        logging:
            options:
              max-size: "10m"
              max-file: "3"
        container_name: stats-db
        command: --max-allowed-packet=64MB
        restart: always
        networks: 
            - dmz
        environment:
            MYSQL_ROOT_PASSWORD: ADMINPASSWORD
            MYSQL_DATABASE: DBNAME
            MYSQL_USER: DBUSER
            MYSQL_PASSWORD: DBUSERPW
        volumes:
            - ./db_data:/var/lib/mysql
    stats-app:
        depends_on:
            - stats-db
        image: matomo:latest
        logging:
            options:
              max-size: "10m"
              max-file: "3"
        restart: always
        networks: 
            - dmz
        environment:
            MATOMO_DATABASE_HOST: stats-db
            MATOMO_DATABASE_ADAPTER: mysql
            MATOMO_DATABASE_TABLES_PREFIX: matomo_
            MATOMO_DATABASE_USERNAME: DBUSER
            MATOMO_DATABASE_PASSWORD: DBUSERPW
            MATOMO_DATABASE_DBNAME: DBNAME
        volumes:
            - ./data:/var/www/html
volumes:
    db_data: {}
networks:
    dmz
        external: true
```

