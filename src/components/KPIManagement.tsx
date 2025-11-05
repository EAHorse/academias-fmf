import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Settings, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface KPICategory {
  id: string;
  name: string;
  description: string | null;
  weight: number;
  order_index: number;
}

interface KPI {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  max_score: number;
  order_index: number;
}

export default function KPIManagement() {
  const [categories, setCategories] = useState<KPICategory[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingKPI, setEditingKPI] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState(false);
  const [newKPI, setNewKPI] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    weight: 0,
    order_index: 0
  });

  const [kpiForm, setKpiForm] = useState({
    category_id: '',
    name: '',
    description: '',
    max_score: 10,
    order_index: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, kpisRes] = await Promise.all([
        supabase.from('kpi_categories').select('*').order('order_index'),
        supabase.from('kpis').select('*').order('order_index')
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (kpisRes.data) setKpis(kpisRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveCategory = async () => {
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('kpi_categories')
          .update(categoryForm)
          .eq('id', editingCategory);

        if (error) throw error;
        setMessage({ type: 'success', text: 'Categoría actualizada exitosamente' });
      } else {
        const { error } = await supabase
          .from('kpi_categories')
          .insert([categoryForm]);

        if (error) throw error;
        setMessage({ type: 'success', text: 'Categoría creada exitosamente' });
      }

      setEditingCategory(null);
      setNewCategory(false);
      setCategoryForm({ name: '', description: '', weight: 0, order_index: 0 });
      loadData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al guardar categoría' });
    }
  };

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar la categoría "${name}"?`)) return;

    try {
      const { error } = await supabase
        .from('kpi_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Categoría eliminada exitosamente' });
      loadData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al eliminar categoría' });
    }
  };

  const saveKPI = async () => {
    try {
      if (editingKPI) {
        const { error } = await supabase
          .from('kpis')
          .update(kpiForm)
          .eq('id', editingKPI);

        if (error) throw error;
        setMessage({ type: 'success', text: 'KPI actualizado exitosamente' });
      } else {
        const { error } = await supabase
          .from('kpis')
          .insert([kpiForm]);

        if (error) throw error;
        setMessage({ type: 'success', text: 'KPI creado exitosamente' });
      }

      setEditingKPI(null);
      setNewKPI(null);
      setKpiForm({ category_id: '', name: '', description: '', max_score: 10, order_index: 0 });
      loadData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al guardar KPI' });
    }
  };

  const deleteKPI = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar el KPI "${name}"?`)) return;

    try {
      const { error } = await supabase
        .from('kpis')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'KPI eliminado exitosamente' });
      loadData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al eliminar KPI' });
    }
  };

  const startEditCategory = (category: KPICategory) => {
    setEditingCategory(category.id);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      weight: category.weight,
      order_index: category.order_index
    });
  };

  const startEditKPI = (kpi: KPI) => {
    setEditingKPI(kpi.id);
    setKpiForm({
      category_id: kpi.category_id,
      name: kpi.name,
      description: kpi.description || '',
      max_score: kpi.max_score,
      order_index: kpi.order_index
    });
  };

  const getKPIsByCategory = (categoryId: string) => {
    return kpis.filter(kpi => kpi.category_id === categoryId);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Settings className="w-6 h-6 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Gestión de KPIs</h2>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Categorías de KPI</h3>
          <button
            onClick={() => {
              setNewCategory(true);
              setCategoryForm({ name: '', description: '', weight: 0, order_index: categories.length + 1 });
            }}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva Categoría
          </button>
        </div>

        {newCategory && (
          <div className="border border-orange-200 rounded-lg p-4 mb-4 bg-orange-50">
            <h4 className="font-bold text-gray-800 mb-3">Nueva Categoría</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Peso (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={categoryForm.weight}
                  onChange={(e) => setCategoryForm({ ...categoryForm, weight: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveCategory}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                Guardar
              </button>
              <button
                onClick={() => {
                  setNewCategory(false);
                  setCategoryForm({ name: '', description: '', weight: 0, order_index: 0 });
                }}
                className="flex items-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {categories.map(category => (
            <div key={category.id} className="border border-gray-200 rounded-lg p-4">
              {editingCategory === category.id ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <input
                        type="text"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Peso (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={categoryForm.weight}
                        onChange={(e) => setCategoryForm({ ...categoryForm, weight: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                      <textarea
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveCategory}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      <Save className="w-4 h-4" />
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="flex items-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg">{category.name}</h4>
                      <p className="text-sm text-gray-600">{category.description}</p>
                      <span className="inline-block mt-1 px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
                        Peso: {category.weight}%
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditCategory(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id, category.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-semibold text-gray-700">Criterios de Evaluación</h5>
                      <button
                        onClick={() => {
                          setNewKPI(category.id);
                          setKpiForm({
                            category_id: category.id,
                            name: '',
                            description: '',
                            max_score: 10,
                            order_index: getKPIsByCategory(category.id).length + 1
                          });
                        }}
                        className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar Criterio
                      </button>
                    </div>

                    {newKPI === category.id && (
                      <div className="border border-blue-200 rounded-lg p-3 mb-2 bg-blue-50">
                        <div className="grid grid-cols-1 gap-2 mb-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del Criterio</label>
                            <input
                              type="text"
                              value={kpiForm.name}
                              onChange={(e) => setKpiForm({ ...kpiForm, name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
                            <textarea
                              value={kpiForm.description}
                              onChange={(e) => setKpiForm({ ...kpiForm, description: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              rows={2}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={saveKPI}
                            className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 text-sm"
                          >
                            <Save className="w-3 h-3" />
                            Guardar
                          </button>
                          <button
                            onClick={() => setNewKPI(null)}
                            className="flex items-center gap-1 bg-gray-300 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-400 text-sm"
                          >
                            <X className="w-3 h-3" />
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {getKPIsByCategory(category.id).map(kpi => (
                        <div key={kpi.id} className="bg-gray-50 rounded-lg p-3">
                          {editingKPI === kpi.id ? (
                            <div>
                              <div className="grid grid-cols-1 gap-2 mb-2">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
                                  <input
                                    type="text"
                                    value={kpiForm.name}
                                    onChange={(e) => setKpiForm({ ...kpiForm, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
                                  <textarea
                                    value={kpiForm.description}
                                    onChange={(e) => setKpiForm({ ...kpiForm, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    rows={2}
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={saveKPI}
                                  className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 text-sm"
                                >
                                  <Save className="w-3 h-3" />
                                  Guardar
                                </button>
                                <button
                                  onClick={() => setEditingKPI(null)}
                                  className="flex items-center gap-1 bg-gray-300 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-400 text-sm"
                                >
                                  <X className="w-3 h-3" />
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h6 className="font-semibold text-gray-800 text-sm">{kpi.name}</h6>
                                <p className="text-xs text-gray-600">{kpi.description}</p>
                                <span className="text-xs text-gray-500">Max: {kpi.max_score} puntos</span>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => startEditKPI(kpi)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => deleteKPI(kpi.id, kpi.name)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
