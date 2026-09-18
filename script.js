(function () {
  'use strict';

  const EVENT_DATE = new Date('2026-11-21T21:00:00-03:00');
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  let toastTimer;

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
  }

  function updateCountdown() {
    const difference = Math.max(0, EVENT_DATE.getTime() - Date.now());
    const days = Math.floor(difference / 86400000);
    const hours = Math.floor((difference / 3600000) % 24);
    const minutes = Math.floor((difference / 60000) % 60);
    const seconds = Math.floor((difference / 1000) % 60);
    $('#days').textContent = String(days).padStart(2, '0');
    $('#hours').textContent = String(hours).padStart(2, '0');
    $('#minutes').textContent = String(minutes).padStart(2, '0');
    $('#seconds').textContent = String(seconds).padStart(2, '0');
  }

  function downloadCalendarEvent() {
    const lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//BloomDate//XV Emilia//ES',
      'BEGIN:VEVENT', 'UID:emilia-xv-20261121@bloomdate',
      'DTSTAMP:20260916T190000Z', 'DTSTART:20261122T000000Z', 'DTEND:20261122T070000Z',
      'SUMMARY:XV Emilia', 'LOCATION:Salón Los Morrillos\\, Calle San Juan 965 Norte\\, Santa Lucía',
      'DESCRIPTION:Fiesta de XV de Emilia. Dress code: estrictamente formal.',
      'URL:https://maps.app.goo.gl/knhqQsHEtGojJEwZ8?g_st=iw', 'END:VEVENT', 'END:VCALENDAR'
    ];
    const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'XV-Emilia-21-11-2026.ics';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Fecha lista para guardar');
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    setTimeout(() => $('.modal__close', modal)?.focus(), 100);
  }

  function closeModal(modal) {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
  }

  function setupReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach((element, index) => {
      if (index === 0) element.classList.add('is-visible');
      observer.observe(element);
    });
  }

  function setupSparkles() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = $('#sparkleCanvas');
    const context = canvas.getContext('2d');
    const particles = [];
    let width = 0;
    let height = 0;
    let lastY = scrollY;

    function resize() {
      const ratio = Math.min(devicePixelRatio || 1, 2);
      width = innerWidth; height = innerHeight;
      canvas.width = width * ratio; canvas.height = height * ratio;
      canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function addSparkle(x, y, amount = 1) {
      for (let i = 0; i < amount; i += 1) {
        particles.push({ x: x + (Math.random() - .5) * 28, y: y + (Math.random() - .5) * 20, r: Math.random() * 1.8 + .4, life: 1, vx: (Math.random() - .5) * .35, vy: -Math.random() * .4 - .1 });
      }
    }

    function draw() {
      context.clearRect(0, 0, width, height);
      particles.forEach((particle) => {
        particle.x += particle.vx; particle.y += particle.vy; particle.life -= .018;
        context.save(); context.translate(particle.x, particle.y); context.globalAlpha = Math.max(0, particle.life);
        context.strokeStyle = '#fff'; context.lineWidth = .7;
        context.beginPath(); context.moveTo(-particle.r * 3, 0); context.lineTo(particle.r * 3, 0); context.moveTo(0, -particle.r * 3); context.lineTo(0, particle.r * 3); context.stroke(); context.restore();
      });
      for (let index = particles.length - 1; index >= 0; index -= 1) if (particles[index].life <= 0) particles.splice(index, 1);
      requestAnimationFrame(draw);
    }

    addEventListener('resize', resize, { passive: true });
    addEventListener('pointermove', (event) => { if (Math.random() > .72) addSparkle(event.clientX, event.clientY); }, { passive: true });
    addEventListener('scroll', () => {
      if (Math.abs(scrollY - lastY) > 12) addSparkle(Math.random() * width, Math.random() * height, 2);
      lastY = scrollY;
    }, { passive: true });
    resize(); draw();
  }

  function setupScratchReveal() {
    const dateReveal = $('#dateReveal');
    const canvas = $('#revealCanvas');
    const context = canvas?.getContext('2d');
    const trail = $('#magicTrail');
    if (!dateReveal || !canvas || !context || !trail) return;

    let drawing = false;
    let complete = false;
    let gate = false;
    let distanceDrawn = 0;
    let lastPoint = null;

    function sizeCanvas() {
      if (complete) return;
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * ratio);
      canvas.height = Math.round(rect.height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const gradient = context.createLinearGradient(0, 0, 0, rect.height);
      gradient.addColorStop(0, '#020202');
      gradient.addColorStop(.48, '#202020');
      gradient.addColorStop(1, '#050505');
      context.fillStyle = gradient;
      context.fillRect(0, 0, rect.width, rect.height);
      for (let index = 0; index < 110; index += 1) {
        context.beginPath();
        context.arc(Math.random() * rect.width, Math.random() * rect.height, Math.random() * 1.4 + .2, 0, Math.PI * 2);
        context.fillStyle = `rgba(240,240,240,${Math.random() * .75})`;
        context.fill();
      }
    }

    function activateGate() {
      if (gate || complete) return;
      gate = true;
      dateReveal.classList.add('gate-active');
      document.documentElement.classList.add('reveal-locked');
      sizeCanvas();
      requestAnimationFrame(() => requestAnimationFrame(() => dateReveal.classList.add('gate-visible')));
    }

    function point(event) {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    function sparkle(at) {
      for (let index = 0; index < 3; index += 1) {
        const star = document.createElement('span');
        star.className = 'trail-star';
        star.style.left = `${at.x + (Math.random() - .5) * 34}px`;
        star.style.top = `${at.y + (Math.random() - .5) * 34}px`;
        trail.appendChild(star);
        setTimeout(() => star.remove(), 900);
      }
    }

    function finishReveal() {
      complete = true;
      drawing = false;
      dateReveal.classList.add('revealed');
      setTimeout(() => {
        dateReveal.classList.remove('gate-active', 'gate-visible');
        canvas.remove();
        trail.remove();
        document.documentElement.classList.remove('reveal-locked');
        dateReveal.scrollIntoView({ block: 'start' });
      }, 850);
    }

    canvas.addEventListener('pointerdown', (event) => {
      drawing = true;
      canvas.setPointerCapture(event.pointerId);
      lastPoint = point(event);
      dateReveal.classList.add('revealing');
    });
    canvas.addEventListener('pointermove', (event) => {
      if (!drawing || complete) return;
      const next = point(event);
      distanceDrawn += Math.hypot(next.x - lastPoint.x, next.y - lastPoint.y);
      context.globalCompositeOperation = 'destination-out';
      context.lineWidth = Math.max(58, canvas.clientWidth * .16);
      context.lineCap = 'round';
      context.beginPath();
      context.moveTo(lastPoint.x, lastPoint.y);
      context.lineTo(next.x, next.y);
      context.stroke();
      context.globalCompositeOperation = 'source-over';
      sparkle(next);
      lastPoint = next;
      if (distanceDrawn >= canvas.clientWidth * 4.4) finishReveal();
    });
    ['pointerup', 'pointercancel'].forEach((name) => canvas.addEventListener(name, () => {
      drawing = false;
      lastPoint = null;
    }));

    addEventListener('resize', sizeCanvas, { passive: true });
    requestAnimationFrame(sizeCanvas);
    const observer = new IntersectionObserver((entries) => {
      if (document.body.classList.contains('has-entered') && entries.some((entry) => entry.isIntersecting)) activateGate();
    }, { threshold: .18 });
    observer.observe(dateReveal);
  }

  function setupGiftSparkles() {
    const layer = $('#giftSparkles');
    if (!layer) return;
    for (let index = 0; index < 48; index += 1) {
      const sparkle = document.createElement('span');
      sparkle.style.setProperty('--x', `${6 + Math.random() * 88}%`);
      sparkle.style.setProperty('--y', `${3 + Math.random() * 94}%`);
      sparkle.style.setProperty('--size', `${1.5 + Math.random() * 3.5}px`);
      sparkle.style.setProperty('--duration', `${.9 + Math.random() * 1.7}s`);
      sparkle.style.setProperty('--delay', `${-Math.random() * 2.6}s`);
      layer.appendChild(sparkle);
    }
  }

  function setupSound() {
    const button = $('#soundToggle');
    const audio = $('#invitationAudio');
    if (!button || !audio) return;
    audio.volume = .62;

    function sync() {
      const playing = !audio.paused && !audio.ended;
      button.setAttribute('aria-pressed', String(playing));
      button.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
    }

    async function play() {
      try { await audio.play(); }
      catch (_) { sync(); }
    }

    button.addEventListener('click', () => {
      if (audio.paused) play();
      else audio.pause();
    });
    $('#openInvitation').addEventListener('click', play, { once: true });
    audio.addEventListener('play', sync);
    audio.addEventListener('pause', sync);
    audio.addEventListener('ended', sync);
    sync();
  }

  function enterInvitation() {
    $('#opening').classList.add('is-open');
    document.body.classList.remove('is-locked');
    document.body.classList.add('has-entered');
  }
  $('#openInvitation').addEventListener('click', enterInvitation);
  $('#openInvitationSilent').addEventListener('click', enterInvitation);
  $('#addCalendar').addEventListener('click', downloadCalendarEvent);
  document.addEventListener('click', (event) => {
    const openTrigger = event.target.closest('[data-open-modal]');
    if (openTrigger) {
      event.preventDefault();
      openModal(openTrigger.dataset.openModal);
      return;
    }
    const closeTrigger = event.target.closest('[data-close-modal]');
    if (closeTrigger) closeModal(closeTrigger.closest('.modal'));
  });
  addEventListener('keydown', (event) => { if (event.key === 'Escape') $$('.modal.is-open').forEach(closeModal); });
  $('#copyAlias').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('emilia3305'); showToast('Alias copiado: emilia3305'); }
    catch (_) { showToast('Alias: emilia3305'); }
  });
  $('#songForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const query = $('#songName').value.trim();
    if (!query) return;
    window.open('https://open.spotify.com/search/' + encodeURIComponent(query), '_blank', 'noopener,noreferrer');
    showToast('Abriendo Spotify');
  });

  updateCountdown();
  setInterval(updateCountdown, 1000);
  setupReveal();
  setupSparkles();
  setupScratchReveal();
  setupGiftSparkles();
  setupSound();
})();
