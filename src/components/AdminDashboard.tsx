import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart3, Users, Building2, ClipboardCheck, TrendingUp, ChevronRight, Award } from 'lucide-react';

interface Stats {
  totalEvaluators: number;
  activeEvaluators: number;
  totalAcademies: number;
  academiesByCategory: Record<string, number>;
  totalEvaluations: number;
  completedEvaluations: number;
  averageScore: number;
  categoryDistribution: Record<string, number>;
}

interface AdminDashboardProps {
  onNavigate?: (view: string, filter?: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [stats, setStats] = useState<Stats>({
    totalEvaluators: 0,
    activeEvaluators: 0,
    totalAcademies: 0,
    academiesByCategory: {},
    totalEvaluations: 0,
    completedEvaluations: 0,
    averageScore: 0,
    categoryDistribution: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [evaluatorsRes, academiesRes, evaluationsRes] = await Promise.all([
        supabase.from('evaluators').select('status'),
        supabase.from('academies').select('id, certification_category'),
        supabase.from('evaluations').select('status, total_score, category')
      ]);

      const totalEvaluators = evaluatorsRes.data?.length || 0;
      const activeEvaluators = evaluatorsRes.data?.filter(e => e.status === 'active').length || 0;
      const totalAcademies = academiesRes.data?.length || 0;

      const academiesByCategory: Record<string, number> = {};
      academiesRes.data?.forEach(academy => {
        if (academy.certification_category) {
          academiesByCategory[academy.certification_category] =
            (academiesByCategory[academy.certification_category] || 0) + 1;
        }
      });

      const totalEvaluations = evaluationsRes.data?.length || 0;
      const completedEvaluations = evaluationsRes.data?.filter(e => e.status === 'completed').length || 0;

      const completedEvals = evaluationsRes.data?.filter(e => e.status === 'completed') || [];
      const averageScore = completedEvals.length > 0
        ? completedEvals.reduce((sum, e) => sum + e.total_score, 0) / completedEvals.length
        : 0;

      const categoryDistribution: Record<string, number> = {};
      completedEvals.forEach(e => {
        if (e.category) {
          categoryDistribution[e.category] = (categoryDistribution[e.category] || 0) + 1;
        }
      });

      setStats({
        totalEvaluators,
        activeEvaluators,
        totalAcademies,
        academiesByCategory,
        totalEvaluations,
        completedEvaluations,
        averageScore,
        categoryDistribution
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
      'Elite': { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-900', icon: 'bg-yellow-100 text-yellow-600' },
      'Avanzado': { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-900', icon: 'bg-green-100 text-green-600' },
      'Básico': { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-900', icon: 'bg-blue-100 text-blue-600' },
      'En Desarrollo': { bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-900', icon: 'bg-orange-100 text-orange-600' }
    };
    return colors[category] || { bg: 'bg-gray-50', border: 'border-gray-400', text: 'text-gray-900', icon: 'bg-gray-100 text-gray-600' };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-center text-gray-600">Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-xl p-8 text-white">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
            <BarChart3 className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Dashboard Administrativo</h1>
            <p className="text-blue-100 mt-1">Sistema de Evaluación de Academias de Fútbol - FMF</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => onNavigate?.('evaluatorsList')}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 hover:scale-105 text-left group"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-600 font-semibold">Evaluadores</p>
              </div>
              <p className="text-4xl font-bold text-gray-900">{stats.activeEvaluators}</p>
              <p className="text-xs text-gray-500 mt-1">de {stats.totalEvaluators} activos</p>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-green-600 transition-colors" />
          </div>
        </button>

        <button
          onClick={() => onNavigate?.('academiesList')}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 hover:scale-105 text-left group"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600 font-semibold">Academias</p>
              </div>
              <p className="text-4xl font-bold text-gray-900">{stats.totalAcademies}</p>
              <p className="text-xs text-gray-500 mt-1">registradas en el sistema</p>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </button>

        <button
          onClick={() => onNavigate?.('reports')}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-all duration-300 hover:scale-105 text-left group"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                  <ClipboardCheck className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-sm text-gray-600 font-semibold">Evaluaciones</p>
              </div>
              <p className="text-4xl font-bold text-gray-900">{stats.completedEvaluations}</p>
              <p className="text-xs text-gray-500 mt-1">de {stats.totalEvaluations} completadas</p>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-orange-600 transition-colors" />
          </div>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-teal-100 rounded-lg">
            <Award className="w-6 h-6 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Academias por Categoría</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['Elite', 'Avanzado', 'Básico', 'En Desarrollo'].map((category) => {
            const count = stats.academiesByCategory[category] || 0;
            const colors = getCategoryColor(category);
            const scoreRange = {
              'Elite': '90-100 pts',
              'Avanzado': '75-89 pts',
              'Básico': '60-74 pts',
              'En Desarrollo': '0-59 pts'
            }[category];

            return (
              <button
                key={category}
                onClick={() => onNavigate?.('academiesList', category)}
                className={`${colors.bg} ${colors.border} border-l-4 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:scale-105 text-left group`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 ${colors.icon} rounded-lg group-hover:scale-110 transition-transform`}>
                    <Award className="w-5 h-5" />
                  </div>
                  <ChevronRight className={`w-5 h-5 ${colors.text} opacity-50 group-hover:opacity-100 transition-opacity`} />
                </div>
                <h3 className={`font-bold text-lg ${colors.text} mb-1`}>{category}</h3>
                <div className="flex items-baseline gap-2">
                  <p className={`text-3xl font-bold ${colors.text}`}>{count}</p>
                  <span className="text-sm text-gray-600">academias</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">{scoreRange}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-teal-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-teal-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Puntuación Promedio</h2>
          </div>
          <div className="text-center py-8">
            <div className="relative inline-block">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(stats.averageScore / 100) * 439.8} 439.8`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#0d9488" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}</p>
                  <p className="text-sm text-gray-600">/ 100</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">Promedio de todas las evaluaciones completadas</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Distribución de Evaluaciones</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(stats.categoryDistribution).length > 0 ? (
              Object.entries(stats.categoryDistribution)
                .sort(([, a], [, b]) => b - a)
                .map(([category, count]) => {
                  const percentage = (count / stats.completedEvaluations) * 100;
                  const colors = getCategoryColor(category);
                  return (
                    <div key={category} className="group">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${colors.icon.split(' ')[0]}`}></div>
                          <span className="text-sm font-semibold text-gray-700">{category}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{count} <span className="text-gray-500 font-normal">({percentage.toFixed(1)}%)</span></span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`${colors.icon.split(' ')[0]} h-3 rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="text-center py-8">
                <ClipboardCheck className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No hay evaluaciones completadas aún</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Award className="w-6 h-6 text-blue-600" />
          Sistema de Categorización
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { category: 'Elite', range: '90-100', description: 'Excelencia en infraestructura y metodología de primer nivel' },
            { category: 'Avanzado', range: '75-89', description: 'Alto nivel de calidad en servicios y formación deportiva' },
            { category: 'Básico', range: '60-74', description: 'Fundamentos sólidos con áreas de mejora identificadas' },
            { category: 'En Desarrollo', range: '0-59', description: 'En proceso de mejora con necesidad de reforzar aspectos clave' }
          ].map(({ category, range, description }) => {
            const colors = getCategoryColor(category);
            return (
              <div key={category} className={`${colors.bg} ${colors.border} border-l-4 rounded-lg p-4`}>
                <h3 className={`font-bold text-lg ${colors.text} mb-1`}>{category}</h3>
                <p className={`text-sm font-semibold ${colors.text} mb-2`}>{range} puntos</p>
                <p className="text-xs text-gray-700 leading-relaxed">{description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
