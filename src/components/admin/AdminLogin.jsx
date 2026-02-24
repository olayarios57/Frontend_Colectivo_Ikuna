import { useState } from 'react';
import { User, Lock, X, AlertCircle, UserPlus, Mail } from 'lucide-react';
import { apiService } from '../../services/apiService'; // IMPORTANTE: Importamos el servicio

export function AdminLogin({ onLogin, onClose }) {
  const [viewMode, setViewMode] = useState('login');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '', email: '', username: '', password: '', confirmPassword: '', role: 'COLLABORATOR',
  });
  const [forgotEmail, setForgotEmail] = useState('');
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // LLAMADA REAL AL BACKEND
      const user = await apiService.login(credentials);
      
      // Adaptamos la respuesta del backend para el frontend
      onLogin(true, { 
        username: user.username, 
        role: user.role, 
        name: user.fullName, 
        email: user.email 
      });
    } catch (err) {
      console.error(err);
      setError('Usuario o contraseña incorrectos');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setIsLoading(true);
    try {
      // LLAMADA REAL AL BACKEND PARA REGISTRO
      await apiService.register({
        fullName: registerData.name,
        email: registerData.email,
        username: registerData.username,
        password: registerData.password,
        role: 'COLLABORATOR',
        status: 'PENDING'
      });
      setSuccess('¡Registro exitoso! Tu solicitud está pendiente de aprobación.');
      setTimeout(() => { setSuccess(''); setViewMode('login'); }, 3000);
    } catch (err) {
      console.error(err);
      setError('Error al registrar. Verifica los datos o el usuario ya existe.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setSuccess('Se ha enviado un enlace de recuperación a tu correo electrónico.');
    setTimeout(() => { setSuccess(''); setViewMode('login'); }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">

        {/* Header */}
        <div className="p-6 relative" style={{ backgroundColor: '#1d1d1b' }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:opacity-70 transition-opacity"
            style={{ color: 'white' }}
            aria-label="Close"
          >
            <X size={24} />
          </button>
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#f18517' }}
            >
              {viewMode === 'register'
                ? <UserPlus className="text-white" size={32} />
                : viewMode === 'forgot'
                ? <Mail className="text-white" size={32} />
                : <User className="text-white" size={32} />
              }
            </div>
            <h2
              className="text-2xl"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, color: 'white' }}
            >
              {viewMode === 'register'
                ? 'Registro de Usuario'
                : viewMode === 'forgot'
                ? 'Recuperar Contraseña'
                : 'Acceso Administrador'}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 rounded-lg flex items-center gap-3" style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
              <AlertCircle size={20} /><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 rounded-lg flex items-center gap-3" style={{ backgroundColor: '#d4edda', color: '#155724' }}>
              <AlertCircle size={20} /><span>{success}</span>
            </div>
          )}

          {/* LOGIN */}
          {viewMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>
                  Usuario
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#808080' }}>
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    id="username"
                    required
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: '#e0e0e0', backgroundColor: '#f5f5f5', color: '#1d1d1b' }}
                    placeholder="Ingresa tu usuario"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#808080' }}>
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    id="password"
                    required
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: '#e0e0e0', backgroundColor: '#f5f5f5', color: '#1d1d1b' }}
                    placeholder="Ingresa tu contraseña"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewMode('forgot')}
                className="text-sm hover:underline"
                style={{ color: '#f18517' }}
              >
                ¿Olvidaste tu contraseña?
              </button>
              <button type="submit" disabled={isLoading} className="w-full px-8 py-3 rounded-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50" style={{ backgroundColor: '#f18517', color: 'white' }}>
                {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>
            </form>
          )}

          {/* REGISTER */}
          {viewMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              {[
                { label: 'Nombre Completo',      key: 'name',            type: 'text',     placeholder: 'Tu nombre completo'   },
                { label: 'Correo Electrónico',   key: 'email',           type: 'email',    placeholder: 'tu@email.com'         },
                { label: 'Usuario',              key: 'username',        type: 'text',     placeholder: 'Nombre de usuario'    },
                { label: 'Contraseña',           key: 'password',        type: 'password', placeholder: 'Mínimo 8 caracteres'  },
                { label: 'Confirmar Contraseña', key: 'confirmPassword', type: 'password', placeholder: 'Repite tu contraseña' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>{label}</label>
                  <input
                    type={type}
                    required
                    value={registerData[key]}
                    onChange={(e) => setRegisterData({ ...registerData, [key]: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e0e0e0', backgroundColor: '#f5f5f5' }}
                    placeholder={placeholder}
                  />
                </div>
              ))}
              <button type="submit" disabled={isLoading} className="w-full px-8 py-3 rounded-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50" style={{ backgroundColor: '#f18517', color: 'white' }}>
                {isLoading ? 'Solicitando...' : 'Solicitar Registro'}
              </button>
            </form>
          )}

          {/* FORGOT */}
          {viewMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#808080' }}>
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e0e0e0', backgroundColor: '#f5f5f5' }}
                    placeholder="tu@email.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full px-8 py-3 rounded-lg hover:shadow-xl transition-all duration-300"
                style={{ backgroundColor: '#f18517', color: 'white' }}
              >
                Enviar Enlace de Recuperación
              </button>
            </form>
          )}

          {/* Navigation links */}
          <div className="mt-6 text-center space-y-2">
            {viewMode === 'login' && (
              <button
                onClick={() => setViewMode('register')}
                className="text-sm hover:underline"
                style={{ color: '#808080' }}
              >
                ¿No tienes cuenta? Solicita registro
              </button>
            )}
            {(viewMode === 'register' || viewMode === 'forgot') && (
              <button
                onClick={() => setViewMode('login')}
                className="text-sm hover:underline"
                style={{ color: '#808080' }}
              >
                Volver al inicio de sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}