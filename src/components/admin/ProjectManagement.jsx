import { useState } from 'react';
import { Plus, Edit, Edit2, Trash2, Users, Calendar, Clock, X, Save } from 'lucide-react';

const COP = (v) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v || 0);

const EMPTY_PROJECT = { title: '', category: 'Espacios', date: '', status: 'upcoming', progress: 0, budget: '' };

// ─────────────────────────────────────────────────────────────────────────────
// ProjectManagement — sin estado propio de proyectos.
// El estado vive en AdminDashboard y se comparte con Calendario y Presupuesto.
// ─────────────────────────────────────────────────────────────────────────────
export function ProjectManagement({ projects = [], onProjectsChange }) {
  const [selectedProject,     setSelectedProject]     = useState(null);
  const [showNewProjectModal,  setShowNewProjectModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal]= useState(false);
  const [showTaskModal,        setShowTaskModal]       = useState(false);
  const [showMemberModal,      setShowMemberModal]     = useState(false);
  const [newTask,              setNewTask]             = useState({});
  const [newMember,            setNewMember]           = useState({});
  const [newProject,           setNewProject]          = useState(EMPTY_PROJECT);
  const [editProject,          setEditProject]         = useState(null); // proyecto en edición

  const getStatusColor = (s) => ({ completed: '#28a745', 'in-progress': '#ffc107', upcoming: '#17a2b8', pending: '#6c757d' }[s] || '#808080');
  const getStatusLabel = (s) => ({ completed: 'Completado', 'in-progress': 'En Progreso', upcoming: 'Próximo', pending: 'Pendiente' }[s] || s);

  const push = (updated) => { if (onProjectsChange) onProjectsChange(updated); };

  // ── Crear proyecto ────────────────────────────────────────────
  const handleAddProject = () => {
    if (!newProject.title.trim() || !newProject.date || !Number(newProject.budget)) return;
    const project = {
      id:          Date.now(),
      title:       newProject.title.trim(),
      category:    newProject.category,
      date:        newProject.date,
      // "Completado" no se permite al crear — solo lo pone el sistema al 100% de ejecución
      status:      newProject.status === 'completed' ? 'upcoming' : newProject.status,
      progress:    Number(newProject.progress) || 0,
      budget:      Number(newProject.budget) || 0,
      spent:       0,
      expenses:    [],
      description: '',
      teamMembers: [],
      tasks:       [],
    };
    push([...projects, project]);
    setNewProject(EMPTY_PROJECT);
    setShowNewProjectModal(false);
  };

  // ── Abrir edición de proyecto ─────────────────────────────────
  const openEditProject = (project, e) => {
    e.stopPropagation();
    setEditProject({
      id:       project.id,
      title:    project.title,
      category: project.category,
      date:     project.date,
      status:   project.status,
      progress: project.progress,
      budget:   project.budget,
    });
    setShowEditProjectModal(true);
  };

  // ── Guardar edición de proyecto ───────────────────────────────
  const handleSaveEditProject = () => {
    if (!editProject.title.trim() || !editProject.date || !Number(editProject.budget)) return;
    const updated = projects.map(p => {
      if (p.id !== editProject.id) return p;
      // Recalcula el progreso de presupuesto (el completado real lo impone el gasto)
      const budgetPct = p.budget > 0 ? Math.min(Math.round((p.spent || 0) / Number(editProject.budget) * 100), 100) : editProject.progress;
      const autoStatus = budgetPct >= 100 ? 'completed' : budgetPct > 0 ? 'in-progress' : editProject.status;
      return {
        ...p,
        title:    editProject.title.trim(),
        category: editProject.category,
        date:     editProject.date,
        budget:   Number(editProject.budget),
        // Solo sobreescribir status/progress si el presupuesto no dicta lo contrario
        status:   p.spent > 0 ? autoStatus : editProject.status,
        progress: p.spent > 0 ? budgetPct : Number(editProject.progress),
      };
    });
    push(updated);
    // Actualizar el modal de detalles si está abierto
    if (selectedProject?.id === editProject.id) {
      setSelectedProject(updated.find(p => p.id === editProject.id));
    }
    setShowEditProjectModal(false);
    setEditProject(null);
  };

  // ── Agregar tarea ─────────────────────────────────────────────
  const handleAddTask = () => {
    if (!selectedProject || !newTask.title) return;
    const task = {
      id: Date.now(), title: newTask.title,
      assignedTo: newTask.assignedTo || '', startDate: newTask.startDate || '',
      endDate: newTask.endDate || '', status: 'pending',
    };
    const updated = { ...selectedProject, tasks: [...(selectedProject.tasks || []), task] };
    push(projects.map(p => p.id === selectedProject.id ? updated : p));
    setSelectedProject(updated);
    setNewTask({});
    setShowTaskModal(false);
  };

  // ── Agregar miembro ───────────────────────────────────────────
  const handleAddMember = () => {
    if (!selectedProject || !newMember.name || !newMember.email) return;
    const member = { id: Date.now(), name: newMember.name, email: newMember.email, role: newMember.role || 'Colaborador' };
    const updated = { ...selectedProject, teamMembers: [...(selectedProject.teamMembers || []), member] };
    push(projects.map(p => p.id === selectedProject.id ? updated : p));
    setSelectedProject(updated);
    setNewMember({});
    setShowMemberModal(false);
  };

  // ── Eliminar miembro ──────────────────────────────────────────
  const handleDeleteMember = (memberId) => {
    const updated = { ...selectedProject, teamMembers: selectedProject.teamMembers.filter(m => m.id !== memberId) };
    push(projects.map(p => p.id === selectedProject.id ? updated : p));
    setSelectedProject(updated);
  };

  // ═════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">

      {/* ── Lista de proyectos ── */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: '#e0e0e0' }}>
          <h2 className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
            Gestión de Proyectos
          </h2>
          <button onClick={() => setShowNewProjectModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:shadow-lg"
            style={{ backgroundColor: '#f18517', color: 'white' }}>
            <Plus size={20} /> Nuevo Proyecto
          </button>
        </div>

        <div className="p-6 space-y-4">
          {projects.length === 0 && (
            <p className="text-center py-12 text-sm" style={{ color: '#808080' }}>
              No hay proyectos. Crea el primero con el botón de arriba.
            </p>
          )}
          {projects.map(project => (
            <div key={project.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow" style={{ borderColor: '#e0e0e0' }}>
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-lg mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                    {project.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: '#808080' }}>
                    <span className="flex items-center gap-1"><Calendar size={16} />{project.date}</span>
                    <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: '#f5f5f5', color: '#1d1d1b' }}>{project.category}</span>
                    <span className="flex items-center gap-1"><Users size={16} />{project.teamMembers?.length || 0} miembros</span>
                    {project.budget > 0 && (
                      <span className="text-xs" style={{ color: '#f18517' }}>💰 {COP(project.budget)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    style={{ backgroundColor: getStatusColor(project.status) + '20', color: getStatusColor(project.status) }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor(project.status) }} />
                    {getStatusLabel(project.status)}
                  </span>
                  {/* Botón editar proyecto */}
                  <button onClick={(e) => openEditProject(project, e)}
                    className="p-2 rounded-lg hover:bg-blue-50 transition-colors" title="Editar proyecto"
                    style={{ color: '#17a2b8' }}>
                    <Edit2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: '#808080' }}>Progreso</span>
                  <span className="text-sm font-medium" style={{ color: '#1d1d1b' }}>{project.progress}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%`, backgroundColor: getStatusColor(project.status) }} />
                </div>
              </div>

              <button onClick={() => setSelectedProject(project)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors flex items-center gap-2"
                style={{ borderColor: '#e0e0e0', color: '#1d1d1b' }}>
                <Edit size={16} /> Ver Detalles
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ══ MODAL: Nuevo Proyecto ══════════════════════════════════ */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>Nuevo Proyecto</h3>
              <button onClick={() => { setShowNewProjectModal(false); setNewProject(EMPTY_PROJECT); }}
                className="p-2 hover:bg-gray-100 rounded-lg" style={{ color: '#808080' }}><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Nombre del proyecto *</label>
                <input type="text" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }}
                  placeholder="Ej: Festival de Cultura 2025" autoFocus />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Categoría</label>
                <select value={newProject.category} onChange={e => setNewProject({ ...newProject, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }}>
                  <option value="Espacios">Resignificación de Espacios</option>
                  <option value="Eventos">Eventos Culturales</option>
                  <option value="Festivales">Festivales</option>
                  <option value="Talleres">Talleres y Pedagogía Social</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Fecha del proyecto *</label>
                <input type="date" value={newProject.date} onChange={e => setNewProject({ ...newProject, date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }} />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Estado inicial</label>
                <select value={newProject.status} onChange={e => setNewProject({ ...newProject, status: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }}>
                  <option value="upcoming">Próximo</option>
                  <option value="in-progress">En Progreso</option>
                  <option value="pending">Pendiente</option>
                  {/* "Completado" NO aparece — lo asigna el sistema al 100% de ejecución presupuestal */}
                </select>
                <p className="text-xs mt-1" style={{ color: '#808080' }}>
                  El estado "Completado" se asignará automáticamente cuando el presupuesto esté 100% ejecutado.
                </p>
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>
                  Progreso inicial: <strong style={{ color: '#f18517' }}>{newProject.progress}%</strong>
                </label>
                <input type="range" min="0" max="100" value={newProject.progress}
                  onChange={e => setNewProject({ ...newProject, progress: Number(e.target.value) })}
                  className="w-full" style={{ accentColor: '#f18517' }} />
                <div className="flex justify-between text-xs mt-1" style={{ color: '#808080' }}>
                  <span>0%</span><span>50%</span><span>100%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Presupuesto Total (COP) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: '#808080' }}>$</span>
                  <input type="number" min="0" value={newProject.budget}
                    onChange={e => setNewProject({ ...newProject, budget: e.target.value })}
                    className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }}
                    placeholder="Ej: 5000000" />
                </div>
                {Number(newProject.budget) > 0 && <p className="text-xs mt-1" style={{ color: '#808080' }}>{COP(newProject.budget)}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleAddProject}
                  disabled={!newProject.title.trim() || !newProject.date || !Number(newProject.budget)}
                  className="flex-1 px-4 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                  style={{ backgroundColor: '#f18517', color: 'white' }}>Crear Proyecto</button>
                <button onClick={() => { setShowNewProjectModal(false); setNewProject(EMPTY_PROJECT); }}
                  className="px-4 py-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#e0e0e0', color: '#808080' }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Editar Proyecto ══════════════════════════════════ */}
      {showEditProjectModal && editProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>Editar Proyecto</h3>
              <button onClick={() => { setShowEditProjectModal(false); setEditProject(null); }}
                className="p-2 hover:bg-gray-100 rounded-lg" style={{ color: '#808080' }}><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Nombre del proyecto *</label>
                <input type="text" value={editProject.title} onChange={e => setEditProject({ ...editProject, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }} />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Categoría</label>
                <select value={editProject.category} onChange={e => setEditProject({ ...editProject, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }}>
                  <option value="Espacios">Resignificación de Espacios</option>
                  <option value="Eventos">Eventos Culturales</option>
                  <option value="Festivales">Festivales</option>
                  <option value="Talleres">Talleres y Pedagogía Social</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Fecha del proyecto *</label>
                <input type="date" value={editProject.date} onChange={e => setEditProject({ ...editProject, date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }} />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Estado</label>
                <select value={editProject.status} onChange={e => setEditProject({ ...editProject, status: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }}>
                  <option value="upcoming">Próximo</option>
                  <option value="in-progress">En Progreso</option>
                  <option value="pending">Pendiente</option>
                  {/* "Completado" aparece solo si ya fue asignado por el sistema */}
                  {editProject.status === 'completed' && <option value="completed">Completado</option>}
                </select>
                {editProject.status === 'completed' && (
                  <p className="text-xs mt-1" style={{ color: '#28a745' }}>
                    ✓ Estado completado asignado automáticamente por ejecución presupuestal.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Presupuesto Total (COP) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: '#808080' }}>$</span>
                  <input type="number" min="0" value={editProject.budget}
                    onChange={e => setEditProject({ ...editProject, budget: e.target.value })}
                    className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }} />
                </div>
                {Number(editProject.budget) > 0 && <p className="text-xs mt-1" style={{ color: '#808080' }}>{COP(editProject.budget)}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveEditProject}
                  disabled={!editProject.title.trim() || !editProject.date || !Number(editProject.budget)}
                  className="flex-1 px-4 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#28a745', color: 'white' }}>
                  <Save size={18} />Guardar Cambios
                </button>
                <button onClick={() => { setShowEditProjectModal(false); setEditProject(null); }}
                  className="px-4 py-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#e0e0e0', color: '#808080' }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Detalles del proyecto ════════════════════════════ */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: '#e0e0e0' }}>
              <div>
                <h2 className="text-2xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                  {selectedProject.title}
                </h2>
                {selectedProject.budget > 0 && (
                  <p className="text-sm mt-1" style={{ color: '#808080' }}>
                    Presupuesto: {COP(selectedProject.budget)} · Gastado: {COP(selectedProject.spent || 0)}
                  </p>
                )}
              </div>
              <button onClick={() => setSelectedProject(null)} className="p-2 hover:bg-gray-100 rounded-lg" style={{ color: '#808080' }}>
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Equipo */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                    <Users size={20} style={{ color: '#f18517' }} /> Equipo de Trabajo
                  </h3>
                  <button onClick={() => setShowMemberModal(true)}
                    className="px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:shadow-lg transition-all"
                    style={{ backgroundColor: '#f18517', color: 'white' }}>
                    <Plus size={16} /> Agregar Miembro
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(selectedProject.teamMembers || []).map(member => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg" style={{ borderColor: '#e0e0e0' }}>
                      <div>
                        <p className="font-medium" style={{ color: '#1d1d1b' }}>{member.name}</p>
                        <p className="text-sm" style={{ color: '#808080' }}>{member.email}</p>
                        <p className="text-xs mt-1" style={{ color: '#f18517' }}>{member.role}</p>
                      </div>
                      <button onClick={() => handleDeleteMember(member.id)} className="p-2 hover:bg-red-50 rounded" style={{ color: '#dc3545' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {!selectedProject.teamMembers?.length && (
                    <p className="text-sm col-span-2" style={{ color: '#808080' }}>No hay miembros en este proyecto aún.</p>
                  )}
                </div>
              </div>

              {/* Tareas */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                    <Clock size={20} style={{ color: '#f18517' }} /> Tareas del Proyecto
                  </h3>
                  <button onClick={() => setShowTaskModal(true)}
                    className="px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:shadow-lg transition-all"
                    style={{ backgroundColor: '#f18517', color: 'white' }}>
                    <Plus size={16} /> Nueva Tarea
                  </button>
                </div>
                <div className="space-y-3">
                  {(selectedProject.tasks || []).map(task => (
                    <div key={task.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow" style={{ borderColor: '#e0e0e0' }}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <h4 className="font-medium" style={{ color: '#1d1d1b' }}>{task.title}</h4>
                        <span className="px-2 py-1 rounded text-xs w-fit"
                          style={{ backgroundColor: getStatusColor(task.status) + '20', color: getStatusColor(task.status) }}>
                          {getStatusLabel(task.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                        <div><span className="block text-xs mb-1" style={{ color: '#808080' }}>Asignado a:</span><span style={{ color: '#1d1d1b' }}>{task.assignedTo || 'Sin asignar'}</span></div>
                        <div><span className="block text-xs mb-1" style={{ color: '#808080' }}>Inicio:</span><span style={{ color: '#1d1d1b' }}>{task.startDate || '—'}</span></div>
                        <div><span className="block text-xs mb-1" style={{ color: '#808080' }}>Fecha límite:</span><span style={{ color: '#1d1d1b' }}>{task.endDate || '—'}</span></div>
                      </div>
                    </div>
                  ))}
                  {!selectedProject.tasks?.length && (
                    <p className="text-sm" style={{ color: '#808080' }}>No hay tareas creadas para este proyecto aún.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Nueva Tarea ══════════════════════════════════════ */}
      {showTaskModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>Nueva Tarea</h3>
              <button onClick={() => { setShowTaskModal(false); setNewTask({}); }} className="p-2 hover:bg-gray-100 rounded-lg" style={{ color: '#808080' }}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Nombre de la tarea *</label>
                <input type="text" value={newTask.title || ''} onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }}
                  placeholder="Ej: Diseñar flyer del evento" autoFocus />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Asignado a</label>
                <input type="text" value={newTask.assignedTo || ''} onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }}
                  placeholder="Nombre del responsable" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Fecha de inicio</label>
                  <input type="date" value={newTask.startDate || ''} onChange={e => setNewTask({ ...newTask, startDate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }} />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Fecha límite</label>
                  <input type="date" value={newTask.endDate || ''} onChange={e => setNewTask({ ...newTask, endDate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleAddTask} disabled={!newTask.title}
                  className="flex-1 px-4 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#f18517', color: 'white' }}>Agregar Tarea</button>
                <button onClick={() => { setShowTaskModal(false); setNewTask({}); }}
                  className="px-4 py-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#e0e0e0', color: '#808080' }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Agregar Miembro ══════════════════════════════════ */}
      {showMemberModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>Agregar Miembro al Equipo</h3>
              <button onClick={() => { setShowMemberModal(false); setNewMember({}); }} className="p-2 hover:bg-gray-100 rounded-lg" style={{ color: '#808080' }}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Nombre completo *',  key: 'name',  type: 'text',  placeholder: 'Ej: María González'          },
                { label: 'Email *',            key: 'email', type: 'email', placeholder: 'maria@ejemplo.com'           },
                { label: 'Rol en el proyecto', key: 'role',  type: 'text',  placeholder: 'Ej: Coordinadora, Diseñador' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>{label}</label>
                  <input type={type} value={newMember[key] || ''} onChange={e => setNewMember({ ...newMember, [key]: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }}
                    placeholder={placeholder} />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={handleAddMember} disabled={!newMember.name || !newMember.email}
                  className="flex-1 px-4 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#f18517', color: 'white' }}>Agregar Miembro</button>
                <button onClick={() => { setShowMemberModal(false); setNewMember({}); }}
                  className="px-4 py-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#e0e0e0', color: '#808080' }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}