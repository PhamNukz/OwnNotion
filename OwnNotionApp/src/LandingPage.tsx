import { useEffect } from 'react';
import './LandingPage.css';

export default function LandingPage() {
  useEffect(() => {
    // ── CURSOR ──────────────────────────────────────
    const dot  = document.getElementById('c-dot') as HTMLElement;
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

    const addHov = () => document.body.classList.add('hov');
    const remHov = () => document.body.classList.remove('hov');
    const hoverTargets = document.querySelectorAll('a,button,input,select,.svc-card,.fleet-card');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', addHov);
      el.addEventListener('mouseleave', remHov);
    });

    // ── MAGNETIC BUTTONS ────────────────────────────
    type Handler = { el: Element; mm: EventListener; ml: EventListener };
    const magHandlers: Handler[] = [];
    document.querySelectorAll('.magnetic').forEach(btn => {
      const mm: EventListener = (e) => {
        const me = e as MouseEvent;
        const r = btn.getBoundingClientRect();
        const x = (me.clientX - r.left - r.width  / 2) * 0.28;
        const y = (me.clientY - r.top  - r.height / 2) * 0.28;
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

    // ── PARTICLES ───────────────────────────────────
    const ptCont = document.getElementById('particles') as HTMLElement;
    for (let i = 0; i < 45; i++) {
      const p = document.createElement('div');
      p.className = 'pt';
      const s = Math.random() * 3 + 1;
      p.style.cssText = `width:${s}px;height:${s}px;left:${Math.random() * 100}%;animation-duration:${Math.random() * 14 + 10}s;animation-delay:${Math.random() * -25}s;opacity:${Math.random() * 0.45 + 0.08};`;
      ptCont.appendChild(p);
    }

    // ── DIAGONAL LINES ──────────────────────────────
    const lCont = document.getElementById('h-lines') as HTMLElement;
    for (let i = 0; i < 6; i++) {
      const l = document.createElement('div');
      l.className = 'h-line';
      l.style.cssText = `top:${15 + i * 13}%;width:${220 + Math.random() * 280}px;animation-duration:${7 + Math.random() * 7}s;animation-delay:${Math.random() * -14}s;`;
      lCont.appendChild(l);
    }

    // ── SCROLL REVEAL ────────────────────────────────
    const rvObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); rvObs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('.rv').forEach(el => rvObs.observe(el));

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
    const statsObs = new IntersectionObserver(es => { if (es[0].isIntersecting) runCounters(); }, { threshold: 0.5 });
    statsObs.observe(heroEl);
    const statsTimer = setTimeout(runCounters, 1200);

    // ── FLEET 3D TILT ─────────────────────────────────
    const fleetHandlers: Handler[] = [];
    document.querySelectorAll('.fleet-card').forEach(card => {
      const glow = card.querySelector('.fleet-tilt-glow') as HTMLElement;
      const mm: EventListener = (e) => {
        const me = e as MouseEvent;
        const r = card.getBoundingClientRect();
        const x = (me.clientX - r.left) / r.width  - 0.5;
        const y = (me.clientY - r.top)  / r.height - 0.5;
        (card as HTMLElement).style.transform = `perspective(700px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg) scale(1.025)`;
        (card as HTMLElement).style.transition = 'transform 0.08s ease';
        glow.style.setProperty('--mx', ((me.clientX - r.left) / r.width * 100) + '%');
        glow.style.setProperty('--my', ((me.clientY - r.top)  / r.height * 100) + '%');
      };
      const ml: EventListener = () => {
        (card as HTMLElement).style.transform = 'none';
        (card as HTMLElement).style.transition = 'transform 0.5s ease';
      };
      card.addEventListener('mousemove', mm);
      card.addEventListener('mouseleave', ml);
      fleetHandlers.push({ el: card, mm, ml });
    });

    // ── HERO PARALLAX ─────────────────────────────────
    const hContent = document.querySelector('.h-content') as HTMLElement;
    const onParallax = () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        hContent.style.transform = `translateY(${y * 0.28}px)`;
        hContent.style.opacity = String(Math.max(0, 1 - y / 580));
      }
    };
    window.addEventListener('scroll', onParallax, { passive: true });

    // ── CLEANUP ──────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(statsTimer);
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onNavScroll);
      window.removeEventListener('scroll', onParallax);
      hoverTargets.forEach(el => { el.removeEventListener('mouseenter', addHov); el.removeEventListener('mouseleave', remHov); });
      magHandlers.forEach(({ el, mm, ml }) => { el.removeEventListener('mousemove', mm); el.removeEventListener('mouseleave', ml); });
      fleetHandlers.forEach(({ el, mm, ml }) => { el.removeEventListener('mousemove', mm); el.removeEventListener('mouseleave', ml); });
      rvObs.disconnect();
      statsObs.disconnect();
      document.body.classList.remove('hov');
      if (ptCont) ptCont.innerHTML = '';
      if (lCont) lCont.innerHTML = '';
    };
  }, []);

  return (
    <>
      <div id="c-dot"></div>
      <div id="c-ring"></div>

      {/* NAVBAR */}
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
          <li><a href="#features">Nosotros</a></li>
          <li><a href="#booking">Contacto</a></li>
        </ul>
        <a href="#booking" className="nav-cta">Reservar ahora</a>
      </nav>

      {/* HERO */}
      <section id="hero">
        <div className="h-grid"></div>
        <div className="h-glow h-glow-1"></div>
        <div className="h-glow h-glow-2"></div>
        <div id="particles"></div>
        <div id="h-lines"></div>

        <div className="h-content">
          <div className="h-badge">Tour &amp; Transfer · Servicio de Élite</div>
          <h1 className="h-title">
            <span className="t1">VIAJA</span>
            <span className="t2">SIN</span>
            <span className="t3">LÍMITES</span>
          </h1>
          <p className="h-sub">
            Transporte privado de <strong>primera clase</strong> para ejecutivos, eventos y traslados
            aeroportuarios. Puntualidad, confort y discreción garantizados.
          </p>
          <div className="h-btns">
            <a href="#booking" className="btn-p magnetic"><span>Solicitar servicio</span></a>
            <a href="#fleet" className="btn-s magnetic">Ver flota</a>
          </div>
        </div>

        <div className="h-visual">
          <div className="h-frame">
            <span className="fc tl"></span><span className="fc tr"></span>
            <span className="fc bl"></span><span className="fc br"></span>
            <div className="ph-icon">
              <svg viewBox="0 0 24 24"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14l4 4v6a2 2 0 0 1-2 2h-2"/><circle cx="8" cy="17" r="2"/><circle cx="18" cy="17" r="2"/></svg>
            </div>
            <span className="ph-label">Imagen Principal</span>
            <span className="ph-sub">Vehículo o escena corporativa</span>
          </div>
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
            <div className="stat-l">Satisfacción del cliente</div>
          </div>
        </div>

        <div className="scroll-cue">
          <span className="sc-txt">Scroll</span>
          <div className="sc-line"></div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="sec">
        <div className="wrap">
          <div className="svc-head rv">
            <div className="sec-tag">Lo que hacemos</div>
            <h2 className="sec-h">Servicios<br />de élite</h2>
            <p className="sec-p">Cada servicio diseñado para superar expectativas con tecnología, profesionalismo y atención al detalle.</p>
          </div>
          <div className="svc-grid">
            <div className="svc-card rv d1">
              <div className="svc-ico"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div>
              <div className="svc-name">Traslados Aeroportuarios</div>
              <p className="svc-desc">Recogida y entrega puntual en todos los aeropuertos. Monitoreo de vuelos en tiempo real para garantizar tu llegada a tiempo, siempre.</p>
              <span className="svc-arr">→</span>
            </div>
            <div className="svc-card rv d2">
              <div className="svc-ico"><svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg></div>
              <div className="svc-name">Transporte Corporativo</div>
              <p className="svc-desc">Servicio discreto y profesional para ejecutivos y equipos. Flota premium con WiFi, temperatura controlada y conectividad total.</p>
              <span className="svc-arr">→</span>
            </div>
            <div className="svc-card rv d3">
              <div className="svc-ico"><svg viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
              <div className="svc-name">Tours y Excursiones</div>
              <p className="svc-desc">Descubre los mejores destinos con chóferes expertos. Rutas personalizadas para experiencias únicas e inolvidables.</p>
              <span className="svc-arr">→</span>
            </div>
            <div className="svc-card rv d4">
              <div className="svc-ico"><svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
              <div className="svc-name">Eventos Especiales</div>
              <p className="svc-desc">Bodas, galas y eventos VIP con vehículos de lujo y coordinación logística impecable para grupos de cualquier tamaño.</p>
              <span className="svc-arr">→</span>
            </div>
          </div>
        </div>
      </section>

      {/* FLEET */}
      <section id="fleet" className="sec">
        <div className="wrap">
          <div className="fleet-top rv">
            <div>
              <div className="sec-tag">Nuestra flota</div>
              <h2 className="sec-h">Vehículos de<br />primer nivel</h2>
            </div>
            <p className="sec-p">Selecciona el vehículo ideal para cada ocasión. Todos con mantenimiento certificado y equipamiento premium.</p>
          </div>
          <div className="fleet-grid">
            <div className="fleet-card rv d1">
              <div className="fleet-ph">
                <div className="fleet-tilt-glow"></div>
                <svg viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                <span className="ph-label">Imagen del vehículo</span>
                <span className="ph-sub">Sedan ejecutivo</span>
              </div>
              <div className="fleet-hover-info">
                <span className="fhi-name">Sedan Ejecutivo</span>
                <span className="fhi-type">Viajes corporativos · Aeropuerto</span>
              </div>
              <div className="fleet-info">
                <span className="fi-name">Sedan Premium</span>
                <span className="fi-cap">Hasta 3 pasajeros</span>
              </div>
            </div>
            <div className="fleet-card rv d2">
              <div className="fleet-ph">
                <div className="fleet-tilt-glow"></div>
                <svg viewBox="0 0 24 24"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14l4 4v6a2 2 0 0 1-2 2h-2"/><circle cx="8" cy="17" r="2"/><circle cx="18" cy="17" r="2"/></svg>
                <span className="ph-label">Imagen del vehículo</span>
                <span className="ph-sub">SUV de lujo</span>
              </div>
              <div className="fleet-hover-info">
                <span className="fhi-name">SUV de Lujo</span>
                <span className="fhi-type">Grupos pequeños · Todo terreno</span>
              </div>
              <div className="fleet-info">
                <span className="fi-name">SUV Premium</span>
                <span className="fi-cap">Hasta 6 pasajeros</span>
              </div>
            </div>
            <div className="fleet-card rv d3">
              <div className="fleet-ph">
                <div className="fleet-tilt-glow"></div>
                <svg viewBox="0 0 24 24"><rect x="1" y="3" width="18" height="13" rx="2"/><path d="M19 8h2a2 2 0 0 1 2 2v5H19V8z"/><circle cx="6" cy="18.5" r="2.5"/><circle cx="16" cy="18.5" r="2.5"/></svg>
                <span className="ph-label">Imagen del vehículo</span>
                <span className="ph-sub">Van ejecutiva</span>
              </div>
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

      {/* FEATURES */}
      <section id="features" className="sec">
        <div className="wrap">
          <div className="feat-layout">
            <div className="feat-visual rv">
              <div className="feat-frame">
                <span className="fc tl"></span><span className="fc tr"></span>
                <span className="fc bl"></span><span className="fc br"></span>
                <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span className="ph-label">Imagen institucional</span>
                <span className="ph-sub">Interior de vehículo o equipo</span>
              </div>
              <div className="f-badge b1">
                <div className="fb-icon">⚡</div>
                <div><div className="fb-val">24/7</div><div className="fb-desc">Disponibilidad total</div></div>
              </div>
              <div className="f-badge b2">
                <div className="fb-icon">🛡</div>
                <div><div className="fb-val">100%</div><div className="fb-desc">Conductores certificados</div></div>
              </div>
            </div>
            <div className="feat-list rv d2">
              <div className="sec-tag">Por qué elegirnos</div>
              <h2 className="sec-h">Excelencia en cada kilómetro</h2>
              <div className="feat-sep"></div>
              <div className="feat-item">
                <span className="feat-num">01</span>
                <div>
                  <div className="feat-title">Puntualidad garantizada</div>
                  <p className="feat-desc">Monitoreamos el tráfico en tiempo real y planificamos cada ruta con precisión milimétrica para asegurar tu llegada a tiempo, siempre.</p>
                </div>
              </div>
              <div className="feat-sep"></div>
              <div className="feat-item">
                <span className="feat-num">02</span>
                <div>
                  <div className="feat-title">Conductores profesionales</div>
                  <p className="feat-desc">Equipo certificado con experiencia en protocolo ejecutivo, idiomas y manejo defensivo. Discreción absoluta garantizada.</p>
                </div>
              </div>
              <div className="feat-sep"></div>
              <div className="feat-item">
                <span className="feat-num">03</span>
                <div>
                  <div className="feat-title">Confort y tecnología</div>
                  <p className="feat-desc">Vehículos con interiores premium, WiFi, agua mineral, climatización individual y asistente de ruta en tiempo real.</p>
                </div>
              </div>
              <div className="feat-sep"></div>
              <div className="feat-item">
                <span className="feat-num">04</span>
                <div>
                  <div className="feat-title">Seguimiento en vivo</div>
                  <p className="feat-desc">Accede al estado de tu servicio desde cualquier dispositivo. Comunicación directa con tu conductor durante todo el trayecto.</p>
                </div>
              </div>
              <div className="feat-sep"></div>
            </div>
          </div>
        </div>
      </section>

      {/* BOOKING */}
      <section id="booking" className="sec">
        <div className="wrap">
          <div className="book-layout">
            <div className="book-info rv">
              <div>
                <div className="sec-tag">Reservas</div>
                <h2 className="sec-h">Solicita tu<br />servicio hoy</h2>
                <p className="sec-p">Completa el formulario y nos comunicamos en menos de 2 horas para confirmar tu reserva.</p>
              </div>
              <div className="book-contacts">
                <div className="con-item">
                  <div className="con-icon"><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/></svg></div>
                  <div><div className="con-lbl">Teléfono</div><div className="con-val">+1 (555) 000-0000</div></div>
                </div>
                <div className="con-item">
                  <div className="con-icon"><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
                  <div><div className="con-lbl">Email</div><div className="con-val">contacto@transkartz.com</div></div>
                </div>
                <div className="con-item">
                  <div className="con-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
                  <div><div className="con-lbl">Disponibilidad</div><div className="con-val">24 horas · 7 días</div></div>
                </div>
              </div>
            </div>

            <div className="rv d2">
              <form className="book-form" onSubmit={e => e.preventDefault()}>
                <div className="f-row">
                  <div className="f-group">
                    <label className="f-lbl" htmlFor="nombre">Nombre</label>
                    <input id="nombre" className="f-inp" type="text" placeholder="Tu nombre completo" />
                  </div>
                  <div className="f-group">
                    <label className="f-lbl" htmlFor="telefono">Teléfono</label>
                    <input id="telefono" className="f-inp" type="tel" placeholder="+1 555 000 000" />
                  </div>
                </div>
                <div className="f-group">
                  <label className="f-lbl" htmlFor="email">Email</label>
                  <input id="email" className="f-inp" type="email" placeholder="tu@email.com" />
                </div>
                <div className="f-row">
                  <div className="f-group">
                    <label className="f-lbl" htmlFor="servicio">Tipo de servicio</label>
                    <select id="servicio" className="f-sel f-inp">
                      <option value="">Seleccionar...</option>
                      <option>Traslado aeroportuario</option>
                      <option>Corporativo</option>
                      <option>Evento especial</option>
                      <option>Tour / Excursión</option>
                    </select>
                  </div>
                  <div className="f-group">
                    <label className="f-lbl" htmlFor="vehiculo">Vehículo</label>
                    <select id="vehiculo" className="f-sel f-inp">
                      <option value="">Seleccionar...</option>
                      <option>Sedan Ejecutivo</option>
                      <option>SUV Premium</option>
                      <option>Van de Lujo</option>
                    </select>
                  </div>
                </div>
                <div className="f-row">
                  <div className="f-group">
                    <label className="f-lbl" htmlFor="fecha">Fecha</label>
                    <input id="fecha" className="f-inp" type="date" />
                  </div>
                  <div className="f-group">
                    <label className="f-lbl" htmlFor="pasajeros">Pasajeros</label>
                    <input id="pasajeros" className="f-inp" type="number" placeholder="Nº pasajeros" min={1} max={50} />
                  </div>
                </div>
                <div className="f-group">
                  <label className="f-lbl" htmlFor="detalles">Detalles adicionales</label>
                  <input id="detalles" className="f-inp" type="text" placeholder="Origen, destino, observaciones..." />
                </div>
                <button className="f-btn magnetic" type="submit"><span>Enviar solicitud</span></button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
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
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Privacidad</a></li>
                <li><a href="#">Términos de uso</a></li>
                <li><a href="#">Cookies</a></li>
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
