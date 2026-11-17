# ShadowNet — Rise of a Digital Empire

Ein Aufbauspiel im Cyberpunk-Look: Netzwerke aufbauen, Einfluss ausweiten,
Ressourcen verwalten. Läuft vollständig im Browser — kein Backend, keine
Konten, kein Tracking.

**Live:** https://cstrsk.github.io/shadownet/

## Lokal starten

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # statischer Build in dist/
```

## Aufbau

```
src/
  main.tsx          Einstiegspunkt
  App.tsx           Spielrahmen
  components/       Oberflächenbausteine
  game/             Spiellogik
public/             Bilder und Assets
```

## Technik

React 19, TypeScript, Vite, Tailwind 4. Der Build ist statisch und braucht
keinen Server. `base: './'` in `vite.config.ts` hält alle Pfade relativ,
damit die App unter einem Unterpfad läuft.

## Lizenz

AGPL-3.0 — siehe `LICENSE`.
