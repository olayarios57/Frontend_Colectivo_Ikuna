import { useState } from 'react';
import { AdminLogin }     from '../components/admin/AdminLogin';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { WhatsAppButton } from '../components/WhatsAppButton';

export function AdminPage() {
  const [isAdmin,   setIsAdmin]   = useState(false);
  const [userData,  setUserData]  = useState(null);
  const [showLogin, setShowLogin] = useState(true);

  const handleLogin = (success, user) => {
    if (success) {
      setIsAdmin(true);
      setUserData(user);
      setShowLogin(false);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setUserData(null);
    setShowLogin(true);
  };

  if (isAdmin) {
    return (
      <>
        <AdminDashboard onLogout={handleLogout} userData={userData} />
        <WhatsAppButton />
      </>
    );
  }

  if (showLogin) {
    return (
      <AdminLogin
        onLogin={handleLogin}
        onClose={() => window.history.back()}
      />
    );
  }

  return null;
}