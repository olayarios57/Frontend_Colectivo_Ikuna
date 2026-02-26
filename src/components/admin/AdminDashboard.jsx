import { useState, useEffect } from 'react';
import {
  LogOut, Menu, X, Plus, Edit, Trash2,
  CheckCircle, XCircle, Ban,
} from 'lucide-react';
import { ProjectManagement } from './ProjectManagement';
import { BudgetManagement }  from './BudgetManagement';
import { ProfileSection }    from './ProfileSection';
import { apiService }        from '../../services/apiService';

const INITIAL_ACTIVE = [
  { id: 0, name: 'Administrador Principal', username: 'admin', email: 'ikunacolectivo@gmail.com', role: 'SUPER_ADMIN', status: 'ACTIVE' },
];

// ── Iconos SVG minimalistas inline ───────────────────────────────────────────
const Icon = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  projects: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6a2 2 0 012-2h4l2 3h10a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
    </svg>
  ),
  calendar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  budget: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><path d="M12 6v2m0 8v2M9.5 9.5A2.5 2.5 0 0112 8a2.5 2.5 0 010 5 2.5 2.5 0 000 5 2.5 2.5 0 002.5-1.5"/>
    </svg>
  ),
  services: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
      <path d="M15.54 8.46a5 5 0 010 7.07M8.46 8.46a5 5 0 000 7.07"/>
    </svg>
  ),
  content: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/>
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  profile: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

// ── Normaliza cualquier proyecto (local o del backend) a campos canónicos ────
// El backend puede devolver totalBudget/executedBudget en lugar de budget/spent.
// Esta función garantiza que SIEMPRE existan los campos que usan BudgetManagement
// y ProjectManagement, sin importar qué variante devuelva el servidor.
function normalizeProject(p) {
  const budget = Number(p.budget ?? p.totalBudget ?? 0)  || 0;
  const spent  = Number(p.spent  ?? p.executedBudget ?? 0) || 0;
  const progress = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  return {
    ...p,
    budget,
    spent,
    progress,
    expenses:    Array.isArray(p.expenses)    ? p.expenses    : [],
    teamMembers: Array.isArray(p.teamMembers) ? p.teamMembers : [],
    tasks:       Array.isArray(p.tasks)       ? p.tasks       : [],
  };
}

// ════════════════════════════════════════════════════════════════════════════
export function AdminDashboard({ onLogout, userData, pendingUsers, onPendingUsersChange }) {
  const [activeTab,     setActiveTab]   = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [projects,      setProjects]    = useState([]);
  const [activeUsers,   setActiveUsers] = useState(INITIAL_ACTIVE);
  const [isLoading,     setIsLoading]   = useState(true);
  const [currentUser,   setCurrentUser] = useState(userData);

  const isSuperAdmin = userData?.role === 'SUPER_ADMIN' || userData?.role === 'superadmin';

  // Wrapper que normaliza antes de guardar en el estado
  const setNormalizedProjects = (list) => setProjects((list || []).map(normalizeProject));

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getPortfolio();
        setNormalizedProjects(data || []);
        if (isSuperAdmin) {
          const [pending, active] = await Promise.all([apiService.getPendingUsers(), apiService.getActiveUsers()]);
          onPendingUsersChange?.(pending || []);
          setActiveUsers([...INITIAL_ACTIVE, ...(active || [])]);
        }
      } catch { /* backend no disponible */ }
      finally { setIsLoading(false); }
    };
    load();
  }, [isSuperAdmin]); // eslint-disable-line

  const STATUS_COLOR = { completed:'#28a745','in-progress':'#ffc107', upcoming:'#17a2b8', pending:'#6c757d' };
  const STATUS_LABEL = { completed:'Completado','in-progress':'En Progreso', upcoming:'Próximo', pending:'Pendiente' };
  const getColor = s => STATUS_COLOR[s] || '#808080';
  const getLabel = s => STATUS_LABEL[s] || s;

  const stats = [
    { label:'Total Proyectos',       value: projects.length,                                                               color:'#f18517' },
    { label:'Completados',           value: projects.filter(p=>p.status==='completed').length,                             color:'#28a745' },
    { label:'En Progreso',           value: projects.filter(p=>p.status==='in-progress').length,                           color:'#ffc107' },
    { label:'Próximos / Pendientes', value: projects.filter(p=>p.status==='upcoming'||p.status==='pending').length,        color:'#17a2b8' },
  ];

  const recentProjects = [...projects]
    .sort((a,b)=>new Date(b.createdAt||b.date||0)-new Date(a.createdAt||a.date||0))
    .slice(0,6);

  const approveUser = async (id) => {
    try { await apiService.approveUser(id); } catch {}
    const u = (pendingUsers||[]).find(u=>u.id===id);
    onPendingUsersChange?.((pendingUsers||[]).filter(u=>u.id!==id));
    if (u) setActiveUsers(prev=>[...prev,{...u,status:'ACTIVE'}]);
  };
  const rejectUser  = async (id) => {
    try { await apiService.rejectUser(id); } catch {}
    onPendingUsersChange?.((pendingUsers||[]).filter(u=>u.id!==id));
  };
  const disableUser = async (id) => {
    try { await apiService.disableUser?.(id); } catch {}
    setActiveUsers(prev=>prev.map(u=>u.id===id?{...u,status:'INACTIVE'}:u));
  };
  const enableUser  = async (id) => {
    try { await apiService.enableUser?.(id); } catch {}
    setActiveUsers(prev=>prev.map(u=>u.id===id?{...u,status:'ACTIVE'}:u));
  };
  const deleteUser  = async (id) => {
    if(!window.confirm('¿Eliminar este usuario permanentemente?')) return;
    try { await apiService.deleteUser?.(id); } catch {}
    setActiveUsers(prev=>prev.filter(u=>u.id!==id));
  };

  const menuItems = [
    { id:'dashboard', label:'Dashboard',   icon: Icon.dashboard },
    { id:'projects',  label:'Proyectos',   icon: Icon.projects  },
    { id:'calendar',  label:'Calendario',  icon: Icon.calendar  },
    { id:'budget',    label:'Presupuesto', icon: Icon.budget    },
    { id:'services',  label:'Servicios',   icon: Icon.services  },
    { id:'content',   label:'Contenido',   icon: Icon.content   },
    ...(isSuperAdmin?[{id:'users',label:'Usuarios',icon:Icon.users}]:[]),
    { id:'profile',   label:'Mi Perfil',   icon: Icon.profile   },
  ];

  const [services] = useState([
    { id:1, name:'Asesoría Cultural',      active:true },
    { id:2, name:'Creación de Proyectos',  active:true },
    { id:3, name:'Ejecución de Proyectos', active:true },
  ]);

  const COP = v => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0}).format(v||0);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor:'#f5f5f5' }}>

      {/* ── Sidebar ── */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-60 transform transition-transform duration-300
        ${isSidebarOpen?'translate-x-0':'-translate-x-full lg:translate-x-0'}`}
        style={{ backgroundColor:'#1d1d1b' }}>
        <div className="flex flex-col h-full">

          {/* Cabecera */}
          <div className="px-5 py-6 border-b" style={{ borderColor:'rgba(255,255,255,0.08)' }}>
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color:'rgba(255,255,255,0.35)' }}>
              Panel de control
            </p>
            {currentUser && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor:'#f18517' }}>
                  {currentUser.avatarUrl
                    ? <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover"/>
                    : <span className="text-white text-xs font-semibold">
                        {(currentUser.name||'A').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                      </span>
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color:'white' }}>{currentUser.name}</p>
                  <p className="text-xs truncate" style={{ color:'rgba(255,255,255,0.4)' }}>
                    {isSuperAdmin?'Super Admin':currentUser.role||'Colaborador'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
            {menuItems.map(({ id, label, icon }) => {
              const active = activeTab === id;
              return (
                <button key={id}
                  onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm"
                  style={{
                    backgroundColor: active ? '#f18517' : 'transparent',
                    color: active ? 'white' : 'rgba(255,255,255,0.55)',
                  }}
                  onMouseEnter={e => { if(!active) e.currentTarget.style.color='white'; }}
                  onMouseLeave={e => { if(!active) e.currentTarget.style.color='rgba(255,255,255,0.55)'; }}
                >
                  <span className="flex-shrink-0">{icon}</span>
                  <span className="font-normal">{label}</span>
                  {id==='users' && (pendingUsers?.length||0)>0 && (
                    <span className="ml-auto text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                      style={{ backgroundColor:'#dc3545', color:'white' }}>
                      {pendingUsers.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Cerrar sesión */}
          <div className="px-3 py-4 border-t" style={{ borderColor:'rgba(255,255,255,0.08)' }}>
            <button onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
              style={{ color:'rgba(255,255,255,0.45)' }}
              onMouseEnter={e=>e.currentTarget.style.color='white'}
              onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.45)'}>
              {Icon.logout}<span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-30 lg:hidden" style={{ backgroundColor:'rgba(0,0,0,0.5)' }}
          onClick={()=>setSidebarOpen(false)}/>
      )}

      {/* ── Main ── */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b px-4 lg:px-8 py-4" style={{ borderColor:'#ebebeb' }}>
          <div className="flex items-center gap-4">
            <button onClick={()=>setSidebarOpen(!isSidebarOpen)} className="lg:hidden p-1.5 rounded-lg"
              style={{ color:'#1d1d1b' }}>
              {isSidebarOpen?<X size={22}/>:<Menu size={22}/>}
            </button>
            <h1 className="text-lg font-medium" style={{ fontFamily:'Montserrat, sans-serif', color:'#1d1d1b' }}>
              {menuItems.find(m=>m.id===activeTab)?.label}
            </h1>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor:'#f18517', borderTopColor:'transparent' }}/>
            </div>
          ) : (
            <>
              {/* ══ DASHBOARD ══ */}
              {activeTab==='dashboard' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map(({label,value,color})=>(
                      <div key={label} className="bg-white rounded-xl p-5 shadow-sm border" style={{ borderColor:'#ebebeb' }}>
                        <p className="text-xs mb-3 uppercase tracking-wide" style={{ color:'#b0b0b0' }}>{label}</p>
                        <p className="text-4xl font-light" style={{ fontFamily:'Montserrat, sans-serif', color }}>{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor:'#ebebeb' }}>
                    <div className="px-6 py-4 border-b" style={{ borderColor:'#ebebeb' }}>
                      <h3 className="text-sm font-medium" style={{ color:'#1d1d1b' }}>Proyectos Recientes</h3>
                    </div>
                    {recentProjects.length===0 ? (
                      <p className="p-6 text-sm text-center" style={{ color:'#b0b0b0' }}>
                        Crea el primer proyecto desde «Proyectos».
                      </p>
                    ):(
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead><tr style={{ backgroundColor:'#fafafa' }}>
                            {['Nombre','Categoría','Estado','Presupuesto','Miembros','Fecha inicio'].map(h=>(
                              <th key={h} className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide"
                                style={{ color:'#b0b0b0' }}>{h}</th>
                            ))}
                          </tr></thead>
                          <tbody>
                            {recentProjects.map(p=>(
                              <tr key={p.id} className="border-t hover:bg-gray-50 transition-colors"
                                style={{ borderColor:'#ebebeb' }}>
                                <td className="px-5 py-3.5 text-sm font-medium" style={{ color:'#1d1d1b' }}>{p.title}</td>
                                <td className="px-5 py-3.5 text-sm" style={{ color:'#808080' }}>{p.category}</td>
                                <td className="px-5 py-3.5">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                                    style={{ backgroundColor:getColor(p.status)+'18', color:getColor(p.status) }}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor:getColor(p.status) }}/>
                                    {getLabel(p.status)}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5 text-sm" style={{ color:'#1d1d1b' }}>{COP(p.budget)}</td>
                                <td className="px-5 py-3.5 text-sm text-center" style={{ color:'#1d1d1b' }}>
                                  {p.teamMembers?.length||0}
                                </td>
                                <td className="px-5 py-3.5 text-sm" style={{ color:'#808080' }}>{p.date||'—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab==='projects'  && <ProjectManagement projects={projects} onProjectsChange={setNormalizedProjects}/>}

              {/* ══ CALENDARIO ══ */}
              {activeTab==='calendar' && (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor:'#ebebeb' }}>
                  <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor:'#ebebeb' }}>
                    <h2 className="text-sm font-medium" style={{ color:'#1d1d1b' }}>
                      Calendario de proyectos
                    </h2>
                    <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor:'#f5f5f5', color:'#808080' }}>
                      {projects.length} proyecto{projects.length!==1?'s':''}
                    </span>
                  </div>
                  <div className="p-6">
                    {projects.length===0 ? (
                      <p className="text-center py-16 text-sm" style={{ color:'#b0b0b0' }}>
                        No hay proyectos. Crea uno desde «Proyectos».
                      </p>
                    ):(
                      <div className="space-y-3">
                        {[...projects].sort((a,b)=>new Date(a.date||0)-new Date(b.date||0)).map(p=>{
                          const progress = p.budget>0 ? Math.min(100,Math.round(((p.spent||0)/p.budget)*100)) : 0;
                          const accent   = getColor(p.status);
                          return (
                            <div key={p.id}
                              className="rounded-xl border overflow-hidden transition-shadow hover:shadow-md"
                              style={{ borderColor:'#ebebeb' }}>
                              {/* Banda de color superior */}
                              <div className="h-1" style={{ backgroundColor: accent }}/>

                              <div className="p-5">
                                {/* Fila 1: nombre + badges */}
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                  <span className="font-semibold text-sm" style={{ color:'#1d1d1b', fontFamily:'Montserrat, sans-serif' }}>
                                    {p.title}
                                  </span>
                                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                                    style={{ backgroundColor:accent+'18', color:accent }}>
                                    {getLabel(p.status)}
                                  </span>
                                  <span className="text-xs px-2.5 py-0.5 rounded-full"
                                    style={{ backgroundColor:'#f5f5f5', color:'#888' }}>
                                    {p.category}
                                  </span>
                                </div>

                                {/* Fila 2: datos en grid compacto */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                  {/* Inicio */}
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-xs uppercase tracking-wide" style={{ color:'#b0b0b0' }}>Inicio</span>
                                    <span className="text-sm font-medium" style={{ color:'#1d1d1b' }}>
                                      {p.date
                                        ? new Date(p.date+'T00:00:00').toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'})
                                        : '—'}
                                    </span>
                                  </div>
                                  {/* Fin — solo si existe */}
                                  {p.endDate && (
                                    <div className="flex flex-col gap-0.5">
                                      <span className="text-xs uppercase tracking-wide" style={{ color:'#b0b0b0' }}>Finalización</span>
                                      <span className="text-sm font-medium" style={{ color:'#1d1d1b' }}>
                                        {new Date(p.endDate+'T00:00:00').toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'})}
                                      </span>
                                    </div>
                                  )}
                                  {/* Equipo */}
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-xs uppercase tracking-wide" style={{ color:'#b0b0b0' }}>Equipo</span>
                                    <span className="text-sm font-medium" style={{ color:'#1d1d1b' }}>
                                      {p.teamMembers?.length||0} miembro{(p.teamMembers?.length||0)!==1?'s':''}
                                    </span>
                                  </div>
                                  {/* Tareas */}
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-xs uppercase tracking-wide" style={{ color:'#b0b0b0' }}>Tareas</span>
                                    <span className="text-sm font-medium" style={{ color:'#1d1d1b' }}>
                                      {p.tasks?.length||0} tarea{(p.tasks?.length||0)!==1?'s':''}
                                    </span>
                                  </div>
                                  {/* Presupuesto */}
                                  <div className="flex flex-col gap-0.5 sm:col-span-2">
                                    <span className="text-xs uppercase tracking-wide" style={{ color:'#b0b0b0' }}>Presupuesto</span>
                                    <span className="text-sm font-medium" style={{ color:'#1d1d1b' }}>{COP(p.budget)}</span>
                                  </div>
                                </div>

                                {/* Barra de progreso */}
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor:'#f0f0f0' }}>
                                    <div className="h-full rounded-full transition-all duration-500"
                                      style={{ width:`${progress}%`, backgroundColor: progress>=100?'#28a745':accent }}/>
                                  </div>
                                  <span className="text-xs font-medium w-9 text-right flex-shrink-0" style={{ color:'#888' }}>
                                    {progress}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab==='budget' && <BudgetManagement projects={projects} onProjectsChange={setNormalizedProjects}/>}

              {/* ══ SERVICIOS ══ */}
              {activeTab==='services' && (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor:'#ebebeb' }}>
                  <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor:'#ebebeb' }}>
                    <h2 className="text-sm font-medium" style={{ color:'#1d1d1b' }}>Gestión de Servicios</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor:'#fff8e1', color:'#b45309' }}>
                        En desarrollo
                      </span>
                      <button disabled className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm opacity-40 cursor-not-allowed"
                        style={{ backgroundColor:'#f18517', color:'white' }}>
                        <Plus size={15}/> Nuevo
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-4 p-3.5 rounded-lg text-sm" style={{ backgroundColor:'#fff8e1', color:'#92400e' }}>
                      Próximamente podrás agregar, editar y eliminar servicios que se reflejarán en la página principal.
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {services.map(s=>(
                        <div key={s.id} className="border rounded-xl p-5 hover:shadow-md transition-shadow"
                          style={{ borderColor:'#ebebeb' }}>
                          <div className="flex items-start justify-between mb-4">
                            <p className="font-medium text-sm" style={{ color:'#1d1d1b' }}>{s.name}</p>
                            <span className="w-2 h-2 rounded-full mt-1.5"
                              style={{ backgroundColor:s.active?'#28a745':'#dc3545' }}/>
                          </div>
                          <div className="flex gap-2">
                            <button disabled className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs opacity-40 cursor-not-allowed"
                              style={{ borderColor:'#e0e0e0', color:'#1d1d1b' }}>
                              <Edit size={13}/> Editar
                            </button>
                            <button disabled className="px-3 py-1.5 rounded-lg border text-xs opacity-40 cursor-not-allowed"
                              style={{ borderColor:'#e0e0e0', color:'#dc3545' }}>
                              <Trash2 size={13}/>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ══ CONTENIDO ══ */}
              {activeTab==='content' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl text-sm" style={{ backgroundColor:'#fff8e1', color:'#92400e' }}>
                    Gestión de contenido en desarrollo. Próximamente podrás editar misión, visión, equipo y aliados desde aquí.
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['Misión','Visión','Valores','Equipo de Trabajo','Aliados'].map(t=>(
                      <button key={t} disabled
                        className="text-left p-4 border rounded-xl bg-white opacity-60 cursor-not-allowed"
                        style={{ borderColor:'#ebebeb' }}>
                        <p className="text-sm font-medium" style={{ color:'#1d1d1b' }}>{t}</p>
                        <p className="text-xs mt-0.5" style={{ color:'#b0b0b0' }}>Editar {t.toLowerCase()}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ══ USUARIOS ══ */}
              {activeTab==='users' && isSuperAdmin && (
                <div className="space-y-6">
                  {/* Pendientes */}
                  <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor:'#ebebeb' }}>
                    <div className="px-6 py-4 border-b"
                      style={{ borderColor:'#ebebeb', backgroundColor:(pendingUsers?.length||0)>0?'#fffbf0':'white' }}>
                      <h2 className="text-sm font-medium"
                        style={{ color:(pendingUsers?.length||0)>0?'#b45309':'#1d1d1b' }}>
                        Solicitudes pendientes · {pendingUsers?.length||0}
                      </h2>
                    </div>
                    <div className="p-6">
                      {(pendingUsers?.length||0)===0 ? (
                        <p className="text-sm text-center py-6" style={{ color:'#b0b0b0' }}>
                          No hay solicitudes pendientes.
                        </p>
                      ):(
                        <div className="space-y-3">
                          {pendingUsers.map(u=>(
                            <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-xl"
                              style={{ borderColor:'#ebebeb' }}>
                              <div>
                                <p className="font-medium text-sm" style={{ color:'#1d1d1b' }}>{u.fullName||u.name}</p>
                                <p className="text-xs mt-0.5" style={{ color:'#808080' }}>{u.email}</p>
                                {u.username && <p className="text-xs" style={{ color:'#b0b0b0' }}>@{u.username}</p>}
                              </div>
                              <div className="flex gap-2">
                                <button onClick={()=>approveUser(u.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:shadow-md"
                                  style={{ backgroundColor:'#28a745', color:'white' }}>
                                  <CheckCircle size={13}/> Aprobar
                                </button>
                                <button onClick={()=>rejectUser(u.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:shadow-md"
                                  style={{ backgroundColor:'#dc3545', color:'white' }}>
                                  <XCircle size={13}/> Rechazar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Activos */}
                  <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor:'#ebebeb' }}>
                    <div className="px-6 py-4 border-b" style={{ borderColor:'#ebebeb' }}>
                      <h2 className="text-sm font-medium" style={{ color:'#1d1d1b' }}>
                        Usuarios · {activeUsers.length}
                      </h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr style={{ backgroundColor:'#fafafa' }}>
                          {['Usuario','Email','Rol','Estado','Acciones'].map(h=>(
                            <th key={h} className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide"
                              style={{ color:'#b0b0b0' }}>{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {activeUsers.map(u=>{
                            const isAdmin0   = u.id===0;
                            const isInactive = u.status==='INACTIVE';
                            return (
                              <tr key={u.id} className="border-t" style={{ borderColor:'#ebebeb', opacity:isInactive?0.6:1 }}>
                                <td className="px-5 py-3.5">
                                  <p className="text-sm font-medium" style={{ color:'#1d1d1b' }}>{u.fullName||u.name}</p>
                                  {u.username && <p className="text-xs" style={{ color:'#b0b0b0' }}>@{u.username}</p>}
                                </td>
                                <td className="px-5 py-3.5 text-sm" style={{ color:'#808080' }}>{u.email}</td>
                                <td className="px-5 py-3.5">
                                  <span className="text-xs px-2.5 py-1 rounded-full"
                                    style={{ backgroundColor:u.role==='SUPER_ADMIN'?'#f18517':'#6c757d', color:'white' }}>
                                    {u.role==='SUPER_ADMIN'||u.role==='superadmin'?'Super Admin':u.role}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5">
                                  <span className="text-xs px-2.5 py-1 rounded-full"
                                    style={{ backgroundColor:isInactive?'#fce8e8':'#e8f5e9', color:isInactive?'#c0392b':'#27ae60' }}>
                                    {isInactive?'Inactivo':'Activo'}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5">
                                  {isAdmin0 ? (
                                    <span className="text-xs" style={{ color:'#d0d0d0' }}>Protegido</span>
                                  ):(
                                    <div className="flex gap-2">
                                      {isInactive ? (
                                        <button onClick={()=>enableUser(u.id)}
                                          className="text-xs px-2.5 py-1 rounded-lg border transition-colors hover:bg-green-50"
                                          style={{ borderColor:'#28a745', color:'#28a745' }}>
                                          Activar
                                        </button>
                                      ):(
                                        <button onClick={()=>disableUser(u.id)}
                                          className="text-xs px-2.5 py-1 rounded-lg border transition-colors hover:bg-yellow-50 flex items-center gap-1"
                                          style={{ borderColor:'#d97706', color:'#d97706' }}>
                                          <Ban size={11}/> Inhabilitar
                                        </button>
                                      )}
                                      <button onClick={()=>deleteUser(u.id)}
                                        className="text-xs px-2.5 py-1 rounded-lg border transition-colors hover:bg-red-50"
                                        style={{ borderColor:'#dc3545', color:'#dc3545' }}>
                                        Eliminar
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ══ MI PERFIL ══ */}
              {activeTab==='profile' && (
                <ProfileSection userData={currentUser} onUserDataChange={u=>setCurrentUser(u)}/>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}