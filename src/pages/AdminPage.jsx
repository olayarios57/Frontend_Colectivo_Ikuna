import { useState } from 'react';
import { AdminLogin }     from '../components/admin/AdminLogin';
import { AdminDashboard } from '../components/admin/AdminDashboard';

// Estado inicial de pendientes (demo). Con backend real esto viene de una API.
const INITIAL_PENDING = [];

export function AdminPage() {
  const [isAdmin,       setIsAdmin]       = useState(false);
  const [userData,      setUserData]      = useState(null);
  // ── Estado compartido: pendientes visibles tanto en login como en dashboard ──
  const [pendingUsers,  setPendingUsers]  = useState(INITIAL_PENDING);

  const handleLogin = (success, user) => {
    if (success) {
      setIsAdmin(true);
      setUserData(user);
    }
  };

  // Recibe la solicitud de registro desde AdminLogin y la agrega a pendientes
  const handleRegisterRequest = (formData) => {
    const newRequest = {
      id:       Date.now(),
      name:     formData.name,
      email:    formData.email,
      username: formData.username,
      role:     formData.role || 'editor',
      date:     new Date().toISOString().split('T')[0],
      status:   'pending',
    };
    setPendingUsers(prev => [...prev, newRequest]);
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setUserData(null);
  };

  if (isAdmin) {
    return (
      <AdminDashboard
        onLogout={handleLogout}
        userData={userData}
        pendingUsers={pendingUsers}
        onPendingUsersChange={setPendingUsers}
      />
    );
  }

  return (
    <AdminLogin
      onLogin={handleLogin}
      onRegisterRequest={handleRegisterRequest}
      onClose={() => window.history.back()}
    />
  );
}