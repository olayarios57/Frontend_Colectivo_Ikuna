import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const mailtoLink = `mailto:contacto@ikuna.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
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

  return (
    <div className="py-16 px-6" style={{ backgroundColor: '#f5f5f5' }}>
      <div className="max-w-6xl mx-auto">
        <h1
          className="text-4xl md:text-5xl text-center mb-6"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300, color: '#f18517' }}
        >
          Contáctanos
        </h1>
        <p className="text-center text-lg mb-12 max-w-2xl mx-auto" style={{ color: '#808080' }}>
          ¿Tienes un proyecto en mente? Escríbenos y trabajemos juntos en la construcción de cultura.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl mb-6" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
              Información de Contacto
            </h2>
            <div className="space-y-6">
              {[
                { icon: Mail,   label: 'Correo Electrónico', content: <a href="mailto:contacto@ikuna.com" className="hover:underline" style={{ color: '#808080' }}>contacto@ikuna.com</a> },
                { icon: Phone,  label: 'WhatsApp',           content: <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: '#808080' }}>+57 300 123 4567</a> },
                { icon: MapPin, label: 'Ubicación',          content: <p style={{ color: '#808080' }}>Andes, Antioquia<br />Colombia</p> },
              ].map(({ icon: Icon, label, content }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f18517' }}>
                    <Icon className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>{label}</h3>
                    {content}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-xl overflow-hidden shadow-lg aspect-video" style={{ backgroundColor: '#e0e0e0' }}>
              <img
                src="https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800"
                alt="Andes, Antioquia"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl mb-6" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
              Envíanos un Mensaje
            </h2>

            {submitSuccess && (
              <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#d4edda', color: '#155724' }}>
                ¡Mensaje enviado exitosamente! Te contactaremos pronto.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {[
                { id: 'name',    label: 'Nombre completo *',     type: 'text',  placeholder: 'Tu nombre' },
                { id: 'email',   label: 'Correo electrónico *',  type: 'email', placeholder: 'tu@email.com' },
                { id: 'subject', label: 'Asunto *',              type: 'text',  placeholder: 'Motivo de contacto' },
              ].map(({ id, label, type, placeholder }) => (
                <div key={id}>
                  <label htmlFor={id} className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>{label}</label>
                  <input
                    type={type}
                    id={id}
                    required
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
                  id="message"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none"
                  style={{ borderColor: '#e0e0e0', backgroundColor: '#ffffff', color: '#1d1d1b' }}
                  placeholder="Cuéntanos sobre tu proyecto o consulta..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 rounded-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
                style={{ backgroundColor: '#f18517', color: 'white' }}
              >
                {isSubmitting ? 'Enviando...' : (<><Send size={20} /><span>Enviar Mensaje</span></>)}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}