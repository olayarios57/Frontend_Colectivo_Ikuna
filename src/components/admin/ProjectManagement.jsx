import { useState } from 'react';
import { Plus, Edit, Trash2, Users, Calendar, Clock, X } from 'lucide-react';

export function ProjectManagement({ projects: initialProjects }) {
  const [projects,         setProjects]         = useState(initialProjects);
  const [selectedProject, setSelectedProject]   = useState(null);
  const [showTaskModal,    setShowTaskModal]     = useState(false);
  const [showMemberModal,  setShowMemberModal]   = useState(false);
  const [newTask,          setNewTask]           = useState({});
  const [newMember,        setNewMember]         = useState({});

  const getStatusColor = (status) => {
    const colors = { completed: '#28a745', 'in-progress': '#ffc107', upcoming: '#17a2b8', pending: '#6c757d' };
    return colors[status] || '#808080';
  };

  const getStatusLabel = (status) => {
    const labels = { completed: 'Completado', 'in-progress': 'En Progreso', upcoming: 'Próximo', pending: 'Pendiente' };
    return labels[status] || status;
  };

  const handleAddTask = () => {
    if (selectedProject && newTask.title) {
      const task = { id: Date.now(), title: newTask.title || '', assignedTo: newTask.assignedTo || '', startDate: newTask.startDate || '', endDate: newTask.endDate || '', status: 'pending' };
      const updatedProjects = projects.map((p) => p.id === selectedProject.id ? { ...p, tasks: [...p.tasks, task] } : p);
      setProjects(updatedProjects);
      setSelectedProject({ ...selectedProject, tasks: [...selectedProject.tasks, task] });
      setNewTask({});
      setShowTaskModal(false);
    }
  };

  const handleAddMember = () => {
    if (selectedProject && newMember.name && newMember.email) {
      const member = { id: Date.now(), name: newMember.name, email: newMember.email, role: newMember.role || 'Colaborador' };
      const updatedProjects = projects.map((p) => p.id === selectedProject.id ? { ...p, teamMembers: [...p.teamMembers, member] } : p);
      setProjects(updatedProjects);
      setSelectedProject({ ...selectedProject, teamMembers: [...selectedProject.teamMembers, member] });
      setNewMember({});
      setShowMemberModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: '#e0e0e0' }}>
          <h2 className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>Gestión de Proyectos</h2>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:shadow-lg" style={{ backgroundColor: '#f18517', color: 'white' }}>
            <Plus size={20} />Nuevo Proyecto
          </button>
        </div>

        <div className="p-6 space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
              style={{ borderColor: '#e0e0e0' }}
              onClick={() => setSelectedProject(project)}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-lg mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>{project.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: '#808080' }}>
                    <span className="flex items-center gap-1"><Calendar size={16} />{project.date}</span>
                    <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: '#f5f5f5', color: '#1d1d1b' }}>{project.category}</span>
                    <span className="flex items-center gap-1"><Users size={16} />{project.teamMembers?.length || 0} miembros</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-sm flex items-center gap-2 w-fit" style={{ backgroundColor: getStatusColor(project.status) + '20', color: getStatusColor(project.status) }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor(project.status) }} />
                  {getStatusLabel(project.status)}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: '#808080' }}>Progreso</span>
                  <span className="text-sm font-medium" style={{ color: '#1d1d1b' }}>{project.progress}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${project.progress}%`, backgroundColor: getStatusColor(project.status) }} />
                </div>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); setSelectedProject(project); }}
                className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
                style={{ borderColor: '#e0e0e0', color: '#1d1d1b' }}
              >
                <Edit size={16} className="inline mr-2" />Ver Detalles
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: '#e0e0e0' }}>
              <h2 className="text-2xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>{selectedProject.title}</h2>
              <button onClick={() => setSelectedProject(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" style={{ color: '#808080' }}><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Team */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                    <Users size={20} style={{ color: '#f18517' }} />Equipo de Trabajo
                  </h3>
                  <button onClick={() => setShowMemberModal(true)} className="px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:shadow-lg transition-all" style={{ backgroundColor: '#f18517', color: 'white' }}>
                    <Plus size={16} />Agregar Miembro
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedProject.teamMembers?.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg" style={{ borderColor: '#e0e0e0' }}>
                      <div>
                        <p className="font-medium" style={{ color: '#1d1d1b' }}>{member.name}</p>
                        <p className="text-sm" style={{ color: '#808080' }}>{member.email}</p>
                        <p className="text-xs mt-1" style={{ color: '#f18517' }}>{member.role}</p>
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded transition-colors" style={{ color: '#dc3545' }}><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                    <Clock size={20} style={{ color: '#f18517' }} />Tareas del Proyecto
                  </h3>
                  <button onClick={() => setShowTaskModal(true)} className="px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:shadow-lg transition-all" style={{ backgroundColor: '#f18517', color: 'white' }}>
                    <Plus size={16} />Nueva Tarea
                  </button>
                </div>
                <div className="space-y-3">
                  {selectedProject.tasks?.map((task) => (
                    <div key={task.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow" style={{ borderColor: '#e0e0e0' }}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <h4 className="font-medium" style={{ color: '#1d1d1b' }}>{task.title}</h4>
                        <span className="px-2 py-1 rounded text-xs w-fit" style={{ backgroundColor: getStatusColor(task.status) + '20', color: getStatusColor(task.status) }}>
                          {getStatusLabel(task.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm" style={{ color: '#808080' }}>
                        <div><span className="block text-xs mb-1">Asignado a:</span><span style={{ color: '#1d1d1b' }}>{task.assignedTo || 'Sin asignar'}</span></div>
                        <div><span className="block text-xs mb-1">Inicio:</span><span style={{ color: '#1d1d1b' }}>{task.startDate}</span></div>
                        <div><span className="block text-xs mb-1">Fecha límite:</span><span style={{ color: '#1d1d1b' }}>{task.endDate}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl mb-4" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>Nueva Tarea</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Nombre de la tarea</label>
                <input type="text" value={newTask.title || ''} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }}
                  placeholder="Ej: Diseñar flyer del evento" />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Asignado a</label>
                <input type="text" value={newTask.assignedTo || ''} onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }}
                  placeholder="Nombre o email" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Fecha de inicio</label>
                  <input type="date" value={newTask.startDate || ''} onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }} />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Fecha límite</label>
                  <input type="date" value={newTask.endDate || ''} onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }} />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button onClick={handleAddTask} className="flex-1 px-4 py-2 rounded-lg hover:shadow-lg transition-all" style={{ backgroundColor: '#f18517', color: 'white' }}>Agregar Tarea</button>
                <button onClick={() => { setShowTaskModal(false); setNewTask({}); }} className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors" style={{ borderColor: '#e0e0e0', color: '#808080' }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl mb-4" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>Agregar Miembro al Equipo</h3>
            <div className="space-y-4">
              {[
                { label: 'Nombre completo', key: 'name',  type: 'text',  placeholder: 'Ej: Carlos Rodríguez' },
                { label: 'Email',           key: 'email', type: 'email', placeholder: 'carlos@example.com' },
                { label: 'Rol en el proyecto', key: 'role', type: 'text', placeholder: 'Ej: Diseñador, Coordinador' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>{label}</label>
                  <input type={type} value={newMember[key] || ''} onChange={(e) => setNewMember({ ...newMember, [key]: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }}
                    placeholder={placeholder} />
                </div>
              ))}
              <div className="flex gap-2 pt-4">
                <button onClick={handleAddMember} className="flex-1 px-4 py-2 rounded-lg hover:shadow-lg transition-all" style={{ backgroundColor: '#f18517', color: 'white' }}>Agregar Miembro</button>
                <button onClick={() => { setShowMemberModal(false); setNewMember({}); }} className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors" style={{ borderColor: '#e0e0e0', color: '#808080' }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}