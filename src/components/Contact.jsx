import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const CONTACT_EMAIL = 'ikunacolectivo@gmail.com';
const WHATSAPP_URL  = 'https://wa.me/573015816157';

// ── Coordenadas del Parque Principal de Andes, Antioquia (CP 056060) ──
const MAPS_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.7!2d-75.8796!3d5.6582!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e468a7c5e5c5e5d%3A0x1234567890abcdef!2sParque%20Principal%20de%20Andes!5e0!3m2!1ses!2sco!4v1700000000000!5m2!1ses!2sco';

export function Contact() {
  const [formData,     setFormData]     = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const mailtoLink =
      `mailto:${CONTACT_EMAIL}` +
      `?subject=${encodeURIComponent(formData.subject)}` +
      `&body=${encodeURIComponent(
        `Nombre: ${formData.name}\nEmail: ${formData.email}\n\nMensaje:\n${formData.message}`
      )}`;

    window.location.href = mailtoLink;

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitSuccess(false), 3000);
    }, 1000);
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Correo Electrónico',
      content: (
        <a href={`mailto:${CONTACT_EMAIL}`} className="hover:underline" style={{ color: '#808080' }}>
          {CONTACT_EMAIL}
        </a>
      ),
    },
    {
      icon: Phone,
      label: 'WhatsApp',
      content: (
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
          className="hover:underline" style={{ color: '#808080' }}>
          +57 301 5816157
        </a>
      ),
    },
    {
      icon: MapPin,
      label: 'Ubicación',
      content: (
        <p style={{ color: '#808080' }}>
          Parque Principal, Andes<br />
          Antioquia, Colombia — CP 056060
        </p>
      ),
    },
  ];

  const fields = [
    { id: 'name',    label: 'Nombre completo *',    type: 'text',  placeholder: 'Tu nombre'         },
    { id: 'email',   label: 'Correo electrónico *', type: 'email', placeholder: 'tu@email.com'       },
    { id: 'subject', label: 'Asunto *',             type: 'text',  placeholder: 'Motivo de contacto' },
  ];

  return (
    <div className="py-16 px-6" style={{ backgroundColor: '#f5f5f5' }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl text-center mb-6"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300, color: '#f18517' }}>
          Contáctanos
        </h1>
        <p className="text-center text-lg mb-12 max-w-2xl mx-auto" style={{ color: '#808080' }}>
          ¿Tienes un proyecto en mente? Escríbenos y trabajemos juntos en la construcción de cultura.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ── Información de contacto + Mapa ── */}
          <div>
            <h2 className="text-2xl mb-6"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
              Información de Contacto
            </h2>
            <div className="space-y-6 mb-8">
              {contactInfo.map(({ icon: Icon, label, content }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#f18517' }}>
                    <Icon className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg mb-1"
                      style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                      {label}
                    </h3>
                    {content}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Mapa real de Andes, Antioquia ── */}
            <div className="rounded-xl overflow-hidden shadow-lg" style={{ height: '300px' }}>
              <iframe
                title="Parque Principal de Andes, Antioquia — CP 056060"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src="https://maps.google.com/maps?q=Parque+Principal+Andes+Antioquia+Colombia+056060&t=&z=16&ie=UTF8&iwloc=&output=embed"
              />
            </div>
            <p className="text-xs mt-2 text-center" style={{ color: '#b0b0b0' }}>
              Parque Principal de Andes, Antioquia — Código Postal 056060
            </p>
          </div>

          {/* ── Formulario ── */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl mb-6"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
              Envíanos un Mensaje
            </h2>

            {submitSuccess && (
              <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#d4edda', color: '#155724' }}>
                ¡Mensaje enviado exitosamente! Te contactaremos pronto.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {fields.map(({ id, label, type, placeholder }) => (
                <div key={id}>
                  <label htmlFor={id} className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>{label}</label>
                  <input
                    type={type} id={id} required
                    value={formData[id]}
                    onChange={(e) => setFormData({ ...formData, [id]: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: '#e0e0e0', backgroundColor: '#ffffff', color: '#1d1d1b' }}
                    placeholder={placeholder}
                  />
                </div>
              ))}

              <div>
                <label htmlFor="message" className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Mensaje *</label>
                <textarea
                  id="message" rows={5} required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none"
                  style={{ borderColor: '#e0e0e0', backgroundColor: '#ffffff', color: '#1d1d1b' }}
                  placeholder="Cuéntanos sobre tu proyecto o consulta..."
                />
              </div>

              <button
                type="submit" disabled={isSubmitting}
                className="w-full px-8 py-4 rounded-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
                style={{ backgroundColor: '#f18517', color: 'white' }}>
                {isSubmitting
                  ? 'Enviando...'
                  : (<><Send size={20} /><span>Enviar Mensaje</span></>)
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}