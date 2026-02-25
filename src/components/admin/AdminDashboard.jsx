import { useState, useEffect } from 'react';
import {
  LayoutDashboard, FolderOpen, Settings, LogOut, Menu, X,
  Plus, Edit, Trash2, FileText, Users as UsersIcon,
  CheckCircle, XCircle, Calendar as CalendarIcon, Clock, DollarSign,
  AlertCircle
} from 'lucide-react';
import { ProjectManagement } from './ProjectManagement';
import { BudgetManagement }  from './BudgetManagement';
import { apiService }        from '../../services/apiService';

// ─── Usuario administrador principal siempre activo ───────────────
const INITIAL_ACTIVE = [
  { id: 0, name: 'Administrador Principal', username: 'admin', email: 'ikunacolectivo@gmail.com', role: 'SUPER_ADMIN', status: 'ACTIVE' },
];

export function AdminDashboard({ onLogout, userData, pendingUsers, onPendingUsersChange }) {
  const [activeTab,     setActiveTab]    = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen]  = useState(false);
  const [projects,      setProjects]     = useState([]);
  const [activeUsers,   setActiveUsers]  = useState(INITIAL_ACTIVE);
  const [isLoading,     setIsLoading]    = useState(true);

  // Acepta tanto 'SUPER_ADMIN' (backend) como 'superadmin' (legacy)
  const isSuperAdmin = userData?.role === 'SUPER_ADMIN' || userData?.role === 'superadmin';

  // ── Carga inicial de datos desde el backend ─────────────────────
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const projectsData = await apiService.getPortfolio();
        // Normalizar campos para compatibilidad con ProjectManagement y BudgetManagement
        const normalized = (projectsData || []).map(p => ({
          ...p,
          budget:   p.budget   || 0,
          spent:    p.spent    || 0,
          expenses: p.expenses || [],
          teamMembers: p.teamMembers || [],
          tasks:    p.tasks    || [],
        }));
        setProjects(normalized);

        if (isSuperAdmin) {
          const pending = await apiService.getPendingUsers();
          const active  = await apiService.getActiveUsers();
          if (onPendingUsersChange) onPendingUsersChange(pending || []);
          setActiveUsers([...INITIAL_ACTIVE, ...(active || [])]);
        }
      } catch (error) {
        console.warn('Backend no disponible, usando datos locales:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [isSuperAdmin]); // eslint-disable-line

  // ── Sincronizar proyectos → calendario + presupuesto ───────────
  const handleProjectsChange = (updated) => setProjects(updated);

  // ── Aprobar usuario: quitar de pendientes → pasar a activos ────
  const handleApproveUser = async (userId) => {
    try {
      await apiService.approveUser(userId);
    } catch (err) {
      console.warn('Backend no disponible, aprobando localmente:', err);
    }
    const user = (pendingUsers || []).find(u => u.id === userId);
    if (onPendingUsersChange) onPendingUsersChange((pendingUsers || []).filter(u => u.id !== userId));
    if (user) setActiveUsers(prev => [...prev, { ...user, status: 'ACTIVE' }]);
  };

  // ── Rechazar usuario: solo quitar de pendientes ─────────────────
  const handleRejectUser = async (userId) => {
    try {
      await apiService.rejectUser(userId);
    } catch (err) {
      console.warn('Backend no disponible, rechazando localmente:', err);
    }
    if (onPendingUsersChange) onPendingUsersChange((pendingUsers || []).filter(u => u.id !== userId));
  };

  // ── Helpers de estado ───────────────────────────────────────────
  const getStatusColor = (status) => {
    const c = { completed: '#28a745', 'in-progress': '#ffc107', upcoming: '#17a2b8', pending: '#6c757d' };
    return c[status] || '#808080';
  };
  const getStatusLabel = (status) => {
    const l = { completed: 'Completado', 'in-progress': 'En Progreso', upcoming: 'Próximo', pending: 'Pendiente' };
    return l[status] || status;
  };

  // ── Métricas del dashboard ──────────────────────────────────────
  const stats = [
    { label: 'Total Proyectos',        value: projects.length,                                                           color: '#f18517' },
    { label: 'Completados',            value: projects.filter(p => p.status === 'completed').length,                     color: '#28a745' },
    { label: 'En Progreso',            value: projects.filter(p => p.status === 'in-progress').length,                   color: '#ffc107' },
    { label: 'Próximos / Pendientes',  value: projects.filter(p => p.status === 'upcoming' || p.status === 'pending').length, color: '#17a2b8' },
  ];

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard',   icon: LayoutDashboard },
    { id: 'projects',  label: 'Proyectos',   icon: FolderOpen      },
    { id: 'calendar',  label: 'Calendario',  icon: CalendarIcon    },
    { id: 'budget',    label: 'Presupuesto', icon: DollarSign      },
    { id: 'services',  label: 'Servicios',   icon: Settings        },
    { id: 'content',   label: 'Contenido',   icon: FileText        },
    ...(isSuperAdmin ? [{ id: 'users', label: 'Usuarios', icon: UsersIcon }] : []),
  ];

  const services = [
    { id: 1, name: 'Asesoría Cultural',      active: true },
    { id: 2, name: 'Creación de Proyectos',  active: true },
    { id: 3, name: 'Ejecución de Proyectos', active: true },
  ];

  // ════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f5f5f5' }}>

      {/* ── Sidebar ── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ backgroundColor: '#1d1d1b' }}
      >
        <div className="flex flex-col h-full">

          {/* Logo + usuario */}
          <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <h2 className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#f18517' }}>
              Ikuna Admin
            </h2>
            {userData && (
              <div className="mt-3">
                <p className="text-sm truncate" style={{ color: 'white' }}>{userData.fullName || userData.name}</p>
                <span className="inline-block text-xs mt-1 px-2 py-1 rounded" style={{ backgroundColor: '#f18517', color: 'white' }}>
                  {isSuperAdmin ? 'Super Admin' : 'Administrador'}
                </span>
              </div>
            )}
          </div>

          {/* Navegación */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map(({ id, label, icon: Icon }) => (
                <li key={id}>
                  <button
                    onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
                    style={{
                      backgroundColor: activeTab === id ? '#f18517' : 'transparent',
                      color: 'white',
                    }}
                  >
                    <Icon size={20} />
                    <span>{label}</span>
                    {/* Badge de pendientes en el menú Usuarios */}
                    {id === 'users' && (pendingUsers?.length || 0) > 0 && (
                      <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: '#dc3545', color: 'white' }}>
                        {pendingUsers.length}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Cerrar sesión */}
          <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all" style={{ color: 'white' }}>
              <LogOut size={20} /><span>Cerrar Sesión</span>
            </button>
          </div>

        </div>
      </aside>

      {/* Overlay mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-30 lg:hidden" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main ── */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-md p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2" style={{ color: '#1d1d1b' }}>
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="text-xl lg:text-2xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                {menuItems.find(m => m.id === activeTab)?.label}
              </h1>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#f18517' }} />
            </div>
          ) : (
            <>
              {/* ── DASHBOARD ── */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    {stats.map(({ label, value, color }) => (
                      <div key={label} className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-sm mb-2" style={{ color: '#808080' }}>{label}</h3>
                        <p className="text-3xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color }}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Proyectos recientes */}
                  {projects.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <h3 className="text-lg mb-4" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                        Proyectos Recientes
                      </h3>
                      <div className="space-y-3">
                        {projects.slice(0, 4).map(p => (
                          <div key={p.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#f5f5f5' }}>
                            <div>
                              <p className="font-medium text-sm" style={{ color: '#1d1d1b' }}>{p.title}</p>
                              <p className="text-xs" style={{ color: '#808080' }}>{p.date} · {p.category}</p>
                            </div>
                            <span className="px-2 py-1 rounded-full text-xs" style={{ backgroundColor: getStatusColor(p.status) + '20', color: getStatusColor(p.status) }}>
                              {getStatusLabel(p.status)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── PROYECTOS → sincronizado con calendario y presupuesto ── */}
              {activeTab === 'projects' && (
                <ProjectManagement
                  projects={projects}
                  onProjectsChange={handleProjectsChange}
                />
              )}

              {/* ── CALENDARIO → lee directamente el estado projects ── */}
              {activeTab === 'calendar' && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6 border-b" style={{ borderColor: '#e0e0e0' }}>
                    <h2 className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                      Calendario de Proyectos
                    </h2>
                    <p className="text-sm mt-1" style={{ color: '#808080' }}>
                      {projects.length} proyecto{projects.length !== 1 ? 's' : ''} registrado{projects.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="p-6">
                    {projects.length === 0 ? (
                      <p className="text-center py-12 text-sm" style={{ color: '#808080' }}>
                        No hay proyectos en el calendario. Crea uno desde la sección «Proyectos».
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {[...projects]
                          .sort((a, b) => new Date(a.date) - new Date(b.date))
                          .map(project => (
                            <div
                              key={project.id}
                              className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border hover:shadow-md transition-shadow"
                              style={{ borderLeftWidth: 4, borderLeftColor: getStatusColor(project.status), borderColor: '#e0e0e0', backgroundColor: getStatusColor(project.status) + '08' }}
                            >
                              {/* Fecha */}
                              <div className="flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center text-white"
                                style={{ backgroundColor: getStatusColor(project.status) }}>
                                {project.date ? (
                                  <>
                                    <span className="text-xs font-medium uppercase">
                                      {new Date(project.date + 'T00:00:00').toLocaleDateString('es-CO', { month: 'short' })}
                                    </span>
                                    <span className="text-2xl font-bold leading-none">
                                      {new Date(project.date + 'T00:00:00').getDate()}
                                    </span>
                                    <span className="text-xs">
                                      {new Date(project.date + 'T00:00:00').getFullYear()}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-xs">TBD</span>
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <h3 className="font-medium" style={{ color: '#1d1d1b' }}>{project.title}</h3>
                                  <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: getStatusColor(project.status) + '20', color: getStatusColor(project.status) }}>
                                    {getStatusLabel(project.status)}
                                  </span>
                                  <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: '#f5f5f5', color: '#808080' }}>
                                    {project.category}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: '#808080' }}>
                                  <span>{project.teamMembers?.length || 0} miembro{(project.teamMembers?.length || 0) !== 1 ? 's' : ''}</span>
                                  <span>{project.tasks?.length || 0} tarea{(project.tasks?.length || 0) !== 1 ? 's' : ''}</span>
                                </div>
                                {/* Mini barra de progreso */}
                                <div className="flex-shrink-0 w-full sm:w-40 mt-2">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs" style={{ color: '#808080' }}>Progreso</span>
                                    <span className="text-xs font-medium" style={{ color: '#1d1d1b' }}>{project.progress}%</span>
                                  </div>
                                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-500"
                                      style={{ width: `${project.progress}%`, backgroundColor: getStatusColor(project.status) }} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── PRESUPUESTO → sincronizado con projects ── */}
              {activeTab === 'budget' && (
                <BudgetManagement
                  projects={projects}
                  onProjectsChange={handleProjectsChange}
                />
              )}

              {/* ── SERVICIOS ── */}
              {activeTab === 'services' && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-4 lg:p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: '#e0e0e0' }}>
                    <h2 className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>Gestión de Servicios</h2>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all hover:shadow-lg" style={{ backgroundColor: '#f18517', color: 'white' }}>
                      <Plus size={20} />Nuevo Servicio
                    </button>
                  </div>
                  <div className="p-4 lg:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {services.map(service => (
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
              )}

              {/* ── CONTENIDO ── */}
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

              {/* ── USUARIOS (solo SUPER_ADMIN) ── */}
              {activeTab === 'users' && isSuperAdmin && (
                <div className="space-y-4 lg:space-y-6">

                  {/* Solicitudes pendientes */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-4 lg:p-6 border-b" style={{ borderColor: '#e0e0e0', backgroundColor: (pendingUsers?.length || 0) > 0 ? '#fffbea' : 'white' }}>
                      <h2 className="text-lg lg:text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: (pendingUsers?.length || 0) > 0 ? '#f18517' : '#1d1d1b' }}>
                        Solicitudes Pendientes ({pendingUsers?.length || 0})
                      </h2>
                    </div>
                    <div className="p-4 lg:p-6">
                      {(pendingUsers?.length || 0) === 0 ? (
                        <p className="text-center py-8 text-sm" style={{ color: '#808080' }}>No hay solicitudes pendientes.</p>
                      ) : (
                        <div className="space-y-4">
                          {pendingUsers.map(user => (
                            <div key={user.id} className="flex flex-col p-4 border rounded-xl gap-4" style={{ borderColor: '#e0e0e0' }}>
                              <div>
                                <p className="font-medium text-lg" style={{ color: '#1d1d1b', fontFamily: 'Montserrat, sans-serif' }}>{user.fullName || user.name}</p>
                                <p className="text-sm break-all" style={{ color: '#808080' }}>{user.email}</p>
                                {user.username && <p className="text-sm" style={{ color: '#808080' }}>Usuario: @{user.username}</p>}
                                <p className="text-xs mt-1" style={{ color: '#b0b0b0' }}>Solicitud: {user.requestDate || user.date || 'Hoy'} · Rol: {user.role}</p>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <button onClick={() => handleApproveUser(user.id)}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all hover:shadow-lg"
                                  style={{ backgroundColor: '#28a745', color: 'white' }}>
                                  <CheckCircle size={18} /><span>Aprobar</span>
                                </button>
                                <button onClick={() => handleRejectUser(user.id)}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all hover:shadow-lg"
                                  style={{ backgroundColor: '#dc3545', color: 'white' }}>
                                  <XCircle size={18} /><span>Rechazar</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Usuarios activos */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-4 lg:p-6 border-b" style={{ borderColor: '#e0e0e0' }}>
                      <h2 className="text-lg lg:text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                        Usuarios Activos ({activeUsers.length})
                      </h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead style={{ backgroundColor: '#f5f5f5' }}>
                          <tr>
                            {['Usuario', 'Email', 'Rol', 'Estado'].map(h => (
                              <th key={h} className="text-left p-3 lg:p-4 text-sm font-medium" style={{ color: '#1d1d1b' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {activeUsers.map(user => (
                            <tr key={user.id} className="border-b" style={{ borderColor: '#e0e0e0' }}>
                              <td className="p-3 lg:p-4">
                                <p className="text-sm font-medium" style={{ color: '#1d1d1b' }}>{user.fullName || user.name}</p>
                                {user.username && <p className="text-xs" style={{ color: '#808080' }}>@{user.username}</p>}
                              </td>
                              <td className="p-3 lg:p-4 text-sm break-all" style={{ color: '#808080' }}>{user.email}</td>
                              <td className="p-3 lg:p-4">
                                <span className="px-2 py-1 rounded-full text-xs font-medium"
                                  style={{ backgroundColor: user.role === 'SUPER_ADMIN' || user.role === 'superadmin' ? '#f18517' : '#6c757d', color: 'white' }}>
                                  {user.role === 'SUPER_ADMIN' || user.role === 'superadmin' ? 'Super Admin' : user.role}
                                </span>
                              </td>
                              <td className="p-3 lg:p-4">
                                <span className="px-2 py-1 rounded-full text-xs" style={{ backgroundColor: '#d4edda', color: '#155724' }}>
                                  Activo
                                </span>
                              </td>
                            </tr>
                          ))}
                          {activeUsers.length === 0 && (
                            <tr><td colSpan="4" className="p-4 text-center text-sm" style={{ color: '#808080' }}>No hay usuarios activos.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}