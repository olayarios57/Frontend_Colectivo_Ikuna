import { createBrowserRouter } from 'react-router-dom';
import { MainLayout }   from '../layouts/MainLayout';
import { HomePage }     from '../pages/HomePage';
import { IdentityPage } from '../pages/IdentityPage';
import { ServicesPage } from '../pages/ServicesPage';
import { ProjectsPage } from '../pages/ProjectsPage';
import { ContactPage }  from '../pages/ContactPage';
import { AdminPage }    from '../pages/AdminPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true,         element: <HomePage />     },
      { path: 'identidad',   element: <IdentityPage /> },
      { path: 'servicios',   element: <ServicesPage /> },
      { path: 'proyectos',   element: <ProjectsPage /> },
      { path: 'contacto',    element: <ContactPage />  },
    ],
  },
  {
    path: '/admin',
    element: <AdminPage />,
  },
]);