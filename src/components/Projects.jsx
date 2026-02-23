import { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Calendar, Theater, Music } from 'lucide-react';

const projectLines = [
  {
    id: 'espacios',
    title: 'Resignificación de Espacios',
    description: 'Transformación de espacios públicos en lugares de encuentro cultural y comunitario.',
    icon: MapPin,
    projects: [
      { id: 1, title: 'Plaza Cultural Centro',  description: 'Intervención artística en espacio público', date: '2024', location: 'Andes, Antioquia', image: 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800' },
      { id: 2, title: 'Parque de la Memoria',   description: 'Resignificación comunitaria del espacio',   date: '2023', location: 'Andes, Antioquia', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800' },
    ],
  },
  {
    id: 'eventos',
    title: 'Eventos Culturales',
    description: 'Organización y producción de eventos que celebran la diversidad cultural del territorio.',
    icon: Calendar,
    projects: [
      { id: 3, title: 'Noche de Cultura Viva', description: 'Festival de expresiones artísticas locales', date: '2024', location: 'Andes, Antioquia', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800' },
      { id: 4, title: 'Encuentro de Saberes',  description: 'Intercambio cultural comunitario',           date: '2023', location: 'Andes, Antioquia', image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800' },
    ],
  },
  {
    id: 'festivales',
    title: 'Festivales',
    description: 'Festivales diversos que integran música, arte, gastronomía y tradición.',
    icon: Music,
    projects: [
      { id: 5, title: 'Festival Cultural Ikuna', description: 'Celebración anual de la cultura local',   date: '2024', location: 'Andes, Antioquia', image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800' },
      { id: 6, title: 'Festival de las Artes',   description: 'Encuentro de artistas del Suroeste',      date: '2023', location: 'Andes, Antioquia', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800' },
    ],
  },
  {
    id: 'talleres',
    title: 'Talleres y Pedagogía Social',
    description: 'Formación y capacitación en procesos culturales y artísticos comunitarios.',
    icon: Theater,
    projects: [
      { id: 7, title: 'Taller de Teatro Comunitario', description: 'Formación en artes escénicas',            date: '2024', location: 'Andes, Antioquia', image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800' },
      { id: 8, title: 'Escuela de Gestión Cultural',  description: 'Capacitación en gestión de proyectos',   date: '2023', location: 'Andes, Antioquia', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800' },
    ],
  },
];

export function Projects() {
  const [carouselIndices, setCarouselIndices] = useState(
    Object.fromEntries(projectLines.map((line) => [line.id, 0]))
  );

  const nextSlide = (lineId, maxIndex) => {
    setCarouselIndices((prev) => ({ ...prev, [lineId]: (prev[lineId] + 1) % maxIndex }));
  };

  const prevSlide = (lineId, maxIndex) => {
    setCarouselIndices((prev) => ({ ...prev, [lineId]: (prev[lineId] - 1 + maxIndex) % maxIndex }));
  };

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
      </div>
    </div>
  );
}