# Architekturtests

Eine deutschsprachige Reveal.js-Präsentation über Architekturtests in .NET und C#.
Sie umfasst derzeit 13 Folien; alle Projektdateien liegen direkt im Repository-Root.

## Start

Voraussetzung: Node.js mit npm. Im Repository-Root ausführen:

```powershell
npm ci
npm start
```

Die Präsentation läuft unter http://127.0.0.1:4173/ und benötigt HTTP, da die
Folien einzeln geladen werden. Nach `npm ci` funktioniert sie ohne Internet.
Mit `Ctrl+C` den Server beenden. Ist Port 4173 belegt, lässt sich ein anderer
Port angeben, zum Beispiel `npm start -- -p 4174`.

## Bedienung

| Taste | Funktion |
| --- | --- |
| Pfeile oder Leertaste | Weiter / zurück |
| Home / End | Erste / letzte Folie |
| Esc | Folienübersicht |
| F | Vollbild |
| S | Sprecheransicht mit Notizen |
| B oder Punkt | Bildschirm abdunkeln |

In der Sprecheransicht Pop-ups für die lokale Adresse zulassen; die Notizen
erscheinen dort, nicht auf der Präsentationsfläche.

## Inhalte bearbeiten

- `slides/` enthält die 13 geladenen Folien als einzelne HTML-Dateien.
- `screenshots/` enthält die Bilder der Architekturtest-Beispiele.
- `diagrams/` enthält wiederverwendbare Mermaid-Quellen.
- `slides.js` legt mit `slideFiles` ihre Reihenfolge fest.
- `slides.css` und `presenter.css` enthalten die Präsentations- und Sprecheransicht-Stile.

Zum Ergänzen eine Folien-Datei kopieren und sie an der passenden Stelle in
`slideFiles` eintragen. Jede Datei enthält genau ein `<section>`-Element mit Inhalt
und Sprechernotizen. C#-Code in HTML-`<pre>`-Blöcken muss maskiert werden, zum
Beispiel `<` als `&lt;`.

## PDF

Den Server starten und http://127.0.0.1:4173/?print-pdf öffnen. Im Browser mit
`Ctrl+P` im Querformat drucken und Hintergrundgrafiken aktivieren. Vor dem Teilen
Seitenumbrüche prüfen.