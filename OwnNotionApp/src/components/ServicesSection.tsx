import { useState, useRef } from 'react';
import { validateImageFile, createSafeObjectURL } from '../utils/security';

interface Service {
  id: number;
  title: string;
  items: string[];
  phClass: string;
  icon: React.ReactNode;
}

interface ServicesSectionProps {
  editMode: boolean;
  onToast: (msg: string, type: 'success' | 'error') => void;
}

const UploadIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const CarIcon = () => (
  <svg width="90" height="90" viewBox="0 0 200 200" fill="none" opacity="0.12">
    <path d="M30 130 L30 100 L55 65 Q60 55 72 55 L128 55 Q140 55 145 65 L170 100 L170 130 Q170 140 160 140 L40 140 Q30 140 30 130Z" fill="white" />
    <circle cx="60" cy="142" r="18" fill="white" />
    <circle cx="60" cy="142" r="10" fill="none" stroke="white" strokeWidth="3" />
    <circle cx="140" cy="142" r="18" fill="white" />
    <circle cx="140" cy="142" r="10" fill="none" stroke="white" strokeWidth="3" />
    <rect x="75" y="62" width="50" height="32" rx="4" fill="none" stroke="white" strokeWidth="3" />
  </svg>
);

const VanIcon = () => (
  <svg width="90" height="90" viewBox="0 0 200 200" fill="none" opacity="0.12">
    <path d="M20 135 L20 95 L40 60 Q46 48 60 48 L150 48 Q165 48 170 60 L185 95 L185 135 Q185 145 175 145 L30 145 Q20 145 20 135Z" fill="white" />
    <circle cx="55" cy="147" r="20" fill="white" />
    <circle cx="55" cy="147" r="11" fill="none" stroke="white" strokeWidth="3" />
    <circle cx="150" cy="147" r="20" fill="white" />
    <circle cx="150" cy="147" r="11" fill="none" stroke="white" strokeWidth="3" />
    <line x1="100" y1="48" x2="100" y2="108" stroke="white" strokeWidth="3" />
  </svg>
);

const WheelchairIcon = () => (
  <svg width="80" height="80" viewBox="0 0 200 200" fill="none" opacity="0.12">
    <circle cx="110" cy="42" r="18" fill="white" />
    <path d="M110 62 L110 108 L140 108 L155 145" stroke="white" strokeWidth="10" strokeLinecap="round" />
    <path d="M78 80 L110 80" stroke="white" strokeWidth="10" strokeLinecap="round" />
    <circle cx="118" cy="158" r="30" fill="none" stroke="white" strokeWidth="10" />
    <path d="M110 108 L88 158" stroke="white" strokeWidth="10" strokeLinecap="round" />
  </svg>
);

const SERVICES: Service[] = [
  {
    id: 0,
    title: 'Servicios Privados',
    phClass: 'card-ph-1',
    icon: <CarIcon />,
    items: [
      'Traslado de ejecutivos de empresas.',
      'Servicios de traslados a Turistas.',
      'Servicios de traslados a aeropuerto.',
      'Servicios de tours, con o sin guía.',
    ],
  },
  {
    id: 1,
    title: 'Servicios Compartidos',
    phClass: 'card-ph-2',
    icon: <VanIcon />,
    items: [
      'Traslados desde terminal VTP a Santiago.',
      'Minibuses (VAN) para hasta 10 pasajeros con equipajes.',
      'Tours con guía en inglés, privados o compartidos.',
    ],
  },
  {
    id: 2,
    title: 'Servicios Especiales',
    phClass: 'card-ph-3',
    icon: <WheelchairIcon />,
    items: [
      'Vehículos con plataforma para sillas de ruedas.',
      'Traslados de hasta 8 pasajeros con equipajes más silla.',
      'Servicios de traslado y tours adaptados.',
    ],
  },
];

export default function ServicesSection({ editMode, onToast }: ServicesSectionProps) {
  const [images, setImages] = useState<(string | null)[]>([null, null, null]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeCardRef = useRef<number>(0);
  const urlsRef = useRef<string[]>([]);

  const handleCardClick = (idx: number) => {
    if (!editMode) return;
    activeCardRef.current = idx;
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(idx); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const err = validateImageFile(file);
    if (err) { onToast(err, 'error'); e.target.value = ''; return; }

    const url = createSafeObjectURL(file);
    urlsRef.current.push(url);

    const idx = activeCardRef.current;
    setImages(prev => prev.map((img, i) => i === idx ? url : img));
    onToast('Imagen actualizada correctamente ✓', 'success');
    e.target.value = '';
  };

  return (
    <section id="servicios" className="services" aria-labelledby="services-heading">
      <div className="section-header">
        <h2 className="section-title" id="services-heading">Nuestros Servicios</h2>
        <p className="section-subtitle">
          Soluciones de transporte para cada necesidad, con flota moderna y conductores certificados.
        </p>
      </div>

      <div className="services__grid">
        {SERVICES.map((svc, idx) => (
          <article key={svc.id} className="service-card">
            <div className="service-card__img-wrap">
              {images[idx] ? (
                <img src={images[idx]!} alt={svc.title} className="service-card__img" />
              ) : (
                <div className={`service-card__placeholder ${svc.phClass}`} aria-hidden="true">
                  {svc.icon}
                </div>
              )}

              {editMode && (
                <div
                  className="service-card__upload"
                  onClick={() => handleCardClick(idx)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Subir imagen para ${svc.title}`}
                  onKeyDown={e => handleKeyDown(e, idx)}
                >
                  <UploadIcon />
                  <span>Subir imagen</span>
                </div>
              )}
            </div>

            <div className="service-card__body">
              <h3 className="service-card__title">{svc.title}</h3>
              <ul className="service-card__list">
                {svc.items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          </article>
        ))}
      </div>

      {/* Reservation CTA */}
      <div className="services__cta">
        <a href="tel:+56999208283" className="cta-btn" aria-label="Llamar para reservar">
          <span className="cta-btn__label">Reserva:</span>
          56999208283
        </a>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />
    </section>
  );
}
