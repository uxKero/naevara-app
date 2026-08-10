# LoreMaps · Faerûn — dataset local

Copia local de los pines del mapa interactivo <https://loremaps.azurewebsites.net/Maps/Faerun>,
que se usa para **verificar ubicaciones, distancias y contexto** del mapa real de Faerûn contra el
canon de Silvapor. Los nombres de lugares del Master a veces cambian, pero la geografía se respeta.

## Archivos

Ocho GeoJSON crudos, tal como los sirve el sitio, más un `index.json` plano y ordenado.

| Archivo | Puntos |
|---|---|
| `Ports.json` | 107 |
| `Cities.json` | 108 |
| `PortCapitals.json` | 26 |
| `Ruins.json` | 22 |
| `Fortresses.json` | 15 |
| `Capitals.json` | 8 |
| `Sites.json` | 6 |
| `Temples.json` | 5 |
| **`index.json`** | **297** (plano: `tipo`, `nombre`, `lat`, `lon`, `desc`) |

## Cómo refrescarlo

No hace falta browser: los endpoints son JSON planos.

```
https://loremaps.azurewebsites.net/data/Faerun/<Set>.json
```

con `<Set>` ∈ Ports, Cities, PortCapitals, Capitals, Temples, Sites, Fortresses, Ruins.
Los tiles del mapa viven en `https://loremaps.github.io/LoreMaps-Faerun-Tiles/Tiles/{z}/{x}/{y}.png`.

## Sistema de coordenadas — IMPORTANTE

`lat`/`lon` **no son geográficas**: son píxeles de la imagen del mapa.

- `lat` va de **37 a 3078.5**, y **más alto = más al SUR**.
- `lon` va de **366.5 a 4718**, y **más alto = más al ESTE**.

Calibración de referencia (norte → sur por la costa):

| lat | lon | Lugar |
|---|---|---|
| 313 | 409.5 | Luskan |
| 448 | 493 | Neverwinter |
| 682 | 694 | Waterdeep |
| 1157 | 1036 | Baldur's Gate |
| 1750 | 880 | Velen |

## Correspondencias ya verificadas con el canon de Silvapor

- **Neverwinter está al NORTE de Waterdeep** (lat 448 vs 682).
- **Iron Keep** existe: lat 1365.5, lon 366.5 — el punto más occidental del mapa, en las Moonshae
  del noroeste, consistente con la isla de Omán.
- **Caer Callidyrr** (lat 1272) y **Caer Corwell** (lat 1581): las capitales Moonshae. El "Caer Cal…"
  de la sesión 3 es Caer Callidyrr.
- **El trío de Lantan es real y el orden norte→sur coincide con lo narrado en mesa**:
  Sundrah lat 2108.5 (norte) → Sambar lat 2206.5 (centro) → Anchoril lat 2291.5 (sur).
  Y quedan pegados a Chult (Port Nyranzaru 2429.5, Fort Beluarian 2364.5, Mezro 2521), igual que
  el canon: "las islas del sudoeste, frente a las junglas de Chult".
- **Goldenfields** existe como *Temple* al norte de Waterdeep (lat 603.5, lon 774) — ojo, no es un
  callejón dentro de la ciudad.
- El **archipiélago de Korinn** no tiene pin acá, pero el lore lo ubica en el extremo **norte** de
  las Moonshae: islas rocosas, ventosas y refugio de piratas.
