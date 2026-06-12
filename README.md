# Mento.IA — Landing Page

**Focused on your future.** Landing page oficial de Mento.IA, el programa de orientación vocacional longitudinal de [MY PATH.IA](https://mypathia.com).

## Contenido

```
index.html          Página principal (EN por defecto · ES · PT)
assets/
  mento.css           Design system: tokens de marca, tipografía, base
  mento-sections.css  Hero, problema, fases, capítulos
  mento-product.css   Mock del producto, informe, CTA, footer
  mento-ui.css        Carrusel, vídeo, modal de demo, separadores
  mento-cult.css      Capa de animación (border-beam, mesh, grano, tilt)
  mento-v2.css        Manifiesto, sticky stack, marquee, nav móvil
  mento-mobile.css    Ajustes responsive para móvil
  app.js              Lógica: i18n, reveals, contadores, modal, efectos
  i18n.es.js          Textos en español
  i18n.en.js          Textos en inglés
  i18n.pt.js          Textos en portugués
```

## Publicar con GitHub Pages

1. Sube `index.html` y la carpeta `assets/` a la raíz del repositorio (rama `main`).
2. En GitHub: **Settings → Pages → Source: Deploy from a branch → `main` / `(root)` → Save**.
3. En 1-2 minutos la web estará en `https://justogoncalves-art.github.io/Mento.IA/`.

## Formulario de demo → Google Sheets

El formulario ya está conectado al Apps Script de la hoja de cálculo
(`window.MENTO_FORM_ENDPOINT` en `index.html`). Cada envío:

- añade una fila a la hoja (fecha, nombre, apellido, colegio, cargo, país, motivo, idioma), y
- envía un aviso por correo a `hola@mypathia.com`.

Si algún día regeneras la implementación del Apps Script, copia la nueva URL `/exec`
y reemplázala en `index.html` (línea `window.MENTO_FORM_ENDPOINT = "..."`).

## Idiomas

Inglés por defecto. El visitante puede cambiar a ES / PT con el selector del menú;
su elección queda guardada en el navegador.

## Marca

- Paleta: teal `#5de0e6` → azul `#004aad` (gradiente 90°), navy `#060754`, ice `#f0f6ff`
- Tipografía: Space Grotesk (títulos) + Quicksand (cuerpo), vía Google Fonts

© 2026 MyPath.IA · Todos los derechos reservados.
