import { useState } from 'react';
import { Plus, Edit, Edit2, Trash2, Users, Calendar, Clock, X, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { apiService } from '../../services/apiService';

const COP = (v) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v || 0);

// ── Estado vacío para nuevo proyecto ─────────────────────────────────────────
// Sin campo progress (solo se mueve con gastos) y sin "completed" en el selector
const EMPTY_PROJECT = {
  title:    '',
  category: 'Resignificación de Espacios',
  date:     '',       // fecha de inicio
  endDate:  '',       // fecha de finalización
  status:   'in-progress',
  budget:   '',
};

// ════════════════════════════════════════════════════════════════════════════
export function ProjectManagement({ projects = [], onProjectsChange }) {
  const [selectedProject,      setSelectedProject]      = useState(null);
  const [showNewProjectModal,  setShowNewProjectModal]  = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showTaskModal,        setShowTaskModal]        = useState(false);
  const [showMemberModal,      setShowMemberModal]      = useState(false);

  const [newTask,    setNewTask]    = useState({});
  const [newMember,  setNewMember]  = useState({});
  const [newProject, setNewProject] = useState(EMPTY_PROJECT);
  const [editProject, setEditProject] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [error,    setError]    = useState('');

  // ── Helpers ────────────────────────────────────────────────────────────────
  const STATUS_COLOR = { completed: '#28a745', 'in-progress': '#ffc107', upcoming: '#17a2b8' };
  const STATUS_LABEL = { completed: 'Completado', 'in-progress': 'En Progreso', upcoming: 'Próximo' };
  const getColor = s => STATUS_COLOR[s] || '#808080';
  const getLabel = s => STATUS_LABEL[s] || s;

  const push = updated => onProjectsChange?.(updated);

  const closeAllModals = () => {
    setShowNewProjectModal(false);
    setShowEditProjectModal(false);
    setShowTaskModal(false);
    setShowMemberModal(false);
    setError('');
  };

  const handleBackendError = (err, defaultMsg) => {
    console.error(err);
    if (err.response?.data) {
      const vals = Object.values(err.response.data);
      if (vals.length && typeof vals[0] === 'string') { setError(vals[0]); return; }
      if (err.response.data.error) { setError(err.response.data.error); return; }
    }
    setError(defaultMsg);
  };

  // ── Calcular progreso a partir del presupuesto ejecutado ──────────────────
  const calcProgress = (project) => {
    const budget = project.budget || project.totalBudget || 0;
    const spent  = project.spent  || project.executedBudget || 0;
    if (!budget) return 0;
    return Math.min(100, Math.round((spent / budget) * 100));
  };

  // ── Crear proyecto ─────────────────────────────────────────────────────────
  const handleAddProject = async () => {
    setError('');
    if (!newProject.title.trim())  { setError('El nombre del proyecto es obligatorio.');        return; }
    if (!newProject.date)          { setError('La fecha de inicio es obligatoria.');             return; }
    if (!newProject.endDate)       { setError('La fecha de finalización es obligatoria.');       return; }
    if (newProject.endDate < newProject.date) { setError('La fecha de fin no puede ser anterior a la de inicio.'); return; }
    if (!Number(newProject.budget)) { setError('El presupuesto debe ser mayor a cero.');         return; }

    setIsSaving(true);
    const payload = {
      title:          newProject.title.trim(),
      category:       newProject.category,
      date:           newProject.date,
      endDate:        newProject.endDate,
      status:         newProject.status,   // solo 'in-progress' o 'upcoming'
      progress:       0,                   // siempre inicia en 0
      spent:          0,
      expenses:       [],
      teamMembers:    [],
      tasks:          [],
      budget:         Number(newProject.budget),
      totalBudget:    Number(newProject.budget),
      executedBudget: 0,
      description:    'Descripción pendiente de actualización.',
      imageUrl:       'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    };

    try {
      const saved = await apiService.createProject(payload);
      push([...projects, saved]);
      setNewProject(EMPTY_PROJECT);
      closeAllModals();
    } catch (err) {
      handleBackendError(err, 'Error al guardar el proyecto. Verifica los datos.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Abrir edición ──────────────────────────────────────────────────────────
  const openEditProject = (project, e) => {
    e.stopPropagation();
    setError('');
    setEditProject({
      id:       project.id,
      title:    project.title,
      category: project.category,
      date:     project.date    || '',
      endDate:  project.endDate || '',
      // En edición se puede ver el estado actual (incluido 'completed' si ya lo tiene),
      // pero NO se puede seleccionar 'completed' manualmente — solo se muestra como info
      status:   project.status,
      budget:   project.totalBudget || project.budget || 0,
    });
    setShowEditProjectModal(true);
  };

  // ── Guardar edición ────────────────────────────────────────────────────────
  const handleSaveEditProject = async () => {
    setError('');
    if (!editProject.title.trim())  { setError('El nombre no puede estar vacío.');               return; }
    if (!editProject.date)          { setError('La fecha de inicio es obligatoria.');             return; }
    if (!editProject.endDate)       { setError('La fecha de fin es obligatoria.');                return; }
    if (editProject.endDate < editProject.date) { setError('La fecha de fin no puede ser anterior a la de inicio.'); return; }
    if (!Number(editProject.budget)) { setError('El presupuesto debe ser mayor a cero.');         return; }

    setIsSaving(true);
    const original = projects.find(p => p.id === editProject.id);

    // Recalcular progreso y estado con el nuevo presupuesto
    const newBudget   = Number(editProject.budget);
    const spent       = original?.spent || 0;
    const newProgress = newBudget > 0 ? Math.min(100, Math.round((spent / newBudget) * 100)) : 0;
    // Si con el nuevo presupuesto el progreso ya es 100%, el estado pasa a completado automáticamente
    const newStatus   = newProgress >= 100 ? 'completed' : editProject.status;

    const payload = {
      ...original,
      title:       editProject.title.trim(),
      category:    editProject.category,
      date:        editProject.date,
      endDate:     editProject.endDate,
      status:      newStatus,
      progress:    newProgress,
      budget:      newBudget,
      totalBudget: newBudget,
    };

    try {
      const updated = await apiService.updateProject(editProject.id, payload);
      push(projects.map(p => p.id === editProject.id ? updated : p));
      if (selectedProject?.id === editProject.id) setSelectedProject(updated);
      setEditProject(null);
      closeAllModals();
    } catch (err) {
      handleBackendError(err, 'Error al actualizar el proyecto.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Agregar tarea ──────────────────────────────────────────────────────────
  const handleAddTask = async () => {
    if (!newTask.title) return;
    setError('');
    setIsSaving(true);
    const task = {
      id:         Date.now(),
      title:      newTask.title,
      assignedTo: newTask.assignedTo || 'Sin asignar',
      startDate:  newTask.startDate  || '',
      endDate:    newTask.endDate    || '',
      status:     'pending',
    };
    const updatedData = { ...selectedProject, tasks: [...(selectedProject.tasks || []), task] };
    try {
      const updated = await apiService.updateProject(selectedProject.id, updatedData);
      push(projects.map(p => p.id === selectedProject.id ? updated : p));
      setSelectedProject(updated);
      setNewTask({});
      closeAllModals();
    } catch (err) {
      handleBackendError(err, 'Error al guardar la tarea.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Agregar miembro ────────────────────────────────────────────────────────
  const handleAddMember = async () => {
    if (!newMember.name || !newMember.email) return;
    setError('');
    setIsSaving(true);
    const member = { id: Date.now(), name: newMember.name, email: newMember.email, role: newMember.role || 'Colaborador' };
    const updatedData = { ...selectedProject, teamMembers: [...(selectedProject.teamMembers || []), member] };
    try {
      const updated = await apiService.updateProject(selectedProject.id, updatedData);
      push(projects.map(p => p.id === selectedProject.id ? updated : p));
      setSelectedProject(updated);
      setNewMember({});
      closeAllModals();
    } catch (err) {
      handleBackendError(err, 'Error al agregar el miembro.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Eliminar miembro ───────────────────────────────────────────────────────
  const handleDeleteMember = async (memberId) => {
    if (!window.confirm('¿Seguro que deseas eliminar este miembro?')) return;
    const updatedData = { ...selectedProject, teamMembers: selectedProject.teamMembers.filter(m => m.id !== memberId) };
    try {
      const updated = await apiService.updateProject(selectedProject.id, updatedData);
      push(projects.map(p => p.id === selectedProject.id ? updated : p));
      setSelectedProject(updated);
    } catch { alert('Error al eliminar el miembro.'); }
  };

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">

      {/* ── Lista de proyectos ── */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: '#e0e0e0' }}>
          <h2 className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
            Gestión de Proyectos
          </h2>
          <button onClick={() => { setError(''); setShowNewProjectModal(true); }}
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
          {projects.map(project => {
            const progress = calcProgress(project);
            return (
              <div key={project.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
                style={{ borderColor: '#e0e0e0' }}>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                      {project.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: '#808080' }}>
                      <span className="flex items-center gap-1">
                        <Calendar size={15} />
                        {project.date || '—'}{project.endDate ? ` → ${project.endDate}` : ''}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: '#f5f5f5', color: '#1d1d1b' }}>
                        {project.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={15} />{project.teamMembers?.length || 0} miembro{project.teamMembers?.length !== 1 ? 's' : ''}
                      </span>
                      {(project.totalBudget > 0 || project.budget > 0) && (
                        <span className="text-xs font-medium" style={{ color: '#f18517' }}>
                          💰 {COP(project.totalBudget || project.budget)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-sm flex items-center gap-1.5"
                      style={{ backgroundColor: getColor(project.status) + '20', color: getColor(project.status) }}>
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: getColor(project.status) }} />
                      {getLabel(project.status)}
                    </span>
                    {/* No mostrar botón editar si ya está completado */}
                    {project.status !== 'completed' && (
                      <button onClick={(e) => openEditProject(project, e)}
                        className="p-2 rounded-lg hover:bg-blue-50 transition-colors" title="Editar proyecto"
                        style={{ color: '#17a2b8' }}>
                        <Edit2 size={16} />
                      </button>
                    )}
                    {project.status === 'completed' && (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded"
                        style={{ backgroundColor: '#d4edda', color: '#155724' }}>
                        <CheckCircle size={12} /> 100% ejecutado
                      </span>
                    )}
                  </div>
                </div>

                {/* Barra de progreso — solo sube con gastos */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: '#808080' }}>Avance presupuestal</span>
                    <span className="text-xs font-medium" style={{ color: '#1d1d1b' }}>{progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%`, backgroundColor: progress >= 100 ? '#28a745' : getColor(project.status) }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs" style={{ color: '#808080' }}>
                      Gastado: {COP(project.spent || 0)}
                    </span>
                    <span className="text-xs" style={{ color: '#808080' }}>
                      Restante: {COP((project.budget || project.totalBudget || 0) - (project.spent || 0))}
                    </span>
                  </div>
                </div>

                <button onClick={() => setSelectedProject(project)}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                  style={{ borderColor: '#e0e0e0', color: '#1d1d1b' }}>
                  <Edit size={15} /> Ver Detalles / Equipo / Tareas
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ MODAL: Nuevo Proyecto ══════════════════════════════════════════ */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                Nuevo Proyecto
              </h3>
              <button onClick={() => { closeAllModals(); setNewProject(EMPTY_PROJECT); }}
                className="p-2 hover:bg-gray-100 rounded-lg" style={{ color: '#808080' }}>
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm"
                style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm mb-2 font-medium" style={{ color: '#1d1d1b' }}>
                  Nombre del proyecto *
                </label>
                <input type="text" autoFocus value={newProject.title}
                  onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e0e0e0' }}
                  placeholder="Ej: Festival de Cultura 2025" />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm mb-2 font-medium" style={{ color: '#1d1d1b' }}>Categoría</label>
                <select value={newProject.category}
                  onChange={e => setNewProject({ ...newProject, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e0e0e0' }}>
                  <option value="Resignificación de Espacios">Resignificación de Espacios</option>
                  <option value="Eventos Culturales">Eventos Culturales</option>
                  <option value="Festivales">Festivales</option>
                  <option value="Talleres y Pedagogía">Talleres y Pedagogía</option>
                </select>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 font-medium" style={{ color: '#1d1d1b' }}>
                    Fecha de inicio *
                  </label>
                  <input type="date" value={newProject.date}
                    onChange={e => setNewProject({ ...newProject, date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e0e0e0' }} />
                </div>
                <div>
                  <label className="block text-sm mb-2 font-medium" style={{ color: '#1d1d1b' }}>
                    Fecha de finalización *
                  </label>
                  <input type="date" value={newProject.endDate}
                    min={newProject.date || undefined}
                    onChange={e => setNewProject({ ...newProject, endDate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e0e0e0' }} />
                </div>
              </div>

              {/* Estado — SOLO dos opciones, sin "Completado" */}
              <div>
                <label className="block text-sm mb-2 font-medium" style={{ color: '#1d1d1b' }}>Estado inicial</label>
                <select value={newProject.status}
                  onChange={e => setNewProject({ ...newProject, status: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e0e0e0' }}>
                  <option value="in-progress">En Progreso</option>
                  <option value="upcoming">Próximo</option>
                </select>
                <p className="text-xs mt-1" style={{ color: '#b0b0b0' }}>
                  El estado «Completado» se asigna automáticamente cuando el presupuesto se ejecuta al 100%.
                </p>
              </div>

              {/* Presupuesto */}
              <div>
                <label className="block text-sm mb-2 font-medium" style={{ color: '#1d1d1b' }}>
                  Presupuesto total (COP) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: '#808080' }}>$</span>
                  <input type="number" min="1" value={newProject.budget}
                    onChange={e => setNewProject({ ...newProject, budget: e.target.value })}
                    className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e0e0e0' }}
                    placeholder="Ej: 5000000" />
                </div>
                {Number(newProject.budget) > 0 && (
                  <p className="text-xs mt-1" style={{ color: '#808080' }}>{COP(newProject.budget)}</p>
                )}
              </div>

              {/* Nota sobre barra de progreso */}
              <div className="p-3 rounded-lg text-xs" style={{ backgroundColor: '#f5f5f5', color: '#808080' }}>
                ℹ La barra de progreso inicia en 0% y únicamente avanza a medida que se registren gastos en el tab de Presupuesto.
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleAddProject} disabled={isSaving}
                  className="flex-1 px-4 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                  style={{ backgroundColor: '#f18517', color: 'white' }}>
                  {isSaving ? 'Guardando...' : 'Crear Proyecto'}
                </button>
                <button onClick={() => { closeAllModals(); setNewProject(EMPTY_PROJECT); }}
                  className="px-4 py-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#e0e0e0', color: '#808080' }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Editar Proyecto ══════════════════════════════════════════ */}
      {showEditProjectModal && editProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                Editar Proyecto
              </h3>
              <button onClick={() => { closeAllModals(); setEditProject(null); }}
                className="p-2 hover:bg-gray-100 rounded-lg" style={{ color: '#808080' }}>
                <X size={24} />
              </button>
            </div>

            {/* Si ya está completado, solo aviso — no se puede editar estado */}
            {editProject.status === 'completed' && (
              <div className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm"
                style={{ backgroundColor: '#d4edda', color: '#155724' }}>
                <CheckCircle size={16} />
                Este proyecto fue completado automáticamente al ejecutar el 100% del presupuesto.
                Solo puedes editar el nombre, fechas y categoría.
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm"
                style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm mb-2 font-medium" style={{ color: '#1d1d1b' }}>Nombre *</label>
                <input type="text" value={editProject.title}
                  onChange={e => setEditProject({ ...editProject, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e0e0e0' }} />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm mb-2 font-medium" style={{ color: '#1d1d1b' }}>Categoría</label>
                <select value={editProject.category}
                  onChange={e => setEditProject({ ...editProject, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e0e0e0' }}>
                  <option value="Resignificación de Espacios">Resignificación de Espacios</option>
                  <option value="Eventos Culturales">Eventos Culturales</option>
                  <option value="Festivales">Festivales</option>
                  <option value="Talleres y Pedagogía">Talleres y Pedagogía</option>
                </select>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 font-medium" style={{ color: '#1d1d1b' }}>Fecha de inicio *</label>
                  <input type="date" value={editProject.date}
                    onChange={e => setEditProject({ ...editProject, date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e0e0e0' }} />
                </div>
                <div>
                  <label className="block text-sm mb-2 font-medium" style={{ color: '#1d1d1b' }}>Fecha de fin *</label>
                  <input type="date" value={editProject.endDate}
                    min={editProject.date || undefined}
                    onChange={e => setEditProject({ ...editProject, endDate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e0e0e0' }} />
                </div>
              </div>

              {/* Estado — solo editable si NO está completado */}
              {editProject.status !== 'completed' ? (
                <div>
                  <label className="block text-sm mb-2 font-medium" style={{ color: '#1d1d1b' }}>Estado</label>
                  <select value={editProject.status}
                    onChange={e => setEditProject({ ...editProject, status: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e0e0e0' }}>
                    <option value="in-progress">En Progreso</option>
                    <option value="upcoming">Próximo</option>
                  </select>
                  <p className="text-xs mt-1" style={{ color: '#b0b0b0' }}>
                    «Completado» se asigna automáticamente al ejecutar el 100% del presupuesto.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm mb-2 font-medium" style={{ color: '#1d1d1b' }}>Estado</label>
                  <input type="text" value="Completado" readOnly
                    className="w-full px-4 py-2 border rounded-lg cursor-not-allowed"
                    style={{ borderColor: '#e0e0e0', backgroundColor: '#f0f0f0', color: '#28a745' }} />
                </div>
              )}

              {/* Presupuesto */}
              <div>
                <label className="block text-sm mb-2 font-medium" style={{ color: '#1d1d1b' }}>Presupuesto total (COP) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: '#808080' }}>$</span>
                  <input type="number" min="1" value={editProject.budget}
                    onChange={e => setEditProject({ ...editProject, budget: e.target.value })}
                    className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e0e0e0' }} />
                </div>
                {Number(editProject.budget) > 0 && (
                  <p className="text-xs mt-1" style={{ color: '#808080' }}>{COP(editProject.budget)}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveEditProject} disabled={isSaving}
                  className="flex-1 px-4 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#28a745', color: 'white' }}>
                  <Save size={18} /> {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button onClick={() => { closeAllModals(); setEditProject(null); }}
                  className="px-4 py-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#e0e0e0', color: '#808080' }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Detalles del proyecto (Equipo + Tareas) ══════════════════ */}
      {selectedProject && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: '#e0e0e0' }}>
              <div>
                <h2 className="text-2xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                  {selectedProject.title}
                </h2>
                <div className="flex items-center gap-3 mt-1 text-sm" style={{ color: '#808080' }}>
                  <span>{selectedProject.category}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs"
                    style={{ backgroundColor: getColor(selectedProject.status) + '20', color: getColor(selectedProject.status) }}>
                    {getLabel(selectedProject.status)}
                  </span>
                  {selectedProject.date && (
                    <span>{selectedProject.date}{selectedProject.endDate ? ` → ${selectedProject.endDate}` : ''}</span>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedProject(null)}
                className="p-2 hover:bg-gray-100 rounded-lg" style={{ color: '#808080' }}>
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">

              {/* ── Equipo ── */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg flex items-center gap-2"
                    style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                    <Users size={20} style={{ color: '#f18517' }} /> Equipo de Trabajo
                  </h3>
                  <button onClick={() => { setError(''); setShowMemberModal(true); }}
                    className="px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:shadow-lg transition-all"
                    style={{ backgroundColor: '#f18517', color: 'white' }}>
                    <Plus size={16} /> Agregar Miembro
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(selectedProject.teamMembers || []).map(member => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg"
                      style={{ borderColor: '#e0e0e0' }}>
                      <div>
                        <p className="font-medium" style={{ color: '#1d1d1b' }}>{member.name}</p>
                        <p className="text-sm" style={{ color: '#808080' }}>{member.email}</p>
                        <p className="text-xs mt-1" style={{ color: '#f18517' }}>{member.role}</p>
                      </div>
                      <button onClick={() => handleDeleteMember(member.id)}
                        className="p-2 hover:bg-red-50 rounded" style={{ color: '#dc3545' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {!selectedProject.teamMembers?.length && (
                    <p className="text-sm col-span-2" style={{ color: '#808080' }}>
                      No hay miembros en este proyecto aún.
                    </p>
                  )}
                </div>
              </div>

              {/* ── Tareas ── */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg flex items-center gap-2"
                    style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                    <Clock size={20} style={{ color: '#f18517' }} /> Tareas del Proyecto
                  </h3>
                  <button onClick={() => { setError(''); setShowTaskModal(true); }}
                    className="px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:shadow-lg transition-all"
                    style={{ backgroundColor: '#f18517', color: 'white' }}>
                    <Plus size={16} /> Nueva Tarea
                  </button>
                </div>
                <div className="space-y-3">
                  {(selectedProject.tasks || []).map(task => (
                    <div key={task.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      style={{ borderColor: '#e0e0e0' }}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <h4 className="font-medium" style={{ color: '#1d1d1b' }}>{task.title}</h4>
                        <span className="px-2 py-1 rounded text-xs w-fit"
                          style={{ backgroundColor: getColor(task.status) + '20', color: getColor(task.status) }}>
                          {getLabel(task.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                        <div><span className="block text-xs mb-0.5" style={{ color: '#808080' }}>Asignado a</span><span style={{ color: '#1d1d1b' }}>{task.assignedTo || '—'}</span></div>
                        <div><span className="block text-xs mb-0.5" style={{ color: '#808080' }}>Inicio</span><span style={{ color: '#1d1d1b' }}>{task.startDate || '—'}</span></div>
                        <div><span className="block text-xs mb-0.5" style={{ color: '#808080' }}>Fecha límite</span><span style={{ color: '#1d1d1b' }}>{task.endDate || '—'}</span></div>
                      </div>
                    </div>
                  ))}
                  {!selectedProject.tasks?.length && (
                    <p className="text-sm" style={{ color: '#808080' }}>No hay tareas creadas para este proyecto.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Nueva Tarea ══════════════════════════════════════════════ */}
      {showTaskModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                Nueva Tarea
              </h3>
              <button onClick={() => { closeAllModals(); setNewTask({}); }}
                className="p-2 hover:bg-gray-100 rounded-lg" style={{ color: '#808080' }}>
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm"
                style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Nombre de la tarea *</label>
                <input type="text" autoFocus value={newTask.title || ''}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e0e0e0' }}
                  placeholder="Ej: Diseñar flyer del evento" />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Asignado a</label>
                <input type="text" value={newTask.assignedTo || ''}
                  onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e0e0e0' }}
                  placeholder="Nombre del responsable" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Fecha de inicio</label>
                  <input type="date" value={newTask.startDate || ''}
                    onChange={e => setNewTask({ ...newTask, startDate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e0e0e0' }} />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Fecha límite</label>
                  <input type="date" value={newTask.endDate || ''}
                    min={newTask.startDate || undefined}
                    onChange={e => setNewTask({ ...newTask, endDate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e0e0e0' }} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleAddTask} disabled={!newTask.title || isSaving}
                  className="flex-1 px-4 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#f18517', color: 'white' }}>
                  {isSaving ? 'Guardando...' : 'Agregar Tarea'}
                </button>
                <button onClick={() => { closeAllModals(); setNewTask({}); }}
                  className="px-4 py-3 rounded-lg border hover:bg-gray-50"
                  style={{ borderColor: '#e0e0e0', color: '#808080' }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Agregar Miembro ══════════════════════════════════════════ */}
      {showMemberModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                Agregar Miembro al Equipo
              </h3>
              <button onClick={() => { closeAllModals(); setNewMember({}); }}
                className="p-2 hover:bg-gray-100 rounded-lg" style={{ color: '#808080' }}>
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm"
                style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div className="space-y-4">
              {[
                { label: 'Nombre completo *',  key: 'name',  type: 'text',  placeholder: 'Ej: María González'          },
                { label: 'Email *',            key: 'email', type: 'email', placeholder: 'maria@ejemplo.com'           },
                { label: 'Rol en el proyecto', key: 'role',  type: 'text',  placeholder: 'Ej: Coordinadora, Diseñador' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>{label}</label>
                  <input type={type} value={newMember[key] || ''}
                    onChange={e => setNewMember({ ...newMember, [key]: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e0e0e0' }}
                    placeholder={placeholder} />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={handleAddMember} disabled={!newMember.name || !newMember.email || isSaving}
                  className="flex-1 px-4 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#f18517', color: 'white' }}>
                  {isSaving ? 'Guardando...' : 'Agregar Miembro'}
                </button>
                <button onClick={() => { closeAllModals(); setNewMember({}); }}
                  className="px-4 py-3 rounded-lg border hover:bg-gray-50"
                  style={{ borderColor: '#e0e0e0', color: '#808080' }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}