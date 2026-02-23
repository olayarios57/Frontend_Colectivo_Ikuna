import { Heart, Instagram, Facebook, Mail } from 'lucide-react';

const WHATSAPP_URL = 'https://wa.me/1234567890';
const INSTAGRAM_URL = 'https://instagram.com';
const FACEBOOK_URL = 'https://facebook.com';
const MAIL_URL = 'mailto:contacto@ikuna.com';

const socialLinks = [
  { href: INSTAGRAM_URL, icon: Instagram, label: 'Instagram' },
  { href: FACEBOOK_URL,  icon: Facebook,  label: 'Facebook'  },
  { href: MAIL_URL,      icon: Mail,      label: 'Email'      },
];

const navLinks = [
  { href: WHATSAPP_URL, label: 'Servicios'  },
  { href: WHATSAPP_URL, label: 'Contacto'   },
];

export function Footer() {
  return (
    <footer
      className="py-12 px-6"
      style={{ backgroundColor: '#1d1d1b', color: 'white' }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Brand */}
          <div>
            <h3
              className="text-3xl mb-3"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 400,
                color: '#f18517',
              }}
            >
              IKUNA
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Construyamos cultura juntos
            </p>
          </div>

          {/* Links */}
          <div>
            <h4
              className="text-lg mb-4"
              style={{ fontFamily: 'Montserrat, sans-serif', color: '#f18517' }}
            >
              Enlaces
            </h4>
            <ul className="space-y-2">
              {navLinks.map(({ href, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-70 transition-opacity"
                    style={{ color: 'white' }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4
              className="text-lg mb-4"
              style={{ fontFamily: 'Montserrat, sans-serif', color: '#f18517' }}
            >
              Síguenos
            </h4>
            <div className="flex gap-4">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity"
                  aria-label={label}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p className="flex items-center justify-center gap-2">
            Hecho con{' '}
            <Heart className="text-red-500" size={16} fill="currentColor" />{' '}
            por IKUNA © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}