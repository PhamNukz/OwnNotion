import { useEffect, useState } from 'react';
import './LandingPage.css';
import heroBgImg from './assets/bgf2.jpg';

const IMG_KEYS = ['hero', 'heroBg', 'whyUs', 'fleet1', 'fleet2', 'fleet3'] as const;
type ImgKey = typeof IMG_KEYS[number];

function loadImgs(): Record<ImgKey, string> {
  return Object.fromEntries(
    IMG_KEYS.map(k => [k, localStorage.getItem(`tk_img_${k}`) ?? ''])
  ) as Record<ImgKey, string>;
}

export default function LandingPage() {
  const [adminMode, setAdminMode] = useState(false);
  const [imgs, setImgs] = useState<Record<ImgKey, string>>(loadImgs);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync body class
  useEffect(() => {
    document.body.classList.toggle('admin-mode', adminMode);
    return () => { document.body.classList.remove('admin-mode'); };
  }, [adminMode]);

  const upload = (key: ImgKey) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setImgs(prev => ({ ...prev, [key]: url }));
        localStorage.setItem(`tk_img_${key}`, url);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const deleteImg = (key: ImgKey, e: React.MouseEvent) => {
    e.stopPropagation();
    setImgs(prev => ({ ...prev, [key]: '' }));
    localStorage.removeItem(`tk_img_${key}`);
  };

  // Generic image slot: renders placeholder or uploaded image + admin overlay
  const imgSlot = (key: ImgKey, placeholder: React.ReactNode, cls: string) => (
    <div
      className={`${cls}${adminMode ? ' img-clickable' : ''}`}
      onClick={adminMode ? () => upload(key) : undefined}
    >
      {imgs[key]
        ? <img src={imgs[key]} alt="" className="uploaded-img" />
        : placeholder}
      {adminMode && (
        <div className="upload-overlay">
          <span className="uov-icon">📷</span>
          <span className="uov-text">{imgs[key] ? 'Cambiar imagen' : 'Subir imagen'}</span>
          {imgs[key] && (
            <button className="uov-del" onClick={e => deleteImg(key, e)}>✕ Eliminar</button>
          )}
        </div>
      )}
    </div>
  );

  // Fleet-ph slot: keeps tilt-glow always visible on top of image
  const fleetSlot = (key: ImgKey, svg: React.ReactNode, label: string, sub: string) => (
    <div
      className={`fleet-ph${adminMode ? ' img-clickable' : ''}`}
      onClick={adminMode ? () => upload(key) : undefined}
    >
      <div className="fleet-tilt-glow"></div>
      {imgs[key]
        ? <img src={imgs[key]} alt={label} className="uploaded-img" />
        : <>{svg}<span className="ph-label">{label}</span><span className="ph-sub">{sub}</span></>}
      {adminMode && (
        <div className="upload-overlay">
          <span className="uov-icon">📷</span>
          <span className="uov-text">{imgs[key] ? 'Cambiar' : 'Subir imagen'}</span>
          {imgs[key] && (
            <button className="uov-del" onClick={e => deleteImg(key, e)}>✕ Eliminar</button>
          )}
        </div>
      )}
    </div>
  );

  useEffect(() => {
    // ── ADMIN KEYBOARD SHORTCUT ──────────────────────
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setAdminMode(prev => !prev);
      }
    };
    document.addEventListener('keydown', onKey);

    // ── CURSOR ──────────────────────────────────────
    const dot = document.getElementById('c-dot') as HTMLElement;
    const ring = document.getElementById('c-ring') as HTMLElement;
    let mx = 0, my = 0, rx = 0, ry = 0;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    };
    document.addEventListener('mousemove', onMouseMove);

    const animRing = () => {
      rx += (mx - rx) * 0.11; ry += (my - ry) * 0.11;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      rafId = requestAnimationFrame(animRing);
    };
    rafId = requestAnimationFrame(animRing);

    // Event delegation — handles dynamic elements like admin overlays
    const HOV_SEL = 'a,button,input,select,.svc-card,.fleet-card,.img-clickable';
    const addHov = (e: Event) => {
      if ((e.target as Element).closest(HOV_SEL)) document.body.classList.add('hov');
    };
    const remHov = (e: Event) => {
      const rel = (e as MouseEvent).relatedTarget as Element | null;
      if (!rel?.closest(HOV_SEL)) document.body.classList.remove('hov');
    };
    document.addEventListener('mouseover', addHov);
    document.addEventListener('mouseout', remHov);

    // ── MAGNETIC BUTTONS ────────────────────────────
    type Handler = { el: Element; mm: EventListener; ml: EventListener };
    const magHandlers: Handler[] = [];
    document.querySelectorAll('.magnetic').forEach(btn => {
      const mm: EventListener = (e) => {
        const me = e as MouseEvent;
        const r = btn.getBoundingClientRect();
        const x = (me.clientX - r.left - r.width / 2) * 0.28;
        const y = (me.clientY - r.top - r.height / 2) * 0.28;
        (btn as HTMLElement).style.transform = `translate(${x}px,${y}px)`;
        (btn as HTMLElement).style.transition = 'transform 0.1s ease';
      };
      const ml: EventListener = () => {
        (btn as HTMLElement).style.transform = 'translate(0,0)';
        (btn as HTMLElement).style.transition = 'transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)';
      };
      btn.addEventListener('mousemove', mm);
      btn.addEventListener('mouseleave', ml);
      magHandlers.push({ el: btn, mm, ml });
    });

    // ── NAVBAR SCROLL ───────────────────────────────
    const nav = document.getElementById('nav') as HTMLElement;
    const onNavScroll = () => nav.classList.toggle('stuck', window.scrollY > 60);
    window.addEventListener('scroll', onNavScroll);

    // ── SCROLL REVEAL ────────────────────────────────
    const rvObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); rvObs.unobserve(e.target); } });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
    const rvEls = document.querySelectorAll('.rv');
    rvEls.forEach(el => rvObs.observe(el));
    // Failsafe: show all if observer hasn't fired after 1.2s
    const rvFallback = setTimeout(() => {
      rvEls.forEach(el => el.classList.add('on'));
    }, 1200);

    // ── STATS COUNTER ────────────────────────────────
    let counted = false;
    const runCounters = () => {
      if (counted) return; counted = true;
      document.querySelectorAll('.cnt').forEach(el => {
        const to = +(el as HTMLElement).dataset.to!;
        const dur = 1800, t0 = Date.now();
        const tick = () => {
          const p = Math.min((Date.now() - t0) / dur, 1);
          el.textContent = String(Math.floor((1 - Math.pow(1 - p, 3)) * to));
          if (p < 1) requestAnimationFrame(tick);
        };
        tick();
      });
    };
    const heroEl = document.getElementById('hero') as HTMLElement;
    const statsObs = new IntersectionObserver(es => { if (es[0].isIntersecting) runCounters(); }, { threshold: 0.1 });
    statsObs.observe(heroEl);
    const statsTimer = setTimeout(runCounters, 100);

    // ── FLEET 3D TILT ─────────────────────────────────
    const fleetHandlers: Handler[] = [];
    document.querySelectorAll('.fleet-card').forEach(card => {
      const glow = card.querySelector('.fleet-tilt-glow') as HTMLElement | null;
      const mm: EventListener = (e) => {
        const me = e as MouseEvent;
        const r = card.getBoundingClientRect();
        const x = (me.clientX - r.left) / r.width - 0.5;
        const y = (me.clientY - r.top) / r.height - 0.5;
        (card as HTMLElement).style.transform = `perspective(700px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg) scale(1.025)`;
        (card as HTMLElement).style.transition = 'transform 0.08s ease';
        if (glow) {
          glow.style.setProperty('--mx', ((me.clientX - r.left) / r.width * 100) + '%');
          glow.style.setProperty('--my', ((me.clientY - r.top) / r.height * 100) + '%');
        }
      };
      const ml: EventListener = () => {
        (card as HTMLElement).style.transform = 'none';
        (card as HTMLElement).style.transition = 'transform 0.5s ease';
      };
      card.addEventListener('mousemove', mm);
      card.addEventListener('mouseleave', ml);
      fleetHandlers.push({ el: card, mm, ml });
    });

    // ── TESTIMONIALS SLIDER ───────────────────────────
    const track = document.getElementById('test-track');
    const dotsContainer = document.getElementById('test-dots');
    let current = 0;
    let autoPlay: ReturnType<typeof setInterval> | null = null;

    if (track && dotsContainer) {
      const cards = track.querySelectorAll('.test-card');
      const total = cards.length;

      const goTo = (i: number) => {
        current = (i + total) % total;
        (track as HTMLElement).style.transform = `translateX(-${current * 100}%)`;
        dotsContainer.querySelectorAll('.test-dot').forEach((d, idx) => {
          d.classList.toggle('active', idx === current);
        });
      };

      for (let i = 0; i < total; i++) {
        const dotEl = document.createElement('button');
        dotEl.className = 'test-dot' + (i === 0 ? ' active' : '');
        dotEl.setAttribute('aria-label', `Testimonio ${i + 1}`);
        const idx = i;
        dotEl.addEventListener('click', () => { goTo(idx); resetAuto(); });
        dotsContainer.appendChild(dotEl);
      }

      const resetAuto = () => {
        if (autoPlay) clearInterval(autoPlay);
        autoPlay = setInterval(() => goTo(current + 1), 4500);
      };
      resetAuto();
    }

    // ── CLEANUP ──────────────────────────────────────
    return () => {
      document.removeEventListener('keydown', onKey);
      cancelAnimationFrame(rafId);
      clearTimeout(statsTimer);
      clearTimeout(rvFallback);
      if (autoPlay) clearInterval(autoPlay);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', addHov);
      document.removeEventListener('mouseout', remHov);
      window.removeEventListener('scroll', onNavScroll);
      magHandlers.forEach(({ el, mm, ml }) => { el.removeEventListener('mousemove', mm); el.removeEventListener('mouseleave', ml); });
      fleetHandlers.forEach(({ el, mm, ml }) => { el.removeEventListener('mousemove', mm); el.removeEventListener('mouseleave', ml); });
      rvObs.disconnect();
      statsObs.disconnect();
      document.body.classList.remove('hov');
    };
  }, []);

  return (
    <>
      <style>{`
        body {
          background-image: url(${heroBgImg});
          background-size: cover;
          background-position: center top;
          background-attachment: fixed;
        }
      `}</style>
      <div id="c-dot"></div>
      <div id="c-ring"></div>

      {/* ── ADMIN BAR ── */}
      {adminMode && (
        <div className="admin-bar">
          <span>⚙ MODO ADMIN — Haz clic en cualquier imagen para subirla</span>
          <button className="admin-bar-close" onClick={() => setAdminMode(false)}>✕ Salir</button>
        </div>
      )}

      {/* ── NAVBAR ── */}
      <nav id="nav">
        <a href="#" className="nav-logo">
          <span className="logo-diamond"></span>
          <span>
            <span className="logo-trans">Trans</span>Kartz
            <span className="nav-sub">Tour &amp; Transfer</span>
          </span>
        </a>
        <ul className="nav-links">
          <li><a href="#services">Servicios</a></li>
          <li><a href="#fleet">Flota</a></li>
          <li><a href="#why-us">Nosotros</a></li>
          <li><a href="#booking-strip">Contacto</a></li>
        </ul>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {!adminMode && (
            <button className="admin-toggle-btn" onClick={() => setAdminMode(true)} title="Modo Admin (Ctrl+Shift+A)">
              ⚙
            </button>
          )}
          <a href="#booking-strip" className="nav-cta magnetic">Reservar ahora</a>
          <button
            className={`nav-hamburger${mobileMenuOpen ? ' open' : ''}`}
            onClick={() => setMobileMenuOpen(o => !o)}
            aria-label="Menú"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* ── MOBILE MENU ── */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <ul>
            <li><a href="#services" onClick={() => setMobileMenuOpen(false)}>Servicios</a></li>
            <li><a href="#fleet" onClick={() => setMobileMenuOpen(false)}>Flota</a></li>
            <li><a href="#why-us" onClick={() => setMobileMenuOpen(false)}>Nosotros</a></li>
            <li><a href="#booking-strip" onClick={() => setMobileMenuOpen(false)}>Contacto</a></li>
          </ul>
          <a href="#booking-strip" className="mobile-menu-cta" onClick={() => setMobileMenuOpen(false)}>Reservar ahora</a>
        </div>
      )}

      {/* ── HERO ── */}
      <section id="hero" className="has-bg">
        {/* Background image */}
        <div
          className={`hero-bg${adminMode ? ' img-clickable' : ''}`}
          onClick={adminMode ? () => upload('heroBg') : undefined}
        >
          <img src={imgs.heroBg || heroBgImg} alt="" className="uploaded-img" />
          <div className="hero-bg-overlay"></div>
          {adminMode && (
            <div className="upload-overlay">
              <span className="uov-icon">📷</span>
              <span className="uov-text">{imgs.heroBg ? 'Cambiar fondo' : 'Subir fondo 16:9'}</span>
              {imgs.heroBg && (
                <button className="uov-del" onClick={e => deleteImg('heroBg', e)}>✕ Eliminar</button>
              )}
            </div>
          )}
        </div>
        <div className="hero-inner wrap">

          {/* Left column */}
          <div className="hero-left">
            <div className="h-badge">Tour &amp; Transfer · Servicio de Élite</div>
            <h1 className="h-title">
              Viaja con<br />
              <em>seguridad</em><br />
              y confort
            </h1>
            <p className="h-sub">
              Transporte privado de primera clase para ejecutivos, eventos y traslados aeroportuarios.
              Puntualidad, seguridad y confort garantizados — servicio validado por el Ministerio de Transporte.
            </p>
            <div className="h-btns">
              <a href="#booking-strip" className="btn-p magnetic"><span>Reservar ahora</span></a>
              <a href="#fleet" className="btn-s magnetic">Ver flota</a>
            </div>
            <div className="h-stats">
              <div className="stat-item">
                <div className="stat-n"><span className="cnt" data-to="8">0</span><em>+</em></div>
                <div className="stat-l">Años de experiencia</div>
              </div>
              <div className="stat-div"></div>
              <div className="stat-item">
                <div className="stat-n"><span className="cnt" data-to="1200">0</span><em>+</em></div>
                <div className="stat-l">Viajes completados</div>
              </div>
              <div className="stat-div"></div>
              <div className="stat-item">
                <div className="stat-n"><span className="cnt" data-to="98">0</span><em>%</em></div>
                <div className="stat-l">Satisfacción</div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="hero-right">
            <div className="hero-img-wrap">
              {imgSlot('hero',
                <>
                  <svg viewBox="0 0 24 24"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14l4 4v6a2 2 0 0 1-2 2h-2" /><circle cx="8" cy="17" r="2" /><circle cx="18" cy="17" r="2" /></svg>
                  <span>Imagen principal</span>
                  <span className="ph-sub">Vehículo o escena premium</span>
                </>,
                'hero-img-ph'
              )}
              <div className="hero-float-card">
                <div className="hfc-stars">★★★★★</div>
                <div className="hfc-text">"Servicio excepcional, puntuales y muy profesionales"</div>
                <div className="hfc-name">— Carlos M., Cliente VIP</div>
              </div>
              <div className="hero-badge-float">
                <div className="hbf-icon">🏆</div>
                <div>
                  <div className="hbf-val">Top rated</div>
                  <div className="hbf-desc">Servicio premium</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── BOOKING STRIP ── */}
      <section id="booking-strip">
        <div className="bs-inner wrap">
          <span className="bs-label">Reserva tu viaje</span>
          <form className="bs-form" onSubmit={e => e.preventDefault()}>
            <div className="bs-field">
              <label>Origen</label>
              <select>
                <optgroup label="— Zona Costera —">
                  <option>Terminal VTP · Valparaíso</option>
                  <option>Hoteles Valparaíso</option>
                  <option>Viña del Mar</option>
                  <option>Reñaca / Concón</option>
                  <option>Zapallar</option>
                  <option>San Antonio</option>
                </optgroup>
                <optgroup label="— Zona Central —">
                  <option>Aeropuerto Internacional AMB</option>
                  <option>Hoteles en Santiago</option>
                  <option>Valle de Casablanca</option>
                </optgroup>
              </select>
            </div>
            <div className="bs-sep">→</div>
            <div className="bs-field">
              <label>Destino</label>
              <select>
                <optgroup label="— Zona Costera —">
                  <option>Terminal VTP · Valparaíso</option>
                  <option>Hoteles Valparaíso</option>
                  <option>Viña del Mar</option>
                  <option>Reñaca / Concón</option>
                  <option>Zapallar</option>
                  <option>San Antonio</option>
                </optgroup>
                <optgroup label="— Zona Central —">
                  <option>Aeropuerto Internacional AMB</option>
                  <option>Hoteles en Santiago</option>
                  <option>Valle de Casablanca</option>
                </optgroup>
              </select>
            </div>
            <div className="bs-field">
              <label>Fecha</label>
              <input type="date" />
            </div>
            <div className="bs-field">
              <label>Pasajeros</label>
              <select>
                <option>1 pasajero</option>
                <option>2 pasajeros</option>
                <option>3 pasajeros</option>
                <option>4 pasajeros</option>
                <option>5 pasajeros</option>
                <option>6 pasajeros</option>
                <option>7–12 pasajeros</option>
              </select>
            </div>
            <div className="bs-field">
              <label>Servicio</label>
              <select>
                <option>Traslado privado</option>
                <option>Servicio compartido (VTP)</option>
                <option>Corporativo / Empresa</option>
                <option>Silla de ruedas</option>
                <option>Tour / Excursión</option>
              </select>
            </div>
            <button type="submit" className="bs-btn magnetic"><span>Cotizar →</span></button>
          </form>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="sec">
        <div className="wrap">
          <div className="sec-head rv">
            <div className="sec-tag">Lo que hacemos</div>
            <h2 className="sec-h">Nuestros servicios<br />de élite</h2>
            <p className="sec-p">Cada servicio diseñado para superar expectativas con tecnología, profesionalismo y atención al detalle.</p>
          </div>
          <div className="svc-grid">
            <div className="svc-card rv d1">
              <div className="svc-ico"><svg viewBox="0 0 24 24"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14l4 4v6a2 2 0 0 1-2 2h-2" /><circle cx="8" cy="17" r="2" /><circle cx="18" cy="17" r="2" /></svg></div>
              <h3 className="svc-name">Traslados Privados</h3>
              <p className="svc-desc">Disponemos de variados vehículos full equipados según tu necesidad. Operamos desde Valparaíso hacia todos los destinos: Hoteles en Valparaíso, Viña del Mar, Hoteles en Santiago, Aeropuerto Internacional AMB y más.</p>
              <a href="#booking-strip" className="svc-link">Reservar →</a>
            </div>
            <div className="svc-card rv d2">
              <div className="svc-ico"><svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg></div>
              <h3 className="svc-name">Servicios Compartidos</h3>
              <p className="svc-desc">Desde el Terminal de Pasajeros VTP, minibuses de distintas capacidades para traslados compartidos al aeropuerto de Santiago y hoteles en Viña del Mar, Valparaíso y Santiago.</p>
              <div className="svc-highlight">Terminal VTP → Aeropuerto: USD 50 / persona (equipaje incluido)</div>
              <a href="#booking-strip" className="svc-link">Reservar →</a>
            </div>
            <div className="svc-card rv d3">
              <div className="svc-ico"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg></div>
              <h3 className="svc-name">Especiales y Empresas</h3>
              <p className="svc-desc">Para empresas nos adaptamos a sus rutas y necesidades con la flota que requieran. También contamos con vehículos adaptados para pasajeros en silla de ruedas: plataforma elevadora para sillas manuales y eléctricas, amplio espacio para equipajes y acompañantes.</p>
              <a href="#booking-strip" className="svc-link">Cotizar →</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section id="why-us" className="sec">
        <div className="wrap">
          <div className="why-layout">
            <div className="why-visual rv">
              {imgSlot('whyUs',
                <>
                  <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  <span>Imagen institucional</span>
                  <span className="ph-sub">Interior de vehículo o equipo</span>
                </>,
                'why-img-ph'
              )}
              <div className="why-badge">
                <div className="wb-icon">⚡</div>
                <div>
                  <div className="wb-val">24/7</div>
                  <div className="wb-desc">Disponibilidad total</div>
                </div>
              </div>
            </div>
            <div className="why-content rv d2">
              <div className="sec-tag">Por qué elegirnos</div>
              <h2 className="sec-h">Excelencia en cada kilómetro</h2>
              <p className="sec-p">Más de 8 años ofreciendo el mejor servicio de transporte privado, con conductores certificados y vehículos de primer nivel.</p>
              <ul className="why-list">
                <li className="why-item">
                  <span className="wi-check">✓</span>
                  <div>
                    <div className="wi-title">Puntualidad garantizada</div>
                    <p className="wi-desc">Monitoreamos el tráfico en tiempo real y planificamos cada ruta para asegurar tu llegada siempre a tiempo.</p>
                  </div>
                </li>
                <li className="why-item">
                  <span className="wi-check">✓</span>
                  <div>
                    <div className="wi-title">Conductores profesionales</div>
                    <p className="wi-desc">Equipo certificado con protocolo ejecutivo, idiomas y manejo defensivo. Discreción absoluta garantizada.</p>
                  </div>
                </li>
                <li className="why-item">
                  <span className="wi-check">✓</span>
                  <div>
                    <div className="wi-title">Confort y tecnología</div>
                    <p className="wi-desc">WiFi a bordo, agua mineral, climatización individual y seguimiento en vivo desde cualquier dispositivo.</p>
                  </div>
                </li>
                <li className="why-item">
                  <span className="wi-check">✓</span>
                  <div>
                    <div className="wi-title">Disponibilidad 24/7</div>
                    <p className="wi-desc">Atendemos tu solicitud en cualquier hora del día o la noche, los 365 días del año.</p>
                  </div>
                </li>
                <li className="why-item">
                  <span className="wi-check">✓</span>
                  <div>
                    <div className="wi-title">Validado por el Ministerio de Transporte</div>
                    <p className="wi-desc">Nuestro servicio cumple con todas las normativas y estándares exigidos por el Ministerio de Transporte, garantizando operaciones seguras, legales y de máxima calidad.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FLEET ── */}
      <section id="fleet" className="sec">
        <div className="wrap">
          <div className="fleet-head rv">
            <div>
              <div className="sec-tag">Nuestra flota</div>
              <h2 className="sec-h">Vehículos de<br />primer nivel</h2>
            </div>
            <p className="sec-p fleet-head-p">Selecciona el vehículo ideal para cada ocasión. Todos con mantenimiento certificado y equipamiento premium.</p>
          </div>
          <div className="fleet-grid">
            <div className="fleet-card rv d1">
              {fleetSlot('fleet1',
                <svg viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
                'Imagen del vehículo', 'Sedan ejecutivo'
              )}
              <div className="fleet-hover-info">
                <span className="fhi-name">Sedan Ejecutivo</span>
                <span className="fhi-type">Corporativo · Aeropuerto</span>
              </div>
              <div className="fleet-info">
                <span className="fi-name">Sedan Premium</span>
                <span className="fi-cap">Hasta 3 pasajeros</span>
              </div>
            </div>
            <div className="fleet-card rv d2">
              {fleetSlot('fleet2',
                <svg viewBox="0 0 24 24"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14l4 4v6a2 2 0 0 1-2 2h-2" /><circle cx="8" cy="17" r="2" /><circle cx="18" cy="17" r="2" /></svg>,
                'Imagen del vehículo', 'SUV de lujo'
              )}
              <div className="fleet-hover-info">
                <span className="fhi-name">SUV de Lujo</span>
                <span className="fhi-type">Grupos · Todo terreno</span>
              </div>
              <div className="fleet-info">
                <span className="fi-name">SUV Premium</span>
                <span className="fi-cap">Hasta 6 pasajeros</span>
              </div>
            </div>
            <div className="fleet-card rv d3">
              {fleetSlot('fleet3',
                <svg viewBox="0 0 24 24"><rect x="1" y="3" width="18" height="13" rx="2" /><path d="M19 8h2a2 2 0 0 1 2 2v5H19V8z" /><circle cx="6" cy="18.5" r="2.5" /><circle cx="16" cy="18.5" r="2.5" /></svg>,
                'Imagen del vehículo', 'Van ejecutiva'
              )}
              <div className="fleet-hover-info">
                <span className="fhi-name">Van Ejecutiva</span>
                <span className="fhi-type">Grupos · Eventos · Tours</span>
              </div>
              <div className="fleet-info">
                <span className="fi-name">Van de Lujo</span>
                <span className="fi-cap">Hasta 12 pasajeros</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials">
        <div className="wrap">
          <div className="test-head rv">
            <div className="sec-tag sec-tag-inv">Lo que dicen nuestros clientes</div>
            <h2 className="sec-h sec-h-inv">Experiencias que hablan</h2>
          </div>
          <div className="test-slider-wrap">
            <div className="test-track" id="test-track">
              <div className="test-card">
                <div className="test-card-inner">
                  <div className="tc-stars">★★★★★</div>
                  <p className="tc-text">"Llegué al aeropuerto con tiempo justo y el conductor ya estaba esperándome. El vehículo impecable, con agua y todo. Sin duda el mejor traslado que he tenido desde Valparaíso."</p>
                  <div className="tc-author">
                    <div className="tc-avatar">AM</div>
                    <div>
                      <div className="tc-name">Andrea Morales</div>
                      <div className="tc-role">Viajera frecuente · Viña del Mar</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="test-card">
                <div className="test-card-inner">
                  <div className="tc-stars">★★★★★</div>
                  <p className="tc-text">"Contraté el servicio para trasladar a un cliente importante desde el aeropuerto hasta su hotel en Valparaíso. Todo perfecto: puntual, profesional y el auto en excelente estado. El cliente quedó muy bien impresionado."</p>
                  <div className="tc-author">
                    <div className="tc-avatar">RP</div>
                    <div>
                      <div className="tc-name">Roberto Peña</div>
                      <div className="tc-role">Gerente Comercial · Santiago</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="test-card">
                <div className="test-card-inner">
                  <div className="tc-stars">★★★★★</div>
                  <p className="tc-text">"Usé el servicio compartido desde el Terminal VTP al aeropuerto. Muy cómodo, a tiempo y con buen precio. Los conductores muy atentos con el equipaje. Lo recomendaría a cualquier turista que llegue a Valparaíso."</p>
                  <div className="tc-author">
                    <div className="tc-avatar">SL</div>
                    <div>
                      <div className="tc-name">Sophie Laurent</div>
                      <div className="tc-role">Turista · Francia</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="test-card">
                <div className="test-card-inner">
                  <div className="tc-stars">★★★★★</div>
                  <p className="tc-text">"Necesitaba un vehículo adaptado para mi madre en silla de ruedas y TransKartz fue la única empresa que nos dio una solución real. La plataforma funcionó perfecto y el trato fue excelente durante todo el recorrido."</p>
                  <div className="tc-author">
                    <div className="tc-avatar">CG</div>
                    <div>
                      <div className="tc-name">Claudia González</div>
                      <div className="tc-role">Clienta · Concón</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="test-card">
                <div className="test-card-inner">
                  <div className="tc-stars">★★★★★</div>
                  <p className="tc-text">"Hicimos el tour por Valparaíso y Viña del Mar con guía en inglés. Increíble experiencia. El conductor conocía cada rincón y los horarios se respetaron al pie de la letra. Volveré a usarlos la próxima vez que visite Chile."</p>
                  <div className="tc-author">
                    <div className="tc-avatar">JW</div>
                    <div>
                      <div className="tc-name">James Wilson</div>
                      <div className="tc-role">Turista · Estados Unidos</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="test-dots" id="test-dots"></div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="cta">
        <div className="wrap cta-inner">
          <div className="cta-text rv">
            <h2 className="sec-h sec-h-inv">¿Listo para tu próximo viaje?</h2>
            <p className="sec-p">Contáctanos ahora y recibe una cotización en menos de 2 horas.</p>
          </div>
          <a href="#booking-strip" className="btn-p-inv magnetic rv d2"><span>Solicitar cotización</span></a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <div className="f-logo">
                <span className="logo-diamond" style={{ width: '20px', height: '20px' }}></span>
                <span><span className="lt">Trans</span>Kartz</span>
              </div>
              <div className="f-sub-logo">Tour &amp; Transfer</div>
              <p>Transporte privado de élite para quienes exigen lo mejor. Puntualidad, confort y seguridad en cada viaje.</p>
            </div>
            <div className="foot-col">
              <h4>Servicios</h4>
              <ul>
                <li><a href="#">Aeroportuario</a></li>
                <li><a href="#">Corporativo</a></li>
                <li><a href="#">Eventos VIP</a></li>
                <li><a href="#">Tours</a></li>
              </ul>
            </div>
            <div className="foot-col">
              <h4>Empresa</h4>
              <ul>
                <li><a href="#">Quiénes somos</a></li>
                <li><a href="#">Nuestra flota</a></li>
                <li><a href="#">Conductores</a></li>
                <li><a href="#">Certificaciones</a></li>
              </ul>
            </div>
            <div className="foot-col">
              <h4>Contacto</h4>
              <ul>
                <li><a href="#">+1 (555) 000-0000</a></li>
                <li><a href="#">contacto@transkartz.com</a></li>
                <li><a href="#">WhatsApp</a></li>
                <li><a href="#">24h · 7 días</a></li>
              </ul>
            </div>
          </div>
          <div className="foot-bot">
            <span className="foot-copy">© 2025 TransKartz Tour &amp; Transfer. Todos los derechos reservados.</span>
            <div className="foot-soc">
              <a className="soc-a" href="#">in</a>
              <a className="soc-a" href="#">ig</a>
              <a className="soc-a" href="#">tw</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
