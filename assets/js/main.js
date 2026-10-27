(() => {
  const root = document.documentElement;

  /* ---------- Thème clair / sombre ---------- */
  const toggle = document.querySelector('.theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  const currentTheme = () =>
    root.dataset.theme || (prefersDark.matches ? 'dark' : 'light');

  const updateToggleLabel = () => {
    if (!toggle) return;
    const isDark = currentTheme() === 'dark';
    toggle.setAttribute('aria-label', isDark ? 'Passer en thème clair' : 'Passer en thème sombre');
    toggle.setAttribute('aria-pressed', String(isDark));
  };

  if (toggle) {
    toggle.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) { /* stockage indisponible */ }
      updateToggleLabel();
    });
    prefersDark.addEventListener?.('change', updateToggleLabel);
    updateToggleLabel();
  }

  /* ---------- Détails dépliables du parcours ---------- */
  document.querySelectorAll('.more').forEach((button) => {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    const label = button.querySelector('.more-label');
    if (!panel) return;

    button.addEventListener('click', () => {
      const isOpen = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!isOpen));
      panel.classList.toggle('is-open', !isOpen);
      if (label) label.textContent = isOpen ? 'Lire le détail' : 'Masquer le détail';
    });
  });

  /* ---------- Lien actif dans la navigation ---------- */
  const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          if (active) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach((section) => observer.observe(section));
  }

  /* ---------- Défilement des compétences ---------- */
  const marquee = document.querySelector('[data-marquee]');

  if (marquee) {
    const control = document.querySelector('.marquee-control');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let paused = false;   // bouton pause
    let visible = true;   // section à l'écran
    let rafId = null;
    let lastTime = null;

    const rows = [...marquee.querySelectorAll('.marquee-row')].map((row) => ({
      row,
      track: row.querySelector('.marquee-track'),
      group: row.querySelector('.marquee-group'),
      direction: row.dataset.direction === 'right' ? 1 : -1,
      speed: Number(row.dataset.speed) || 40, // pixels par seconde
      offset: 0,
    }));

    // Duplique le groupe de badges autant que nécessaire pour remplir la largeur
    const fillRow = (r) => {
      r.track.querySelectorAll('[data-clone]').forEach((n) => n.remove());
      const groupWidth = r.group.offsetWidth;
      if (!groupWidth) return;
      const copies = Math.max(1, Math.ceil(r.row.clientWidth / groupWidth));
      for (let i = 0; i < copies; i++) {
        const clone = r.group.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.dataset.clone = '';
        r.track.appendChild(clone);
      }
    };

    const tick = (time) => {
      if (lastTime === null) lastTime = time;
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (!paused && visible) {
        rows.forEach((r) => {
          const width = r.group.offsetWidth;
          if (!width) return;
          r.offset = (r.offset + r.speed * dt) % width;
          const x = r.direction < 0 ? -r.offset : r.offset - width;
          r.track.style.transform = `translate3d(${x}px, 0, 0)`;
        });
      }
      rafId = requestAnimationFrame(tick);
    };

    const start = () => {
      marquee.classList.add('is-animated');
      rows.forEach(fillRow);
      if (control) control.hidden = false;
      if (rafId === null) {
        lastTime = null;
        rafId = requestAnimationFrame(tick);
      }
    };

    const stop = () => {
      marquee.classList.remove('is-animated');
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
      rows.forEach((r) => {
        r.track.querySelectorAll('[data-clone]').forEach((n) => n.remove());
        r.track.style.transform = '';
        r.offset = 0;
      });
      if (control) control.hidden = true;
    };

    const applyMotionPreference = () => (reduceMotion.matches ? stop() : start());
    applyMotionPreference();
    reduceMotion.addEventListener?.('change', applyMotionPreference);

    // Recalcule les copies si la taille change (rotation, polices chargées…)
    if ('ResizeObserver' in window) {
      new ResizeObserver(() => {
        if (marquee.classList.contains('is-animated')) rows.forEach(fillRow);
      }).observe(marquee);
    }
    document.fonts?.ready.then(() => {
      if (marquee.classList.contains('is-animated')) rows.forEach(fillRow);
    });

    // Pas de calcul inutile quand la section n'est pas visible
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(marquee);
    }

    // Bouton pause / lecture
    if (control) {
      control.addEventListener('click', () => {
        paused = !paused;
        control.setAttribute('aria-pressed', String(paused));
        control.setAttribute('aria-label', paused ? 'Relancer le défilement' : 'Mettre en pause le défilement');
      });
    }
  }

  /* ---------- Année du pied de page ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
