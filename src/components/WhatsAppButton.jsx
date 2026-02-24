import { MessageCircle } from 'lucide-react';

const WHATSAPP_URL =
  'https://wa.me/573015816157?text=Saludos%20Ikunistas%2C%20quisiera%20recibir%20m%C3%A1s%20informaci%C3%B3n%20sobre%20los%20proyectos%20y%20servicios%20que%20brindan.';
export function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 group"
      style={{ backgroundColor: '#25D366' }}
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle
        className="text-white group-hover:scale-110 transition-transform"
        size={28}
      />
      <span
        className="absolute inset-0 rounded-full animate-ping opacity-20"
        style={{ backgroundColor: '#25D366' }}
      />
    </a>
  );
}