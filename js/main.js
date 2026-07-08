/* ============================================================
   jooexploit — main.js  v2.1
   Interaction engine:
     • Interactive hero background + Three.js DevOps scene
     • Lenis smooth scroll (single rAF source)
     • GSAP + ScrollTrigger reveals
     • Hero character-level text animation
     • Orbital skills SVG constellation (pauses offscreen/on hover)
     • Accessible project accordion + tabs (ARIA, arrow keys)
     • Mouse-tracked border light on cards
     • Magnetic buttons · Animated counters · Timeline fill
     • Nav scroll spy + progress · Mobile nav · Preloader
   All motion respects prefers-reduced-motion.
   ============================================================ */

(() => {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ================================================================
     PRELOADER (with failsafe so the page can never stay covered)
     ================================================================ */
  const loader    = $("#loader");
  const loaderBar = $("#loaderBar");
  const loaderCap = $("#loaderCaption");
  const captions  = ["initializing...", "loading assets...", "almost ready..."];
  let capIdx = 0, progress = 0, loaderDone = false;

  const capInterval = setInterval(() => {
    capIdx = (capIdx + 1) % captions.length;
    if (loaderCap) loaderCap.textContent = captions[capIdx];
  }, 600);

  const tick = setInterval(() => {
    progress = Math.min(progress + Math.random() * 22, 88);
    if (loaderBar) loaderBar.style.width = progress + "%";
  }, 120);

  function finishLoader() {
    if (loaderDone) return;
    loaderDone = true;
    clearInterval(tick);
    clearInterval(capInterval);
    if (loaderCap) loaderCap.textContent = "ready.";
    if (loaderBar) loaderBar.style.width = "100%";
    setTimeout(() => {
      if (loader) loader.classList.add("is-done");
      startHeroAnimation();
    }, reduced ? 0 : 420);
  }

  if (document.readyState === "complete") finishLoader();
  else window.addEventListener("load", finishLoader);
  setTimeout(finishLoader, 5000); // failsafe: never trap the user behind the loader


  /* ================================================================
     LENIS SMOOTH SCROLL — single rAF source (GSAP ticker when present)
     ================================================================ */
  let lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new Lenis({
      duration: 1.15,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });
    if (window.gsap && window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(time => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  /* Anchor navigation — smooth scroll + focus management (a11y).
     Works with or without Lenis, so the skip link always functions. */
  $$("a[href^='#']").forEach(a => {
    a.addEventListener("click", e => {
      const id = a.getAttribute("href").slice(1);
      const target = id && document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -72 });
      else target.scrollIntoView(reduced ? {} : { behavior: "smooth" });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      history.replaceState(null, "", "#" + id);
    });
  });


  /* ================================================================
     HERO BACKGROUND — simple pointer-reactive grid, no shader.
     ================================================================ */
  function initHeroBackground() {
    const hero = $("#top");
    if (!hero || reduced) return;

    const pos = { x: 72, y: 42, tx: 72, ty: 42 };
    let rafId = 0, running = false;

    hero.addEventListener("pointermove", e => {
      const r = hero.getBoundingClientRect();
      pos.tx = ((e.clientX - r.left) / r.width) * 100;
      pos.ty = ((e.clientY - r.top) / r.height) * 100;
    }, { passive: true });

    hero.addEventListener("pointerleave", () => {
      pos.tx = 72;
      pos.ty = 42;
    }, { passive: true });

    function frame() {
      rafId = requestAnimationFrame(frame);
      pos.x += (pos.tx - pos.x) * .08;
      pos.y += (pos.ty - pos.y) * .08;
      hero.style.setProperty("--hero-x", pos.x.toFixed(2) + "%");
      hero.style.setProperty("--hero-y", pos.y.toFixed(2) + "%");
      hero.style.setProperty("--hero-grid-x", ((pos.x - 50) * -.16).toFixed(2) + "px");
      hero.style.setProperty("--hero-grid-y", ((pos.y - 50) * -.16).toFixed(2) + "px");
    }

    const start = () => { if (!running) { running = true; rafId = requestAnimationFrame(frame); } };
    const stop  = () => { running = false; cancelAnimationFrame(rafId); };

    new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden) ? start() : stop())
      .observe(hero);
    document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
  }

  initHeroBackground();


  /* ================================================================
     HERO THREE.JS DEVOPS OBJECT
     Decorative, draggable, and paused offscreen.
     ================================================================ */
  function initHeroThree() {
    const canvas = $("#hero-three");
    const wrap = $(".hero__scene");
    if (!canvas || !wrap) return;
    if (!window.THREE) {
      wrap.classList.add("is-fallback");
      return;
    }

    const T = window.THREE;
    let renderer = null;
    try {
      renderer = new T.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch (err) {
      console.warn("hero 3d:", err);
      wrap.classList.add("is-fallback");
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    if (T.sRGBEncoding) renderer.outputEncoding = T.sRGBEncoding;

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0.15, 6.8);

    // Optimized Lighting for Glass and Metals
    scene.add(new T.AmbientLight(0xffffff, 0.45));
    
    const keyLight = new T.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);
    
    const blueGlow = new T.PointLight(0x2563eb, 2.5, 12);
    blueGlow.position.set(-4, 3, 3);
    scene.add(blueGlow);

    const whiteGlow = new T.PointLight(0xa1a1aa, 1.5, 8);
    whiteGlow.position.set(4, -2, 2);
    scene.add(whiteGlow);

    const rig = new T.Group();
    rig.rotation.set(-0.06, -0.36, 0.0);
    scene.add(rig);

    // Premium Materials
    const darkMetalMat = new T.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.35,
      metalness: 0.85,
    });
    
    const glassMat = new T.MeshPhysicalMaterial({
      color: 0x111115,
      roughness: 0.15,
      metalness: 0.1,
      transmission: 0.65, // translucent glass effect
      thickness: 0.6,
      transparent: true,
      opacity: 0.75,
    });

    const activeBlueMat = new T.MeshStandardMaterial({
      color: 0x2563eb,
      emissive: 0x2563eb,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.3,
    });

    const pulseGreenMat = new T.MeshStandardMaterial({
      color: 0x16a34a,
      emissive: 0x16a34a,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });

    const lineMat = new T.LineBasicMaterial({
      color: 0x2563eb,
      transparent: true,
      opacity: 0.35,
    });

    // Helper: draw wireframe edges for glass structures
    function addEdges(mesh, color = 0x27272a, opacity = 0.5) {
      const geo = new T.EdgesGeometry(mesh.geometry);
      const mat = new T.LineBasicMaterial({ color, transparent: true, opacity });
      const wire = new T.LineSegments(geo, mat);
      mesh.add(wire);
      return wire;
    }

    // Helper: Box mesh
    function box(w, h, d, x, y, z, mat, parent = rig) {
      const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
      mesh.position.set(x, y, z);
      parent.add(mesh);
      return mesh;
    }

    // 1. THE SERVER CABINET (CI/CD Mainframe)
    const serverCabinet = new T.Group();
    serverCabinet.position.set(-1.4, -0.1, 0);
    rig.add(serverCabinet);

    // Glass Outer Shell
    const shell = box(1.3, 2.5, 1.1, 0, 0, 0, glassMat, serverCabinet);
    addEdges(shell, 0x2563eb, 0.25);

    // Horizontal Server Slabs
    const serverBlades = [];
    const serverLEDs = [];
    for (let i = 0; i < 5; i++) {
      const y = (i - 2) * 0.42;
      // Main blade frame
      const blade = box(1.15, 0.22, 0.95, 0, y, 0, darkMetalMat, serverCabinet);
      addEdges(blade, 0x27272a, 0.4);
      serverBlades.push(blade);

      // Blinking LEDs on blade front
      const ledsForBlade = [];
      for (let j = 0; j < 3; j++) {
        const lx = -0.42 + j * 0.18;
        const led = new T.Mesh(
          new T.SphereGeometry(0.032, 8, 8),
          j === 0 ? activeBlueMat : pulseGreenMat
        );
        led.position.set(lx, 0.0, 0.49); // place on the front face of blade
        blade.add(led);
        ledsForBlade.push(led);
      }
      serverLEDs.push(ledsForBlade);
    }

    // 2. KUBERNETES CONTAINERS (Floating Cloud Pods)
    const podsGroup = new T.Group();
    podsGroup.position.set(1.4, -0.1, 0);
    rig.add(podsGroup);

    const pods = [];
    const podCores = [];
    const podPositions = [
      { x: -0.4, y: 0.5, z: 0 },
      { x: 0.4, y: -0.1, z: 0.3 },
      { x: -0.2, y: -0.7, z: -0.2 }
    ];

    podPositions.forEach((pos, idx) => {
      const pod = box(0.68, 0.52, 0.68, pos.x, pos.y, pos.z, glassMat, podsGroup);
      addEdges(pod, 0x2563eb, 0.35);
      pods.push(pod);

      // Glowing core inside pod
      const coreMat = new T.MeshStandardMaterial({
        color: idx % 2 === 0 ? 0x2563eb : 0x0ea5e9,
        emissive: idx % 2 === 0 ? 0x2563eb : 0x0ea5e9,
        emissiveIntensity: 0.9,
        roughness: 0.1,
      });
      const core = new T.Mesh(new T.SphereGeometry(0.14, 16, 16), coreMat);
      core.position.set(0, 0, 0);
      pod.add(core);
      podCores.push(core);
    });

    // 3. DEVOPS INFINITY PIPELINE (Lemniscate of Bernoulli in 3D)
    const loopPoints = [];
    const segments = 100;
    const loopScaleX = 2.4;
    const loopScaleY = 1.3;
    
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const denom = 1 + Math.sin(t) * Math.sin(t);
      const x = (loopScaleX * Math.cos(t)) / denom;
      const y = (loopScaleY * Math.sin(t) * Math.cos(t)) / denom;
      const z = Math.sin(t * 2) * 0.45; // elegant 3D wave
      loopPoints.push(new T.Vector3(x, y, z));
    }

    const infinityCurve = new T.CatmullRomCurve3(loopPoints);
    const curvePoints = infinityCurve.getPoints(100);
    const loopGeo = new T.BufferGeometry().setFromPoints(curvePoints);
    const loopLine = new T.Line(loopGeo, lineMat);
    rig.add(loopLine);

    // Flowing Data Particles
    const particles = [];
    const numParticles = 8;
    for (let i = 0; i < numParticles; i++) {
      const pGeo = new T.SphereGeometry(0.045, 12, 12);
      const pMat = new T.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x2563eb : 0xfafafa,
        transparent: true,
        opacity: 0.9,
      });
      const pMesh = new T.Mesh(pGeo, pMat);
      rig.add(pMesh);
      particles.push({
        mesh: pMesh,
        progress: i / numParticles,
      });
    }

    // 4. FLOATING TOPOLOGY NETWORK NODES
    const nodePoints = [
      new T.Vector3(-1.4, 1.4, -0.4),
      new T.Vector3(-0.2, 1.6, 0.4),
      new T.Vector3(1.2, 1.3, -0.2),
      new T.Vector3(1.5, -1.3, 0.3),
      new T.Vector3(-0.1, -1.5, -0.4),
      new T.Vector3(-1.5, -1.4, 0.2),
    ];

    const nodes = [];
    nodePoints.forEach((p, idx) => {
      const nSize = idx % 2 === 0 ? 0.08 : 0.06;
      const nMat = new T.MeshStandardMaterial({
        color: idx % 2 === 0 ? 0x2563eb : 0xfaafa,
        emissive: idx % 2 === 0 ? 0x2563eb : 0xfaafa,
        emissiveIntensity: 0.6,
        roughness: 0.3,
      });
      const nMesh = new T.Mesh(new T.SphereGeometry(nSize, 12, 12), nMat);
      nMesh.position.copy(p);
      rig.add(nMesh);
      nodes.push(nMesh);
    });

    // Connect nodes with lines
    const pipePoints = [];
    for (let i = 0; i < nodePoints.length; i++) {
      pipePoints.push(nodePoints[i]);
      pipePoints.push(nodePoints[(i + 1) % nodePoints.length]);
    }
    const pipeGeo = new T.BufferGeometry().setFromPoints(pipePoints);
    const pipeLines = new T.LineSegments(pipeGeo, new T.LineBasicMaterial({
      color: 0x3f3f46,
      transparent: true,
      opacity: 0.4,
    }));
    rig.add(pipeLines);

    // Pointer, dragging & rotation controls
    const target = { x: -0.06, y: -0.36 };
    const drag = { active: false, x: 0, y: 0, rx: 0, ry: 0 };

    function setPointerTarget(e) {
      const r = wrap.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) - 0.5;
      const py = ((e.clientY - r.top) / r.height) - 0.5;
      target.y = -0.36 + px * 0.45;
      target.x = -0.06 - py * 0.28;
    }

    wrap.addEventListener("pointermove", e => {
      if (drag.active) {
        target.y = drag.ry + (e.clientX - drag.x) * 0.006;
        target.x = drag.rx + (e.clientY - drag.y) * 0.005;
      } else {
        setPointerTarget(e);
      }
    }, { passive: true });

    wrap.addEventListener("pointerdown", e => {
      if (e.button !== 0) return;
      drag.active = true;
      drag.x = e.clientX;
      drag.y = e.clientY;
      drag.rx = target.x;
      drag.ry = target.y;
      wrap.classList.add("is-dragging");
      wrap.setPointerCapture(e.pointerId);
    });

    function endDrag(e) {
      if (!drag.active) return;
      drag.active = false;
      wrap.classList.remove("is-dragging");
      try { wrap.releasePointerCapture(e.pointerId); } catch (_) {}
    }

    wrap.addEventListener("pointerup", endDrag);
    wrap.addEventListener("pointercancel", endDrag);
    wrap.addEventListener("lostpointercapture", () => {
      drag.active = false;
      wrap.classList.remove("is-dragging");
    });

    function resize() {
      const r = wrap.getBoundingClientRect();
      const w = Math.max(1, Math.round(r.width));
      const h = Math.max(1, Math.round(r.height));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    wrap.classList.add("is-ready");

    let rafId = 0, running = false, last = 0, time = 0;
    
    function frame(now) {
      rafId = requestAnimationFrame(frame);
      const dt = last ? Math.min(now - last, 32) : 16;
      last = now;
      time += dt * 0.001;

      // Smooth inertia rotation to target
      rig.rotation.x += (target.x - rig.rotation.x) * 0.06;
      rig.rotation.y += (target.y - rig.rotation.y) * 0.06;
      rig.rotation.z = Math.sin(time * 0.35) * 0.025; // gentle roll

      // 1. Animate server LED blinks
      serverLEDs.forEach((bladeLEDs, bladeIdx) => {
        bladeLEDs.forEach((led, ledIdx) => {
          // Blinking sequence: off/on patterns over time
          const pulseSpeed = 1.8 + ledIdx * 0.4 + bladeIdx * 0.3;
          const brightness = 0.2 + Math.abs(Math.sin(time * pulseSpeed + bladeIdx)) * 0.8;
          led.material.emissiveIntensity = brightness;
        });
      });

      // 2. Animate container cores (breathing effect)
      podCores.forEach((core, idx) => {
        const pulse = 1.2 + idx * 0.5;
        const scale = 0.75 + Math.sin(time * pulse + idx) * 0.25;
        core.scale.setScalar(scale);
      });
      podsGroup.rotation.y = Math.sin(time * 0.6) * 0.06;
      serverCabinet.rotation.y = Math.cos(time * 0.54) * 0.04;

      // 3. Animate pipeline particles along the infinity curve
      particles.forEach(p => {
        p.progress += dt * 0.00007; // flow speed
        if (p.progress > 1) p.progress -= 1;
        const pt = infinityCurve.getPointAt(p.progress);
        p.mesh.position.copy(pt);
      });

      // 4. Animate network nodes (subtle floating & pulse)
      nodes.forEach((n, idx) => {
        const floatSpeed = 1.5 + idx * 0.3;
        n.position.y = nodePoints[idx].y + Math.sin(time * floatSpeed) * 0.04;
        n.material.emissiveIntensity = 0.4 + Math.sin(time * 2.5 + idx) * 0.3;
      });

      // Slow rotate the infinity loop to show 3D depth
      loopLine.rotation.y = time * 0.025;

      renderer.render(scene, camera);
    }

    const start = () => {
      if (!running && !reduced) {
        running = true;
        last = 0;
        rafId = requestAnimationFrame(frame);
      }
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };

    canvas.addEventListener("webglcontextlost", e => { e.preventDefault(); stop(); });
    new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden) ? start() : stop())
      .observe(wrap);
    document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
    renderer.render(scene, camera);
  }

  initHeroThree();


  /* ================================================================
     HERO TEXT ANIMATION (GSAP character-level)
     The h1 keeps its aria-label; injected char spans are aria-hidden.
     ================================================================ */
  function startHeroAnimation() {
    const eyebrow = $("#heroEyebrow");
    if (eyebrow) eyebrow.classList.add("is-visible");

    if (!window.gsap || reduced) {
      $$(".hero__chars").forEach(el => el.classList.add("is-visible"));
      ["#heroSub", "#heroCta", "#heroStats"].forEach(sel => {
        const el = $(sel);
        if (el) el.classList.add("is-visible");
      });
      return;
    }

    const titleEl = $("#heroTitle");
    if (titleEl) {
      $$(".hero__chars", titleEl).forEach(span => {
        let html = "";
        const charSpan = ch => ch === " "
          ? `<span class="hero__char" aria-hidden="true">&nbsp;</span>`
          : `<span class="hero__char" aria-hidden="true">${ch}</span>`;
        const parts = span.innerHTML.split(/(<em[^>]*>.*?<\/em>)/);
        parts.forEach(part => {
          if (part.startsWith("<em")) {
            const emMatch = part.match(/<em[^>]*>(.*?)<\/em>/);
            if (emMatch) {
              html += `<em class="accent-em">`;
              [...emMatch[1]].forEach(ch => { html += charSpan(ch); });
              html += `</em>`;
            }
          } else {
            [...part].forEach(ch => { html += charSpan(ch); });
          }
        });
        span.innerHTML = html;
        span.classList.add("is-visible");
      });
    }

    gsap.from(".hero__char", {
      y: 90,
      opacity: 0,
      rotateX: -25,
      stagger: { amount: 0.55, from: "start" },
      duration: 0.75,
      ease: "power4.out",
      delay: 0.15,
      onComplete() {
        ["#heroSub", "#heroCta", "#heroStats"].forEach(sel => {
          const el = $(sel);
          if (el) el.classList.add("is-visible");
        });
      },
    });
  }


  /* ================================================================
     SCROLL REVEALS — GSAP batch, with IO + reduced-motion fallbacks
     ================================================================ */
  function initReveals() {
    const items = $$("[data-reveal]");
    if (reduced) {
      items.forEach(el => el.classList.add("is-visible"));
      return;
    }
    if (!window.gsap || !window.ScrollTrigger) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
      items.forEach(el => io.observe(el));
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.batch("[data-reveal]", {
      onEnter: batch => gsap.to(batch, {
        opacity: 1,
        y: 0,
        stagger: { each: .08 },
        duration: .9,
        ease: "power3.out",
        overwrite: true,
      }),
      start: "top 88%",
      once: true,
    });
  }

  initReveals();

  /* Timeline items */
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        revealIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });
  $$(".tl-item").forEach(el => revealIO.observe(el));

  /* Arc steps stagger (was querying [data-arc-step], which never existed) */
  const arcIO = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    $$(".arc__step").forEach((step, i) => {
      setTimeout(() => step.classList.add("is-visible"), reduced ? 0 : i * 120);
    });
    arcIO.disconnect();
  }, { threshold: 0.2 });
  const arcSteps = $("#arcSteps");
  if (arcSteps) arcIO.observe(arcSteps);


  /* ================================================================
     ANIMATED COUNTERS
     ================================================================ */
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.count, dur = 1400;
      countIO.unobserve(el);
      if (reduced || !Number.isFinite(target)) { el.textContent = target; return; }
      const t0 = performance.now();
      (function step(ts) {
        const p = Math.min((ts - t0) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }, { threshold: 0.5 });
  $$("[data-count]").forEach(el => countIO.observe(el));


  /* ================================================================
     NAV STATE + SCROLL PROGRESS + SECTION SPY + TIMELINE FILL
     ================================================================ */
  const nav          = $("#nav");
  const progressBar  = $("#progressBar");
  const spyLinks     = $$("[data-spy]");
  const sections     = spyLinks.map(a => $(a.getAttribute("href"))).filter(Boolean);
  const timelineEl   = $("#timeline");
  const timelineFill = $("#timelineFill");
  let scrollQueued   = false;

  function onScroll() {
    scrollQueued = false;
    const y   = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;

    if (nav) nav.classList.toggle("is-scrolled", y > 28);
    if (progressBar) progressBar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";

    if (timelineEl && timelineFill) {
      const r = timelineEl.getBoundingClientRect();
      const p = Math.min(Math.max((innerHeight * 0.65 - r.top) / r.height, 0), 1);
      timelineFill.style.height = (p * 100) + "%";
    }

    let active = null;
    for (const s of sections)
      if (s.getBoundingClientRect().top <= innerHeight * 0.45) active = s.id;
    spyLinks.forEach(a =>
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + active));

    // Update side dots navigation active state dynamically
    const sideDotsList = $$(".side-slider__dot");
    let activeDot = "top";
    const sectionIds = ["top", "about", "journey", "work", "skills", "library", "contact"];
    for (const id of sectionIds) {
      const el = $("#" + id);
      if (el && el.getBoundingClientRect().top <= innerHeight * 0.45) {
        activeDot = id;
      }
    }
    sideDotsList.forEach(dot => {
      dot.classList.toggle("is-active", dot.getAttribute("data-dot") === activeDot);
    });
  }

  window.addEventListener("scroll", () => {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();


  /* ================================================================
     MOBILE NAV
     ================================================================ */
  const navToggle = $("#navToggle");
  if (nav && navToggle) {
    const closeMenu = () => {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    };
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    $$(".nav__links a").forEach(a => a.addEventListener("click", closeMenu));
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        closeMenu();
        navToggle.focus();
      }
    });
  }


  /* ================================================================
     MAGNETIC BUTTONS (pointer: fine only)
     ================================================================ */
  if (!reduced && matchMedia("(pointer: fine)").matches) {
    $$("[data-magnetic]").forEach(btn => {
      btn.addEventListener("pointermove", e => {
        const r = btn.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width  - .5) * 12;
        const y = ((e.clientY - r.top)  / r.height - .5) * 9;
        btn.style.transform = `translate(${x}px,${y}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }


  /* ================================================================
     CARD BORDER LIGHT (mouse tracking)
     ================================================================ */
  $$(".card, .project-card, .library-soon").forEach(card => {
    card.addEventListener("pointermove", e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top)  + "px");
    }, { passive: true });
  });


  /* ================================================================
     PROJECT CARD ACCORDION + ACCESSIBLE TABS
     ================================================================ */
  function initProjects() {
    /* Bootstrap ARIA + initial state (progressive enhancement) */
    $$(".project-detail").forEach(detail => {
      detail.hidden = true;
      const tabNav = $(".project-tabs", detail);
      const tabs   = $$(".project-tab", detail);
      const panels = $$(".project-panel", detail);
      if (tabNav && !tabNav.getAttribute("role")) tabNav.setAttribute("role", "tablist");
      tabs.forEach((tab, i) => {
        const panel = panels[i];
        if (!panel) return;
        if (!panel.id) panel.id = `${detail.id}-panel-${tab.dataset.tab || i}`;
        if (!panel.dataset.panel) panel.dataset.panel = tab.dataset.tab || String(i);
        panel.setAttribute("role", "tabpanel");
        if (tab.id) panel.setAttribute("aria-labelledby", tab.id);
        panel.hidden = !panel.classList.contains("is-active");
        tab.setAttribute("aria-controls", panel.id);
        tab.tabIndex = tab.classList.contains("is-active") ? 0 : -1;
      });
    });

    /* Accordion */
    $$(".project-expand").forEach(btn => {
      btn.addEventListener("click", () => {
        const detail = $(`#detail-${btn.dataset.project}`);
        if (!detail) return;
        const label  = $(".project-expand__label", btn);
        const isOpen = btn.getAttribute("aria-expanded") === "true";

        if (isOpen) {
          btn.setAttribute("aria-expanded", "false");
          if (label) label.textContent = "View Case Study";
          if (!reduced && window.gsap) {
            gsap.to(detail, {
              height: 0,
              duration: .4,
              ease: "power3.in",
              onComplete() { detail.hidden = true; detail.style.height = ""; },
            });
          } else {
            detail.hidden = true;
          }
        } else {
          /* Close any other open case study first */
          $$(".project-expand[aria-expanded='true']").forEach(other => {
            if (other !== btn) other.click();
          });

          detail.hidden = false;
          btn.setAttribute("aria-expanded", "true");
          if (label) label.textContent = "Close Case Study";

          if (!reduced && window.gsap) {
            gsap.fromTo(detail, { height: 0 }, {
              height: detail.scrollHeight,
              duration: .5,
              ease: "power3.out",
              onComplete() { detail.style.height = "auto"; },
            });
          }
        }
      });
    });

    /* Tabs — click + arrow-key navigation with roving tabindex */
    function activateTab(tabNav, tab) {
      const detail = tabNav.closest(".project-detail");
      if (!detail) return;
      $$(".project-tab", tabNav).forEach(t => {
        const active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
        t.tabIndex = active ? 0 : -1;
      });
      $$(".project-panel", detail).forEach(p => {
        const match = p.dataset.panel === tab.dataset.tab;
        p.classList.toggle("is-active", match);
        p.hidden = !match;
      });
      /* Keep the accordion height in sync if it is open and auto-sized */
      if (!detail.hidden && detail.style.height && detail.style.height !== "auto") {
        detail.style.height = "auto";
      }
    }

    $$(".project-tabs").forEach(tabNav => {
      tabNav.addEventListener("click", e => {
        const tab = e.target.closest(".project-tab");
        if (tab) activateTab(tabNav, tab);
      });
      tabNav.addEventListener("keydown", e => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
        const tabs = $$(".project-tab", tabNav);
        const i = tabs.indexOf(document.activeElement);
        if (i < 0) return;
        e.preventDefault();
        let n = e.key === "ArrowLeft"  ? i - 1
              : e.key === "ArrowRight" ? i + 1
              : e.key === "Home"       ? 0
              : tabs.length - 1;
        n = (n + tabs.length) % tabs.length;
        tabs[n].focus();
        activateTab(tabNav, tabs[n]);
      });
    });
  }

  initProjects();


  /* ================================================================
     INTERACTIVE SKILLS CONSTELLATION (SVG)
     Nodes can be dragged or nudged with arrow keys. Orbit pauses
     offscreen and while the tab is hidden.
     ================================================================ */
  function initSkills() {
    const SVGNS   = "http://www.w3.org/2000/svg";
    const svg     = $("#skillsSvg");
    const linesG  = $("#skill-lines");
    const hubG    = $("#skill-hub");
    const nodesG  = $("#skill-nodes");
    const tooltip = $("#skillTooltip");
    const tipName = $("#tooltipName");
    const tipList = $("#tooltipList");
    const stage   = $(".skills-stage");
    if (!svg || !linesG || !hubG || !nodesG) return;
    if (tooltip) tooltip.classList.remove("is-active");

    const skills = [
      { id: "devops",     label: "DevOps",     tech: ["Docker", "CI/CD", "Kubernetes", "IaC"] },
      { id: "cloud",      label: "Cloud",      tech: ["AWS", "Azure", "Infrastructure"] },
      { id: "linux",      label: "Linux",      tech: ["Containers", "System Administration", "Networking"] },
      { id: "automation", label: "Automation", tech: ["Python", "Bash", "Bots & Agents", "Pipelines"] },
      { id: "backend",    label: "Backend",    tech: ["APIs", "Authentication", "Databases"] },
      { id: "frontend",   label: "Frontend",   tech: ["React", "TypeScript", "Design Systems"] },
      { id: "security",   label: "Security",   tech: ["Penetration Testing", "Security Auditing", "Hardening"] },
      { id: "ai",         label: "AI",         tech: ["LLMs", "Autonomous Agents", "Workflows"] },
      { id: "education",  label: "Education",  tech: ["Technical Writing", "LMS Platforms", "Documentation"] },
    ];

    const CX = 320, CY = 240;
    const inner  = skills.slice(0, 3);
    const middle = skills.slice(3, 7);
    const outer  = skills.slice(7);
    
    const rings = [
      { items: inner,  r: 96,  a0: -Math.PI / 2,                        speed:  0.06 },
      { items: middle, r: 168, a0: -Math.PI / 2 + Math.PI / 4,           speed:  0.06 },
      { items: outer,  r: 224, a0: -Math.PI / 2 + Math.PI / 2,           speed:  0.06 },
    ];

    // Hub node representation
    const hub = {
      id: "hub",
      label: "jooexploit",
      isHub: true,
      x: CX,
      y: CY,
      prevX: CX,
      prevY: CY,
      vx: 0,
      vy: 0,
      mass: 8.0,
      radius: 52,
      currentRadius: 52,
      targetRadius: 52,
      depth: 1.35,
      _group: hubG
    };

    const allNodes = [hub];
    let activeSkill = null;
    let draggedNode = null;
    let dragOffset = { x: 0, y: 0 };
    let mouseX = null;
    let mouseY = null;
    let orbit = 0;
    let camX = 0;
    let camY = 0;

    function svgPoint(e) {
      const ctm = svg.getScreenCTM();
      if (!ctm) return null;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      return pt.matrixTransform(ctm.inverse());
    }

    function positionTip(svgX, svgY, depth) {
      if (!stage || !tooltip) return;
      const rx = svgX + camX * (depth - 1.0);
      const ry = svgY + camY * (depth - 1.0);
      
      const svgRect   = svg.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const vb = svg.viewBox.baseVal;
      const scaleX = svgRect.width  / vb.width;
      const scaleY = svgRect.height / vb.height;
      const px = (rx - vb.x) * scaleX + svgRect.left - stageRect.left;
      const py = (ry - vb.y) * scaleY + svgRect.top  - stageRect.top;
      tooltip.style.left = px + 16 + "px";
      tooltip.style.top  = py - 16 + "px";
    }

    function showTip(skill) {
      if (!tooltip || !tipName || !tipList) return;
      tipName.textContent = skill.label;
      tipList.replaceChildren(...skill.tech.map(t => {
        const li = document.createElement("li");
        li.textContent = t;
        return li;
      }));
      tooltip.classList.add("is-active");
      positionTip(skill.x, skill.y, skill.depth);
    }

    function hideTip(skill) {
      if (draggedNode === skill) return;
      if (activeSkill === skill) return;
      if (tooltip) tooltip.classList.remove("is-active");
    }

    // Initialize all skill nodes
    rings.forEach(ring => {
      ring.items.forEach((skill, i) => {
        const a = ring.a0 + (i / ring.items.length) * (Math.PI * 2);
        const x = CX + Math.cos(a) * ring.r;
        const y = CY + Math.sin(a) * ring.r;
        
        skill.isHub = false;
        skill.initialAngle = a;
        skill.ringRadius = ring.r;
        skill.speed = ring.speed;
        
        skill.x = x;
        skill.y = y;
        skill.prevX = x;
        skill.prevY = y;
        skill.vx = 0;
        skill.vy = 0;
        skill.mass = 1.0;
        skill.radius = 28;
        skill.currentRadius = 28;
        skill.targetRadius = 28;
        skill.phase = Math.random() * Math.PI * 2;
        
        // Depth parallax configuration
        if (ring.r === 96) skill.depth = 1.15;
        else if (ring.r === 168) skill.depth = 0.95;
        else skill.depth = 0.75;

        // Line creation
        const line = document.createElementNS(SVGNS, "line");
        line.setAttribute("x1", CX); line.setAttribute("y1", CY);
        line.setAttribute("x2", x);  line.setAttribute("y2", y);
        line.classList.add("skill-line");
        linesG.appendChild(line);
        skill._line = line;

        // Group creation
        const g = document.createElementNS(SVGNS, "g");
        g.classList.add("skill-group");
        g.setAttribute("role", "button");
        g.setAttribute("tabindex", "0");
        g.setAttribute("aria-label", `${skill.label}: ${skill.tech.join(", ")}`);
        g.setAttribute("transform", `translate(${x} ${y})`);

        // Node circle
        const circle = document.createElementNS(SVGNS, "circle");
        circle.setAttribute("cx", 0); circle.setAttribute("cy", 0);
        circle.setAttribute("r", 28);
        circle.setAttribute("filter", "url(#node-shadow)");
        circle.classList.add("skill-circle");
        g.appendChild(circle);

        // Node label
        const text = document.createElementNS(SVGNS, "text");
        text.setAttribute("x", 0); text.setAttribute("y", 4);
        text.classList.add("skill-label");
        text.textContent = skill.label;
        g.appendChild(text);

        skill._group  = g;
        skill._circle = circle;
        skill._text   = text;

        // Interactivity
        g.addEventListener("mouseenter", () => {
          activeSkill = skill;
          skill.targetRadius = 34;
          showTip(skill);
        });
        g.addEventListener("mouseleave", () => {
          if (activeSkill === skill) {
            activeSkill = null;
            hideTip(skill);
          }
          skill.targetRadius = 28;
        });
        g.addEventListener("focus", () => {
          activeSkill = skill;
          skill.targetRadius = 34;
          showTip(skill);
        });
        g.addEventListener("blur", () => {
          if (activeSkill === skill) {
            activeSkill = null;
            hideTip(skill);
          }
          skill.targetRadius = 28;
        });
        g.addEventListener("keydown", e => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            activeSkill === skill ? hideTip(skill) : showTip(skill);
          } else if (e.key === "Escape") {
            hideTip(skill);
          } else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
            e.preventDefault();
            const step = e.shiftKey ? 18 : 8;
            const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
            const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
            skill.x += dx;
            skill.y += dy;
            skill.vx = 0;
            skill.vy = 0;
            showTip(skill);
          }
        });

        nodesG.appendChild(g);
        allNodes.push(skill);
      });
    });

    // Hub events
    hubG.addEventListener("mouseenter", () => {
      hub.targetRadius = 56;
    });
    hubG.addEventListener("mouseleave", () => {
      hub.targetRadius = 52;
    });

    // Pointer event listeners on SVG for dragging
    svg.addEventListener("pointerdown", e => {
      const nodeG = e.target.closest(".skill-group");
      const isHubClick = e.target.closest("#skill-hub");
      
      if (!nodeG && !isHubClick) return;
      
      const p = svgPoint(e);
      if (!p) return;
      
      e.preventDefault();
      
      if (isHubClick) {
        draggedNode = hub;
        hubG.classList.add("is-dragging");
      } else {
        const skill = skills.find(s => s._group === nodeG);
        if (skill) {
          draggedNode = skill;
          nodeG.classList.add("is-dragging");
          showTip(skill);
        }
      }
      
      if (draggedNode) {
        dragOffset.x = p.x - draggedNode.x;
        dragOffset.y = p.y - draggedNode.y;
        draggedNode.isDragging = true;
        svg.setPointerCapture(e.pointerId);
      }
    });

    svg.addEventListener("pointermove", e => {
      const p = svgPoint(e);
      if (p) {
        mouseX = p.x;
        mouseY = p.y;
      }
      
      if (draggedNode && draggedNode.isDragging) {
        e.preventDefault();
        if (p) {
          draggedNode.x = p.x - dragOffset.x;
          draggedNode.y = p.y - dragOffset.y;
        }
      }
    });

    function endDrag(e) {
      if (!draggedNode) return;
      
      if (draggedNode.isHub) {
        hubG.classList.remove("is-dragging");
      } else {
        draggedNode._group.classList.remove("is-dragging");
        // Save new relative position so it stays where it is dropped
        const dx = draggedNode.x - hub.x;
        const dy = draggedNode.y - hub.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        draggedNode.ringRadius = Math.max(60, Math.min(dist, 250));
        const angle = Math.atan2(dy, dx);
        draggedNode.initialAngle = angle - orbit * draggedNode.speed;
      }
      
      draggedNode.isDragging = false;
      draggedNode = null;
      try { svg.releasePointerCapture(e.pointerId); } catch (_) {}
    }

    svg.addEventListener("pointerup", endDrag);
    svg.addEventListener("pointercancel", endDrag);
    svg.addEventListener("lostpointercapture", () => {
      if (draggedNode) {
        if (draggedNode.isHub) {
          hubG.classList.remove("is-dragging");
        } else {
          draggedNode._group.classList.remove("is-dragging");
          const dx = draggedNode.x - hub.x;
          const dy = draggedNode.y - hub.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          draggedNode.ringRadius = Math.max(60, Math.min(dist, 250));
          const angle = Math.atan2(dy, dx);
          draggedNode.initialAngle = angle - orbit * draggedNode.speed;
        }
        draggedNode.isDragging = false;
        draggedNode = null;
      }
    });

    svg.addEventListener("pointerleave", () => {
      mouseX = null;
      mouseY = null;
    });

    // Render loop and IntersectionObserver
    if (reduced) {
      // If prefers-reduced-motion is active, render statically
      hubG.setAttribute("transform", `translate(${CX} ${CY})`);
      skills.forEach(skill => {
        skill._group.setAttribute("transform", `translate(${skill.x} ${skill.y})`);
        skill._line.setAttribute("x1", CX);
        skill._line.setAttribute("y1", CY);
        skill._line.setAttribute("x2", skill.x);
        skill._line.setAttribute("y2", skill.y);
      });
    } else {
      let rafId = 0, running = false, lastTime = 0;

      function step(now) {
        rafId = requestAnimationFrame(step);
        if (!lastTime) lastTime = now;
        let dt = (now - lastTime) / 16.666;
        lastTime = now;
        
        if (dt > 3.0) dt = 1.0; // Prevent huge lag spikes from breaking physics

        orbit += 0.003 * dt;

        // 1. Update Hub Physics
        if (hub.isDragging) {
          hub.vx = (hub.x - hub.prevX) / dt;
          hub.vy = (hub.y - hub.prevY) / dt;
          let speed = Math.hypot(hub.vx, hub.vy);
          if (speed > 35) {
            hub.vx = (hub.vx / speed) * 35;
            hub.vy = (hub.vy / speed) * 35;
          }
        } else {
          // Restore to center spring force
          let dx = CX - hub.x;
          let dy = CY - hub.y;
          hub.vx += dx * 0.025 * dt;
          hub.vy += dy * 0.025 * dt;
          
          // Organic hub floating
          hub.vx += Math.sin(now * 0.0008) * 0.015 * dt;
          hub.vy += Math.cos(now * 0.0006) * 0.015 * dt;
          
          hub.x += hub.vx * dt;
          hub.y += hub.vy * dt;
        }
        hub.prevX = hub.x;
        hub.prevY = hub.y;
        
        hub.vx *= Math.pow(0.92, dt);
        hub.vy *= Math.pow(0.92, dt);

        // 2. Update Skill Nodes Physics
        skills.forEach(skill => {
          if (skill.isDragging) {
            skill.vx = (skill.x - skill.prevX) / dt;
            skill.vy = (skill.y - skill.prevY) / dt;
            let speed = Math.hypot(skill.vx, skill.vy);
            if (speed > 35) {
              skill.vx = (skill.vx / speed) * 35;
              skill.vy = (skill.vy / speed) * 35;
            }
          } else {
            // Target circular orbit position around the hub
            const baseAngle = skill.initialAngle + orbit * skill.speed;
            const tx = hub.x + Math.cos(baseAngle) * skill.ringRadius;
            const ty = hub.y + Math.sin(baseAngle) * skill.ringRadius;
            
            // Soft spring pull circular orbital anchor
            const dx = tx - skill.x;
            const dy = ty - skill.y;
            skill.vx += dx * 0.06 * dt;
            skill.vy += dy * 0.06 * dt;
            
            // Gentle breathing noise
            skill.vx += Math.sin(now * 0.001 + skill.phase) * 0.02 * dt;
            skill.vy += Math.cos(now * 0.0008 + skill.phase) * 0.02 * dt;

            // Subtle mouse attraction ONLY on the hovered/active node
            if (activeSkill === skill && mouseX !== null && mouseY !== null) {
              let mdx = mouseX - skill.x;
              let mdy = mouseY - skill.y;
              skill.vx += mdx * 0.012 * dt;
              skill.vy += mdy * 0.012 * dt;
            }

            skill.x += skill.vx * dt;
            skill.y += skill.vy * dt;
          }
          skill.prevX = skill.x;
          skill.prevY = skill.y;
          
          skill.vx *= Math.pow(0.93, dt);
          skill.vy *= Math.pow(0.93, dt);
        });

        // 3. Collision Resolution (Elastic bounces)
        for (let i = 0; i < allNodes.length; i++) {
          for (let j = i + 1; j < allNodes.length; j++) {
            const nA = allNodes[i];
            const nB = allNodes[j];
            
            const dx = nB.x - nA.x;
            const dy = nB.y - nA.y;
            const dist = Math.hypot(dx, dy) || 0.001;
            const minDist = nA.currentRadius + nB.currentRadius;
            
            if (dist < minDist) {
              const overlap = minDist - dist;
              const nx = dx / dist;
              const ny = dy / dist;
              
              const totalMass = nA.mass + nB.mass;
              const ratioA = nB.mass / totalMass;
              const ratioB = nA.mass / totalMass;
              
              // Non-penetration push apart
              if (!nA.isDragging && !nA.isHub) {
                nA.x -= nx * overlap * ratioA;
                nA.y -= ny * overlap * ratioA;
              }
              if (!nB.isDragging && !nB.isHub) {
                nB.x += nx * overlap * ratioB;
                nB.y += ny * overlap * ratioB;
              }
              
              // Soft impulse reflection
              const rvx = nB.vx - nA.vx;
              const rvy = nB.vy - nA.vy;
              const velAlongNormal = rvx * nx + rvy * ny;
              
              if (velAlongNormal < 0) {
                const restitution = 0.35;
                let impulse = -(1.0 + restitution) * velAlongNormal;
                impulse /= (1.0 / nA.mass + 1.0 / nB.mass);
                
                const ix = nx * impulse;
                const iy = ny * impulse;
                
                if (!nA.isDragging) {
                  nA.vx -= ix / nA.mass;
                  nA.vy -= iy / nA.mass;
                }
                if (!nB.isDragging) {
                  nB.vx += ix / nB.mass;
                  nB.vy += iy / nB.mass;
                }
              }
            }
          }
        }

        // Clamp to SVG limits (except hub)
        skills.forEach(skill => {
          const m = skill.currentRadius + 12;
          if (skill.x < m) { skill.x = m; skill.vx *= -0.5; }
          if (skill.x > 640 - m) { skill.x = 640 - m; skill.vx *= -0.5; }
          if (skill.y < m) { skill.y = m; skill.vy *= -0.5; }
          if (skill.y > 480 - m) { skill.y = 480 - m; skill.vy *= -0.5; }
        });

        // 4. Floating Camera
        let targetCamX = 0, targetCamY = 0;
        if (mouseX !== null && mouseY !== null) {
          targetCamX = (mouseX - CX) * 0.08;
          targetCamY = (mouseY - CY) * 0.08;
        }
        camX += (targetCamX - camX) * 0.06 * dt;
        camY += (targetCamY - camY) * 0.06 * dt;

        // 5. Interpolate radii for hover scaling
        allNodes.forEach(node => {
          node.currentRadius += (node.targetRadius - node.currentRadius) * 0.15 * dt;
        });

        // 6. Rendering
        const hpx = hub.x + camX * (hub.depth - 1.0);
        const hpy = hub.y + camY * (hub.depth - 1.0);
        hubG.setAttribute("transform", `translate(${hpx} ${hpy})`);

        skills.forEach(skill => {
          const px = skill.x + camX * (skill.depth - 1.0);
          const py = skill.y + camY * (skill.depth - 1.0);
          skill._group.setAttribute("transform", `translate(${px} ${py})`);
          
          skill._line.setAttribute("x1", hpx);
          skill._line.setAttribute("y1", hpy);
          skill._line.setAttribute("x2", px);
          skill._line.setAttribute("y2", py);

          // Connecting line width and opacity tension styling
          const dist = Math.hypot(skill.x - hub.x, skill.y - hub.y) || 0.001;
          const tension = Math.abs(dist - skill.ringRadius) / skill.ringRadius;
          
          let targetWidth = 1.0 + tension * 4.0;
          let targetOpacity = 0.35 + tension * 0.55;

          if (activeSkill === skill) {
            targetWidth += 1.5;
            targetOpacity = 0.9;
            skill._line.setAttribute("stroke", "#2563eb");
          } else {
            skill._line.setAttribute("stroke", "var(--border)");
          }

          let currentWidth = parseFloat(skill._line.getAttribute("stroke-width") || 1);
          let currentOpacity = parseFloat(skill._line.getAttribute("opacity") || 0.35);

          currentWidth += (targetWidth - currentWidth) * 0.15 * dt;
          currentOpacity += (targetOpacity - currentOpacity) * 0.15 * dt;

          skill._line.setAttribute("stroke-width", currentWidth.toFixed(2));
          skill._line.setAttribute("opacity", currentOpacity.toFixed(2));
        });

        // 7. Reposition tooltip if active
        if (activeSkill) {
          positionTip(activeSkill.x, activeSkill.y, activeSkill.depth);
        }
      }

      const start = () => {
        if (!running) {
          running = true;
          lastTime = 0;
          rafId = requestAnimationFrame(step);
        }
      };
      const stop  = () => {
        running = false;
        cancelAnimationFrame(rafId);
      };

      new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden) ? start() : stop())
        .observe(stage || svg);
      document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
    }
  }

  initSkills();


  /* ================================================================
     MOBILE COLLAPSIBLE PROJECT CARDS
     ================================================================ */
  function initCollapsibleCards() {
    const cardHeaders = $$(".project-card__mobile-header");
    
    cardHeaders.forEach(header => {
      const card = header.closest(".project-card");
      const toggleBtn = $(".project-card__toggle", header);
      const collapsible = $(".project-card__collapsible", card);
      if (!card || !toggleBtn || !collapsible) return;

      header.addEventListener("click", () => {
        if (window.innerWidth > 900) return;

        const label = $(".project-card__toggle-label", toggleBtn);
        const isExpanded = card.classList.contains("is-card-expanded");

        if (isExpanded) {
          card.classList.remove("is-card-expanded");
          toggleBtn.setAttribute("aria-expanded", "false");
          if (label) label.textContent = "Show Details";

          if (!reduced && window.gsap) {
            gsap.to(collapsible, {
              height: 0,
              duration: 0.4,
              ease: "power3.inOut",
              onComplete() {
                collapsible.style.display = "none";
                collapsible.style.height = "";
              }
            });
          } else {
            collapsible.style.display = "none";
          }
        } else {
          card.classList.add("is-card-expanded");
          toggleBtn.setAttribute("aria-expanded", "true");
          if (label) label.textContent = "Hide Details";

          collapsible.style.display = "block";
          
          if (!reduced && window.gsap) {
            gsap.fromTo(collapsible, { height: 0 }, {
              height: collapsible.scrollHeight,
              duration: 0.5,
              ease: "power3.out",
              onComplete() {
                collapsible.style.height = "auto";
              }
            });
          }
        }
      });
    });

    let isMobileState = window.innerWidth <= 900;
    window.addEventListener("resize", () => {
      const currentlyMobile = window.innerWidth <= 900;
      if (currentlyMobile !== isMobileState) {
        isMobileState = currentlyMobile;
        $$(".project-card").forEach(card => {
          const collapsible = $(".project-card__collapsible", card);
          const toggleBtn = $(".project-card__toggle", card);
          const label = $(".project-card__toggle-label", toggleBtn);
          if (collapsible) {
            collapsible.style.height = "";
            collapsible.style.display = "";
          }
          if (card.classList.contains("is-card-expanded")) {
            card.classList.remove("is-card-expanded");
          }
          if (toggleBtn) {
            toggleBtn.setAttribute("aria-expanded", "false");
          }
          if (label) {
            label.textContent = "Show Details";
          }
        });
      }
    });
  }

  initCollapsibleCards();


  /* ================================================================
     FOOTER YEAR
     ================================================================ */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
