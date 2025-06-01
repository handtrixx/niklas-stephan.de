+++
title = 'Redis Objekt- und Caddy Seitencache für WordPress unter Docker einrichten'
slug = 'wordpress-caches'
image = '01_good.png'
date = 2023-07-18
lastmod = 2023-07-18
draft = false
tags = ['deutsch']
+++

WordPress ist nicht gerade berühmt dafür, besonders schnell zu sein. 
Es bemühen sich daraus reultierend unzählige Plugins auf dem WordPress Marktplatz, 
mit dem versprechen daran etwas zu ändern, darum die Gunst des Administrators zu gewinnen. 
Oft, vielleicht sogar meistens, können diese Plugins ihr versprechen nicht halten oder reißen 
sogar neue Sicherheitslücken im System auf. Vom nichts tun wird die Leistung aber auch nicht besser, 
weshalb dieser Artikel beschreibt wie man die Performance durch einen Seitencache und einen Objektcache 
steigern kann, ohne die Sicherheit des Systems aufs Spiel zu setzen.

![Wartung](02_details.png)

## Wofür sind die Caches da?

Ein Seitencache sagt dem Client (Browser) des Besuchers einer Seite, dass er beim erneuten Besuch oder 
mehrmaligen Aufruf gleicher Dateien, diese nicht jedes Mal wieder neu vom Server laden zu braucht, 
sondern die Versionen im seinem lokalen Cache (Speicher) nutzen kann. Dadurch wird die Ladezeit der 
Seite nicht nur stark beschleunigt, sondern auch der Server auf dem die Website liegt entlastet. 
Der Seitencache sollte andereseits aber auch nur eine bestimmte Zeit lokal vorgehalten werden, 
damit Änderungen an der Seite selbst bzw. deren Inhalten auch beim Besucher ankommen. 
Dies lässt sich über eine direktive in allen gängigen Webserver Systemen einstellen.

Der Objektcahce wiederum agiert auf dem Server selbst und läd häufig benutzte Elemente einer Website 
in seinen Arbeitsspeicher. In modernen Varianten passiert das über eine sogenannte In-Memory 
Datenbank, also einer Datenbank die eben ihre Inhalte im Arbeitspeicher ablegt. 
Das hat neben der gesteigerten Performance den positiven Nebeneffekt, dass weniger von der 
Festplatte/SSD geladen werden muss und die Hardware so geschont wird.

## Seiten Cache in Caddy Reverse Proxy aktivieren

Um den Seiten Cache für unsere WordPress Installationen zu aktivieren fügen wir oben unter 
den globalen Definitionen in unserem Caddyfile folgende Regel hinzu:

```js
(wordpress) {
    header {
        Cache-Control "public, max-age=36000, must-revalidate"
    }
}
```

Nun importieren wir diese Regel in allen unseren WordPress Defintionen darunter, z.B. so:

```js
domain.de {
    import wordpress
    reverse_proxy container:80
}
```

Das war es schon. Nun müssen wir die Caddy Konfiguration nach dem speichern nur einmal neu laden, 
schon ist der Seitencache überall aktiviert.

## Redis Objektcache für WordPress konfigurieren

Um einen Redis Objektcache für WordPress zu aktivieren gibt es mehrere Möglichkeiten. 
Ich habe mich dafür entschieden einen eigenen Redis Docker Container zu starten der dann von 
WordPress über ein kleines Plugin angesprochen wird. Dazu müssen wir drei Dinge tun.

### compose.yml anpassen

Zunächst ergänzen wir unsere Compose Datei im einen weiteren Block für den Redis Service. 
Das kann ungefähr so aussehen:

```yaml
    wordpress-redis:
        image: redis:alpine
        hostname: wordpress-redis
        container_name: wordpress-redis
        restart: unless-stopped
        networks:
            - default
        logging:
            options:
              max-size: "10m"
              max-file: "3"
```

Bitte daran denken das Ganze vorher über ```docker compose down``` herunterzufahren und nach dem speichern wieder mit
```docker compose up -d``` zu starten. Nun steht uns der Redis Server zur Verfügung und es geht mit 
dem nächsten Schritt weiter.

### wp-config.php editieren

In der WordPress Konfigurationsdatei „wp-config.php“ müssen wir noch zwei Zeilen ergänzen. 
Diese Datei liegt im Stammordner euerer WordPress Installation und ist (soll) in der Regel 
sowohl lese- als auch schreibgeschützt sein. D.h. zum editieren müsst ihr kurz die 
Berechtigungen auf die Datei so ändern, dass ihr sie beschreiben könnt. 
Anschließend nicht vergessen die Berechtigung wieder auf den Ausgangswert einzustellen.

```php
define( 'WP_REDIS_HOST', 'wordpress-redis' );
define( 'WP_REDIS_PORT', 6379 );
```
Das funktionierte bei mir nur ordnungsgemäß, wenn ich diese Zeilen relativ weit oben in der Datei eingefügt habe.

### Plugin installieren

Abschließend kommen wir um die Installation eines kleinen Plugins, dass WordPress sagt den Redis Cache zu nutzen, 
nicht ganz herum. Installiert auch dafür aus dem Marktplatz das Plugin <a href="https://wordpress.org/plugins/redis-cache/" target="_blank">Redis Object Cache</a> 
und aktivert dieses.

![Plugin](03_plugin.png)

In der Konfiguration des Plugins (unter Einstellungen -> Redis) klickt ihr nun 
auf „Object-Zwischenspeicher aktivieren“.

![Plugin Config](04_config.png)

## Fazit

Wenn bis hierhin alles funktioniert hat, seid ihr auch schon fertig und sowohl Seiten- als auch 
Object-Cache sind aktiv. Das könnt ihr euch auch beim betrachten des Website Zuststands in WordPress 
bestätigen lassen.
