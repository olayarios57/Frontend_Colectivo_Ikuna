import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Calendar, Users, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoIkuna from '../assets/logo-ikuna.png';

// ════════════════════════════════════════════════════════════════════════════
// CARRUSEL DE IMÁGENES REALES
// ════════════════════════════════════════════════════════════════════════════
const carouselImages = [
  '/images/inicio/festival-rap-tres.jpg',   
  '/images/inicio/festival-seis.JPG',  
  '/images/inicio/puente.JPG',  
  '/images/inicio/festival2.jpg',   
  '/images/inicio/escaleras-tres.JPG',   
  '/images/inicio/sapoliso-dos.JPG',
  '/images/inicio/hospital-tres.JPG',    
  '/images/inicio/tejedoras.jpg',  
  '/images/inicio/grados-laboratorio.jpg',  
  '/images/inicio/laboratorio-cuatro.jpg', 

];

// Imagen de respaldo si alguna foto no carga
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1080';

const highlights = [
  { id: 1, icon: Sparkles, title: '+30 Proyectos',  description: 'Ejecutados exitosamente'  },
  { id: 2, icon: Calendar, title: '5 Años',          description: 'Transformando cultura'    },
  { id: 3, icon: Users,    title: '1000+ Personas',  description: 'Impactadas positivamente' },
  { id: 4, icon: Heart,    title: '8 Aliados',       description: 'Estratégicos regionales'  },
];

const WHATSAPP_CONTACT =
  'https://wa.me/573015816157?text=Saludos%20Ikunistas%2C%20quisiera%20recibir%20m%C3%A1s%20informaci%C3%B3n%20sobre%20los%20proyectos%20y%20servicios%20que%20brindan.';

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imgErrors,    setImgErrors]    = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselImages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % carouselImages.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + carouselImages.length) % carouselImages.length);

  const handleNavigate = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImgError = (index) => {
    setImgErrors(prev => ({ ...prev, [index]: true }));
  };

  return (
    <div className="relative">

      {/* ── Hero Banner ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: '#1d1d1b' }}>
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(241,133,24,0.3) 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 text-center relative z-10">
          <div className="mb-8" style={{ animation: 'float 3s ease-in-out infinite' }}>
            <img src={logoIkuna} alt="Ikuna Logo" className="w-40 h-40 md:w-48 md:h-48 mx-auto drop-shadow-2xl" />
          </div>

          <h1 className="text-6xl md:text-7xl mb-6"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300, color: 'white', animation: 'fadeIn 1s ease-in' }}>
            Colectivo Cultural Ikuna
          </h1>

          <p className="text-2xl md:text-3xl mb-4 max-w-3xl mx-auto"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300, color: '#f18517', animation: 'fadeIn 1.5s ease-in' }}>
            Construyamos Cultura
          </p>

          <p className="text-base md:text-lg mb-12 max-w-2xl mx-auto leading-relaxed"
            style={{ color: '#b0b0b0', animation: 'fadeIn 2s ease-in' }}>
            Somos un emprendimiento del municipio de Andes dedicado al desarrollo cultural,
            social y artístico, promoviendo la creatividad experiencial y la educación integral.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            style={{ animation: 'fadeIn 2.5s ease-in' }}>
            <button
              onClick={() => handleNavigate('/proyectos')}
              className="px-8 py-4 rounded-full hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105"
              style={{ backgroundColor: '#f18517', color: 'white' }}>
              Ver Proyectos <ArrowRight size={20} />
            </button>
            <button
              onClick={() => handleNavigate('/contacto')}
              className="px-8 py-4 rounded-full border-2 hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
              style={{ borderColor: '#f18517', color: 'white' }}>
              Contáctanos
            </button>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {highlights.map((h, i) => {
              const Icon = h.icon;
              return (
                <div key={h.id}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
                  style={{ animation: `fadeIn ${2.5 + i * 0.2}s ease-in`, border: '1px solid rgba(241,133,24,0.2)' }}>
                  <Icon className="mx-auto mb-3" size={32} style={{ color: '#f18517' }} />
                  <h3 className="text-xl mb-1"
                    style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: 'white' }}>
                    {h.title}
                  </h3>
                  <p className="text-sm" style={{ color: '#b0b0b0' }}>{h.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Carrusel de imágenes reales ── */}
      <section className="py-20 px-6" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl mb-4"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, color: '#f18517' }}>
              Nuestros Trabajos
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#808080' }}>
              Descubre los momentos más destacados de nuestros proyectos culturales y artísticos
            </p>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl" style={{ height: '500px' }}>
              {carouselImages.map((image, index) => (
                <div key={index} className="absolute inset-0 transition-opacity duration-1000"
                  style={{ opacity: index === currentSlide ? 1 : 0 }}>
                  <img
                    src={imgErrors[index] ? FALLBACK_IMAGE : image}
                    alt={`Proyecto ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={() => handleImgError(index)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              ))}
            </div>

            <button onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-xl"
              style={{ backgroundColor: '#1d1d1b', color: 'white' }} aria-label="Anterior">
              <ChevronLeft size={28} />
            </button>
            <button onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-xl"
              style={{ backgroundColor: '#1d1d1b', color: 'white' }} aria-label="Siguiente">
              <ChevronRight size={28} />
            </button>

            {/* Indicadores */}
            <div className="flex justify-center gap-2 mt-8">
              {carouselImages.map((_, index) => (
                <button key={index} onClick={() => setCurrentSlide(index)}
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: index === currentSlide ? '3rem' : '0.5rem',
                    backgroundColor: index === currentSlide ? '#f18517' : '#d0d0d0',
                  }}
                  aria-label={`Ir a foto ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <button onClick={() => handleNavigate('/proyectos')}
              className="px-8 py-4 rounded-full hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              style={{ backgroundColor: '#f18517', color: 'white' }}>
              Ver Todos los Proyectos
            </button>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}