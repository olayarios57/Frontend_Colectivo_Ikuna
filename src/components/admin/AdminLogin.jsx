import { useState } from 'react';
import { User, Lock, X, AlertCircle, UserPlus, Mail, CheckCircle } from 'lucide-react';
import { apiService } from '../../services/apiService';

export function AdminLogin({ onLogin, onRegisterRequest, onClose }) {
  const [viewMode,     setViewMode]    = useState('login');
  const [credentials,  setCredentials] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '', email: '', username: '', password: '', confirmPassword: '', role: 'editor',
  });
  const [forgotEmail,  setForgotEmail] = useState('');
  const [error,        setError]       = useState('');
  const [success,      setSuccess]     = useState('');
  const [isLoading,    setIsLoading]   = useState(false);
  const [submitted,    setSubmitted]   = useState(false);

  // ── Login ──────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. USUARIO HARDCODEADO para acceso rápido sin backend
      if (credentials.username === 'admin' && credentials.password === 'ikuna2024') {
        onLogin(true, {
          username: 'admin',
          role:     'SUPER_ADMIN',
          name:     'Administrador Principal',
          email:    'ikunacolectivo@gmail.com',
        });
        return;
      }

      // 2. Si no es el admin hardcodeado → llamada real al backend
      const user = await apiService.login(credentials);
      onLogin(true, {
        username: user.username,
        role:     user.role,
        name:     user.fullName,
        email:    user.email,
      });
    } catch (err) {
      console.error(err);
      setError('Usuario o contraseña incorrectos');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Registro → Llama al backend y respeta las validaciones ──
  const handleRegister = async (e) => {
    e.preventDefault();
    if (submitted) return;

    if (registerData.password !== registerData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    // CORRECCIÓN: El backend exige mínimo 8 caracteres
    if (registerData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setIsLoading(true);

    try {
      // Llamada real al backend
      await apiService.register({
        fullName: registerData.name, // El backend mapea esto a fullName
        email:    registerData.email,
        username: registerData.username,
        password: registerData.password,
        role:     registerData.role.toUpperCase(), // Aseguramos que llegue en mayúscula
        status:   'PENDING',
      });

      // Si el código llega aquí, es porque el BACKEND SÍ GUARDÓ en la base de datos
      setSuccess('¡Solicitud enviada! Tu registro está pendiente de aprobación por el administrador.');
      setSubmitted(true);
      
      // Notifica a AdminPage si es necesario localmente
      if (onRegisterRequest) {
        onRegisterRequest({
          name:     registerData.name,
          email:    registerData.email,
          username: registerData.username,
          role:     registerData.role,
        });
      }

      setTimeout(() => {
        setSuccess('');
        setSubmitted(false);
        setIsLoading(false);
        setRegisterData({ name: '', email: '', username: '', password: '', confirmPassword: '', role: 'editor' });
        setViewMode('login');
      }, 3500);

    } catch (err) {
      // CORRECCIÓN: Si el backend rechaza el registro, mostramos el error
      setIsLoading(false);
      console.error('Error del backend:', err);
      
      // Intentamos extraer el mensaje de error exacto que manda Spring Boot
      let errorMsg = 'Error al registrar. Verifica los datos o el usuario ya existe.';
      if (err.response && err.response.data) {
        // Tu GlobalExceptionHandler devuelve un mapa con los errores (ej: { "password": "La contraseña debe tener al menos 8 caracteres" })
        const backendErrors = Object.values(err.response.data);
        if (backendErrors.length > 0) {
          errorMsg = backendErrors[0]; // Mostramos el primer error que mande el backend
        }
      }
      
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    }
  };

  // ── Recuperar contraseña ───────────────────────────────────────
  const handleForgotPassword = (e) => {
    e.preventDefault();
    setSuccess('Se ha enviado un enlace de recuperación a tu correo electrónico.');
    setTimeout(() => { setSuccess(''); setForgotEmail(''); setViewMode('login'); }, 3000);
  };

  // ── UI helpers ─────────────────────────────────────────────────
  const icons  = { login: User, register: UserPlus, forgot: Mail };
  const titles = { login: 'Acceso Administrador', register: 'Registro de Usuario', forgot: 'Recuperar Contraseña' };
  const IconHead = icons[viewMode];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">

        {/* ── Header ── */}
        <div className="p-6 relative" style={{ backgroundColor: '#1d1d1b' }}>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:opacity-70 transition-opacity" style={{ color: 'white' }} aria-label="Cerrar">
            <X size={24} />
          </button>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#f18517' }}>
              <IconHead className="text-white" size={32} />
            </div>
            <h2 className="text-2xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, color: 'white' }}>
              {titles[viewMode]}
            </h2>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-8">

          {/* Alertas */}
          {error && (
            <div className="mb-5 p-4 rounded-lg flex items-center gap-3" style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
              <AlertCircle size={20} /><span className="text-sm">{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-5 p-4 rounded-lg flex items-center gap-3" style={{ backgroundColor: '#d4edda', color: '#155724' }}>
              <CheckCircle size={20} /><span className="text-sm">{success}</span>
            </div>
          )}

          {/* ── FORMULARIO LOGIN ── */}
          {viewMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Usuario</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#808080' }}><User size={18} /></div>
                  <input type="text" id="username" required value={credentials.username}
                    onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e0e0e0', backgroundColor: '#f5f5f5', color: '#1d1d1b' }}
                    placeholder="Ingresa tu usuario" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Contraseña</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#808080' }}><Lock size={18} /></div>
                  <input type="password" id="password" required value={credentials.password}
                    onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e0e0e0', backgroundColor: '#f5f5f5', color: '#1d1d1b' }}
                    placeholder="Ingresa tu contraseña" />
                </div>
              </div>

              <button type="button" onClick={() => setViewMode('forgot')} className="text-sm hover:underline" style={{ color: '#f18517' }}>
                ¿Olvidaste tu contraseña?
              </button>

              <button type="submit" disabled={isLoading}
                className="w-full py-3 rounded-lg font-medium hover:shadow-xl transition-all disabled:opacity-50"
                style={{ backgroundColor: '#f18517', color: 'white' }}>
                {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>
            </form>
          )}

          {/* ── FORMULARIO REGISTRO ── */}
          {viewMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              {[
                { label: 'Nombre completo *',      key: 'name',            type: 'text',     placeholder: 'Tu nombre completo'    },
                { label: 'Correo electrónico *',   key: 'email',           type: 'email',    placeholder: 'tu@email.com'          },
                { label: 'Nombre de usuario *',    key: 'username',        type: 'text',     placeholder: 'Ej: maria_gonzalez'    },
                { label: 'Contraseña *',           key: 'password',        type: 'password', placeholder: 'Mínimo 8 caracteres'   },
                { label: 'Confirmar contraseña *', key: 'confirmPassword', type: 'password', placeholder: 'Repite tu contraseña'  },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>{label}</label>
                  <input type={type} required value={registerData[key]}
                    onChange={e => setRegisterData({ ...registerData, [key]: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e0e0e0', backgroundColor: '#f9f9f9' }}
                    placeholder={placeholder} />
                </div>
              ))}

              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Rol solicitado</label>
                <select value={registerData.role} onChange={e => setRegisterData({ ...registerData, role: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e0e0e0', backgroundColor: '#f9f9f9' }}>
                  <option value="editor">Editor</option>
                  <option value="viewer">Visualizador</option>
                  <option value="colaborador">Colaborador</option>
                </select>
              </div>

              <button type="submit" disabled={isLoading || submitted}
                className="w-full py-3 rounded-lg font-medium hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                style={{ backgroundColor: '#f18517', color: 'white' }}>
                {isLoading ? 'Enviando solicitud...' : 'Enviar Solicitud de Registro'}
              </button>
            </form>
          )}

          {/* ── FORMULARIO RECUPERAR CONTRASEÑA ── */}
          {viewMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <p className="text-sm" style={{ color: '#808080' }}>
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Correo electrónico</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#808080' }}><Mail size={18} /></div>
                  <input type="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e0e0e0', backgroundColor: '#f5f5f5' }}
                    placeholder="tu@email.com" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 rounded-lg font-medium hover:shadow-xl transition-all" style={{ backgroundColor: '#f18517', color: 'white' }}>
                Enviar Enlace de Recuperación
              </button>
            </form>
          )}

          {/* ── Links de navegación ── */}
          <div className="mt-6 text-center space-y-2 border-t pt-5" style={{ borderColor: '#f0f0f0' }}>
            {viewMode === 'login' && (
              <button onClick={() => setViewMode('register')} className="text-sm hover:underline" style={{ color: '#808080' }}>
                ¿No tienes cuenta? → Solicitar registro
              </button>
            )}
            {(viewMode === 'register' || viewMode === 'forgot') && (
              <button onClick={() => { setViewMode('login'); setError(''); setSuccess(''); }}
                className="text-sm hover:underline" style={{ color: '#808080' }}>
                ← Volver al inicio de sesión
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}