# Mento.IA — Web

Landing institucional de **Mento.IA**, el programa de orientación vocacional longitudinal potenciado por IA (parte del ecosistema MyPath.IA).

Sitio estático (HTML + CSS + JS, sin build). Trilingüe (ES por defecto · EN · PT) y responsive (desktop / tablet / mobile).

## Estructura

```
index.html                     Página principal
assets/
  mento-web.css                Estilos (design system Mento.IA)
  app.js                       Lógica: i18n, scroll reveals, modal, formulario
  i18n.es.js / .en.js / .pt.js Contenido trilingüe
_ds/…/tokens/                  Tokens del design system (colores, efectos)
google-apps-script.gs          Backend del formulario (Google Sheets + email + Slack)
```

## Publicar en GitHub Pages

1. Crea el repositorio y sube TODO el contenido de esta carpeta (respetando la estructura, incluida `_ds/`).
2. En el repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
3. Branch: `main` · carpeta `/ (root)` → **Save**.
4. En 1–2 min la web queda publicada en `https://<usuario>.github.io/<repo>/`.

## Formulario de demo (leads)

El formulario envía cada solicitud a una hoja de Google Sheets, avisa por email a `hola@mypathia.com` y publica el lead en el canal de Slack `#leads`.

**Configuración (una sola vez):**

1. Abre la hoja de cálculo → **Extensiones → Apps Script**.
2. Pega el contenido de `google-apps-script.gs` y guarda.
3. **Implementar → Nueva implementación → Aplicación web** (Ejecutar como: *Yo* · Acceso: *Cualquier usuario*). Autoriza y copia la URL `/exec`.
4. Pega esa URL en `index.html`, en `window.MENTO_FORM_ENDPOINT = "…"`.
5. El webhook de Slack y el correo ya vienen configurados en el `.gs`.

Al editar el `.gs` después de implementar: **Implementar → Gestionar implementaciones → editar → Versión nueva** (la URL `/exec` se mantiene).

## Notas

- Los textos de cada idioma viven en `assets/i18n.*.js` (claves `data-i18n`).
- El video de "La solución" es un YouTube Short en formato vertical (9:16).
- Paleta y tipografías siguen el design system Mento.IA: Azul Intenso `#074292`, Cyan `#0de0e6`, Space Grotesk / Quicksand / DM Mono.
