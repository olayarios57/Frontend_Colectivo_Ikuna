import { Target, Eye, Heart, Users, Handshake } from 'lucide-react';

// ════════════════════════════════════════════════════════════════════════════
// IDENTIDAD DEL COLECTIVO — Edita los datos reales aquí
// Imágenes del equipo → public/images/equipo/
// Logos de aliados    → public/images/aliados/
// ════════════════════════════════════════════════════════════════════════════
const identityData = {
  mission: 'Somos un emprendimiento del municipio de Andes conformado para el desarrollo cultural, social y artístico, que busca promover y fomentar la creatividad experiencial y la educación integral para generar apropiación del conocimiento territorial con vías a la construcción de tejido social en el Suroeste Antioqueño, mediante la articulación del sector público / privado. Con el desarrollo de procesos de resignificación de espacios, eventos y festivales diversos, talleres, pedagogía social y proyectos culturales.',
  vision: 'Para el año 2030 se espera que el colectivo sea autosostenible y tenga la experiencia suficiente en el trabajo a nivel local para proyectarse en escenarios departamentales y nacionales, alcanzando un reconocimiento por el fomento de la creatividad experiencial y la educación integral a través de los procesos culturales, generando transformación ciudadana en Andes, Antioquia y demás municipios del departamento.',
  values: [
    {
      id:          'amistad',
      title:       'Amistad',
      icon:        Heart,
      description: 'Es la estructura sobre la cual se crean los lazos de confianza, que a su vez posibilitan los procesos creativos y del hacer.',
    },
    {
      id:          'proactividad',
      title:       'Proactividad',
      icon:        Target,
      description: 'Obtener nuevos conocimientos es parte de nuestra esencia. Esperar no es una opción; moverse y provocar los sucesos es nuestro ADN.',
    },
    {
      id:          'pasion',
      title:       'Pasión',
      icon:        Heart,
      description: 'Nos permitimos disfrutar cada intervención, porque en IKUNA la pasión hace que los procesos se llenen de magia.',
    },
  ],

  // ── EQUIPO DE TRABAJO ────────────────────────────────────────────────────
  // photo: ruta relativa desde /public — p.ej. '/images/equipo/sara.jpg'
  // bio:   descripción corta del miembro (2-3 líneas)
  team: [
    {
      id:    1,
      name:  'Sara Olaya',                                     // ← EDITA
      role:  'Directora y Fundadora',                          // ← EDITA
      photo: '/images/equipo/sara.jpg',                        // ← EDITA
      bio:   'Gestora cultural con más de 10 años de experiencia en procesos comunitarios y artísticos en el Suroeste Antioqueño.', // ← EDITA
    },
    {
      id:    2,
      name:  'Nombre del Miembro 2',                           // ← EDITA
      role:  'Coordinador de Proyectos',                       // ← EDITA
      photo: '/images/equipo/miembro2.jpg',                    // ← EDITA
      bio:   'Descripción breve del miembro 2.',               // ← EDITA
    },
    {
      id:    3,
      name:  'Nombre del Miembro 3',                           // ← EDITA
      role:  'Gestora Cultural',                               // ← EDITA
      photo: '/images/equipo/miembro3.jpg',                    // ← EDITA
      bio:   'Descripción breve del miembro 3.',               // ← EDITA
    },
    {
      id:    4,
      name:  'Nombre del Miembro 4',                           // ← EDITA
      role:  'Productor Artístico',                            // ← EDITA
      photo: '/images/equipo/miembro4.jpg',                    // ← EDITA
      bio:   'Descripción breve del miembro 4.',               // ← EDITA
    },
    // Agrega más miembros copiando el bloque anterior
  ],

  // ── ALIADOS ───────────────────────────────────────────────────────────────
  // logo: ruta relativa desde /public — p.ej. '/images/aliados/alcaldia.png'
  //       Si no tienes logo, deja logo: null y se mostrará solo el nombre.
  allies: [
    {
      id:   1,
      name: 'Ministerio de las Culturas, las Artes y los Saberes', // ← EDITA
      logo: '/images/aliados/ministerio-culturas.png',             // ← EDITA
    },
    {
      id:   2,
      name: 'Alcaldía de Andes',                                   // ← EDITA
      logo: '/images/aliados/alcaldia-andes.png',                  // ← EDITA
    },
    {
      id:   3,
      name: 'Gobernación de Antioquia',                            // ← EDITA
      logo: '/images/aliados/gobernacion.png',                     // ← EDITA
    },
    {
      id:   4,
      name: 'Instituto de Cultura de Antioquia',                   // ← EDITA
      logo: '/images/aliados/cultura-antioquia.png',               // ← EDITA
    },
    {
      id:   5,
      name: 'Banco de la República',                               // ← EDITA
      logo: '/images/aliados/banrep.png',                          // ← EDITA
    },
    {
      id:   6,
      name: 'Organizaciones Culturales del Suroeste',              // ← EDITA
      logo: null,                                                   // ← EDITA o deja null
    },
    // Agrega más aliados copiando el bloque anterior
  ],
};

// ════════════════════════════════════════════════════════════════════════════
export function Identity() {
  return (
    <div className="py-16 px-6" style={{ backgroundColor: '#ffffff' }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl text-center mb-16"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300, color: '#f18517' }}>
          Nuestra Identidad
        </h1>

        {/* ── Misión & Visión ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 border" style={{ borderColor: '#f18517' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f18517' }}>
                <Target className="text-white" size={24} />
              </div>
              <h2 className="text-2xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, color: '#1d1d1b' }}>Misión</h2>
            </div>
            <p className="leading-relaxed" style={{ color: '#1d1d1b' }}>{identityData.mission}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 border" style={{ borderColor: '#f18517' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f18517' }}>
                <Eye className="text-white" size={24} />
              </div>
              <h2 className="text-2xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, color: '#1d1d1b' }}>Visión</h2>
            </div>
            <p className="leading-relaxed" style={{ color: '#1d1d1b' }}>{identityData.vision}</p>
          </div>
        </div>

        {/* ── Valores ── */}
        <div className="mb-16">
          <h2 className="text-3xl text-center mb-8"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, color: '#f18517' }}>
            Valores Corporativos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {identityData.values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                  style={{ border: '1px solid #e0e0e0' }}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#f18517' }}>
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl mb-3"
                    style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                    {value.title}
                  </h3>
                  <p className="leading-relaxed" style={{ color: '#808080' }}>{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Equipo de Trabajo ── */}
        <div className="mb-16">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Users size={32} style={{ color: '#f18517' }} />
            <h2 className="text-3xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, color: '#f18517' }}>
              Equipo de Trabajo
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {identityData.team.map((member) => (
              <div key={member.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Foto del miembro */}
                <div className="aspect-square overflow-hidden" style={{ backgroundColor: '#f5f5f5' }}>
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={e => {
                        // Si la imagen no carga, muestra un placeholder con iniciales
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  {/* Placeholder con iniciales */}
                  <div
                    className="w-full h-full items-center justify-center text-white text-4xl font-bold"
                    style={{
                      backgroundColor: '#f18517',
                      display: member.photo ? 'none' : 'flex',
                      fontFamily: 'Montserrat, sans-serif',
                    }}>
                    {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                </div>
                {/* Info del miembro */}
                <div className="p-4">
                  <h3 className="text-lg mb-1 text-center"
                    style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                    {member.name}
                  </h3>
                  <p className="text-center mb-2" style={{ color: '#f18517', fontSize: '0.85rem', fontWeight: 500 }}>
                    {member.role}
                  </p>
                  {member.bio && (
                    <p className="text-center text-sm leading-relaxed" style={{ color: '#808080' }}>
                      {member.bio}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Aliados ── */}
        <div>
          <div className="flex items-center justify-center gap-3 mb-8">
            <Handshake size={32} style={{ color: '#f18517' }} />
            <h2 className="text-3xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, color: '#f18517' }}>
              Nuestros Aliados
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {identityData.allies.map((ally) => (
              <div key={ally.id}
                className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center hover:shadow-xl transition-shadow min-h-[150px] gap-3">
                {ally.logo ? (
                  <img
                    src={ally.logo}
                    alt={ally.name}
                    className="max-h-16 max-w-full object-contain"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#f185171a' }}>
                    <Handshake size={28} style={{ color: '#f18517' }} />
                  </div>
                )}
                <p className="text-center text-sm"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
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