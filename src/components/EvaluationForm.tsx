import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ClipboardCheck, Save, Send } from 'lucide-react';

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

interface Academy {
  id: string;
  name: string;
}

interface Evaluator {
  id: string;
  full_name: string;
  fmf_credential: string;
}

interface Score {
  kpi_id: string;
  score: number;
  comments: string;
}

interface EvaluationFormProps {
  onEvaluationComplete?: (evaluationId: string) => void;
}

export default function EvaluationForm({ onEvaluationComplete }: EvaluationFormProps) {
  const [categories, setCategories] = useState<KPICategory[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [selectedAcademy, setSelectedAcademy] = useState('');
  const [evaluationDate, setEvaluationDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [scores, setScores] = useState<Record<string, Score>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, kpisRes, academiesRes] = await Promise.all([
        supabase.from('kpi_categories').select('*').order('order_index'),
        supabase.from('kpis').select('*').order('order_index'),
        supabase.from('academies').select('id, name').order('name')
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (kpisRes.data) {
        setKpis(kpisRes.data);
        const initialScores: Record<string, Score> = {};
        kpisRes.data.forEach(kpi => {
          initialScores[kpi.id] = { kpi_id: kpi.id, score: 0, comments: '' };
        });
        setScores(initialScores);
      }
      if (academiesRes.data) setAcademies(academiesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const updateScore = (kpiId: string, field: 'score' | 'comments', value: number | string) => {
    if (field === 'score') {
      const numValue = typeof value === 'number' ? value : parseFloat(value as string);

      if (numValue < 0) {
        alert('La puntuación no puede ser menor a 0');
        return;
      }

      if (numValue > 10) {
        alert('La puntuación no puede ser mayor a 10');
        return;
      }
    }

    setScores(prev => ({
      ...prev,
      [kpiId]: {
        ...prev[kpiId],
        [field]: value
      }
    }));
  };

  const saveEvaluation = async (status: 'draft' | 'completed') => {
    if (!selectedAcademy) {
      setMessage({ type: 'error', text: 'Debe seleccionar una academia' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { data: evaluation, error: evalError } = await supabase
        .from('evaluations')
        .insert([{
          academy_id: selectedAcademy,
          evaluator_id: '00000000-0000-0000-0000-000000000001',
          evaluation_date: evaluationDate,
          status,
          notes
        }])
        .select()
        .single();

      if (evalError) throw evalError;

      const scoreRecords = Object.values(scores).map(score => ({
        evaluation_id: evaluation.id,
        kpi_id: score.kpi_id,
        score: score.score,
        comments: score.comments
      }));

      const { error: scoresError } = await supabase
        .from('evaluation_scores')
        .insert(scoreRecords);

      if (scoresError) throw scoresError;

      setMessage({
        type: 'success',
        text: status === 'draft' ? 'Evaluación guardada como borrador' : 'Evaluación completada exitosamente'
      });

      if (status === 'completed' && onEvaluationComplete) {
        setTimeout(() => {
          onEvaluationComplete(evaluation.id);
        }, 1500);
      } else {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Error al guardar la evaluación'
      });
    } finally {
      setLoading(false);
    }
  };

  const getKPIsByCategory = (categoryId: string) => {
    return kpis.filter(kpi => kpi.category_id === categoryId);
  };

  const calculateCategoryProgress = (categoryId: string) => {
    const categoryKpis = getKPIsByCategory(categoryId);
    if (categoryKpis.length === 0) return 0;

    const totalScore = categoryKpis.reduce((sum, kpi) => sum + (scores[kpi.id]?.score || 0), 0);
    const maxPossibleScore = categoryKpis.length * 10;

    return maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
  };

  const calculateOverallProgress = () => {
    if (categories.length === 0) return 0;

    const weightedSum = categories.reduce((sum, category) => {
      const progress = calculateCategoryProgress(category.id);
      return sum + (progress * category.weight / 100);
    }, 0);

    return Math.round(weightedSum);
  };

  const overallProgress = calculateOverallProgress();

  return (
    <div className="space-y-6">
      {/* Progress Header - Sticky */}
      <div className="sticky top-0 z-10 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-b-2xl shadow-lg border border-emerald-100 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-md">
            <ClipboardCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Formulario de Evaluación</h2>
            <p className="text-xs text-gray-600">Completa cada sección para generar el reporte</p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mb-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-700">Progreso General</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-emerald-600">{overallProgress}%</span>
              {overallProgress === 100 && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">Completo</span>
              )}
            </div>
          </div>
          <div className="relative w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
          </div>
        </div>

        {/* Category Progress */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {categories.map(category => {
            const progress = calculateCategoryProgress(category.id);
            const isComplete = progress === 100;
            return (
              <div key={category.id} className="bg-white rounded-lg p-2 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-semibold text-gray-700 leading-tight">{category.name}</span>
                  <div className="flex items-center gap-1 ml-1">
                    <span className={`text-sm font-bold ${
                      isComplete ? 'text-emerald-600' :
                      progress >= 50 ? 'text-teal-600' :
                      progress > 0 ? 'text-amber-600' : 'text-gray-400'
                    }`}>{progress}%</span>
                    {isComplete && (
                      <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="relative w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out ${
                      isComplete ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                      progress >= 50 ? 'bg-gradient-to-r from-teal-500 to-cyan-500' :
                      progress > 0 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gray-300'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academia *
            </label>
            <select
              value={selectedAcademy}
              onChange={(e) => setSelectedAcademy(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              required
            >
              <option value="">Seleccionar academia</option>
              {academies.map(academy => (
                <option key={academy.id} value={academy.id}>
                  {academy.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Evaluación
            </label>
            <input
              type="date"
              value={evaluationDate}
              onChange={(e) => setEvaluationDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {categories.map(category => {
          const categoryKpis = getKPIsByCategory(category.id);
          return (
            <div key={category.id} className="border-2 border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-gray-50 to-white hover:shadow-md transition-all duration-200">
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-800">{category.name}</h3>
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 text-xs font-bold rounded-full shadow-sm">
                    Peso: {category.weight}%
                  </span>
                </div>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>

              <div className="space-y-4">
                {categoryKpis.map(kpi => (
                  <div key={kpi.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-colors duration-200">
                    <div className="mb-3">
                      <h4 className="font-semibold text-gray-800">{kpi.name}</h4>
                      <p className="text-sm text-gray-600">{kpi.description}</p>
                      <span className="text-xs text-gray-500">Puntuación máxima: {kpi.max_score}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Puntuación (0-10)
                        </label>
                        <select
                          value={scores[kpi.id]?.score || 0}
                          onChange={(e) => updateScore(kpi.id, 'score', parseFloat(e.target.value))}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-colors font-medium"
                        >
                          <option value="0">0 - No cumple</option>
                          <option value="1">1 - Muy deficiente</option>
                          <option value="2">2 - Deficiente</option>
                          <option value="3">3 - Insuficiente</option>
                          <option value="4">4 - Regular bajo</option>
                          <option value="5">5 - Regular</option>
                          <option value="6">6 - Aceptable</option>
                          <option value="7">7 - Bueno</option>
                          <option value="8">8 - Muy bueno</option>
                          <option value="9">9 - Excelente</option>
                          <option value="10">10 - Sobresaliente</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Comentarios
                        </label>
                        <input
                          type="text"
                          value={scores[kpi.id]?.comments || ''}
                          onChange={(e) => updateScore(kpi.id, 'comments', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                          placeholder="Observaciones"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas Generales
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
            placeholder="Observaciones generales de la evaluación..."
          />
        </div>

        {message && (
          <div className={`p-4 rounded-xl font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-2 border-rose-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button
            onClick={() => saveEvaluation('draft')}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 rounded-xl font-bold hover:from-gray-700 hover:to-gray-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <Save className="w-5 h-5" />
            Guardar Borrador
          </button>

          <button
            onClick={() => saveEvaluation('completed')}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <Send className="w-5 h-5" />
            Completar Evaluación
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
