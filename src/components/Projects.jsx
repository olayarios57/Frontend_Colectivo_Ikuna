import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Calendar, Theater, Music } from 'lucide-react';
import { apiService } from '../services/apiService';

// Mapeo de íconos según categoría
const iconMap = {
  'Espacios': MapPin,
  'Eventos': Calendar,
  'Festivales': Music,
  'Talleres': Theater,
  'default': Calendar
};

// Imagen por defecto por si no cargan una en el backend
const defaultImage = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800';

export function Projects() {
  const [projectLines, setProjectLines] = useState([]);
  const [carouselIndices, setCarouselIndices] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        // Llamada al backend
        const data = await apiService.getPortfolio();
        
        // Agrupar proyectos por categoría para adaptarlo al diseño existente
        const grouped = data.reduce((acc, project) => {
          const cat = project.category || 'Otros';
          
          if (!acc[cat]) {
            acc[cat] = {
              id: cat.toLowerCase().replace(/\s+/g, '-'),
              title: cat,
              description: `Proyectos y actividades de la línea: ${cat}`, 
              icon: iconMap[cat] || iconMap['default'],
              projects: []
            };
          }
          
          acc[cat].projects.push({
            id: project.id,
            title: project.title,
            description: project.description,
            date: project.date || 'Sin fecha', 
            location: 'Andes, Antioquia', // Dato estático por ahora, o lo agregas a tu DB luego
            image: project.imageUrl || defaultImage
          });
          
          return acc;
        }, {});

        const linesArray = Object.values(grouped);
        setProjectLines(linesArray);
        
        // Inicializar los índices del carrusel en 0 para cada categoría
        const indices = {};
        linesArray.forEach(line => indices[line.id] = 0);
        setCarouselIndices(indices);

      } catch (error) {
        console.error("Error cargando proyectos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const nextSlide = (lineId, maxIndex) => {
    setCarouselIndices((prev) => ({ ...prev, [lineId]: (prev[lineId] + 1) % maxIndex }));
  };

  const prevSlide = (lineId, maxIndex) => {
    setCarouselIndices((prev) => ({ ...prev, [lineId]: (prev[lineId] - 1 + maxIndex) % maxIndex }));
  };

  if (isLoading) {
    return (
      <div className="py-32 flex justify-center items-center" style={{ backgroundColor: '#ffffff' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#f18517]"></div>
      </div>
    );
  }

  return (
    <div className="py-16 px-6" style={{ backgroundColor: '#ffffff' }}>
      <div className="max-w-7xl mx-auto">
        <h1
          className="text-4xl md:text-5xl text-center mb-6"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300, color: '#f18517' }}
        >
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
              const currentIndex = carouselIndices[line.id];
              const currentProject = line.projects[currentIndex];

              return (
                <div key={line.id} className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ border: '1px solid #e0e0e0' }}>
                  <div className="p-8" style={{ backgroundColor: '#f5f5f5' }}>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f18517' }}>
                        <IconComponent className="text-white" size={24} />
                      </div>
                      <h2 className="text-3xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, color: '#1d1d1b' }}>
                        {line.title}
                      </h2>
                    </div>
                    <p style={{ color: '#808080' }}>{line.description}</p>
                  </div>

                  <div className="p-8">
                    <div className="relative">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="relative overflow-hidden rounded-lg aspect-video">
                          <img src={currentProject.image} alt={currentProject.title} className="w-full h-full object-cover" />
                          <button
                            onClick={() => prevSlide(line.id, line.projects.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                            style={{ backgroundColor: 'rgba(29, 29, 27, 0.7)', color: 'white' }}
                            aria-label="Previous project"
                          >
                            <ChevronLeft size={20} />
                          </button>
                          <button
                            onClick={() => nextSlide(line.id, line.projects.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                            style={{ backgroundColor: 'rgba(29, 29, 27, 0.7)', color: 'white' }}
                            aria-label="Next project"
                          >
                            <ChevronRight size={20} />
                          </button>
                        </div>

                        <div className="flex flex-col justify-center">
                          <h3 className="text-2xl mb-3" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                            {currentProject.title}
                          </h3>
                          <p className="mb-4 leading-relaxed" style={{ color: '#808080' }}>{currentProject.description}</p>
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

                      <div className="flex justify-center gap-2 mt-6">
                        {line.projects.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCarouselIndices((prev) => ({ ...prev, [line.id]: index }))}
                            className={`h-2 rounded-full transition-all ${index === currentIndex ? 'w-8' : 'w-2'}`}
                            style={{ backgroundColor: index === currentIndex ? '#f18517' : '#d0d0d0' }}
                            aria-label={`Go to project ${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>
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