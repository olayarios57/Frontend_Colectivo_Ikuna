import { Target, Eye, Heart, Users, Handshake } from 'lucide-react';

const identityData = {
  mission: 'Somos un emprendimiento del municipio de Andes conformado para el desarrollo cultural, social y artístico, que busca promover y fomentar la creatividad experiencial y la educación integral para generar apropiación del conocimiento territorial con vías a la construcción de tejido social en el Suroeste Antioqueño, mediante la articulación del sector público / privado. Con el desarrollo de procesos de resignificación de espacios, eventos y festivales diversos, talleres, pedagogía social y proyectos culturales.',
  vision: 'Para el año 2030 se espera que el colectivo sea autosostenible y tenga la experiencia suficiente en el trabajo a nivel local para proyectarse en escenarios departamentales y nacionales, alcanzando un reconocimiento por el fomento de la creatividad experiencial y la educación integral a través de los procesos culturales, generando transformación ciudadana en Andes, Antioquia y demás municipios del departamento.',
  values: [
    { id: 'amistad',     title: 'Amistad',      icon: Heart,  description: 'Es la estructura sobre la cual se crean los lazos de confianza, que a su vez posibilitan los procesos creativos y del hacer.' },
    { id: 'proactividad',title: 'Proactividad', icon: Target, description: 'Obtener nuevos conocimientos es parte de nuestra esencia. Esperar no es una opción; moverse y provocar los sucesos es nuestro ADN.' },
    { id: 'pasion',      title: 'Pasión',        icon: Heart,  description: 'Nos permitimos disfrutar cada intervención, porque en IKUNA la pasión hace que los procesos se llenen de magia.' },
  ],
  team: [
    { id: 1, name: 'María González',  role: 'Directora Cultural',    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' },
    { id: 2, name: 'Carlos Rodríguez',role: 'Coordinador de Proyectos',photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
    { id: 3, name: 'Ana Martínez',    role: 'Gestora Cultural',       photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400' },
    { id: 4, name: 'Juan Pérez',      role: 'Productor Artístico',    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400' },
  ],
  allies: [
    { id: 1, name: 'Ministerio de Cultura' },
    { id: 2, name: 'Alcaldía de Andes' },
    { id: 3, name: 'Gobernación de Antioquia' },
    { id: 4, name: 'Organizaciones Culturales' },
  ],
};

export function Identity() {
  return (
    <div className="py-16 px-6" style={{ backgroundColor: '#ffffff' }}>
      <div className="max-w-7xl mx-auto">
        <h1
          className="text-4xl md:text-5xl text-center mb-16"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300, color: '#f18517' }}
        >
          Nuestra Identidad
        </h1>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 border" style={{ borderColor: '#f18517' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f18517' }}>
                <Target className="text-white" size={24} />
              </div>
              <h2 className="text-2xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, color: '#1d1d1b' }}>
                Misión
              </h2>
            </div>
            <p className="leading-relaxed" style={{ color: '#1d1d1b' }}>{identityData.mission}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border" style={{ borderColor: '#f18517' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f18517' }}>
                <Eye className="text-white" size={24} />
              </div>
              <h2 className="text-2xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, color: '#1d1d1b' }}>
                Visión
              </h2>
            </div>
            <p className="leading-relaxed" style={{ color: '#1d1d1b' }}>{identityData.vision}</p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl text-center mb-8" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, color: '#f18517' }}>
            Valores Corporativos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {identityData.values.map((value) => {
              const IconComponent = value.icon;
              return (
                <div
                  key={value.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                  style={{ border: '1px solid #e0e0e0' }}
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#f18517' }}>
                    <IconComponent className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl mb-3" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                    {value.title}
                  </h3>
                  <p className="leading-relaxed" style={{ color: '#808080' }}>{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Users size={32} style={{ color: '#f18517' }} />
            <h2 className="text-3xl text-center" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, color: '#f18517' }}>
              Equipo de Trabajo
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {identityData.team.map((member) => (
              <div key={member.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-square overflow-hidden" style={{ backgroundColor: '#f5f5f5' }}>
                  <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-lg mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                    {member.name}
                  </h3>
                  <p style={{ color: '#808080', fontSize: '0.9rem' }}>{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Allies */}
        <div>
          <div className="flex items-center justify-center gap-3 mb-8">
            <Handshake size={32} style={{ color: '#f18517' }} />
            <h2 className="text-3xl text-center" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, color: '#f18517' }}>
              Nuestros Aliados
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {identityData.allies.map((ally) => (
              <div
                key={ally.id}
                className="bg-white rounded-xl shadow-lg p-8 flex items-center justify-center hover:shadow-xl transition-shadow min-h-[150px]"
              >
                <p className="text-center" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b', fontSize: '0.95rem' }}>
                  {ally.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}