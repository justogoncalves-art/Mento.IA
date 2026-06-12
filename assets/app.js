/* ============================================================
   MENTO.IA — App logic: i18n, scroll reveals, micro-interactions
   ============================================================ */
(function () {
  "use strict";
  var DICT = window.MENTO_I18N || {};
  var LANGS = ["es", "en", "pt"];

  /* ---------- i18n ---------- */
  function applyLang(lang) {
    if (LANGS.indexOf(lang) < 0) lang = "es";
    var d = DICT[lang] || DICT.es;
    document.documentElement.setAttribute("lang", lang);
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (d[key] != null) {
        if (el.classList.contains("count")) {
          el.setAttribute("data-count-target", d[key]);
          if (el.classList.contains("in") || (el.closest(".reveal.in"))) animateCount(el);
          else el.textContent = d[key];
        } else {
          el.textContent = d[key];
        }
      }
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (d[key] != null) el.setAttribute("aria-label", d[key]);
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-ph");
      if (d[key] != null) el.setAttribute("placeholder", d[key]);
    });
    // manifesto: rebuild word spans ({word} => accent)
    document.querySelectorAll("[data-words]").forEach(function (el) {
      var key = el.getAttribute("data-words");
      if (d[key] == null) return;
      el.textContent = "";
      d[key].split(/\s+/).forEach(function (tok, i) {
        var m = tok.match(/^\{(.+)\}(.*)$/);
        var sp = document.createElement("span");
        sp.className = "w" + (m ? " acc" : "");
        sp.textContent = m ? m[1] + m[2] : tok;
        if (i) el.appendChild(document.createTextNode(" "));
        el.appendChild(sp);
      });
    });
    document.querySelectorAll(".lang button").forEach(function (b) {
      b.classList.toggle("active", b.dataset.lang === lang);
    });
    try { localStorage.setItem("mento.lang", lang); } catch (e) {}
  }
  function initLang() {
    var saved;
    try { saved = localStorage.getItem("mento.lang"); } catch (e) {}
    var nav = (navigator.language || "es").slice(0, 2);
    var lang = saved || (LANGS.indexOf(nav) >= 0 ? nav : "es");
    document.querySelectorAll(".lang button").forEach(function (b) {
      b.addEventListener("click", function () { applyLang(b.dataset.lang); });
    });
    applyLang(lang);
  }

  /* ---------- Nav solidify ---------- */
  function initNav() {
    var nav = document.querySelector(".nav");
    if (!nav) return;
    var onScroll = function () { nav.classList.toggle("solid", window.scrollY > 40); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    // smooth anchor
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var t = document.querySelector(a.getAttribute("href"));
        if (t) { e.preventDefault(); window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 70, behavior: "smooth" }); }
      });
    });
  }

  /* ---------- Scroll reveals + data-driven animations (scroll-position based) ---------- */
  function fireEl(el) {
    if (el.classList.contains("in")) return;
    el.classList.add("in");
    el.querySelectorAll("[data-fill]").forEach(function (f) {
      setTimeout(function () { f.style.width = f.dataset.fill; }, 140);
    });
    el.querySelectorAll(".count").forEach(function (c) { animateCount(c); });
    if (el.classList.contains("count")) animateCount(el);
    el.querySelectorAll("[data-ring]").forEach(function (r) { animateRing(r, parseFloat(r.dataset.ring)); });
    if (el.dataset.ring != null) animateRing(el, parseFloat(el.dataset.ring));
    if (el.classList.contains("chapters")) {
      var line = el.querySelector(".progress-line");
      if (line) setTimeout(function () { line.style.setProperty("--cw", "100%"); }, 220);
    }
  }
  function initReveals() {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var els = [].slice.call(document.querySelectorAll(".reveal, .chapters, [data-ring]"));
    if (reduce) {
      els.forEach(fireEl);
      document.querySelectorAll("[data-fill]").forEach(function (el) { el.style.width = el.dataset.fill; });
      document.querySelectorAll("[data-ring]").forEach(function (el) { el.style.setProperty("--p", el.dataset.ring); var n = el.querySelector("[data-ring-num]"); if (n) n.textContent = el.dataset.ring + "%"; });
      var pl = document.querySelector(".progress-line"); if (pl) pl.style.setProperty("--cw", "100%");
      return;
    }
    var check = function () {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      for (var i = els.length - 1; i >= 0; i--) {
        var el = els[i];
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.9 && r.bottom > 0) { fireEl(el); els.splice(i, 1); }
      }
      if (!els.length && io) { io.disconnect(); window.removeEventListener("scroll", check); window.removeEventListener("resize", check); }
    };
    var io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            fireEl(en.target);
            var idx = els.indexOf(en.target); if (idx >= 0) els.splice(idx, 1);
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      els.forEach(function (el) { io.observe(el); });
    }
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });
    // safety sweeps in case scroll events are throttled or programmatic
    setTimeout(check, 400); setTimeout(check, 1200);
    // rAF polling — guarantees reveals fire even when scroll events aren't dispatched
    (function poll() { if (els.length) { check(); requestAnimationFrame(poll); } })();
  }

  /* ---------- Testimonial carousel ---------- */
  function initCarousel() {
    document.querySelectorAll("[data-carousel]").forEach(function (root) {
      var track = root.querySelector(".carousel-track");
      var slides = [].slice.call(root.querySelectorAll(".tquote"));
      var dotsWrap = root.querySelector("[data-carousel-dots]");
      var prev = root.querySelector("[data-carousel-prev]");
      var next = root.querySelector("[data-carousel-next]");
      var idx = 0, timer = null;
      var dots = slides.map(function (_, i) {
        var b = document.createElement("button");
        b.setAttribute("aria-label", "Ir al testimonio " + (i + 1));
        b.addEventListener("click", function () { go(i); rearm(); });
        dotsWrap.appendChild(b);
        return b;
      });
      function go(i) {
        idx = (i + slides.length) % slides.length;
        track.style.transform = "translateX(" + (-idx * 100) + "%)";
        dots.forEach(function (d, di) { d.classList.toggle("active", di === idx); });
      }
      function rearm() {
        if (timer) clearInterval(timer);
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        timer = setInterval(function () { go(idx + 1); }, 6000);
      }
      if (prev) prev.addEventListener("click", function () { go(idx - 1); rearm(); });
      if (next) next.addEventListener("click", function () { go(idx + 1); rearm(); });
      // swipe
      var sx = null;
      root.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
      root.addEventListener("touchend", function (e) {
        if (sx == null) return;
        var dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 40) { go(idx + (dx < 0 ? 1 : -1)); rearm(); }
        sx = null;
      }, { passive: true });
      go(0); rearm();
    });
  }

  /* ---------- Video: YouTube facade ---------- */
  function initVideo() {
    document.querySelectorAll(".video-frame[data-yt]").forEach(function (frame) {
      var id = frame.getAttribute("data-yt");
      var btn = frame.querySelector(".video-play");
      var load = function () {
        if (frame.classList.contains("playing")) return;
        var iframe = document.createElement("iframe");
        iframe.className = "video-iframe";
        iframe.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
        iframe.setAttribute("title", "Mento.IA");
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
        iframe.setAttribute("allowfullscreen", "");
        frame.appendChild(iframe);
        frame.classList.add("playing");
      };
      frame.addEventListener("click", load);
      if (btn) btn.addEventListener("click", function (e) { e.stopPropagation(); load(); });
    });
  }

  /* ---------- Demo modal ---------- */
  function initModal() {
    var modal = document.getElementById("demo-modal");
    if (!modal) return;
    var form = modal.querySelector("#demo-form");
    var success = modal.querySelector("[data-modal-success]");
    var lastFocus = null;
    function open() {
      lastFocus = document.activeElement;
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (form) form.hidden = false;
      if (success) success.hidden = true;
      var f = modal.querySelector("input"); if (f) setTimeout(function () { f.focus(); }, 60);
    }
    function close() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (form) form.reset();
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    document.querySelectorAll("[data-demo]").forEach(function (b) {
      b.addEventListener("click", function (e) { e.preventDefault(); open(); });
    });
    modal.querySelectorAll("[data-modal-close]").forEach(function (b) { b.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && modal.classList.contains("open")) close(); });
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      // Static prototype: deliver via the user's mail client to hola@mypathia.com
      var get = function (n) { var el = form.elements[n]; return el ? el.value.trim() : ""; };
      var nombre = get("nombre"), apellido = get("apellido"), colegio = get("colegio"),
          cargo = get("cargo"), pais = get("pais"), motivo = get("motivo");
      var lang = document.documentElement.getAttribute("lang") || "es";
      var L = {
        es: { subj: "Solicitud de demo · Mento.IA", intro: "Nueva solicitud de demo desde la web de Mento.IA:",
              nombre: "Nombre", apellido: "Apellido", colegio: "Colegio / institución", cargo: "Cargo", pais: "País", motivo: "Motivo", none: "(no indicado)" },
        en: { subj: "Demo request · Mento.IA", intro: "New demo request from the Mento.IA website:",
              nombre: "First name", apellido: "Last name", colegio: "School / institution", cargo: "Role", pais: "Country", motivo: "Reason", none: "(not provided)" },
        pt: { subj: "Pedido de demo · Mento.IA", intro: "Novo pedido de demo a partir do site da Mento.IA:",
              nombre: "Nome", apellido: "Apelido", colegio: "Escola / instituição", cargo: "Cargo", pais: "País", motivo: "Motivo", none: "(não indicado)" }
      }[lang] || null;
      var t = L || { subj: "Solicitud de demo · Mento.IA", intro: "Nueva solicitud de demo:", nombre: "Nombre", apellido: "Apellido", colegio: "Colegio / institución", cargo: "Cargo", pais: "País", motivo: "Motivo", none: "(no indicado)" };
      var body = t.intro + "\n\n" +
        t.nombre + ": " + nombre + "\n" +
        t.apellido + ": " + apellido + "\n" +
        t.colegio + ": " + colegio + "\n" +
        t.cargo + ": " + cargo + "\n" +
        t.pais + ": " + (pais || t.none) + "\n" +
        t.motivo + ": " + (motivo || t.none) + "\n";
      var href = "mailto:hola@mypathia.com" +
        "?subject=" + encodeURIComponent(t.subj) +
        "&body=" + encodeURIComponent(body);
      // open the mail client
      window.location.href = href;
      // show confirmation
      if (form) form.hidden = true;
      if (success) success.hidden = false;
    });
    window.__mentoOpenDemo = open;
  }

  /* ---------- Count-up numbers ---------- */
  function parseTarget(str) {
    // captures: prefix (non-digit), number (digits + . , separators), suffix
    var m = String(str).match(/^(\D*?)([\d][\d.,\s]*\d|\d)(\D*)$/);
    if (!m) return null;
    var prefix = m[1], raw = m[2], suffix = m[3];
    if (/[→<>/]/.test(suffix) || /[→<>/]/.test(prefix)) return null; // ranges like "12 → 18"
    var sepChar = (raw.match(/[.,](?=\d{3}\b)/) || [])[0] || "";
    var digits = raw.replace(/[.,\s]/g, "");
    return { prefix: prefix, value: parseInt(digits, 10), suffix: suffix, sep: sepChar };
  }
  function groupNum(n, sep) {
    if (!sep) return String(n);
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  }
  function animateCount(el) {
    var target = el.getAttribute("data-count-target") || el.textContent;
    el.setAttribute("data-count-target", target);
    var p = parseTarget(target);
    if (!p) { el.textContent = target; return; }
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { el.textContent = p.prefix + groupNum(p.value, p.sep) + p.suffix; return; }
    var dur = 1500, start = null;
    function step(ts) {
      if (start == null) start = ts;
      var t = Math.min((ts - start) / dur, 1);
      var e = 1 - Math.pow(1 - t, 3);
      var cur = Math.round(p.value * e);
      el.textContent = p.prefix + groupNum(cur, p.sep) + p.suffix;
      if (t < 1) requestAnimationFrame(step);
      else { el.classList.add("pop"); setTimeout(function(){ el.classList.remove("pop"); }, 520); }
    }
    requestAnimationFrame(step);
  }

  /* ---------- Scroll progress bar ---------- */
  function initProgress() {
    var bar = document.getElementById("scroll-progress");
    if (!bar) return;
    var onScroll = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? (h.scrollTop || window.scrollY) / max : 0;
      bar.style.width = (p * 100).toFixed(2) + "%";
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
  }

  function animateRing(el, target) {
    var start = null, dur = 1300;
    function step(ts) {
      if (start == null) start = ts;
      var t = Math.min((ts - start) / dur, 1);
      var e = 1 - Math.pow(1 - t, 3);
      el.style.setProperty("--p", (target * e).toFixed(1));
      var num = el.querySelector("[data-ring-num]");
      if (num) num.textContent = Math.round(target * e) + "%";
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Parallax (moves the whole bg layer, not the animated glows) ---------- */
  function initParallax() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var bg = document.querySelector(".hero .hero-bg");
    if (!bg) return;
    window.addEventListener("scroll", function () {
      bg.style.transform = "translateY(" + (window.scrollY * 0.18) + "px)";
    }, { passive: true });
  }

  /* ---------- 3D tilt (cult-ui style) ---------- */
  function initTilt() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      var max = parseFloat(el.getAttribute("data-tilt")) || 7;
      var raf = null;
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.style.transform = "perspective(1100px) rotateY(" + (px * max) + "deg) rotateX(" + (-py * max) + "deg)";
        });
      });
      el.addEventListener("pointerleave", function () {
        if (raf) cancelAnimationFrame(raf);
        el.style.transform = "";
      });
    });
  }

  /* ---------- Magnetic primary buttons ---------- */
  function initMagnetic() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;
    document.querySelectorAll(".btn-primary").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.18;
        var y = (e.clientY - r.top - r.height / 2) * 0.3;
        btn.style.transform = "translate(" + x + "px," + (y - 2) + "px)";
      });
      btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
    });
  }

  /* ---------- Hero intro ---------- */
  function initHero() {
    var hero = document.querySelector(".hero");
    if (hero) setTimeout(function () { hero.setAttribute("data-in", ""); }, 120);
  }

  /* ---------- Parallax glows ---------- */

  /* ---------- Tweaks panel ---------- */
  var TW = { palette: "brand", display: "Space Grotesk", body: "Quicksand" };
  function loadTweaks() {
    try { var s = JSON.parse(localStorage.getItem("mento.tweaks") || "{}"); Object.assign(TW, s); } catch (e) {}
  }
  function saveTweaks() { try { localStorage.setItem("mento.tweaks", JSON.stringify(TW)); } catch (e) {} }
  function applyTweaks() {
    document.documentElement.setAttribute("data-palette", TW.palette === "brand" ? "" : TW.palette);
    document.documentElement.style.setProperty("--display", '"' + TW.display + '", system-ui, sans-serif');
    document.documentElement.style.setProperty("--sans", '"' + TW.body + '", system-ui, sans-serif');
    document.documentElement.style.setProperty("--serif", '"' + TW.body + '", system-ui, sans-serif');
  }
  function initTweaks() {
    loadTweaks(); applyTweaks();
    var panel = document.getElementById("tweaks");
    if (!panel) return;
    panel.querySelectorAll("[data-tw]").forEach(function (btn) {
      var group = btn.dataset.tw, val = btn.dataset.val;
      btn.classList.toggle("active", TW[group] === val);
      btn.addEventListener("click", function () {
        TW[group] = val;
        panel.querySelectorAll('[data-tw="' + group + '"]').forEach(function (b) { b.classList.toggle("active", b === btn); });
        applyTweaks(); saveTweaks();
      });
    });
    var close = panel.querySelector(".tw-close");
    if (close) close.addEventListener("click", function () { setTweaksOpen(false); });
    // host protocol
    window.addEventListener("message", function (e) {
      var d = e.data;
      if (d && d.type === "tweaks:toggle") setTweaksOpen(!!d.value);
      if (d && d.type === "tweaks") setTweaksOpen(!!d.value);
    });
  }
  function setTweaksOpen(open) {
    var panel = document.getElementById("tweaks");
    if (panel) panel.classList.toggle("show", open);
  }
  // expose for the in-page gear (fallback when host bar absent)
  window.__mentoToggleTweaks = function () {
    var p = document.getElementById("tweaks");
    if (p) p.classList.toggle("show");
  };

  /* ---------- Persistent scroll FX loop (manifesto highlight + phase stack) ---------- */
  function initFxLoop() {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var manifesto = document.querySelector("[data-words]");
    if (reduce) {
      if (manifesto) manifesto.querySelectorAll(".w").forEach(function (w) { w.classList.add("on"); });
      return;
    }
    var slots = [].slice.call(document.querySelectorAll(".phase-slot"));
    var lastY = -1, lastN = -1;
    function tick() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var y = window.scrollY;
      if (y !== lastY) {
        lastY = y;
        // — manifesto word highlight —
        if (manifesto) {
          var r = manifesto.getBoundingClientRect();
          var p = (vh * 0.82 - r.top) / (r.height + vh * 0.42);
          p = Math.max(0, Math.min(1, p));
          var words = manifesto.querySelectorAll(".w");
          var n = Math.round(p * words.length);
          if (n !== lastN) {
            lastN = n;
            for (var i = 0; i < words.length; i++) words[i].classList.toggle("on", i < n);
          }
        }
        // — settle scale on covered phase cards —
        if (window.innerWidth > 860) {
          for (var s = 0; s < slots.length - 1; s++) {
            var card = slots[s].querySelector(".phasecard");
            var nextTop = slots[s + 1].getBoundingClientRect().top;
            var t = Math.max(0, Math.min(1, (vh * 0.6 - nextTop) / (vh * 0.5)));
            card.style.transform = t > 0 ? "scale(" + (1 - t * 0.045) + ")" : "";
            card.style.filter = t > 0 ? "brightness(" + (1 - t * 0.05) + ")" : "";
          }
        }
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Mobile nav ---------- */
  function initBurger() {
    var burger = document.querySelector(".nav-burger");
    var body = document.body;
    if (!burger) return;
    burger.addEventListener("click", function () { body.classList.toggle("nav-open"); });
    document.querySelectorAll(".nav-panel a").forEach(function (a) {
      a.addEventListener("click", function () { body.classList.remove("nav-open"); });
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    initLang(); initNav(); initReveals(); initHero(); initParallax(); initTweaks(); initProgress();
    initCarousel(); initVideo(); initModal(); initTilt(); initMagnetic(); initFxLoop(); initBurger();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
