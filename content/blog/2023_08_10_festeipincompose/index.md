+++
title = 'Feste IP-Adressen mit Docker Compose'
slug = 'docker-fixed-ips'
image = '01_Moby-share.png'
date = 2023-08-10
lastmod = 2023-08-10
draft = false
tags = ['deutsch']
+++

Warum um Himmels willen sollte man Containern feste IP-Adresse zuweisen? 
Eine absolut berechtigte Frage auf die die Antwort lautet: Am besten nie! 
Denn: Docker kommt mit einer Art eingebauten DNS- und DHCP-Server und verwaltet die IP-Adresse 
wunderbar selbst. Leider gibt es trotzdem Spezialfälle in denen man sich das Leben vereinfachen kann, 
wenn man IPs händisch setzt. 
So ein Spezialfall wäre z.B. gegeben, wenn die Applikation die in einem Container betrieben wird 
nicht mit Hostnamen sondern nur mit IP-Adressen umgehen kann, um auf einen weiteren Container zuzugreifen.

Früher war das ein relativ kompliziertes unterfangen, mit den aktuellen Docker (Compose) Versionen 
ist aber auch das kinderleicht.

## IP-Adressen laufender Container herausfinden

Falls du bereits diverse Container innerhalb eines Netzes am laufen hast, 
wäre es gefährlich nur einigen davon eine feste IP-Adresse zuzuordnen. 
Warum? Weil, es dir dann z.B. nach einem Reboot deines Servers passieren könnte, 
dass sich die automatisch zugewiesene IP eines Containers mit einer von dir fest 
zugeordneten eines anderen Containers überschneidet. Das Resultat wäre, 
dass der zweite Container nicht starten kann, da die IP ja bereits vergeben ist.

Um zu erfahren welche IP-Adresse einem Container aktuell zugewiesen ist, hilft uns das Kommando

```bash
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' CONTAINERNAMEoderID
```

Falls man die IP-Adressen aller laufenden Container herausfinden möchte, ist dieses Kommando sehr nützlich:

```bash
docker inspect $(docker ps -q ) --format='{{ printf "%-50s" .Name}} {{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}'
```

## Ein Netz einrichten

In unserem Beispiel wollen wir allen Containern die in einem für unseren Caddy Reverse Proxy erstellen 
Netz liegen feste IP-Adressen vergeben. Falls ihr noch kein solches Netz habt, könnt ihr dieses über den Befehl

```bash
docker network create --subnet=172.28.0.0/16 proxy
```

anlegen. Nachdem dies erfolgt ist, können wir nun in den Docker Compose Definitionen der 
einzelnen Container die IP-Adressen 172.20.0.X verwenden. Wobei X für die Zahlen 1-255 steht.

## IP-Zuweisung mit Docker Compose

Beginnen wir mit der Zuweisung einer festen IP für unseren Caddy Reverse Proxy:

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
        proxy:
          ipv4_address: 172.28.0.1
volumes:
  caddy_data:
  caddy_config:
networks:
    proxy:
        external: true
```

Nach dem speichern und anschließendem Neustart der Umgebung, ist die IP fest zugeordnet. 
Entscheidend sind die Blöcke:

```yaml
    networks:
        proxy:
          ipv4_address: 172.28.0.1
```

sowie

```yaml
networks:
    proxy:
        external: true
```

Nun verfahren wir genauso mit allen anderen Containern mit einer jeweils individuellen IP 
und haben unser vorhaben erfolgreich beendet.

## Fazit

Auch wenn die Zuweisung fester IP-Adressen relativ einfach ist, erscheint das Ganze als etwas „unsauber“. 
So widerspricht die Vorgehensweise doch dem Prinzip, 
dass ich die Definition eines Docker Containers nehmen und jederzeit auf einem anderen Server/Host 
starten kann. Das ist so nun nicht mehr möglich, weil zunächst manuell ein neues Netz angelegt werden muss. 
Anderseits ist die manuelle Erstellung des Netzes sowieso erforderlich, 
wenn man eine Art DMZ (eigenes Netz) für seinen Reverse Proxy definiert. 
Nur der manuell vergebene Subnetzbereich ist hier der zusätzliche Aufwand. 
So bleibt die Verwendung fester IP-Adressen als ein Spezialfall der nur in bestimmten Szenarien Sinn macht.