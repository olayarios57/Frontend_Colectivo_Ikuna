import { useState } from 'react';
import {
  LayoutDashboard, FolderOpen, Settings, LogOut, Menu, X,
  Plus, Edit, Trash2, FileText, Users as UsersIcon,
  CheckCircle, XCircle, Calendar as CalendarIcon, Clock, DollarSign
} from 'lucide-react';
import { ProjectManagement } from './ProjectManagement';
import { BudgetManagement }   from './BudgetManagement';

export function AdminDashboard({ onLogout, userData }) {
  const [activeTab,      setActiveTab]      = useState('dashboard');
  const [isSidebarOpen,  setIsSidebarOpen]  = useState(false);
  const isSuperAdmin = userData?.role === 'superadmin';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard',   icon: LayoutDashboard },
    { id: 'projects',  label: 'Proyectos',   icon: FolderOpen },
    { id: 'calendar',  label: 'Calendario',  icon: CalendarIcon },
    { id: 'budget',    label: 'Presupuesto', icon: DollarSign },
    { id: 'services',  label: 'Servicios',   icon: Settings },
    { id: 'content',   label: 'Contenido',   icon: FileText },
    ...(isSuperAdmin ? [{ id: 'users', label: 'Usuarios', icon: UsersIcon }] : []),
  ];

  const projects = [
    { id: 1, title: 'Plaza Cultural Centro',       status: 'completed',  date: '2024-01-15', progress: 100, category: 'Espacios',
      teamMembers: [
        { id: 1, name: 'María González',  email: 'maria@ikuna.com',  role: 'Coordinadora' },
        { id: 2, name: 'Carlos Rodríguez',email: 'carlos@ikuna.com', role: 'Diseñador' },
      ],
      tasks: [
        { id: 1, title: 'Diseño inicial', assignedTo: 'Carlos Rodríguez', startDate: '2024-01-05', endDate: '2024-01-10', status: 'completed' },
        { id: 2, title: 'Ejecución',      assignedTo: 'María González',   startDate: '2024-01-11', endDate: '2024-01-15', status: 'completed' },
      ],
    },
    { id: 2, title: 'Noche de Cultura Viva',      status: 'in-progress', date: '2024-02-20', progress: 65, category: 'Eventos',
      teamMembers: [{ id: 3, name: 'Ana Martínez', email: 'ana@ikuna.com', role: 'Productora' }],
      tasks: [
        { id: 3, title: 'Reserva de espacio',    assignedTo: 'Ana Martínez', startDate: '2024-02-01', endDate: '2024-02-05', status: 'completed' },
        { id: 4, title: 'Contratación artistas', assignedTo: 'Ana Martínez', startDate: '2024-02-10', endDate: '2024-02-15', status: 'in-progress' },
      ],
    },
    { id: 3, title: 'Festival Cultural Ikuna',    status: 'in-progress', date: '2024-03-10', progress: 40, category: 'Festivales', teamMembers: [], tasks: [] },
    { id: 4, title: 'Taller de Teatro Comunitario',status: 'upcoming',   date: '2024-04-15', progress: 10, category: 'Talleres',   teamMembers: [], tasks: [] },
  ];

  const [pendingUsers, setPendingUsers] = useState([
    { id: 1, name: 'María González',  email: 'maria@example.com',  username: 'mgonzalez',  requestDate: '2024-01-18' },
    { id: 2, name: 'Carlos Rodríguez',email: 'carlos@example.com', username: 'crodriguez', requestDate: '2024-01-19' },
  ]);

  const services = [
    { id: 1, name: 'Asesoría Cultural',       active: true },
    { id: 2, name: 'Creación de Proyectos',   active: true },
    { id: 3, name: 'Ejecución de Proyectos',  active: true },
  ];

  const getStatusColor = (status) => {
    const colors = { completed: '#28a745', 'in-progress': '#ffc107', upcoming: '#17a2b8' };
    return colors[status] || '#808080';
  };

  const getStatusLabel = (status) => {
    const labels = { completed: 'Completado', 'in-progress': 'En Progreso', upcoming: 'Próximo' };
    return labels[status] || 'Desconocido';
  };

  const handleApproveUser = (userId) => setPendingUsers(pendingUsers.filter((u) => u.id !== userId));
  const handleRejectUser  = (userId) => setPendingUsers(pendingUsers.filter((u) => u.id !== userId));

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ backgroundColor: '#1d1d1b' }}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <h2 className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#f18517' }}>
              Ikuna Admin
            </h2>
            {userData && (
              <div className="mt-2">
                <p className="text-sm truncate" style={{ color: 'white' }}>{userData.name}</p>
                <p className="text-xs mt-1 px-2 py-1 rounded w-fit" style={{ backgroundColor: '#f18517', color: 'white' }}>
                  {userData.role === 'superadmin' ? 'Super Admin' : 'Administrador'}
                </p>
              </div>
            )}
          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === item.id ? 'shadow-lg' : 'hover:bg-white/10'}`}
                      style={{ backgroundColor: activeTab === item.id ? '#f18517' : 'transparent', color: 'white' }}
                    >
                      <IconComponent size={20} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all" style={{ color: 'white' }}>
              <LogOut size={20} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-30 lg:hidden" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-md p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2" style={{ color: '#1d1d1b' }}>
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="text-xl lg:text-2xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                {menuItems.find((item) => item.id === activeTab)?.label}
              </h1>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {[
                { label: 'Total Proyectos', value: projects.length,                                         color: '#f18517' },
                { label: 'Completados',     value: projects.filter((p) => p.status === 'completed').length, color: '#28a745' },
                { label: 'En Progreso',     value: projects.filter((p) => p.status === 'in-progress').length,color: '#ffc107' },
                { label: 'Próximos',        value: projects.filter((p) => p.status === 'upcoming').length,  color: '#17a2b8' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-sm mb-2" style={{ color: '#808080' }}>{label}</h3>
                  <p className="text-3xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color }}>{value}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'projects' && <ProjectManagement projects={projects} />}
          {activeTab === 'budget'   && <BudgetManagement />}

          {/* Calendar */}
          {activeTab === 'calendar' && (
            <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
              <h2 className="text-xl mb-6" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                Calendario de Actividades
              </h2>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow" style={{ borderColor: '#e0e0e0' }}>
                    <div
                      className="w-full sm:w-16 h-16 rounded-lg flex flex-col items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: getStatusColor(project.status) + '20', color: getStatusColor(project.status) }}
                    >
                      <span className="text-xs">{new Date(project.date).toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}</span>
                      <span className="text-xl font-bold">{new Date(project.date).getDate()}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg mb-1" style={{ color: '#1d1d1b', fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>{project.title}</h3>
                      <p className="text-sm mb-2" style={{ color: '#808080' }}>{project.category}</p>
                      <div className="flex items-center gap-2">
                        <Clock size={14} style={{ color: '#808080' }} />
                        <span className="text-sm" style={{ color: '#808080' }}>{getStatusLabel(project.status)} - {project.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          {activeTab === 'services' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 lg:p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: '#e0e0e0' }}>
                <h2 className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>Gestión de Servicios</h2>
                <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all hover:shadow-lg" style={{ backgroundColor: '#f18517', color: 'white' }}>
                  <Plus size={20} />Nuevo Servicio
                </button>
              </div>
              <div className="p-4 lg:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {services.map((service) => (
                    <div key={service.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow" style={{ borderColor: '#e0e0e0' }}>
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>{service.name}</h3>
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: service.active ? '#28a745' : '#dc3545' }} />
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors" style={{ borderColor: '#e0e0e0', color: '#1d1d1b' }}>
                          <Edit size={16} className="inline mr-2" />Editar
                        </button>
                        <button className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors" style={{ borderColor: '#e0e0e0', color: '#dc3545' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {activeTab === 'content' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
                <h2 className="text-xl mb-4" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>Contenido Institucional</h2>
                <div className="space-y-4">
                  {[{ title: 'Misión', sub: 'Editar misión institucional' }, { title: 'Visión', sub: 'Editar visión institucional' }, { title: 'Valores', sub: 'Gestionar valores corporativos' }].map(({ title, sub }) => (
                    <button key={title} className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors" style={{ borderColor: '#e0e0e0' }}>
                      <h3 className="mb-1" style={{ color: '#1d1d1b' }}>{title}</h3>
                      <p className="text-sm" style={{ color: '#808080' }}>{sub}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
                <h2 className="text-xl mb-4" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>Equipo y Aliados</h2>
                <div className="space-y-4">
                  {[{ title: 'Equipo de Trabajo', sub: 'Gestionar miembros del equipo' }, { title: 'Aliados', sub: 'Gestionar aliados estratégicos' }].map(({ title, sub }) => (
                    <button key={title} className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors" style={{ borderColor: '#e0e0e0' }}>
                      <h3 className="mb-1" style={{ color: '#1d1d1b' }}>{title}</h3>
                      <p className="text-sm" style={{ color: '#808080' }}>{sub}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users */}
          {activeTab === 'users' && isSuperAdmin && (
            <div className="space-y-4 lg:space-y-6">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 lg:p-6 border-b" style={{ borderColor: '#e0e0e0', backgroundColor: '#fff3cd' }}>
                  <h2 className="text-lg lg:text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#856404' }}>
                    Solicitudes Pendientes ({pendingUsers.length})
                  </h2>
                </div>
                <div className="p-4 lg:p-6">
                  {pendingUsers.length > 0 ? (
                    <div className="space-y-4">
                      {pendingUsers.map((user) => (
                        <div key={user.id} className="flex flex-col p-4 border rounded-lg gap-4" style={{ borderColor: '#e0e0e0' }}>
                          <div className="flex-1">
                            <h3 className="text-base lg:text-lg mb-1" style={{ color: '#1d1d1b', fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>{user.name}</h3>
                            <p className="text-sm mb-1 break-all" style={{ color: '#808080' }}>{user.email}</p>
                            <p className="text-sm mb-1" style={{ color: '#808080' }}>Usuario: @{user.username}</p>
                            <p className="text-xs" style={{ color: '#808080' }}>Solicitud: {user.requestDate}</p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button onClick={() => handleApproveUser(user.id)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all hover:shadow-lg" style={{ backgroundColor: '#28a745', color: 'white' }}>
                              <CheckCircle size={18} /><span>Aprobar</span>
                            </button>
                            <button onClick={() => handleRejectUser(user.id)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all hover:shadow-lg" style={{ backgroundColor: '#dc3545', color: 'white' }}>
                              <XCircle size={18} /><span>Rechazar</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8" style={{ color: '#808080' }}>No hay solicitudes pendientes</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 lg:p-6 border-b" style={{ borderColor: '#e0e0e0' }}>
                  <h2 className="text-lg lg:text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>Usuarios Activos</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ backgroundColor: '#f5f5f5' }}>
                      <tr>
                        {['Usuario', 'Email', 'Rol', 'Estado'].map((h) => (
                          <th key={h} className="text-left p-3 lg:p-4 text-sm" style={{ color: '#1d1d1b' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b" style={{ borderColor: '#e0e0e0' }}>
                        <td className="p-3 lg:p-4 text-sm" style={{ color: '#1d1d1b' }}>admin</td>
                        <td className="p-3 lg:p-4 text-sm" style={{ color: '#808080' }}>admin@ikuna.com</td>
                        <td className="p-3 lg:p-4"><span className="px-2 py-1 rounded-full text-xs" style={{ backgroundColor: '#f18517', color: 'white' }}>Super Admin</span></td>
                        <td className="p-3 lg:p-4"><span className="px-2 py-1 rounded-full text-xs" style={{ backgroundColor: '#d4edda', color: '#155724' }}>Activo</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}