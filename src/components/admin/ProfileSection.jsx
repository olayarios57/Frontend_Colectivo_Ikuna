import { useState, useRef } from 'react';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { apiService } from '../../services/apiService';

// ── Ojito sin pérdida de foco ─────────────────────────────────────────────────
function PwField({ id, label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
        style={{ color: '#a0a0a0' }}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id} type={show ? 'text' : 'password'} required
          value={value} onChange={onChange}
          className="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none transition-colors"
          style={{ borderColor: '#e8e8e8', backgroundColor: '#fafafa', color: '#1d1d1b' }}
          placeholder={placeholder}
        />
        <button
          type="button"
          onMouseDown={e => e.preventDefault()}
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-60"
          style={{ color: '#b0b0b0' }}>
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

// ── Toast de feedback ─────────────────────────────────────────────────────────
function Toast({ msg }) {
  if (!msg.text) return null;
  const ok = msg.type === 'success';
  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm mb-5"
      style={{ backgroundColor: ok ? '#f0faf4' : '#fff5f5', color: ok ? '#1a7f47' : '#c0392b',
               border: `1px solid ${ok ? '#b8e6c8' : '#fac5c5'}` }}>
      {ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      {msg.text}
    </div>
  );
}

// ── Icono cámara SVG ──────────────────────────────────────────────────────────
const CameraIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

// ════════════════════════════════════════════════════════════════════════════
export function ProfileSection({ userData, onUserDataChange }) {
  const fileRef = useRef(null);

  // ── Estado ────────────────────────────────────────────────────────────────
  const [activeTab,     setActiveTab]     = useState('info');   // 'info' | 'password'
  const [profile,       setProfile]       = useState({ name: userData?.name || '', email: userData?.email || '' });
  const [avatarPreview, setAvatarPreview] = useState(userData?.avatarUrl || null);
  const [avatarFile,    setAvatarFile]    = useState(null);
  const [pwData,        setPwData]        = useState({ current: '', newPw: '', confirm: '' });
  const [profileMsg,    setProfileMsg]    = useState({ type: '', text: '' });
  const [pwMsg,         setPwMsg]         = useState({ type: '', text: '' });
  const [isSavingInfo,  setIsSavingInfo]  = useState(false);
  const [isSavingPw,    setIsSavingPw]    = useState(false);

  const isSuperAdmin = userData?.role === 'SUPER_ADMIN' || userData?.role === 'superadmin';
  const initials = (profile.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  // ── Foto ──────────────────────────────────────────────────────────────────
  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
  };

  // ── Guardar info ──────────────────────────────────────────────────────────
  const handleSaveInfo = async e => {
    e.preventDefault();
    
    // VALIDACIÓN: Evitar modificar al admin principal quemado en código
    if (!userData.id || userData.id === 0) {
      setProfileMsg({ type: 'error', text: 'No se puede modificar el administrador protegido del sistema.' });
      return;
    }

    setIsSavingInfo(true);
    setProfileMsg({ type: '', text: '' });
    try {
      let newUrl = avatarPreview;
      if (avatarFile) {
        try {
          const res = await apiService.uploadAvatar?.(userData.id, avatarFile);
          newUrl = res?.avatarUrl || avatarPreview;
        } catch { /* mantiene preview local */ }
      }
      await apiService.updateProfile?.(userData.id, { fullName: profile.name, email: profile.email });
      setAvatarFile(null);
      onUserDataChange?.({ ...userData, name: profile.name, email: profile.email, avatarUrl: newUrl });
      setProfileMsg({ type: 'success', text: 'Información actualizada correctamente.' });
    } catch {
      setProfileMsg({ type: 'error', text: 'No se pudo guardar. Intenta de nuevo.' });
    } finally {
      setIsSavingInfo(false);
      setTimeout(() => setProfileMsg({ type: '', text: '' }), 4000);
    }
  };

  // ── Cambiar contraseña ─────────────────────────────────────────────────────
  const handleSavePw = async e => {
    e.preventDefault();
    setPwMsg({ type: '', text: '' });

    // VALIDACIÓN: Evitar modificar al admin principal quemado en código
    if (!userData.id || userData.id === 0) {
      setPwMsg({ type: 'error', text: 'No se puede cambiar la contraseña del administrador protegido.' });
      return;
    }

    if (pwData.newPw.length < 8) { setPwMsg({ type: 'error', text: 'Mínimo 8 caracteres.' }); return; }
    if (pwData.newPw !== pwData.confirm) { setPwMsg({ type: 'error', text: 'Las contraseñas no coinciden.' }); return; }
    
    setIsSavingPw(true);
    try {
      await apiService.changePassword(userData.id, { 
        currentPassword: pwData.current, 
        newPassword: pwData.newPw 
      });
      setPwData({ current: '', newPw: '', confirm: '' });
      setPwMsg({ type: 'success', text: 'Contraseña actualizada correctamente.' });
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Contraseña actual incorrecta o servicio no disponible.';
      setPwMsg({ type: 'error', text: errorMessage });
    } finally {
      setIsSavingPw(false);
      setTimeout(() => setPwMsg({ type: '', text: '' }), 4000);
    }
  };

  // ── Tabs config ───────────────────────────────────────────────────────────
  const tabs = [
    { id: 'info',     label: 'Información' },
    { id: 'password', label: 'Contraseña'  },
  ];

  return (
    <div className="max-w-2xl">

      {/* ── Header de perfil ── */}
      <div className="bg-white rounded-xl border mb-4 px-8 py-6 flex items-center gap-6"
        style={{ borderColor: '#ebebeb' }}>
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center"
            style={{ backgroundColor: '#f18517' }}>
            {avatarPreview
              ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              : <span className="text-white text-2xl font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {initials}
                </span>
            }
          </div>
          {/* Botón cámara */}
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110"
            style={{ backgroundColor: '#1d1d1b', color: 'white' }}
            aria-label="Cambiar foto">
            <CameraIcon />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>

        {/* Info rápida */}
        <div className="min-w-0">
          <p className="font-semibold text-lg truncate" style={{ fontFamily: 'Montserrat, sans-serif', color: '#1d1d1b' }}>
            {profile.name || '—'}
          </p>
          <p className="text-sm truncate mt-0.5" style={{ color: '#a0a0a0' }}>
            {userData?.email || '—'}
          </p>
          <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full"
            style={{ backgroundColor: '#f18517', color: 'white' }}>
            {isSuperAdmin ? 'Super Admin' : userData?.role || 'Colaborador'}
          </span>
        </div>
      </div>

      {/* ── Card con tabs ── */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#ebebeb' }}>

        {/* Tab bar */}
        <div className="flex border-b" style={{ borderColor: '#ebebeb' }}>
          {tabs.map(t => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className="flex-1 py-3.5 text-sm font-medium transition-colors relative"
                style={{ color: active ? '#f18517' : '#a0a0a0', backgroundColor: 'transparent' }}>
                {t.label}
                {/* Underline activo */}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                    style={{ backgroundColor: '#f18517' }} />
                )}
              </button>
            );
          })}
        </div>

        {/* ── TAB: Información ── */}
        {activeTab === 'info' && (
          <form onSubmit={handleSaveInfo} className="px-8 py-6 space-y-5">
            <Toast msg={profileMsg} />

            {/* Nombre */}
            <div>
              <label htmlFor="prof-name" className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                style={{ color: '#a0a0a0' }}>
                Nombre completo
              </label>
              <input id="prof-name" type="text" value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none transition-colors"
                style={{ borderColor: '#e8e8e8', backgroundColor: '#fafafa', color: '#1d1d1b' }}
                placeholder="Tu nombre completo" />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="prof-email" className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                style={{ color: '#a0a0a0' }}>
                Correo electrónico
              </label>
              <input id="prof-email" type="email" value={profile.email}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none transition-colors"
                style={{ borderColor: '#e8e8e8', backgroundColor: '#fafafa', color: '#1d1d1b' }}
                placeholder="tu@email.com" />
            </div>

            {/* Usuario (solo lectura) */}
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                style={{ color: '#a0a0a0' }}>
                Usuario
              </label>
              <input type="text" value={userData?.username || ''} readOnly
                className="w-full px-4 py-2.5 border rounded-lg text-sm cursor-not-allowed"
                style={{ borderColor: '#e8e8e8', backgroundColor: '#f3f3f3', color: '#c0c0c0' }} />
              <p className="text-xs mt-1" style={{ color: '#c8c8c8' }}>No puede modificarse.</p>
            </div>

            {/* Foto seleccionada */}
            {avatarFile && (
              <p className="text-xs" style={{ color: '#a0a0a0' }}>
                📎 Foto seleccionada: <span style={{ color: '#1d1d1b' }}>{avatarFile.name}</span>
                {' — '}
                <button type="button" className="underline" style={{ color: '#dc3545' }}
                  onClick={() => { setAvatarFile(null); setAvatarPreview(userData?.avatarUrl || null); }}>
                  Cancelar
                </button>
              </p>
            )}

            <button type="submit" disabled={isSavingInfo}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50 mt-2"
              style={{ backgroundColor: '#f18517', color: 'white' }}>
              {isSavingInfo ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </form>
        )}

        {/* ── TAB: Contraseña ── */}
        {activeTab === 'password' && (
          <form onSubmit={handleSavePw} className="px-8 py-6 space-y-5">
            <Toast msg={pwMsg} />

            <PwField id="pw-current" label="Contraseña actual"
              value={pwData.current} onChange={e => setPwData({ ...pwData, current: e.target.value })}
              placeholder="Tu contraseña actual" />

            <PwField id="pw-new" label="Nueva contraseña (mín. 8 caracteres)"
              value={pwData.newPw} onChange={e => setPwData({ ...pwData, newPw: e.target.value })}
              placeholder="Nueva contraseña" />

            {/* Indicador de fortaleza */}
            {pwData.newPw.length > 0 && (
              <div className="space-y-1">
                <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#f0f0f0' }}>
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (pwData.newPw.length / 12) * 100)}%`,
                      backgroundColor: pwData.newPw.length < 8 ? '#dc3545' : pwData.newPw.length < 10 ? '#ffc107' : '#28a745',
                    }} />
                </div>
                <p className="text-xs" style={{
                  color: pwData.newPw.length < 8 ? '#dc3545' : pwData.newPw.length < 10 ? '#b45309' : '#28a745'
                }}>
                  {pwData.newPw.length < 8 ? 'Muy corta' : pwData.newPw.length < 10 ? 'Aceptable' : 'Segura'}
                </p>
              </div>
            )}

            <PwField id="pw-confirm" label="Confirmar contraseña"
              value={pwData.confirm} onChange={e => setPwData({ ...pwData, confirm: e.target.value })}
              placeholder="Repite la nueva contraseña" />

            {/* Match indicator */}
            {pwData.confirm.length > 0 && (
              <p className="text-xs" style={{ color: pwData.newPw === pwData.confirm ? '#28a745' : '#dc3545' }}>
                {pwData.newPw === pwData.confirm ? '✓ Las contraseñas coinciden' : '✗ No coinciden'}
              </p>
            )}

            <button type="submit" disabled={isSavingPw}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50 mt-2"
              style={{ backgroundColor: '#1d1d1b', color: 'white' }}>
              {isSavingPw ? 'Actualizando…' : 'Cambiar contraseña'}
            </button>
          </form>
        )}
      </div>

    </div>
  );
}