+++
title = 'Rechenkraft für die Wissenschaft mit BOINC'
slug = 'boinc'
image = 'boinc_certificate_2022-04-01-2048x1371.webp'
date = 2022-11-01
lastmod = 2022-11-01
draft = false
tags = ['deutsch']
og_title = "Rechenkraft für die Wissenschaft mit BOINC"
+++

Wenn man sich zum Einem für wissenschaftliche Projekte begeistern kann und zum Anderen 
ein wenig Rechenleistung übrig hat, dann sollte man sich das Open Source Projekt und Werkzeug 
Boinc einmal genauer anschauen. In diesem Artikel berichte ich darüber, was Boinc eigentlich 
ist und wie man es einfach installieren kann.

## Volunteer-Computing / Ehrenamtliches Rechnen?

<blockquote>
    <p>Volunteer-Computing (zu deutsch: ehrenamtliches / freiwilliges Rechnen) beschreibt eine Technik 
    der Anwendungsprogrammierung bei der einzelne Computernutzer Rechnerkapazitäten wie Rechenzeit 
    und Speicherplatz auf freiwilliger Basis einem bestimmten Projekt zur Verfügung stellen, 
    um unter Anwendung des verteilten Rechnens ein gemeinsames Ergebnis zu berechnen.</p>
    <footer>— Wikipedia</footer>
</blockquote>

Das heisst, dass jeder der ein wenig Rechenleistung entbehren kann, sich an wissenschaftlichen 
Projekten beteiligen kann, um diesen dabei zu helfen bestimmte Problemstellungen zu lösen. 
Um das zu tun, muss man sich bloß ein bestimmtes Programm installieren, dass auf einem Computer 
läuft der möglichst oft/dauerhaft betrieben wird. Wer also z.B. zuhause einen Raspberry Pi oder 
so wie ich, sowieso einen Server betreibt, kann wissenschaftliche Arbeit leisten in dem er 
teile seiner freien Prozessorkapazität zur Verfügung stellt.

## Hinweis

Vor einem Betrieb auf einem Laptop oder einem klassischen PC sollte man bedenken, 
dass durch erhöhten CPU-Verbrauch die Lebensdauer, wenn vielleicht auch nicht signifikant, 
heruntergesetzt bzw. der Stromverbrauch gesteigert wird. Von einem Betrieb auf Cloud-Server 
Angeboten wie Microsoft Azure oder Amazon AWS, ist wegen der auf CPU-Leistung und 
Datenübertragung basierenden Abrechnungsmodelle, ebenfalls abzuraten.

Sonst kann es teuer werden!

## Was ist Boinc?

Die Schaffer des Tools Boinc haben es sich zur Aufgabe gemacht ca. 30 wissenschaftliche 
Volunteer-Computing Projekte über eine Oberfläche verfügbar und konfigurierbar zu machen. 
Auch Einstellungen wie die zur Verfügung zu stellenden Ressourcen und Reports über bereits 
geleistete Arbeit stellt das Tool zur Verfügung. Eine genaue Liste mit Beschreibung 
der Projekte findet sich hier: https://boinc.berkeley.edu/projects.php . 
Dort wird auch schon ersichtlich, dass nicht jedes Projekt für jede Computerplattform 
existiert und andere nicht für jede Art von Plattform geeignet sind. 
So benötigen einige von Ihnen z.B. eine schnelle dezidierte Grafikkarte, da die angestellten 
Berechnung auf diesen Prozessortyp (GPU) optimiert sind.

![Boinc screenshot](02_boinc_screenshot.webp)

## OK, gefällt mir. Wie starte ich?

Die Installation kann entweder manuell und direkt über das auf der Boinc Homepage verfügbare 
Installationsprogramm erfolgen oder, wie von mir bevorzugt und folgend beschrieben, 
als Docker Container mit Docker Compose.

Die manuelle Installation funktioniert auf jeder Art von Rechner und kann zum Beispiel so konfiguriert werden, 
das BOINC als Bildschirmschoner läuft und so nur dann Ressourcen des PCs beansprucht, 
wenn dieser gerade nicht genutzt wird. 
Die Installation kann man unter https://boinc.berkeley.edu/download.php herunterladen.

Für den Betrieb auf einem Server in einem Container hier eine beispielhafte compose.yml Datei:

```yaml
version: "2.1"
services:
  boinc:
    image: lscr.io/linuxserver/boinc
    hostname: "boinc"
    container_name: boinc
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Europe/Berlin
      - PASSWORD=xxx
    volumes:
      - ./config:/config
    restart: unless-stopped
    #ports:
    #  - 8080:8080
    logging:
      options:
        max-size: "10m"
        max-file: "3"
    networks:
      - dmz
    deploy:
      resources:
        limits:
          cpus: 1.00
          memory: 2048M
networks:
  dmz:
    external: true
``` 

Die Angabe der zur Verfügung gestellten Ressourcen über deploy – resources – limits, ist optional. 
Eine Beschränkung der dem Program bereitgestellten Ressourcen lässt sich, wie schon zuvor erwähnt, 
auch direkt im Programm konfigurieren. Ich gehe hier auf Nummer sicher und schränke den Zugriff 
von vorn herein ein. Ein CPU Wert von 1 entspricht einem CPU-Thread. Bei z.B. vorhandenen 8 Threads, 
kann der hier definierte Container also auf 12,5% der verfügbaren CPU-Leistung zugreifen. 
Genau das von mir gewünschte “Grundrauschen”.
Die Angabe des Ports ist nur erforderlich, wenn wir keinen Reverse Proxy nutzen. 
Dann wäre unsere BOINC Instanz auf dem Host über den entsprechenden Port erreichbar.
Das Passwort sollte auf jeden Fall gesetzt werden und ist dann zur Anmeldung am virtuellen 
Desktop über den Browser erforderlich. Der Benutzer ist übrigens fest auf abc eingestellt.

## Anwendung und Fazit

Entweder durch starten der Anwendung oder durch Zugriff auf das Webinterface im Conatinerbetrieb, 
können wir uns nun im Program für die Projekte die uns intressieren anmelden und die Prozesse starten. 
Danach passiert eigentlich nichts spannendes mehr und eine weiteres Eingreifen unserseits ist nicht erfordlich. 
Unseren Beitrag zum jeweiligen Projekt können wir über die im Program integrierten Berichte 
oder auf der jeweiligen Projektseite jederzeit einsehen. Dort oder unter können wir uns auch ein 
Zertifkat gennerieren lassen, wenn wir das möchten.

Einfacher geht es nicht, viel Spaß beim rechnen (lassen)!