import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Calendar, Theater, Music, Loader } from 'lucide-react';
import { apiService } from '../services/apiService';

// ── Mapeo de íconos por categoría ────────────────────────────────────────────
const iconMap = {
  'Resignificación de Espacios': MapPin,
  'Eventos Culturales':          Calendar,
  'Festivales':                  Music,
  'Talleres y Pedagogía':        Theater,
};

const defaultImage = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800';

// ════════════════════════════════════════════════════════════════════════════
// images: array con las rutas de las fotos del carrusel del proyecto.
//         Imágenes guardadas en: public/images/proyectos/
// ════════════════════════════════════════════════════════════════════════════
const STATIC_PROJECTS = [
  // ── RESIGNIFICACIÓN DE ESPACIOS ─────────────────────────────────────────
  {
    id:          1,
    category:    'Resignificación de Espacios',
    title:       'Matices Ancestrales',                          
    description: 'Proyecto de intervención artística y cultural del espacio público de la calle Arboleda, generando un lugar de encuentro para la comunidad y la dinámica cotidiana de los habitantes.',
    date:        'Año 2020',                                    
    location:    'Andes, Antioquia',
    images: [                                                      
      '/images/proyectos/matices.jpg',
    ],
  },
  {
    id:          2,
    category:    'Resignificación de Espacios',
    title:       'Andes, Chivas y Café',                     
    description: 'Proyecto de Megamuralismo, desarrollado para propiciar la resignificación de los espacios a través del arte.',
    date:        '2021',
    location:    'Andes, Antioquia',
    images: [
      '/images/proyectos/sapoliso-cuatro.JPG',
      '/images/proyectos/sapoliso-tres.JPG',
      '/images/proyectos/puente-terminado.jpg',
      '/images/proyectos/mosaico-terminado.jpg',
    ],
  },

  // ── EVENTOS CULTURALES ────────────────────────────────────────────────────
  {
    id:          3,
    category:    'Eventos Culturales',
    title:       'Huellas rurales',                       
    description: 'Iniciativa de articulación con la Corporación Adagio de La Unión, donde se desarrolló trabajo comunitario en torno al tejido y a la construcción de dinámicas territoriales.',
    date:        '2022',
    location:    'Vereda San Gregorio, Andes, Antioquia',
    images: [
      '/images/proyectos/huellas-rurales.jpg',
      '/images/proyectos/huellas-rurales-dos.jpg',
    ],
  },
  {
    id:          4,
    category:    'Eventos Culturales',
    title:       'Encuentro Cultural Literario',                  
    description: 'Encuentros de reconocimiento literario a escritores y escritoras locales.',
    date:        '2022',
    location:    'Parque Principal de Andes, Antioquia',
    images: [
      '/images/proyectos/gonzalo.jpg',
      '/images/proyectos/gonzalo-dos.jpg',
    ],
  },

  // ── FESTIVALES ─────────────────────────────────────────────────────────────
  {
    id:          5,
    category:    'Festivales',
    title:       'Festival Días del Arcoíris',                      
    description: 'Festival anual que festeja, celebra, defiende y educa en torno a temáticas y derechos LGBTIQ+.',
    date:        '2020',
    location:    'Coliseo Municipal, Andes, Antioquia',
    images: [
      '/images/proyectos/festival.jpg',
      '/images/proyectos/festival2.jpg',
    ],
  },
  {
    id:          6,
    category:    'Festivales',
    title:       'Parchados Rap Festival',              
    description: 'Festival de música urbana que reune diferentes exponentes de la región en el género rap.',
    date:        '2022',
    location:    'Sinforoso - Andes, Antioquia',
    images: [
      '/images/proyectos/festival-rap-cinco.jpg',
      '/images/proyectos/festival-rap-cuatro.jpg',
      '/images/proyectos/rap-2025.jpg',
    ],
  },

  // ── TALLERES Y PEDAGOGÍA ──────────────────────────────────────────────────
  {
    id:          7,
    category:    'Talleres y Pedagogía',
    title:       'Escuela de las Diversidades',                   
    description: 'Proceso formativo dirigido a líderes y lideresas juveniles del Suroeste Antioqueño sobre políticas, derechos y temáticas LGBTIQ+ desde las artes y la cultura.',
    date:        '2024',
    location:    'Andes y Ciudad Bolívar, Antioquia',
    images: [
      '/images/proyectos/escuela-diversa.jpg',
      '/images/proyectos/escuela-diversa-dos.jpg',
    ],
  },
  {
    id:          8,
    category:    'Talleres y Pedagogía',
    title:       'Laboratorio de creación Raíces',                    
    description: 'Proceso de formación artística dirigido a artistas experimentales o con trayectoria del Suroeste Antioqueño en el Marco de la Bienal Internacional de Antioquia y Medellín.',
    date:        '2025',
    location:    'Andes y Jericó, Antioquia',
    images: [
      '/images/proyectos/laboratorio-cinco.jpg',
      '/images/proyectos/laboratorio.jpg',
    ],
  },
];

// ── Agrupa proyectos por categoría ────────────────────────────────────────────
function groupByCategory(list) {
  return list.reduce((acc, project) => {
    const cat = project.category || 'Otros';
    if (!acc[cat]) {
      acc[cat] = {
        id:          cat.toLowerCase().replace(/\s+/g, '-'),
        title:       cat,
        icon:        iconMap[cat] || Calendar,
        description: `Proyectos de la línea: ${cat}`,
        projects:    [],
      };
    }
    acc[cat].projects.push({
      ...project,
      image:  project.images?.[0] || project.imageUrl || defaultImage,
    });
    return acc;
  }, {});
}

// ════════════════════════════════════════════════════════════════════════════
export function Projects() {
  const [projectLines,    setProjectLines]    = useState([]);
  const [lineIndices,     setLineIndices]     = useState({}); // índice de proyecto activo por línea
  const [imageIndices,    setImageIndices]    = useState({}); // índice de imagen activa por proyecto
  const [isLoading,       setIsLoading]       = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        // Intenta cargar desde el backend; solo proyectos completados (100% ejecutados)
        const data = await apiService.getPortfolio();
        const completed = (data || []).filter(p => p.status === 'completed');
        const grouped = groupByCategory(completed.length > 0 ? completed : STATIC_PROJECTS);
        initState(grouped);
      } catch {
        // Si el backend no responde, usa los datos estáticos
        const grouped = groupByCategory(STATIC_PROJECTS);
        initState(grouped);
      } finally {
        setIsLoading(false);
      }
    };

    const initState = (grouped) => {
      const lines = Object.values(grouped);
      setProjectLines(lines);
      const li = {}, ii = {};
      lines.forEach(line => {
        li[line.id] = 0;
        line.projects.forEach(p => { ii[p.id] = 0; });
      });
      setLineIndices(li);
      setImageIndices(ii);
    };

    fetchProjects();
  }, []);

  // Navegar entre proyectos de una línea
  const nextProject = (lineId, total) =>
    setLineIndices(prev => ({ ...prev, [lineId]: (prev[lineId] + 1) % total }));
  const prevProject = (lineId, total) =>
    setLineIndices(prev => ({ ...prev, [lineId]: (prev[lineId] - 1 + total) % total }));

  // Navegar entre imágenes de un proyecto
  const nextImage = (projectId, total) =>
    setImageIndices(prev => ({ ...prev, [projectId]: (prev[projectId] + 1) % total }));
  const prevImage = (projectId, total) =>
    setImageIndices(prev => ({ ...prev, [projectId]: (prev[projectId] - 1 + total) % total }));

  if (isLoading) {
    return (
      <div className="py-32 flex justify-center items-center" style={{ backgroundColor: '#ffffff' }}>
        <Loader className="animate-spin" size={48} style={{ color: '#f18517' }} />
      </div>
    );
  }

  return (
    <div className="py-16 px-6" style={{ backgroundColor: '#ffffff' }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl text-center mb-6"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300, color: '#f18517' }}>
          Nuestros Proyectos
        </h1>
        <p className="text-center text-lg mb-16 max-w-3xl mx-auto" style={{ color: '#808080' }}>
          Descubre nuestras líneas de trabajo y los proyectos que transforman el territorio a través de la cultura.
        </p>

        {projectLines.length === 0 ? (
          <div className="text-center p-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Aún no hay proyectos publicados.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {projectLines.map((line) => {
              const IconComponent = line.icon;
              const currentProjectIdx = lineIndices[line.id] ?? 0;
              const currentProject    = line.projects[currentProjectIdx];
              if (!currentProject) return null;

              const currentImageIdx = imageIndices[currentProject.id] ?? 0;
              const images = currentProject.images || [currentProject.image || defaultImage];
              const currentImage = images[currentImageIdx] || defaultImage;

              return (
                <div key={line.id} className="bg-white rounded-xl shadow-lg overflow-hidden"
                  style={{ border: '1px solid #e0e0e0' }}>

                  {/* ── Cabecera de línea ── */}
                  <div className="p-8" style={{ backgroundColor: '#f5f5f5' }}>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: '#f18517' }}>
                        <IconComponent className="text-white" size={24} />
                      </div>
                      <h2 className="text-3xl"
                        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, color: '#1d1d1b' }}>
                        {line.title}
                      </h2>
                    </div>
                    <p style={{ color: '#808080' }}>{line.description}</p>
                  </div>

                  <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                      {/* ── Carrusel de imágenes del proyecto ── */}
                      <div className="relative overflow-hidden rounded-lg aspect-video bg-gray-100">
                        <img
                          src={currentImage}
                          alt={currentProject.title}
                          className="w-full h-full object-cover"
                          onError={e => { e.target.src = defaultImage; }}
                        />

                        {/* Flechas de imagen (solo si hay más de 1 imagen) */}
                        {images.length > 1 && (
                          <>
                            <button onClick={() => prevImage(currentProject.id, images.length)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                              style={{ backgroundColor: 'rgba(29,29,27,0.7)', color: 'white' }}
                              aria-label="Imagen anterior">
                              <ChevronLeft size={18} />
                            </button>
                            <button onClick={() => nextImage(currentProject.id, images.length)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                              style={{ backgroundColor: 'rgba(29,29,27,0.7)', color: 'white' }}
                              aria-label="Imagen siguiente">
                              <ChevronRight size={18} />
                            </button>
                            {/* Puntos indicadores de imagen */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                              {images.map((_, idx) => (
                                <button key={idx}
                                  onClick={() => setImageIndices(prev => ({ ...prev, [currentProject.id]: idx }))}
                                  className="rounded-full transition-all"
                                  style={{ width: idx === currentImageIdx ? '1.5rem' : '0.4rem', height: '0.4rem', backgroundColor: idx === currentImageIdx ? '#f18517' : 'rgba(255,255,255,0.8)' }}
                                  aria-label={`Ir a imagen ${idx + 1}`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {/* ── Detalle del proyecto ── */}
                      <div className="flex flex-col justify-center">
                        <h3 className="text-2xl mb-3"
                          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                          {currentProject.title}
                        </h3>
                        <p className="mb-4 leading-relaxed" style={{ color: '#808080' }}>
                          {currentProject.description}
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar size={18} style={{ color: '#f18517' }} />
                            <span style={{ color: '#1d1d1b' }}>{currentProject.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={18} style={{ color: '#f18517' }} />
                            <span style={{ color: '#1d1d1b' }}>{currentProject.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── Selector de proyecto dentro de la línea ── */}
                    {line.projects.length > 1 && (
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium" style={{ color: '#808080' }}>
                            Proyecto {currentProjectIdx + 1} de {line.projects.length}
                          </span>
                          <div className="flex gap-2">
                            <button onClick={() => prevProject(line.id, line.projects.length)}
                              className="w-9 h-9 rounded-full flex items-center justify-center border transition-all hover:shadow-md"
                              style={{ borderColor: '#e0e0e0', color: '#1d1d1b' }}
                              aria-label="Proyecto anterior">
                              <ChevronLeft size={18} />
                            </button>
                            <button onClick={() => nextProject(line.id, line.projects.length)}
                              className="w-9 h-9 rounded-full flex items-center justify-center border transition-all hover:shadow-md"
                              style={{ borderColor: '#e0e0e0', color: '#1d1d1b' }}
                              aria-label="Proyecto siguiente">
                              <ChevronRight size={18} />
                            </button>
                          </div>
                        </div>
                        {/* Puntos indicadores de proyecto */}
                        <div className="flex justify-center gap-2">
                          {line.projects.map((_, idx) => (
                            <button key={idx}
                              onClick={() => setLineIndices(prev => ({ ...prev, [line.id]: idx }))}
                              className="h-2 rounded-full transition-all"
                              style={{ width: idx === currentProjectIdx ? '2rem' : '0.5rem', backgroundColor: idx === currentProjectIdx ? '#f18517' : '#d0d0d0' }}
                              aria-label={`Ir al proyecto ${idx + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}