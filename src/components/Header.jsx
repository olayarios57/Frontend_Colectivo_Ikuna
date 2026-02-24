import { useState } from 'react';
import { Menu, X, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

import logoIkuna from '../assets/logo-ikuna.png';

const navItems = [
  { id: '/',           label: 'Inicio'              },
  { id: '/identidad',  label: 'Nuestra Identidad'   },
  { id: '/servicios',  label: 'Nuestros Servicios'  },
  { id: '/proyectos',  label: 'Nuestros Proyectos'  },
  { id: '/contacto',   label: 'Contáctanos'         },
];

export function Header({ onAdminClick }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleNavClick = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className="sticky top-0 z-50 shadow-md"
      style={{ backgroundColor: '#1d1d1b' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleNavClick('/')}
          >
            <img
              src={logoIkuna}
              alt="Ikuna Logo"
              className="w-12 h-12"
            />
            <span
              className="text-xl hidden md:block"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 400,
                color: 'white',
              }}
            >
              Colectivo Cultural Ikuna
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = location.pathname === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="transition-colors"
                  style={{
                    color: isActive ? '#f18517' : 'white',
                    opacity: isActive ? 1 : 0.7,
                  }}
                  onMouseEnter={(e) => (e.target.style.opacity = 1)}
                  onMouseLeave={(e) => (e.target.style.opacity = isActive ? 1 : 0.7)}
                >
                  {item.label}
                </button>
              );
            })}

            <button
              onClick={onAdminClick}
              className="flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:shadow-lg"
              style={{ backgroundColor: '#f18517', color: 'white' }}
            >
              <User size={18} />
              <span>Administrador</span>
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2"
            style={{ color: 'white' }}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden py-4 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => {
                const isActive = location.pathname === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className="text-left py-2"
                    style={{ color: isActive ? '#f18517' : 'white' }}
                  >
                    {item.label}
                  </button>
                );
              })}

              <button
                onClick={() => {
                  onAdminClick();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-3 rounded-full mt-4 w-fit"
                style={{ backgroundColor: '#f18517', color: 'white' }}
              >
                <User size={18} />
                <span>Administrador</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}