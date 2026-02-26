import { useState, useMemo } from 'react';
import { DollarSign, Plus, TrendingUp, TrendingDown, PieChart, X, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { apiService } from '../../services/apiService'; // IMPORTAMOS LA API

const EXPENSES_PER_PAGE = 30;

const EXPENSE_CONCEPTS = [
  'Logística',
  'Talento Humano',
  'Materiales',
  'Servicios',
  'Marketing y Comunicaciones',
];

const CONCEPT_COLORS = {
  'Logística':                  '#17a2b8',
  'Talento Humano':             '#28a745',
  'Materiales':                 '#ffc107',
  'Servicios':                  '#6f42c1',
  'Marketing y Comunicaciones': '#fd7e14',
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount || 0);

// ════════════════════════════════════════════════════════════════════════════
export function BudgetManagement({ projects = [], onProjectsChange }) {
  const [showModal,   setShowModal]   = useState(false);
  const [newExpense,  setNewExpense]  = useState({ projectId: '', paidTo: '', amount: '', date: '', concept: 'Logística', notes: '' });
  const [expensePage, setExpensePage] = useState(1);
  const [modalError,  setModalError]  = useState('');
  const [isSaving,    setIsSaving]    = useState(false);

  // ── Acumular todos los gastos de todos los proyectos ──────────────────────
  const allExpenses = useMemo(() =>
    projects.flatMap(p =>
      (p.expenses || []).map(e => ({ ...e, projectName: p.title, projectId: p.id }))
    ).sort((a, b) => new Date(b.date) - new Date(a.date)),
    [projects]
  );

  // ── Totales globales ───────────────────────────────────────────────────────
  const totalBudget    = projects.reduce((s, p) => s + (p.budget || 0), 0);
  const totalSpent     = projects.reduce((s, p) => s + (p.spent  || 0), 0);
  const totalRemaining = totalBudget - totalSpent;

  // ── Paginación de gastos ───────────────────────────────────────────────────
  const totalPages      = Math.max(1, Math.ceil(allExpenses.length / EXPENSES_PER_PAGE));
  const pagedExpenses   = allExpenses.slice((expensePage - 1) * EXPENSES_PER_PAGE, expensePage * EXPENSES_PER_PAGE);

  // ── Proyecto seleccionado en el modal ──────────────────────────────────────
  const selectedProject  = projects.find(p => String(p.id) === String(newExpense.projectId));
  const selBudget        = Number(selectedProject?.budget ?? selectedProject?.totalBudget ?? 0) || 0;
  const selSpent         = Number(selectedProject?.spent  ?? selectedProject?.executedBudget ?? 0) || 0;
  const projectRemaining = selectedProject ? Math.max(0, selBudget - selSpent) : null;
  const projectIsFull    = selectedProject !== undefined && selBudget > 0 && selSpent >= selBudget;

  // NUEVO: Función auxiliar para leer los errores del backend
  const handleBackendError = (err, defaultMessage) => {
    console.error(err);
    if (err.response && err.response.data) {
      const backendErrors = Object.values(err.response.data);
      if (backendErrors.length > 0 && typeof backendErrors[0] === 'string') {
        setModalError(backendErrors[0]);
        return;
      }
      if (err.response.data.error) {
        setModalError(err.response.data.error);
        return;
      }
    }
    setModalError(defaultMessage);
  };

  // ── Registrar gasto (CONECTADO AL BACKEND) ────────────────────────────────────────────────────────
  const handleAddExpense = async () => {
    setModalError('');

    if (!newExpense.projectId || !newExpense.paidTo || !newExpense.amount || !newExpense.date) {
      setModalError('Completa todos los campos obligatorios.');
      return;
    }

    const amount = Number(newExpense.amount);
    if (amount <= 0) { setModalError('El monto debe ser mayor a cero.'); return; }
    if (projectIsFull) { setModalError('Este proyecto ya ejecutó el 100% del presupuesto.'); return; }
    if (projectRemaining !== null && amount > projectRemaining) {
      setModalError(`El monto supera el saldo disponible (${formatCurrency(projectRemaining)}).`);
      return;
    }

    setIsSaving(true);

    // Adaptamos el gasto del Front al DTO de Budget del Backend
    const budgetPayload = {
      amount: amount,
      totalIncome: 0,
      totalExpense: amount,
      balance: -amount,
      startDate: newExpense.date,
      endDate: newExpense.date,
      status: 'APPROVED',
      projectId: Number(newExpense.projectId),
      concept: newExpense.concept,
      paidTo: newExpense.paidTo,
      notes: newExpense.notes || ''
    };

    try {
      // 1. LLAMADA REAL A LA BASE DE DATOS
      await apiService.createBudget(budgetPayload);

      // 2. ACTUALIZAMOS EL ESTADO LOCAL PARA QUE SE VEA EN PANTALLA INMEDIATAMENTE
      const expense = {
        id:        Date.now(),
        paidTo:    newExpense.paidTo,
        amount,
        date:      newExpense.date,
        concept:   newExpense.concept,
        notes:     newExpense.notes,
        projectId: Number(newExpense.projectId),
      };

      const updatedProjects = projects.map(p => {
        if (String(p.id) !== String(newExpense.projectId)) return p;
        const pBudget     = Number(p.budget ?? p.totalBudget ?? 0) || 0;
        const pSpent      = Number(p.spent  ?? p.executedBudget ?? 0) || 0;
        const newSpent    = pSpent + amount;
        const newProgress = pBudget > 0 ? Math.min(100, Math.round((newSpent / pBudget) * 100)) : 0;
        const newStatus   = newProgress >= 100 ? 'completed' : p.status;
        return {
          ...p,
          budget:   pBudget,
          spent:    newSpent,
          progress: newProgress,
          status:   newStatus,
          expenses: [...(p.expenses || []), expense],
        };
      });

      onProjectsChange?.(updatedProjects);
      closeModal();
      setExpensePage(1);

    } catch (err) {
      handleBackendError(err, "Error al guardar el gasto en la base de datos.");
    } finally {
      setIsSaving(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalError('');
    setNewExpense({ projectId: '', paidTo: '', amount: '', date: '', concept: 'Logística', notes: '' });
  };

  return (
    <div className="space-y-6">

      {/* ── Tarjetas resumen ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard icon={<DollarSign className="text-blue-500" size={24} />}
          label="Presupuesto Total" value={formatCurrency(totalBudget)} sub="Todos los proyectos" />
        <SummaryCard icon={<TrendingDown className="text-red-500" size={24} />}
          label="Total Gastado" value={formatCurrency(totalSpent)} valueColor="#dc3545"
          bar={totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0} barColor="#dc3545" />
        <SummaryCard icon={<TrendingUp className="text-green-500" size={24} />}
          label="Presupuesto Restante" value={formatCurrency(totalRemaining)} valueColor="#28a745"
          sub={totalBudget > 0 ? `${((totalRemaining / totalBudget) * 100).toFixed(1)}% disponible` : '—'} />
      </div>

      {/* ── Presupuesto por proyecto ── */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b" style={{ borderColor: '#e0e0e0' }}>
          <h2 className="text-xl flex items-center gap-2"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
            <PieChart size={24} style={{ color: '#f18517' }} />
            Presupuesto por Proyecto
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {projects.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: '#808080' }}>
              No hay proyectos creados. Créalos desde el tab Proyectos.
            </p>
          ) : (
            projects.map(project => {
              const spent   = Number(project.spent   ?? project.executedBudget ?? 0) || 0;
              const budget  = Number(project.budget  ?? project.totalBudget    ?? 0) || 0;
              const remaining = Math.max(0, budget - spent);
              const pct     = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
              const isFull  = budget > 0 && spent >= budget;

              return (
                <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  style={{ borderColor: '#e0e0e0' }}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-base font-medium" style={{ color: '#1d1d1b', fontFamily: 'Montserrat, sans-serif' }}>
                        {project.title}
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: '#808080' }}>{project.category}</p>
                    </div>
                    <span className="text-sm px-3 py-1 rounded-full w-fit"
                      style={{ backgroundColor: isFull ? '#dc354520' : '#28a74520', color: isFull ? '#dc3545' : '#28a745' }}>
                      {pct.toFixed(1)}% ejecutado{isFull ? ' · COMPLETADO' : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                    <div>
                      <span className="block text-xs mb-1" style={{ color: '#808080' }}>Presupuesto</span>
                      <span className="font-medium" style={{ color: '#1d1d1b' }}>{formatCurrency(budget)}</span>
                    </div>
                    <div>
                      <span className="block text-xs mb-1" style={{ color: '#808080' }}>Gastado</span>
                      <span className="font-medium" style={{ color: '#dc3545' }}>{formatCurrency(spent)}</span>
                    </div>
                    <div>
                      <span className="block text-xs mb-1" style={{ color: '#808080' }}>Restante</span>
                      <span className="font-medium" style={{ color: '#28a745' }}>{formatCurrency(remaining)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: isFull ? '#dc3545' : '#f18517' }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Registro de gastos ── */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 lg:p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ borderColor: '#e0e0e0' }}>
          <h2 className="text-xl flex items-center gap-2"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
            <DollarSign size={24} style={{ color: '#f18517' }} />
            Registro de Gastos
            {allExpenses.length > 0 && (
              <span className="text-sm font-normal" style={{ color: '#808080' }}>
                ({allExpenses.length} gasto{allExpenses.length !== 1 ? 's' : ''})
              </span>
            )}
          </h2>
          <button onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all hover:shadow-lg w-full sm:w-auto"
            style={{ backgroundColor: '#f18517', color: 'white' }}>
            <Plus size={20} /> Registrar Gasto
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#f5f5f5' }}>
              <tr>
                {['Fecha', 'Proyecto', 'Pagado a', 'Concepto', 'Notas', 'Monto'].map((h, i) => (
                  <th key={h} className={`p-4 text-sm font-medium ${i === 5 ? 'text-right' : 'text-left'}`}
                    style={{ color: '#1d1d1b' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedExpenses.map(expense => (
                <tr key={expense.id} className="border-b hover:bg-gray-50" style={{ borderColor: '#e0e0e0' }}>
                  <td className="p-4 text-sm" style={{ color: '#808080' }}>{expense.date}</td>
                  <td className="p-4 text-sm" style={{ color: '#1d1d1b' }}>{expense.projectName}</td>
                  <td className="p-4 text-sm" style={{ color: '#1d1d1b' }}>{expense.paidTo}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded text-xs"
                      style={{ backgroundColor: (CONCEPT_COLORS[expense.concept] || '#808080') + '20', color: CONCEPT_COLORS[expense.concept] || '#808080' }}>
                      {expense.concept}
                    </span>
                  </td>
                  <td className="p-4 text-sm" style={{ color: '#808080' }}>{expense.notes || '—'}</td>
                  <td className="p-4 text-sm text-right font-medium" style={{ color: '#dc3545' }}>
                    {formatCurrency(expense.amount)}
                  </td>
                </tr>
              ))}
              {allExpenses.length === 0 && (
                <tr><td colSpan="6" className="p-8 text-center text-sm" style={{ color: '#808080' }}>
                  No hay gastos registrados aún.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between" style={{ borderColor: '#e0e0e0' }}>
            <span className="text-sm" style={{ color: '#808080' }}>
              Página {expensePage} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button onClick={() => setExpensePage(p => Math.max(1, p - 1))} disabled={expensePage === 1}
                className="p-2 rounded-lg border disabled:opacity-40 hover:bg-gray-50 transition-colors"
                style={{ borderColor: '#e0e0e0' }}>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setExpensePage(page)}
                  className="w-8 h-8 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: page === expensePage ? '#f18517' : 'transparent',
                    color: page === expensePage ? 'white' : '#1d1d1b',
                    border: page === expensePage ? 'none' : '1px solid #e0e0e0',
                  }}>
                  {page}
                </button>
              ))}
              <button onClick={() => setExpensePage(p => Math.min(totalPages, p + 1))} disabled={expensePage === totalPages}
                className="p-2 rounded-lg border disabled:opacity-40 hover:bg-gray-50 transition-colors"
                style={{ borderColor: '#e0e0e0' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal Registrar Gasto ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
                Registrar Gasto
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg" style={{ color: '#808080' }}>
                <X size={24} />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm" style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                <AlertCircle size={16} /> {modalError}
              </div>
            )}

            <div className="space-y-4">
              {/* Proyecto */}
              <div>
                <label className="block text-sm mb-2 font-medium" style={{ color: '#1d1d1b' }}>Proyecto *</label>
                <select value={newExpense.projectId}
                  onChange={e => setNewExpense({ ...newExpense, projectId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e0e0e0' }}>
                  <option value="">Selecciona un proyecto</option>
                  {projects.map(p => {
                    const pBudget = Number(p.budget ?? p.totalBudget    ?? 0) || 0;
                    const pSpent  = Number(p.spent  ?? p.executedBudget ?? 0) || 0;
                    const pSaldo  = Math.max(0, pBudget - pSpent);
                    const full    = pBudget > 0 && pSpent >= pBudget;
                    return (
                      <option key={p.id} value={p.id} disabled={full}>
                        {p.title}{full ? ' — SIN SALDO' : ` — Saldo: ${formatCurrency(pSaldo)}`}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Pagado a */}
              <div>
                <label className="block text-sm mb-2 font-medium" style={{ color: '#1d1d1b' }}>Pagado a *</label>
                <input type="text" value={newExpense.paidTo}
                  onChange={e => setNewExpense({ ...newExpense, paidTo: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e0e0e0' }}
                  placeholder="Nombre del proveedor o persona" />
              </div>

              {/* Concepto */}
              <div>
                <label className="block text-sm mb-2 font-medium" style={{ color: '#1d1d1b' }}>Concepto *</label>
                <select value={newExpense.concept}
                  onChange={e => setNewExpense({ ...newExpense, concept: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e0e0e0' }}>
                  {EXPENSE_CONCEPTS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Monto */}
              <div>
                <label className="block text-sm mb-2 font-medium" style={{ color: '#1d1d1b' }}>Monto (COP) *</label>
                <input type="number" min="1" value={newExpense.amount}
                  onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e0e0e0' }} placeholder="0" />
                {selectedProject && newExpense.amount && (
                  <p className="text-xs mt-1" style={{ color: Number(newExpense.amount) > projectRemaining ? '#dc3545' : '#28a745' }}>
                    Saldo disponible: {formatCurrency(projectRemaining)}
                  </p>
                )}
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-sm mb-2 font-medium" style={{ color: '#1d1d1b' }}>Fecha *</label>
                <input type="date" value={newExpense.date}
                  onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e0e0e0' }} />
              </div>

              {/* Notas opcionales */}
              <div>
                <label className="block text-sm mb-2 font-medium" style={{ color: '#1d1d1b' }}>Descripción / Notas</label>
                <textarea value={newExpense.notes} rows={2}
                  onChange={e => setNewExpense({ ...newExpense, notes: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none"
                  style={{ borderColor: '#e0e0e0' }}
                  placeholder="Descripción adicional (opcional)" />
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={handleAddExpense} disabled={projectIsFull || isSaving}
                  className="flex-1 px-4 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#f18517', color: 'white' }}>
                  {isSaving ? 'Guardando en BD...' : 'Registrar Gasto'}
                </button>
                <button onClick={closeModal}
                  className="px-4 py-3 rounded-lg border hover:bg-gray-50 transition-colors"
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

// ── Componente interno de tarjeta resumen ─────────────────────────────────────
function SummaryCard({ icon, label, value, valueColor = '#1d1d1b', sub, bar, barColor }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm" style={{ color: '#808080' }}>{label}</h3>
        {icon}
      </div>
      <p className="text-3xl mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: valueColor }}>
        {value}
      </p>
      {bar !== undefined && (
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2 mb-1">
          <div className="h-2 rounded-full transition-all" style={{ width: `${bar}%`, backgroundColor: barColor }} />
        </div>
      )}
      {sub && <p className="text-sm" style={{ color: '#808080' }}>{sub}</p>}
    </div>
  );
}