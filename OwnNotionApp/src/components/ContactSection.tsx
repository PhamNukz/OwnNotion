import { useState } from 'react';
import { validateEmail, sanitizeInput } from '../utils/security';

interface FormState {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
}

interface FormErrors {
  nombre?: string;
  email?: string;
  mensaje?: string;
}

const ZONA_CENTRAL = ['Aeropuerto Internacional AMB', 'Hoteles en Santiago', 'Valle de Casablanca'];
const ZONA_COSTERA = ['Hoteles Valparaíso', 'Viña del Mar', 'Reñaca / Concón', 'Zapallar / San Antonio'];

export default function ContactSection() {
  const [form, setForm] = useState<FormState>({ nombre: '', email: '', asunto: '', mensaje: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido.';
    if (!form.email.trim()) e.email = 'El email es requerido.';
    else if (!validateEmail(form.email)) e.email = 'Ingresa un email válido.';
    if (!form.mensaje.trim()) e.mensaje = 'El mensaje es requerido.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Limit length to prevent excessive input
    const limited = value.slice(0, name === 'mensaje' ? 1000 : 200);
    setForm(prev => ({ ...prev, [name]: limited }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('sending');

    // Sanitize before "sending" (in production, send to your backend/email API here)
    const payload = {
      nombre: sanitizeInput(form.nombre),
      email: sanitizeInput(form.email),
      asunto: sanitizeInput(form.asunto),
      mensaje: sanitizeInput(form.mensaje),
    };

    // Simulate async send (replace with real fetch/axios call to your backend)
    console.info('Form payload (sanitized):', payload);
    setTimeout(() => {
      setStatus('success');
      setForm({ nombre: '', email: '', asunto: '', mensaje: '' });
    }, 1200);
  };

  return (
    <>
      <section id="nosotros" className="contact-section" aria-labelledby="contact-heading">
        <div className="inner">
          {/* ── Contact form ── */}
          <div>
            <h2 className="contact__title" id="contact-heading">Contáctanos</h2>
            <p className="contact__subtitle">Contáctanos para recibir un presupuesto personalizado.</p>

            {status === 'success' ? (
              <div className="form-success" role="status" aria-live="polite">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                ¡Mensaje enviado! Te responderemos a la brevedad.
              </div>
            ) : (
              <form className="contact__form" onSubmit={handleSubmit} noValidate>
                <div className="form-field">
                  <label htmlFor="nombre">Nombre *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    className={`form-input${errors.nombre ? ' input-error' : ''}`}
                    placeholder="Tu nombre completo"
                    value={form.nombre}
                    onChange={handleChange}
                    autoComplete="name"
                    maxLength={200}
                  />
                  {errors.nombre && <span className="form-error-msg" role="alert">{errors.nombre}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`form-input${errors.email ? ' input-error' : ''}`}
                    placeholder="tu@email.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    maxLength={200}
                  />
                  {errors.email && <span className="form-error-msg" role="alert">{errors.email}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="asunto">Asunto</label>
                  <input
                    type="text"
                    id="asunto"
                    name="asunto"
                    className="form-input"
                    placeholder="¿En qué podemos ayudarte?"
                    value={form.asunto}
                    onChange={handleChange}
                    maxLength={200}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="mensaje">Mensaje *</label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    className={`form-input${errors.mensaje ? ' input-error' : ''}`}
                    placeholder="Cuéntanos sobre tu traslado: fecha, destino, número de pasajeros..."
                    value={form.mensaje}
                    onChange={handleChange}
                    maxLength={1000}
                  />
                  {errors.mensaje && <span className="form-error-msg" role="alert">{errors.mensaje}</span>}
                </div>

                <div className="form-footer">
                  <span className="form-note">* Campos requeridos</span>
                  <button
                    type="submit"
                    className="form-submit-btn"
                    disabled={status === 'sending'}
                  >
                    {status === 'sending' ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        Enviando...
                      </>
                    ) : 'Enviar'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ── Service areas ── */}
          <div id="vehiculos">
            <h2 className="areas__title">Áreas De Servicio</h2>
            <p className="areas__description">
              Nuestra oficina central se ubica en Valparaíso, interior Terminal de Pasajeros VTP,
              lo que nos permite entregar atención segura y directa para tu traslado.
            </p>

            <div className="areas__card" role="table" aria-label="Zonas de cobertura">
              <div className="areas__header" role="row">
                <div className="areas__header-cell" role="columnheader">Zona Central</div>
                <div className="areas__header-cell" role="columnheader">Zona Costera</div>
              </div>
              <div className="areas__body">
                <div className="areas__col" role="cell">
                  {ZONA_CENTRAL.map(item => (
                    <div key={item} className="areas__item">{item}</div>
                  ))}
                </div>
                <div className="areas__col" role="cell">
                  {ZONA_COSTERA.map(item => (
                    <div key={item} className="areas__item">{item}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer-bar">
        © {new Date().getFullYear()} TransKartz Tour &amp; Transfer · Valparaíso, Chile ·{' '}
        <a href="mailto:kartz@kartz.cl" style={{ color: 'inherit', textDecoration: 'underline' }}>kartz@kartz.cl</a>
      </footer>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
