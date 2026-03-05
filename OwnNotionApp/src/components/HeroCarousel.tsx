import { useState, useEffect, useCallback, useRef } from 'react';
import { validateImageFile, createSafeObjectURL } from '../utils/security';

interface Slide {
  id: number;
  imageUrl: string | null;
  title: string;
  titleAccent: string;
  subtitle: string;
  phClass: string;
}

interface HeroCarouselProps {
  editMode: boolean;
  onToast: (msg: string, type: 'success' | 'error') => void;
}

const SLIDES: Slide[] = [
  {
    id: 1, imageUrl: null, phClass: 'hero__placeholder-1',
    title: 'Traslados Ejecutivos',
    titleAccent: 'y Turísticos',
    subtitle: 'Vehículos modernos con conductores profesionales certificados',
  },
  {
    id: 2, imageUrl: null, phClass: 'hero__placeholder-2',
    title: 'Servicios VTP –',
    titleAccent: 'Santiago',
    subtitle: 'Traslados desde el Terminal de Pasajeros Valparaíso',
  },
  {
    id: 3, imageUrl: null, phClass: 'hero__placeholder-3',
    title: 'Vehículos con',
    titleAccent: 'Acceso Especial',
    subtitle: 'Plataforma para sillas de ruedas · hasta 8 pasajeros',
  },
  {
    id: 4, imageUrl: null, phClass: 'hero__placeholder-4',
    title: 'Tours con Guía',
    titleAccent: 'en Inglés',
    subtitle: 'Valparaíso, Viña del Mar, Valle de Casablanca y más',
  },
];

export default function HeroCarousel({ editMode, onToast }: HeroCarouselProps) {
  const [slides, setSlides] = useState<Slide[]>(SLIDES);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlsRef = useRef<string[]>([]);

  const total = slides.length;

  const next = useCallback(() => setCurrent(c => (c + 1) % total), [total]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + total) % total), [total]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [paused, next]);

  // Revoke object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => { urlsRef.current.forEach(url => URL.revokeObjectURL(url)); };
  }, []);

  const handleUploadClick = () => {
    if (!editMode) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const err = validateImageFile(file);
    if (err) { onToast(err, 'error'); e.target.value = ''; return; }

    const url = createSafeObjectURL(file);
    urlsRef.current.push(url);

    setSlides(prev =>
      prev.map((s, i) => i === current ? { ...s, imageUrl: url } : s)
    );
    onToast('Imagen actualizada correctamente ✓', 'success');
    e.target.value = '';
  };

  const ArrowIcon = ({ dir }: { dir: 'left' | 'right' }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dir === 'left'
        ? <polyline points="15 18 9 12 15 6" />
        : <polyline points="9 18 15 12 9 6" />}
    </svg>
  );

  return (
    <section id="inicio" className="hero" aria-label="Galería de presentación">
      {/* Track */}
      <div
        className="hero__track"
        style={{ transform: `translateX(-${current * 100}%)` }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className="hero__slide"
            aria-hidden={idx !== current}
          >
            {/* Background */}
            {slide.imageUrl ? (
              <img src={slide.imageUrl} alt={`${slide.title} ${slide.titleAccent}`} className="hero__slide-image" />
            ) : (
              <div className={`hero__placeholder ${slide.phClass}`} aria-hidden="true">
                <svg width="180" height="180" viewBox="0 0 200 200" fill="none" opacity="0.07">
                  <path d="M30 140 L30 100 Q30 80 50 80 L60 80 L75 55 Q80 45 90 45 L130 45 Q140 45 145 55 L160 80 L165 80 Q180 80 180 100 L180 140 Q180 150 170 150 L40 150 Q30 150 30 140Z" fill="white" />
                  <circle cx="100" cy="110" r="22" fill="white" />
                  <circle cx="100" cy="110" r="14" fill="none" stroke="white" strokeWidth="3" />
                </svg>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="hero__overlay" aria-hidden="true" />

            {/* Edit upload overlay */}
            {editMode && idx === current && (
              <div
                className="hero__upload-overlay"
                onClick={handleUploadClick}
                role="button"
                tabIndex={0}
                aria-label="Subir imagen para este slide"
                onKeyDown={e => e.key === 'Enter' && handleUploadClick()}
              >
                <div className="upload-icon-circle">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p className="upload-text">Haz clic para<br />subir una imagen</p>
              </div>
            )}

            {/* Slide text */}
            {idx === current && (
              <div className="hero__content">
                <h2 className="hero__title">
                  {slide.title}{' '}
                  <span className="hero__title-accent">{slide.titleAccent}</span>
                </h2>
                <p className="hero__subtitle">{slide.subtitle}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button className="hero__arrow hero__arrow--prev" onClick={prev} aria-label="Imagen anterior">
        <ArrowIcon dir="left" />
      </button>
      <button className="hero__arrow hero__arrow--next" onClick={next} aria-label="Siguiente imagen">
        <ArrowIcon dir="right" />
      </button>

      {/* Dots */}
      <div className="hero__dots" role="tablist" aria-label="Seleccionar slide">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`hero__dot${i === current ? ' active' : ''}`}
            onClick={() => setCurrent(i)}
            role="tab"
            aria-selected={i === current}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
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
