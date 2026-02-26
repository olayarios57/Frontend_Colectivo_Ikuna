import { useState, useCallback } from 'react';
import { User, Lock, X, AlertCircle, UserPlus, Mail, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { apiService } from '../../services/apiService';

// ── Componente reutilizable para input de contraseña con ojito ──────────────
function PwInput({ id, value, onChange, placeholder, label }) {
  const [show, setShow] = useState(false);

  const toggle = useCallback((e) => {
    e.preventDefault(); 
    setShow(s => !s);
  }, []);

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#808080' }}>
          <Lock size={18} />
        </div>
        <input
          type={show ? 'text' : 'password'}
          id={id}
          required
          value={value}
          onChange={onChange}
          className="w-full pl-12 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2"
          style={{ borderColor: '#e0e0e0', backgroundColor: '#f5f5f5', color: '#1d1d1b' }}
          placeholder={placeholder}
        />
        <button
          type="button"
          onMouseDown={toggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
          style={{ color: '#808080' }}
          aria-label={show ? 'Ocultar contraseña' : 'Ver contraseña'}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

// ── Componente para campos de contraseña en el formulario de registro ────────
function PwInputRegister({ id, value, onChange, placeholder, label }) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          id={id}
          required
          value={value}
          onChange={onChange}
          className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
          style={{ borderColor: '#e0e0e0', backgroundColor: '#f9f9f9' }}
          placeholder={placeholder}
        />
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); setShow(s => !s); }}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          style={{ color: '#808080' }}
          aria-label={show ? 'Ocultar' : 'Ver'}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
export function AdminLogin({ onLogin, onRegisterRequest, onClose }) {
  const [viewMode,     setViewMode]    = useState('login');
  const [credentials,  setCredentials] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '', email: '', username: '', password: '', confirmPassword: '',
  });
  const [forgotEmail,  setForgotEmail] = useState('');
  const [error,        setError]       = useState('');
  const [success,      setSuccess]     = useState('');
  const [isLoading,    setIsLoading]   = useState(false);
  const [submitted,    setSubmitted]   = useState(false);

  // ── Login ──────────────────────────────────────────────────────────────
  // ── Login ──────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Usuario admin hardcodeado
      if (credentials.username === 'admin' && credentials.password === 'ikuna2024') {
        onLogin(true, {
          id:       0,
          username: 'admin',
          role:     'SUPER_ADMIN',
          name:     'Administrador Principal',
          email:    'ikunacolectivo@gmail.com',
        });
        return;
      }

      // 2. Llamada real al backend
      const user = await apiService.login(credentials);
      
      // Solo entran usuarios con status ACTIVE
      if (user.status && user.status !== 'ACTIVE') {
        throw new Error('Tu cuenta aún no ha sido aprobada por el administrador.');
      }
      
      onLogin(true, {
        id:       user.id,
        username: user.username,
        role:     user.role,
        name:     user.fullName,
        email:    user.email,
      });
      
    } catch (err) {
      console.error("Error devuelto:", err);
      
      let msg = 'Error de conexión con el servidor.'; // Mensaje por defecto
      
      // Si el error lo lanzamos nosotros arriba (ej. pendiente de aprobación)
      if (err.message && err.message.includes('aprobada')) {
        msg = err.message;
      } 
      // Si el error viene de tu backend Java (Ej: "Usuario no encontrado" o "Contraseña incorrecta")
      else if (err.response && err.response.data && err.response.data.error) {
        msg = err.response.data.error; 
      }

      setError(msg);
      setCredentials(prev => ({ ...prev, password: '' })); // Borra la contraseña para volver a intentar
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Registro ────────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    if (submitted) return;

    if (registerData.password !== registerData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (registerData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setIsLoading(true);
    try {
      await apiService.register({
        fullName: registerData.name,
        email:    registerData.email,
        username: registerData.username,
        password: registerData.password,
        role:     'COLABORADOR',
        status:   'PENDING',
      });

      setSuccess('¡Solicitud enviada! Tu registro está pendiente de aprobación por el administrador.');
      setSubmitted(true);

      if (onRegisterRequest) {
        onRegisterRequest({
          name:     registerData.name,
          email:    registerData.email,
          username: registerData.username,
          role:     'colaborador',
        });
      }

      setTimeout(() => {
        setSuccess('');
        setSubmitted(false);
        setIsLoading(false);
        setRegisterData({ name: '', email: '', username: '', password: '', confirmPassword: '' });
        setViewMode('login');
      }, 3500);
    } catch (err) {
      setIsLoading(false);
      console.error('Error del backend:', err);
      let errorMsg = 'Error al registrar. Verifica los datos o el usuario ya existe.';
      if (err.response?.data) {
        const backendErrors = Object.values(err.response.data);
        if (backendErrors.length > 0) errorMsg = backendErrors[0];
      }
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    }
  };

  // ── Recuperar contraseña ─────────────────────────────────────────────────
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiService.forgotPassword?.(forgotEmail);
      setSuccess('Se ha enviado un enlace de recuperación a tu correo electrónico.');
    } catch {
      setSuccess('Si el correo está registrado, recibirás el enlace en breve.');
    } finally {
      setIsLoading(false);
      setTimeout(() => { setSuccess(''); setForgotEmail(''); setViewMode('login'); }, 4000);
    }
  };

  // ── Cambio de vista → limpiar mensajes ──────────────────────────────────
  const switchView = (mode) => {
    setViewMode(mode);
    setError('');
    setSuccess('');
  };

  // ── UI helpers ────────────────────────────────────────────────────────────
  const iconMap  = { login: User, register: UserPlus, forgot: Mail };
  const titleMap = { login: 'Acceso Administrador', register: 'Registro de Usuario', forgot: 'Recuperar Contraseña' };
  const IconHead = iconMap[viewMode];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col"
        style={{ maxHeight: '95vh' }}>

        {/* ── Header ── */}
        <div className="p-6 relative flex-shrink-0" style={{ backgroundColor: '#1d1d1b' }}>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:opacity-70 transition-opacity"
            style={{ color: 'white' }} aria-label="Cerrar">
            <X size={24} />
          </button>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#f18517' }}>
              <IconHead className="text-white" size={32} />
            </div>
            <h2 className="text-2xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, color: 'white' }}>
              {titleMap[viewMode]}
            </h2>
          </div>
        </div>

        {/* ── Body con scroll ── */}
        <div className="p-8 overflow-y-auto flex-1">

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
                  <input
                    type="text" id="username" required
                    value={credentials.username}
                    onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e0e0e0', backgroundColor: '#f5f5f5', color: '#1d1d1b' }}
                    placeholder="Ingresa tu usuario"
                  />
                </div>
              </div>

              <PwInput
                id="login-password"
                label="Contraseña"
                value={credentials.password}
                onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="Ingresa tu contraseña"
              />

              <button type="button" onClick={() => switchView('forgot')}
                className="text-sm hover:underline" style={{ color: '#f18517' }}>
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

              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Nombre completo *</label>
                <input type="text" required value={registerData.name}
                  onChange={e => setRegisterData({ ...registerData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e0e0e0', backgroundColor: '#f9f9f9' }}
                  placeholder="Tu nombre completo" />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Correo electrónico *</label>
                <input type="email" required value={registerData.email}
                  onChange={e => setRegisterData({ ...registerData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e0e0e0', backgroundColor: '#f9f9f9' }}
                  placeholder="tu@email.com" />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Nombre de usuario *</label>
                <input type="text" required value={registerData.username}
                  onChange={e => setRegisterData({ ...registerData, username: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e0e0e0', backgroundColor: '#f9f9f9' }}
                  placeholder="Ej: maria_gonzalez" />
              </div>

              <PwInputRegister
                id="reg-password"
                label="Contraseña * (mínimo 8 caracteres)"
                value={registerData.password}
                onChange={e => setRegisterData({ ...registerData, password: e.target.value })}
                placeholder="Mínimo 8 caracteres"
              />

              <PwInputRegister
                id="reg-confirm"
                label="Confirmar contraseña *"
                value={registerData.confirmPassword}
                onChange={e => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                placeholder="Repite tu contraseña"
              />

              {/* Rol fijo: solo colaborador */}
              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Rol</label>
                <input type="text" value="Colaborador" readOnly
                  className="w-full px-4 py-2.5 border rounded-lg cursor-not-allowed"
                  style={{ borderColor: '#e0e0e0', backgroundColor: '#f0f0f0', color: '#808080' }} />
                <p className="text-xs mt-1" style={{ color: '#b0b0b0' }}>
                  El acceso estará sujeto a aprobación por el administrador.
                </p>
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
                  <input type="email" required value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e0e0e0', backgroundColor: '#f5f5f5' }}
                    placeholder="tu@email.com" />
                </div>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full py-3 rounded-lg font-medium hover:shadow-xl transition-all disabled:opacity-50"
                style={{ backgroundColor: '#f18517', color: 'white' }}>
                {isLoading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
              </button>
            </form>
          )}

          {/* ── Links de navegación ── */}
          <div className="mt-6 text-center space-y-2 border-t pt-5" style={{ borderColor: '#f0f0f0' }}>
            {viewMode === 'login' && (
              <button onClick={() => switchView('register')} className="text-sm hover:underline" style={{ color: '#808080' }}>
                ¿No tienes cuenta? → Solicitar registro
              </button>
            )}
            {(viewMode === 'register' || viewMode === 'forgot') && (
              <button onClick={() => switchView('login')} className="text-sm hover:underline" style={{ color: '#808080' }}>
                ← Volver al inicio de sesión
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}