import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Header }        from '../components/Header';
import { Footer }        from '../components/Footer';
import { WhatsAppButton } from '../components/WhatsAppButton';

export function MainLayout() {
  const navigate = useNavigate();

  const handleAdminClick = () => {
    navigate('/admin');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      <Header onAdminClick={handleAdminClick} />
      <main>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}