# Architekturtests

Eine deutschsprachige Reveal.js-Präsentation über Architekturtests in .NET und C#.
Sie umfasst 14 Kernfolien sowie vier optionale Vertiefungen. Die Präsentation und
eine kleine ausführbare Testdemo liegen direkt im Repository-Root.

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

Folie 14 schließt den 20-Minuten-Vortrag mit einer Diskussion ab. Folien 15 bis 18
sind optionale Vertiefungen. In der Sprecheransicht Pop-ups für die lokale Adresse
zulassen; die Notizen erscheinen dort, nicht auf der Präsentationsfläche.

## Testdemo

Die Demo benötigt das .NET-10-SDK. Alle Befehle aus dem Repository-Root ausführen.
Zuerst Pakete wiederherstellen und optional bauen:

```powershell
dotnet restore demo/ArchitectureDemo.csproj
dotnet build demo/ArchitectureDemo.csproj --no-restore
```

Der Test ist zunächst erfolgreich. Danach lässt sich eine echte unerlaubte
Abhängigkeit zuschalten; dieser Lauf soll fehlschlagen:

```powershell
dotnet test demo/ArchitectureDemo.csproj --no-restore
dotnet test demo/ArchitectureDemo.csproj --no-restore -p:ArchitectureViolation=true
dotnet test demo/ArchitectureDemo.csproj --no-restore
```

Die Eigenschaft schaltet beim Neubau einen Verstoß von BusinessLogic zu Api zu.
Darum `--no-build` nicht verwenden. Die Demo ist ein isoliertes Beispiel, keine
produktive Anwendung.

## Inhalte bearbeiten

- `slides/` enthält die 18 Folien als einzelne HTML-Dateien.
- `slides.js` legt mit `slideFiles` ihre Reihenfolge fest.
- `slides.css` und `presenter.css` enthalten die Präsentations- und Sprecheransicht-Stile.
- `demo/` enthält das .NET-Testprojekt.

Zum Ergänzen eine Folien-Datei kopieren und sie an der passenden Stelle in
`slideFiles` eintragen. Jede Datei enthält genau ein `<section>`-Element mit Inhalt
und Sprechernotizen. C#-Code in HTML-`<pre>`-Blöcken muss maskiert werden, zum
Beispiel `<` als `&lt;`.

## PDF

Den Server starten und http://127.0.0.1:4173/?print-pdf öffnen. Im Browser mit
`Ctrl+P` im Querformat drucken und Hintergrundgrafiken aktivieren. Vor dem Teilen
Seitenumbrüche prüfen.