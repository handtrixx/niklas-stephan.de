+++
title = 'Distrobox - oder: "Noch unabhängiger in Linux"'
slug = 'distrobox'
image = 'distrobox.png'
date = 2025-03-19
lastmod = 2025-03-19
draft = false
tags = ['deutsch', 'linux']
+++

Wenn du irgendwann genauso wie ich die Nase voll von MS Windows und Apple macOS hast, bleibt Linux als beliebteste 
und mittlerweile absolut konkurrenzfähige Alternative. Und schon stehst du vor der nächsten Entscheidung: 
Welches Linux darf es denn sein? Aber was wäre, wenn man einfach "jede" Art von Linux auf einmal laufen lassen könnte? 
Genau das verspricht <a href="https://distrobox.it/" target="_blank">Distrobox</a>. Dieser Post geht kurz auf die Unterschiede 
zwischen Linux-Kernel, Distribution und Derivation ein und zeigt dann, wie man Distrobox installiert und konfiguriert.

## Kernel, Distribution und Derviation

Hier die Unterschiede kurz erklärt, was hilft, den Rest des Artikels besser zu verstehen (Quelle: GPT-4o mini, 
Prompt: "Was ist der Unterschied in Linux zwischen: Kernel, Distribution und Derivation?", Datum: 27.03.2025).

### Kernel 
Der <a href="https://kernel.org/" target="_blank">Kernel</a> ist der zentrale Bestandteil eines Betriebssystems. 
Er ist die Schnittstelle zwischen der Hardware und der Software und verwaltet die Systemressourcen wie CPU, Speicher und Geräte. 
Der Linux-Kernel ist der Kern des Linux-Betriebssystems und wird ständig weiterentwickelt. 
Er ist verantwortlich für die Ausführung von Prozessen, das Management von Speicher und die Kommunikation mit Hardwarekomponenten.

### Distribution
Eine Linux-Distribution ist eine vollständige Sammlung von Software, die auf dem Linux-Kernel basiert. 
Sie umfasst den Kernel selbst sowie eine Vielzahl von Softwarepaketen, die für die Nutzung des Systems erforderlich sind, 
wie z.B. Desktop-Umgebungen, Anwendungssoftware, Systemwerkzeuge und Treiber. Beispiele für beliebte Linux-Distributionen sind:

- <a href="https://ubuntu.com/" target="_blank">Ubuntu</a>,
- <a href="https://fedoraproject.org/" target="_blank">Fedora</a>,
- <a href="https://www.debian.org/" target="_blank">Debian</a>,
- <a href="https://archlinux.org/" target="_blank">Arch Linux</a>.

Jede Distribution hat ihre eigenen Merkmale, Paketverwaltungssysteme und Zielgruppen.

### Derivation
Derivation (oder abgeleitete Distribution) bezieht sich auf eine Distribution, die auf einer anderen Distribution basiert. 
Sie nutzt den Kernel und die Softwarepakete der ursprünglichen Distribution, fügt jedoch eigene Anpassungen, 
zusätzliche Software oder spezifische Konfigurationen hinzu. Ein Beispiel für eine Derivation ist <a href="https://www.linuxmint.com/" target="_blank">Linux Mint</a>, das auf Ubuntu basiert, 
aber eine andere Benutzeroberfläche und zusätzliche Funktionen bietet. 
Derivationen können oft als benutzerfreundlicher oder spezialisierter angesehen werden, 
da sie auf den Stärken der Basisdistribution aufbauen.

## Und warum nun Distrobox?
Distrobox zu nutzen, kann aus mehreren Gründen nützlich oder sogar sinnvoll sein:

1. Ich verwende Distribution X, kenne mich aber in Distribution Y besser aus.
Einige Tools in der Linux-Welt sind auf eine bestimmte Linux-Distribution "gemünzt". Ein prominentes Beispiel hierfür sind die Paketmanager. In Fedora und Co. hat sich da dnf durchgesetzt, während unter Ubuntu und Co. apt üblich ist. Mit Distrobox kannst du einfach beide verwenden.

2. Deine Wunsch-App gibt es nur für Distribution Y, aber du nutzt Distribution X.
Dann installiere sie doch einfach über Distrobox 😊.

3. Ein Container oder gar eine VM wäre mit "Kanonen auf Spatzen" geschossen.
Zum Ausprobieren empfiehlt es sich nach wie vor eher, mit einer vollständigen Container-Management-Software wie Docker zu arbeiten, aber eine tiefgehende Integration in dein Betriebssystem lässt sich einfacher mit Distrobox umsetzen.

4. Weil es lustig ist.
Ja, zumindest finde ich es lustig, auch auf einem Desktop zu sehen, dass alle Linux-Distributionen auf dem gleichen Kernel basieren und im Endeffekt nur ein Gerüst darstellen.

## Installation von Distrobox

Die Installationspakete für Distrobox sind mittlerweile in allen großen Distributionen integriert und stellen die einfachste Variante dar, Distrobox zu installieren. Die Installation selbst könnt ihr entweder über die grafische Oberfläche eurer Paketverwaltung durchführen oder wie folgt über die Kommandozeile.

Für Fedora / CentOs / RedHat:
```shell
sudo dnf install distrobox 
```

Für Debian / Ubuntu:
```sh
sudo apt-get install distrobox
```

Alternativ, z.B. wenn du eine Distribution nutzt, die nur eine ältere Version von Distrobox anbietet, kannst du die Installation auch mit:

```bash
curl -s https://raw.githubusercontent.com/89luca89/distrobox/main/install | sudo sh
```

starten. Denke dann aber daran, dass du für Updates selbst zuständig bist (diese startest du einfach durch einen erneuten Aufruf des zuvor genannten Befehls).

## Erstellen eines neuen Containers
Das Erstellen von Containern geht mit einem simplen Befehl auf der Kommandozeile vonstatten, z.B. so:

```bash
distrobox create --name ubuntu_container --image ubuntu:latest
```

In diesem Fall würde ein neuer Container mit dem Namen "ubuntu_container" und der neuesten Ubuntu-Version angelegt werden.

## Zwischen den Containern hin und her wechseln

Um einen Container wie den im Beispiel zuvor erstellten "ubuntu_container" zu betreten, führt man folgendes Kommando aus:

```bash
distrobox enter ubuntu_container
```

Um einen Container wieder zu verlassen, reicht ein simples

```bash
exit
```

Denke daran, den Container erst zu verlassen, bevor du in einen anderen springst.

## Weitere nützliche Befehle
Alle vorhandenen Container kannst du dir mit folgendem Befehl anzeigen lassen:

```bash
distrobox list
```

Einen laufenden Container wie unseren "ubuntu_container" kannst du mit folgendem Befehl stoppen:

```bash
distrobox stop ubuntu_container
```

Und um einen Container komplett zu löschen, benötigen wir folgendes Kommando

```bash
distrobox rm ubuntu_container
```

## Fazit

Distrobox macht es maximal einfach, zwischen verschiedenen Linux-Distributionen hin und her zu springen, ohne eine Dual-Boot-Installation, eine virtuelle Maschine oder Docker/Podman-Container anlegen zu müssen. Das macht sogar noch Sinn, wenn du z.B. schon Docker installiert hast, weil die dort verfügbaren Images in der Regel für Serversysteme gedacht sind und deshalb für die interaktive Nutzung nicht wirklich taugen.

## Bonustipp

Wenn du beim betreten der Shell Kommandozeile auch ein cooles OS Logo mit Systeminformationen sehen willst:
Das geht mit <a href="https://github.com/dylanaraps/neofetch" target="_blank">neofetch</a>. Das Paket kann über alle gängigen Paketmanager installiert werden und heißt, rate mal, "neofetch".
Für einen automatischen Start nach der Installation einfach neofetch ans ende eurer ~/.bashrc oder ~/.zshrc setzen.

![Neofetch](edit_neofetch.png)