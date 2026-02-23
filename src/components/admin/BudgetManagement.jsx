import { useState } from 'react';
import { DollarSign, Plus, TrendingUp, TrendingDown, PieChart, X } from 'lucide-react';

export function BudgetManagement() {
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [newExpense,        setNewExpense]       = useState({});

  const projectsBudget = [
    { id: 1, name: 'Plaza Cultural Centro',         totalBudget: 50000000, spent: 50000000, remaining: 0 },
    { id: 2, name: 'Noche de Cultura Viva',         totalBudget: 30000000, spent: 19500000, remaining: 10500000 },
    { id: 3, name: 'Festival Cultural Ikuna',       totalBudget: 80000000, spent: 32000000, remaining: 48000000 },
    { id: 4, name: 'Taller de Teatro Comunitario',  totalBudget: 15000000, spent: 1500000,  remaining: 13500000 },
  ];

  const totalBudget    = projectsBudget.reduce((sum, p) => sum + p.totalBudget, 0);
  const totalSpent     = projectsBudget.reduce((sum, p) => sum + p.spent,       0);
  const totalRemaining = projectsBudget.reduce((sum, p) => sum + p.remaining,   0);

  const [expenses, setExpenses] = useState([
    { id: 1, projectId: 1, projectName: 'Plaza Cultural Centro',   type: 'Materiales de construcción', paidTo: 'Ferretería El Constructor', amount: 5000000,  date: '2024-01-15', category: 'material' },
    { id: 2, projectId: 2, projectName: 'Noche de Cultura Viva',  type: 'Sonido e iluminación',        paidTo: 'Producciones AV',           amount: 8000000,  date: '2024-02-10', category: 'service' },
    { id: 3, projectId: 3, projectName: 'Festival Cultural Ikuna', type: 'Honorarios artistas',         paidTo: 'Grupo Musical Los Andes',   amount: 12000000, date: '2024-03-05', category: 'personnel' },
  ]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);

  const getCategoryColor = (category) => {
    const colors = { material: '#17a2b8', service: '#ffc107', personnel: '#28a745', transport: '#6f42c1', other: '#6c757d' };
    return colors[category] || '#808080';
  };

  const getCategoryLabel = (category) => {
    const labels = { material: 'Materiales', service: 'Servicios', personnel: 'Personal', transport: 'Transporte', other: 'Otros' };
    return labels[category] || category;
  };

  const handleAddExpense = () => {
    if (newExpense.type && newExpense.paidTo && newExpense.amount && newExpense.projectId) {
      const project = projectsBudget.find((p) => p.id === newExpense.projectId);
      const expense = {
        id: Date.now(),
        projectId:   newExpense.projectId,
        projectName: project?.name || '',
        type:        newExpense.type,
        paidTo:      newExpense.paidTo,
        amount:      newExpense.amount,
        date:        newExpense.date || new Date().toISOString().split('T')[0],
        category:    newExpense.category || 'other',
      };
      setExpenses([...expenses, expense]);
      setNewExpense({});
      setShowExpenseModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Presupuesto Total',     value: totalBudget,    icon: DollarSign,  iconColor: 'text-blue-500',  textColor: '#1d1d1b', sub: 'Todos los proyectos', bar: false },
          { label: 'Gastos Ejecutados',     value: totalSpent,     icon: TrendingDown,iconColor: 'text-red-500',   textColor: '#dc3545', sub: null, bar: true, barPct: (totalSpent/totalBudget)*100, barColor: '#dc3545' },
          { label: 'Presupuesto Restante',  value: totalRemaining, icon: TrendingUp,  iconColor: 'text-green-500', textColor: '#28a745', sub: `${((totalRemaining/totalBudget)*100).toFixed(1)}% disponible`, bar: false },
        ].map(({ label, value, icon: Icon, iconColor, textColor, sub, bar, barPct, barColor }) => (
          <div key={label} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm" style={{ color: '#808080' }}>{label}</h3>
              <Icon className={iconColor} size={24} />
            </div>
            <p className="text-3xl mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: textColor }}>
              {formatCurrency(value)}
            </p>
            {bar && <div className="w-full bg-gray-200 rounded-full h-2 mt-2"><div className="h-2 rounded-full transition-all" style={{ width: `${barPct}%`, backgroundColor: barColor }} /></div>}
            {sub && <p className="text-sm" style={{ color: '#808080' }}>{sub}</p>}
          </div>
        ))}
      </div>

      {/* Budget by Project */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b" style={{ borderColor: '#e0e0e0' }}>
          <h2 className="text-xl flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>
            <PieChart size={24} style={{ color: '#f18517' }} />Presupuesto por Proyecto
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {projectsBudget.map((project) => {
            const spentPct = (project.spent / project.totalBudget) * 100;
            return (
              <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow" style={{ borderColor: '#e0e0e0' }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                  <h3 className="text-lg" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>{project.name}</h3>
                  <span className="text-sm w-fit px-3 py-1 rounded-full" style={{ backgroundColor: spentPct >= 100 ? '#dc354520' : '#28a74520', color: spentPct >= 100 ? '#dc3545' : '#28a745' }}>
                    {spentPct.toFixed(1)}% ejecutado
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3 text-sm">
                  <div><span className="block text-xs mb-1" style={{ color: '#808080' }}>Presupuesto Total</span><span className="font-medium" style={{ color: '#1d1d1b' }}>{formatCurrency(project.totalBudget)}</span></div>
                  <div><span className="block text-xs mb-1" style={{ color: '#808080' }}>Gastado</span><span className="font-medium" style={{ color: '#dc3545' }}>{formatCurrency(project.spent)}</span></div>
                  <div><span className="block text-xs mb-1" style={{ color: '#808080' }}>Restante</span><span className="font-medium" style={{ color: '#28a745' }}>{formatCurrency(project.remaining)}</span></div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="h-3 rounded-full transition-all duration-500" style={{ width: `${Math.min(spentPct, 100)}%`, backgroundColor: spentPct >= 100 ? '#dc3545' : spentPct >= 75 ? '#ffc107' : '#28a745' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: '#e0e0e0' }}>
          <h2 className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>Registro de Gastos</h2>
          <button onClick={() => setShowExpenseModal(true)} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all hover:shadow-lg w-full sm:w-auto" style={{ backgroundColor: '#f18517', color: 'white' }}>
            <Plus size={20} />Agregar Gasto
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#f5f5f5' }}>
              <tr>
                {['Fecha', 'Proyecto', 'Tipo de Gasto', 'Pagado a', 'Categoría', 'Monto'].map((h, i) => (
                  <th key={h} className={`p-4 text-sm ${i === 5 ? 'text-right' : 'text-left'}`} style={{ color: '#1d1d1b' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#e0e0e0' }}>
                  <td className="p-4 text-sm" style={{ color: '#808080' }}>{expense.date}</td>
                  <td className="p-4 text-sm" style={{ color: '#1d1d1b' }}>{expense.projectName}</td>
                  <td className="p-4 text-sm" style={{ color: '#1d1d1b' }}>{expense.type}</td>
                  <td className="p-4 text-sm" style={{ color: '#808080' }}>{expense.paidTo}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: getCategoryColor(expense.category) + '20', color: getCategoryColor(expense.category) }}>
                      {getCategoryLabel(expense.category)}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-right font-medium" style={{ color: '#dc3545' }}>{formatCurrency(expense.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#1d1d1b' }}>Registrar Nuevo Gasto</h3>
              <button onClick={() => { setShowExpenseModal(false); setNewExpense({}); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" style={{ color: '#808080' }}>
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Proyecto</label>
                <select value={newExpense.projectId || ''} onChange={(e) => setNewExpense({ ...newExpense, projectId: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }}>
                  <option value="">Selecciona un proyecto</option>
                  {projectsBudget.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Tipo de Gasto</label>
                <input type="text" value={newExpense.type || ''} onChange={(e) => setNewExpense({ ...newExpense, type: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }}
                  placeholder="Ej: Alquiler de equipos, Materiales, etc." />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Categoría</label>
                <select value={newExpense.category || 'other'} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }}>
                  <option value="material">Materiales</option>
                  <option value="service">Servicios</option>
                  <option value="personnel">Personal</option>
                  <option value="transport">Transporte</option>
                  <option value="other">Otros</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Pagado a</label>
                <input type="text" value={newExpense.paidTo || ''} onChange={(e) => setNewExpense({ ...newExpense, paidTo: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }}
                  placeholder="Nombre de proveedor o persona" />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Monto (COP)</label>
                <input type="number" value={newExpense.amount || ''} onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }} placeholder="0" />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: '#1d1d1b' }}>Fecha</label>
                <input type="date" value={newExpense.date || ''} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2" style={{ borderColor: '#e0e0e0' }} />
              </div>
              <div className="flex gap-2 pt-4">
                <button onClick={handleAddExpense} className="flex-1 px-4 py-3 rounded-lg hover:shadow-lg transition-all" style={{ backgroundColor: '#f18517', color: 'white' }}>Registrar Gasto</button>
                <button onClick={() => { setShowExpenseModal(false); setNewExpense({}); }} className="px-4 py-3 rounded-lg border hover:bg-gray-50 transition-colors" style={{ borderColor: '#e0e0e0', color: '#808080' }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}