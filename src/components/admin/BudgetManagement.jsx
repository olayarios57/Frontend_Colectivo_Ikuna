import { useState } from 'react';
import { Plus, X, TrendingUp, DollarSign, AlertTriangle, CheckCircle, Edit2, Save } from 'lucide-react';

const COP = (v) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v || 0);

const CATEGORIES = ['Materiales', 'Servicios', 'Personal', 'Marketing', 'Logística', 'Otros'];

const CATEGORY_STYLE = {
  Materiales: { bg: '#e3f2fd', color: '#1565c0' },
  Servicios:  { bg: '#fff3e0', color: '#e65100' },
  Personal:   { bg: '#f3e5f5', color: '#6a1b9a' },
  Marketing:  { bg: '#e8f5e9', color: '#2e7d32' },
  Logística:  { bg: '#fce4ec', color: '#880e4f' },
  Otros:      { bg: '#f5f5f5', color: '#616161' },
};

const EMPTY_EXPENSE = { projectId: '', type: '', category: 'Otros', paidTo: '', amount: '', date: '' };

export function BudgetManagement({ projects = [], onProjectsChange }) {
  const [showExpenseModal,  setShowExpenseModal]  = useState(false);
  const [showEditModal,     setShowEditModal]      = useState(false);
  const [editingExpense,    setEditingExpense]     = useState(null); // { expense, projectId }
  const [newExpense,        setNewExpense]         = useState(EMPTY_EXPENSE);
  const [editForm,          setEditForm]           = useState(EMPTY_EXPENSE);

  const budgetProjects = projects.filter(p => p.budget > 0);
  const totalBudget    = budgetProjects.reduce((s, p) => s + (p.budget || 0), 0);
  const totalSpent     = budgetProjects.reduce((s, p) => s + (p.spent  || 0), 0);
  const totalLeft      = totalBudget - totalSpent;
  const globalPct      = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const allExpenses = budgetProjects
    .flatMap(p => (p.expenses || []).map(e => ({ ...e, projectTitle: p.title, projectId: p.id })))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const barColor = (pct) => pct >= 100 ? '#dc3545' : pct >= 75 ? '#ffc107' : '#28a745';

  // Recalcula spent y status de un proyecto a partir de sus expenses
  const recalcProject = (p) => {
    const newSpent    = (p.expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
    const newProgress = p.budget > 0 ? Math.min(Math.round((newSpent / p.budget) * 100), 100) : p.progress;
    // Estado: completado SOLO si presupuesto 100% ejecutado
    const newStatus   = newProgress >= 100 ? 'completed' : newProgress > 0 ? 'in-progress' : 'upcoming';
    return { ...p, spent: newSpent, progress: newProgress, status: newStatus };
  };

  // ── Agregar gasto ─────────────────────────────────────────────
  const handleAddExpense = () => {
    if (!newExpense.projectId || !newExpense.type || !newExpense.amount || !newExpense.date) return;
    const amount = Number(newExpense.amount) || 0;
    if (amount <= 0) return;

    // Bloquear si supera el presupuesto disponible
    const proj = projects.find(p => p.id === Number(newExpense.projectId));
    if (proj && amount > (proj.budget - (proj.spent || 0))) return;

    const expense = {
      id: Date.now(), type: newExpense.type, category: newExpense.category,
      paidTo: newExpense.paidTo, amount, date: newExpense.date,
    };

    const updated = projects.map(p => {
      if (p.id !== Number(newExpense.projectId)) return p;
      return recalcProject({ ...p, expenses: [...(p.expenses || []), expense] });
    });

    if (onProjectsChange) onProjectsChange(updated);
    setNewExpense(EMPTY_EXPENSE);
    setShowExpenseModal(false);
  };

  // ── Abrir modal de edición ────────────────────────────────────
  const openEditExpense = (expense) => {
    setEditingExpense(expense);
    setEditForm({
      type:     expense.type,
      category: expense.category,
      paidTo:   expense.paidTo || '',
      amount:   expense.amount,
      date:     expense.date,
    });
    setShowEditModal(true);
  };

  // ── Guardar edición de gasto ──────────────────────────────────
  const handleSaveEdit = () => {
    if (!editForm.type || !editForm.amount || !editForm.date) return;
    const amount = Number(editForm.amount) || 0;
    if (exceedsOnEdit) return; // Bloquear si supera presupuesto disponible

    const updated = projects.map(p => {
      if (p.id !== editingExpense.projectId) return p;
      const updatedExpenses = (p.expenses || []).map(e =>
        e.id === editingExpense.id
          ? { ...e, type: editForm.type, category: editForm.category, paidTo: editForm.paidTo, amount, date: editForm.date }
          : e
      );
      return recalcProject({ ...p, expenses: updatedExpenses });
    });

    if (onProjectsChange) onProjectsChange(updated);
    setShowEditModal(false);
    setEditingExpense(null);
  };

  // ── Eliminar gasto ────────────────────────────────────────────
  const handleDeleteExpense = (expense) => {
    if (!window.confirm('¿Eliminar este gasto?')) return;
    const updated = projects.map(p => {
      if (p.id !== expense.projectId) return p;
      return recalcProject({ ...p, expenses: (p.expenses || []).filter(e => e.id !== expense.id) });
    });
    if (onProjectsChange) onProjectsChange(updated);
  };

  const selectedProject    = budgetProjects.find(p => p.id === Number(newExpense.projectId));
  const selectedRemaining  = selectedProject ? (selectedProject.budget - (selectedProject.spent || 0)) : 0;
  const newAmountNum       = Number(newExpense.amount) || 0;
  const exceedsOnNew       = selectedProject && newAmountNum > selectedRemaining;

  // Para edición: el presupuesto disponible es el restante + el monto original del gasto (que será reemplazado)
  const editProject        = editingExpense ? budgetProjects.find(p => p.id === editingExpense.projectId) : null;
  const editRemaining      = editProject ? (editProject.budget - (editProject.spent || 0)) + (editingExpense?.amount || 0) : 0;
  const editAmountNum      = Number(editForm.amount) || 0;
  const exceedsOnEdit      = editProject && editAmountNum > editRemaining;

  return (
    <div className="space-y-6">

      {/* ── Resumen global ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Presupuesto Total', value: COP(totalBudget), icon: DollarSign,  color: '#17a2b8', bg: '#17a2b820' },
          { label: 'Total Gastado',     value: COP(totalSpent),  icon: TrendingUp,   color: '#dc3545', bg: '#dc354520' },
          { label: 'Total Restante',    value: COP(totalLeft),   icon: CheckCircle,  color: '#28a745', bg: '#28a74520' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: bg }}>
                <Icon size={20} style={{ color }} />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: bg, color }}>
                {globalPct}% ejecutado
              </span>
            </div>
            <p className="text-xl font-bold" style={{ color: '#1d1d1b' }}>{value}</p>
            <p className="text-sm mt-1" style={{ color: '#808080' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Presupuesto por proyecto ── */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b" style={{ borderColor: '#e0e0e0' }}>
          <h2 className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
            Presupuesto por Proyecto
          </h2>
          <p className="text-sm mt-1" style={{ color: '#808080' }}>
            Los proyectos aparecen aquí automáticamente al crearlos con presupuesto asignado.
          </p>
        </div>
        <div className="p-6 space-y-6">
          {budgetProjects.length === 0 && (
            <p className="text-center py-10 text-sm" style={{ color: '#808080' }}>
              No hay proyectos con presupuesto. Crea uno desde la sección <strong>Proyectos</strong>.
            </p>
          )}
          {budgetProjects.map(project => {
            const spent  = project.spent  || 0;
            const budget = project.budget || 0;
            const left   = budget - spent;
            const pct    = budget > 0 ? Math.min(Math.round((spent / budget) * 100), 100) : 0;
            const color  = barColor(pct);
            return (
              <div key={project.id} className="border rounded-xl p-5 hover:shadow-md transition-shadow" style={{ borderColor: '#e0e0e0' }}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <div>
                    <h3 className="font-medium text-lg" style={{ color: '#1d1d1b' }}>{project.title}</h3>
                    <p className="text-xs mt-0.5" style={{ color: '#808080' }}>{project.category} · {project.date}</p>
                  </div>
                  <span className="text-sm font-medium px-3 py-1 rounded-full w-fit"
                    style={{ backgroundColor: color + '20', color }}>
                    {pct}% ejecutado
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs mb-1" style={{ color: '#808080' }}>Presupuesto Total</p>
                    <p className="font-semibold" style={{ color: '#1d1d1b' }}>{COP(budget)}</p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: '#808080' }}>Gastado</p>
                    <p className="font-semibold" style={{ color: '#dc3545' }}>{COP(spent)}</p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: '#808080' }}>Restante</p>
                    <p className="font-semibold" style={{ color: left >= 0 ? '#28a745' : '#dc3545' }}>{COP(left)}</p>
                  </div>
                </div>
                {pct >= 100 && (
                  <div className="mt-3 flex items-center gap-2 text-sm" style={{ color: '#dc3545' }}>
                    <AlertTriangle size={16} /><span>Presupuesto completamente ejecutado</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Registro de gastos ── */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: '#e0e0e0' }}>
          <h2 className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
            Registro de Gastos
          </h2>
          <button onClick={() => setShowExpenseModal(true)} disabled={budgetProjects.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#f18517', color: 'white' }}>
            <Plus size={20} /> Agregar Gasto
          </button>
        </div>
        <div className="overflow-x-auto">
          {allExpenses.length === 0 ? (
            <p className="text-center py-10 text-sm" style={{ color: '#808080' }}>No hay gastos registrados aún.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  {['Fecha', 'Proyecto', 'Tipo de Gasto', 'Pagado a', 'Categoría', 'Monto', 'Acciones'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: '#1d1d1b' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allExpenses.map(expense => {
                  const cs = CATEGORY_STYLE[expense.category] || CATEGORY_STYLE.Otros;
                  return (
                    <tr key={expense.id} className="border-t hover:bg-gray-50 transition-colors" style={{ borderColor: '#e0e0e0' }}>
                      <td className="px-4 py-3" style={{ color: '#808080' }}>{expense.date}</td>
                      <td className="px-4 py-3" style={{ color: '#1d1d1b' }}>{expense.projectTitle}</td>
                      <td className="px-4 py-3" style={{ color: '#1d1d1b' }}>{expense.type}</td>
                      <td className="px-4 py-3" style={{ color: '#808080' }}>{expense.paidTo || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: cs.bg, color: cs.color }}>
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: '#dc3545' }}>{COP(expense.amount)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditExpense(expense)}
                            className="p-1.5 rounded hover:bg-blue-50 transition-colors" title="Editar gasto"
                            style={{ color: '#17a2b8' }}>
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => handleDeleteExpense(expense)}
                            className="p-1.5 rounded hover:bg-red-50 transition-colors" title="Eliminar gasto"
                            style={{ color: '#dc3545' }}>
                            <X size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ══ MODAL: Nuevo Gasto ══════════════════════════════════════ */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                Registrar Nuevo Gasto
              </h3>
              <button onClick={() => { setShowExpenseModal(false); setNewExpense(EMPTY_EXPENSE); }}
                className="p-2 hover:bg-gray-100 rounded-lg" style={{ color: '#808080' }}><X size={24} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Proyecto *</label>
                <select value={newExpense.projectId} onChange={e => setNewExpense({ ...newExpense, projectId: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }}>
                  <option value="">Selecciona un proyecto</option>
                  {budgetProjects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} — Restante: {COP((p.budget || 0) - (p.spent || 0))}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProject && selectedProject.budget <= selectedProject.spent && (
                <div className="p-3 rounded-lg flex items-center gap-2 text-sm" style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                  <AlertTriangle size={16} />Este proyecto ya agotó su presupuesto. No se pueden registrar más gastos.
                </div>
              )}

              {selectedProject && selectedProject.budget > selectedProject.spent && (
                <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#f0f9f0', color: '#28a745' }}>
                  💰 Disponible: <strong>{COP(selectedRemaining)}</strong>
                </div>
              )}

              {exceedsOnNew && (
                <div className="p-3 rounded-lg flex items-center gap-2 text-sm" style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                  <AlertTriangle size={16} />El monto ({COP(newAmountNum)}) supera el presupuesto disponible ({COP(selectedRemaining)}). Redúcelo.
                </div>
              )}

              {[
                { label: 'Tipo de Gasto *', key: 'type',   type: 'text',   placeholder: 'Ej: Alquiler de equipos' },
                { label: 'Pagado a',        key: 'paidTo', type: 'text',   placeholder: 'Nombre de proveedor o persona' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>{label}</label>
                  <input type={type} value={newExpense[key]} onChange={e => setNewExpense({ ...newExpense, [key]: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }}
                    placeholder={placeholder} />
                </div>
              ))}

              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Categoría</label>
                <select value={newExpense.category} onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Monto (COP) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-sm" style={{ color: '#808080' }}>$</span>
                  <input type="number" min="0" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                    className="w-full pl-8 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }}
                    placeholder="0" />
                </div>
                {Number(newExpense.amount) > 0 && <p className="text-xs mt-1" style={{ color: '#808080' }}>{COP(newExpense.amount)}</p>}
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Fecha *</label>
                <input type="date" value={newExpense.date} onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }} />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleAddExpense}
                  disabled={!newExpense.projectId || !newExpense.type || !newExpense.amount || !newExpense.date || exceedsOnNew || (selectedProject && selectedProject.budget <= selectedProject.spent)}
                  className="flex-1 py-3 rounded-lg font-medium hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#f18517', color: 'white' }}>Registrar Gasto</button>
                <button onClick={() => { setShowExpenseModal(false); setNewExpense(EMPTY_EXPENSE); }}
                  className="px-4 py-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#e0e0e0', color: '#808080' }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Editar Gasto ══════════════════════════════════════ */}
      {showEditModal && editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                Editar Gasto
              </h3>
              <button onClick={() => { setShowEditModal(false); setEditingExpense(null); }}
                className="p-2 hover:bg-gray-100 rounded-lg" style={{ color: '#808080' }}><X size={24} /></button>
            </div>

            {/* Proyecto (solo lectura) */}
            <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#f5f5f5' }}>
              <p className="text-xs mb-0.5" style={{ color: '#808080' }}>Proyecto</p>
              <p className="font-medium text-sm" style={{ color: '#1d1d1b' }}>{editingExpense.projectTitle}</p>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Tipo de Gasto *', key: 'type',   type: 'text', placeholder: 'Ej: Alquiler de equipos' },
                { label: 'Pagado a',        key: 'paidTo', type: 'text', placeholder: 'Nombre de proveedor o persona' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>{label}</label>
                  <input type={type} value={editForm[key]} onChange={e => setEditForm({ ...editForm, [key]: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }}
                    placeholder={placeholder} />
                </div>
              ))}

              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Categoría</label>
                <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Monto (COP) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-sm" style={{ color: '#808080' }}>$</span>
                  <input type="number" min="0" value={editForm.amount} onChange={e => setEditForm({ ...editForm, amount: e.target.value })}
                    className="w-full pl-8 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: exceedsOnEdit ? '#dc3545' : '#e0e0e0' }} />
                </div>
                {Number(editForm.amount) > 0 && <p className="text-xs mt-1" style={{ color: '#808080' }}>{COP(editForm.amount)}</p>}
                {editProject && (
                  <p className="text-xs mt-1" style={{ color: '#808080' }}>
                    Disponible para este gasto: <strong style={{ color: exceedsOnEdit ? '#dc3545' : '#28a745' }}>{COP(editRemaining)}</strong>
                  </p>
                )}
                {exceedsOnEdit && (
                  <div className="mt-2 p-2 rounded-lg flex items-center gap-2 text-xs" style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                    <AlertTriangle size={14} />El monto supera el presupuesto disponible para este proyecto.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Fecha *</label>
                <input type="date" value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }} />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveEdit} disabled={!editForm.type || !editForm.amount || !editForm.date || exceedsOnEdit}
                  className="flex-1 py-3 rounded-lg font-medium hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#28a745', color: 'white' }}>
                  <Save size={18} />Guardar Cambios
                </button>
                <button onClick={() => { setShowEditModal(false); setEditingExpense(null); }}
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