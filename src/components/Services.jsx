import { Lightbulb, Palette, CheckCircle } from 'lucide-react';

const services = [
  {
    id: 'asesoria',
    title: 'Asesoría Cultural',
    icon: Lightbulb,
    description:
      'Consultoría especializada en proyectos y gestión cultural para organizaciones e instituciones públicas y privadas.',
  },
  {
    id: 'creacion',
    title: 'Creación de Proyectos Artísticos y Culturales',
    icon: Palette,
    description:
      'Diseño de experiencias culturales innovadoras que conectan comunidades y fortalecen el tejido social territorial.',
  },
  {
    id: 'ejecucion',
    title: 'Acompañamiento en la Ejecución de Proyectos',
    icon: CheckCircle,
    description:
      'Gestión integral y acompañamiento técnico en la implementación de iniciativas culturales y artísticas.',
  },
];

const WHATSAPP_URL =
'https://wa.me/573015816157?text=Saludos%20Ikunistas%2C%20quisiera%20recibir%20m%C3%A1s%20informaci%C3%B3n%20sobre%20los%20proyectos%20y%20servicios%20que%20brindan.';
export function Services() {
  return (
    <div className="py-16 px-6" style={{ backgroundColor: '#f5f5f5' }}>
      <div className="max-w-7xl mx-auto">
        <h1
          className="text-4xl md:text-5xl text-center mb-6"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 300,
            color: '#f18517',
          }}
        >
          Nuestros Servicios
        </h1>

        <p
          className="text-center text-lg mb-16 max-w-3xl mx-auto"
          style={{ color: '#808080' }}
        >
          Acompañamos tu proceso creativo y cultural desde la ideación hasta la
          ejecución, generando transformación social en el territorio.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <div
                key={service.id}
                className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: '#f18517' }}
                >
                  <IconComponent className="text-white" size={32} />
                </div>
                <h3
                  className="text-2xl mb-4"
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                    color: '#1d1d1b',
                  }}
                >
                  {service.title}
                </h3>
                <p className="leading-relaxed" style={{ color: '#808080' }}>
                  {service.description}
                </p>
                <div
                  className="mt-6 h-1 w-16 rounded-full"
                  style={{ backgroundColor: '#f18517' }}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <p className="text-lg mb-6" style={{ color: '#1d1d1b' }}>
            ¿Interesado en nuestros servicios?
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-10 py-4 rounded-full hover:shadow-xl transition-all duration-300"
            style={{ backgroundColor: '#f18517', color: 'white' }}
          >
            Contáctanos por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}