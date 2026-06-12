# Mento.IA — Landing

> **Focused on your future.**
> Orientación vocacional longitudinal impulsada por IA. Un programa de [MyPath.IA](https://mypathia.com).

Landing page de Mento.IA: trilingüe (ES · EN · PT), con storytelling por scroll, contadores animados, carrusel de testimonios, vídeo de presentación y formulario de solicitud de demo.

## 🚀 Publicar con GitHub Pages

1. Sube estos archivos a tu repositorio.
2. En GitHub → **Settings → Pages**.
3. En *Source*, elige la rama `main` y la carpeta `/ (root)`.
4. Guarda. Tu web quedará publicada en `https://justogoncalves-art.github.io/Mento.IA/`.

El punto de entrada es **`index.html`**.

## 📁 Estructura

```
index.html                 ← Página principal (entrada del sitio)
Mento.IA - Landing.html    ← Copia con nombre descriptivo (idéntica a index.html)
assets/
  ├─ mento.css             ← Tokens de marca (colores, tipografía)
  ├─ mento-sections.css    ← Hero, problema, recorrido, capítulos
  ├─ mento-product.css     ← Producto, informe, ecosistema, CTA, footer
  ├─ mento-ui.css          ← Carrusel, vídeo, modal de demo
  ├─ app.js                ← i18n, animaciones, carrusel, formulario
  ├─ i18n.es.js            ← Diccionario español
  ├─ i18n.en.js            ← Diccionario inglés
  └─ i18n.pt.js            ← Diccionario portugués
```

## 🎨 Marca

- **Colores:** Teal `#5de0e6` → Azul `#004aad` (degradado 90°) · Navy `#060754` · Ice `#f0f6ff`
- **Tipografía:** Space Grotesk (títulos) + Quicksand (cuerpo)
- **Idiomas:** Español · Inglés · Portugués (conmutador en la barra superior)

## ✉️ Formulario de demo

El formulario abre el cliente de correo del usuario con la solicitud redactada hacia **hola@mypathia.com**.
Para enviarlo a un backend o servicio (Formspree, etc.) en lugar de `mailto:`, edita el handler `initModal` en `assets/app.js`.

## ▶️ Vídeo

La sección "¿Qué es Mento.IA?" incrusta un vídeo de YouTube mediante una *facade* (carga al hacer clic, sin penalizar el rendimiento inicial).

---

© 2026 MyPath.IA · Todos los derechos reservados.
