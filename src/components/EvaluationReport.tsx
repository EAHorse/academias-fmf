import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Award, TrendingUp, Download, BarChart3, FileSpreadsheet } from 'lucide-react';
import { generateEvaluationPDF } from '../utils/pdfGenerator';
import { calculateCertification, CERTIFICATION_LEVELS } from '../utils/certificationCalculator';
import * as XLSX from 'xlsx';

interface Evaluation {
  id: string;
  evaluation_date: string;
  total_score: number;
  category: string | null;
  status: string;
  notes: string | null;
  academy: {
    name: string;
  };
  evaluator: {
    full_name: string;
    fmf_credential: string;
  };
}

interface EvaluationWithScores extends Evaluation {
  scores: Array<{
    score: number;
    comments: string | null;
    kpi: {
      name: string;
      max_score: number;
      category: {
        name: string;
      };
    };
  }>;
}

export default function EvaluationReport() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationWithScores | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvaluations();
  }, []);

  const loadEvaluations = async () => {
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .select(`
          *,
          academy:academies(name),
          evaluator:evaluators(full_name, fmf_credential)
        `)
        .order('evaluation_date', { ascending: false });

      if (error) throw error;
      if (data) setEvaluations(data as any);
    } catch (error) {
      console.error('Error loading evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEvaluationDetails = async (evaluationId: string) => {
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .select(`
          *,
          academy:academies(name),
          evaluator:evaluators(full_name, fmf_credential),
          scores:evaluation_scores(
            score,
            comments,
            kpi:kpis(
              name,
              max_score,
              category:kpi_categories(name)
            )
          )
        `)
        .eq('id', evaluationId)
        .single();

      if (error) throw error;
      setSelectedEvaluation(data as any);
    } catch (error) {
      console.error('Error loading evaluation details:', error);
    }
  };

  const getCategoryColor = (totalScore: number) => {
    const cert = calculateCertification(totalScore);
    return `${cert.bgColor} ${cert.color}`;
  };

  const getCategoryName = (totalScore: number) => {
    const cert = calculateCertification(totalScore);
    return cert.name;
  };

  const getCategoryIcon = (totalScore: number) => {
    const cert = calculateCertification(totalScore);
    if (cert.minScore >= 850) return <Award className="w-5 h-5" />;
    if (cert.minScore >= 650) return <TrendingUp className="w-5 h-5" />;
    if (cert.minScore >= 450) return <BarChart3 className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const exportToExcel = (evaluation: EvaluationWithScores) => {
    const groupedScores = evaluation.scores.reduce((acc, score) => {
      const categoryName = score.kpi.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(score);
      return acc;
    }, {} as Record<string, typeof evaluation.scores>);

    const summaryData = [
      ['REPORTE DE EVALUACIÓN'],
      [],
      ['Academia:', evaluation.academy.name],
      ['Evaluador:', evaluation.evaluator.full_name],
      ['Credencial:', evaluation.evaluator.fmf_credential],
      ['Fecha:', new Date(evaluation.evaluation_date).toLocaleDateString('es-MX')],
      ['Puntuación Total:', evaluation.total_score.toFixed(2)],
      ['Certificación:', getCategoryName(evaluation.total_score)],
      [],
      ['Notas Generales:', evaluation.notes || 'Sin notas'],
      [],
      []
    ];

    const detailsData = [
      ['DETALLE DE EVALUACIÓN POR CATEGORÍA'],
      []
    ];

    Object.entries(groupedScores).forEach(([categoryName, scores]) => {
      const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
      const maxScore = scores.reduce((sum, s) => sum + s.kpi.max_score, 0);
      const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

      detailsData.push([`CATEGORÍA: ${categoryName}`]);
      detailsData.push([]);
      detailsData.push(['KPI', 'Puntuación', 'Máximo', '% Logro', 'Comentarios']);

      scores.forEach(score => {
        const kpiPercentage = (score.score / score.kpi.max_score) * 100;
        detailsData.push([
          score.kpi.name,
          score.score.toFixed(2),
          score.kpi.max_score.toString(),
          kpiPercentage.toFixed(1) + '%',
          score.comments || 'Sin comentarios'
        ]);
      });

      detailsData.push([]);
      detailsData.push(['TOTAL CATEGORÍA', totalScore.toFixed(2), maxScore.toString(), percentage.toFixed(1) + '%', '']);
      detailsData.push([]);
      detailsData.push([]);
    });

    const wb = XLSX.utils.book_new();

    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    ws1['!cols'] = [{ wch: 20 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, ws1, 'Resumen');

    const ws2 = XLSX.utils.aoa_to_sheet(detailsData);
    ws2['!cols'] = [{ wch: 40 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, ws2, 'Detalle');

    const fileName = `Evaluacion_${evaluation.academy.name.replace(/\s+/g, '_')}_${new Date(evaluation.evaluation_date).toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-center text-gray-600">Cargando evaluaciones...</p>
      </div>
    );
  }

  if (selectedEvaluation) {
    const groupedScores = selectedEvaluation.scores.reduce((acc, score) => {
      const categoryName = score.kpi.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(score);
      return acc;
    }, {} as Record<string, typeof selectedEvaluation.scores>);

    const categoryScores = Object.entries(groupedScores).map(([categoryName, scores]) => {
      const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
      const maxScore = scores.reduce((sum, s) => sum + s.kpi.max_score, 0);
      const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
      return { categoryName, totalScore, maxScore, percentage };
    });

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setSelectedEvaluation(null)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Volver a la lista
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => exportToExcel(selectedEvaluation)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <FileSpreadsheet className="w-5 h-5" />
              Exportar Excel
            </button>
            <button
              onClick={() => generateEvaluationPDF(selectedEvaluation)}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Exportar PDF
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Reporte de Evaluación</h2>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold ${getCategoryColor(selectedEvaluation.total_score)}`}>
              {getCategoryIcon(selectedEvaluation.total_score)}
              {getCategoryName(selectedEvaluation.total_score)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Academia</h3>
              <p className="text-gray-900">{selectedEvaluation.academy.name}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Evaluador</h3>
              <p className="text-gray-900">{selectedEvaluation.evaluator.full_name}</p>
              <p className="text-sm text-gray-600">{selectedEvaluation.evaluator.fmf_credential}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Fecha</h3>
              <p className="text-gray-900">{new Date(selectedEvaluation.evaluation_date).toLocaleDateString('es-MX')}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Puntuación Total</h3>
              <p className="text-3xl font-bold text-gray-900">{selectedEvaluation.total_score.toFixed(2)}</p>
            </div>
          </div>

          {selectedEvaluation.notes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Notas Generales</h3>
              <p className="text-blue-800">{selectedEvaluation.notes}</p>
            </div>
          )}
        </div>

        <div className="mb-6 bg-gray-50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-teal-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Gráfica de Puntuación por Categoría</h3>
          </div>
          <div className="space-y-4">
            {categoryScores.map(({ categoryName, totalScore, maxScore, percentage }) => (
              <div key={categoryName}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700">{categoryName}</span>
                  <span className="text-sm text-gray-600">
                    {totalScore.toFixed(1)} / {maxScore} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-teal-600 h-8 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                    style={{ width: `${percentage}%` }}
                  >
                    {percentage > 15 && (
                      <span className="text-white font-bold text-sm">
                        {percentage.toFixed(0)}%
                      </span>
                    )}
                  </div>
                  {percentage <= 15 && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-bold text-sm">
                      {percentage.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-800">Desglose por Categoría KPI</h3>
          {Object.entries(groupedScores).map(([categoryName, scores]) => (
            <div key={categoryName} className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-bold text-gray-800 mb-4">{categoryName}</h4>
              <div className="space-y-3">
                {scores.map((score, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-gray-800">{score.kpi.name}</span>
                      <span className="text-lg font-bold text-gray-900">
                        {score.score} / {score.kpi.max_score}
                      </span>
                    </div>
                    {score.comments && (
                      <p className="text-sm text-gray-600 italic">{score.comments}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <FileText className="w-6 h-6 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Reportes de Evaluación</h2>
      </div>

      {evaluations.length === 0 ? (
        <p className="text-center text-gray-600 py-8">No hay evaluaciones registradas</p>
      ) : (
        <div className="space-y-3">
          {evaluations.map((evaluation) => (
            <div
              key={evaluation.id}
              onClick={() => loadEvaluationDetails(evaluation.id)}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{evaluation.academy.name}</h3>
                  <p className="text-sm text-gray-600">
                    Evaluador: {evaluation.evaluator.full_name} ({evaluation.evaluator.fmf_credential})
                  </p>
                  <p className="text-sm text-gray-600">
                    Fecha: {new Date(evaluation.evaluation_date).toLocaleDateString('es-MX')}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg font-bold text-sm ${getCategoryColor(evaluation.total_score)}`}>
                    {getCategoryIcon(evaluation.total_score)}
                    {getCategoryName(evaluation.total_score)}
                  </div>
                  <p className="text-lg font-bold text-gray-900 mt-2">
                    {evaluation.total_score.toFixed(2)} / 1000
                  </p>
                  <p className="text-xs text-gray-500">puntos</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
