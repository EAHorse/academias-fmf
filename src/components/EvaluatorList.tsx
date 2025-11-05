import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, Mail, Phone, Award, Shield, Trash2 } from 'lucide-react';

interface Evaluator {
  id: string;
  full_name: string;
  email: string;
  fmf_credential: string;
  phone: string | null;
  status: string;
  created_at: string;
}

export default function EvaluatorList() {
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadEvaluators();
  }, []);

  const loadEvaluators = async () => {
    try {
      const { data, error } = await supabase
        .from('evaluators')
        .select('*')
        .order('full_name');

      if (error) throw error;
      setEvaluators(data || []);
    } catch (error) {
      console.error('Error loading evaluators:', error);
      setMessage({ type: 'error', text: 'Error al cargar evaluadores' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar al evaluador "${name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('evaluators')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Evaluador eliminado exitosamente' });
      loadEvaluators();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Error al eliminar evaluador'
      });
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
      const { error } = await supabase
        .from('evaluators')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: `Evaluador ${newStatus === 'active' ? 'activado' : 'desactivado'} exitosamente`
      });
      loadEvaluators();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Error al cambiar estado'
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-center text-gray-600">Cargando evaluadores...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <UserPlus className="w-6 h-6 text-green-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800">Evaluadores Registrados</h2>
          <p className="text-sm text-gray-600">
            {evaluators.length} evaluador{evaluators.length !== 1 ? 'es' : ''} en total
            {evaluators.filter(e => e.status === 'active').length > 0 &&
              ` (${evaluators.filter(e => e.status === 'active').length} activo${evaluators.filter(e => e.status === 'active').length !== 1 ? 's' : ''})`
            }
          </p>
        </div>
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

      {evaluators.length === 0 ? (
        <div className="text-center py-12">
          <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No hay evaluadores registrados</p>
          <p className="text-sm text-gray-500">Los evaluadores pueden registrarse desde la pantalla de login</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {evaluators.map((evaluator) => (
            <div
              key={evaluator.id}
              className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                evaluator.status === 'active'
                  ? 'border-gray-200 bg-white'
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    evaluator.status === 'active'
                      ? 'bg-green-50'
                      : 'bg-gray-200'
                  }`}>
                    <Award className={`w-5 h-5 ${
                      evaluator.status === 'active'
                        ? 'text-green-600'
                        : 'text-gray-500'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{evaluator.full_name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Shield className="w-3 h-3 text-blue-600" />
                      <span className="text-xs text-blue-600 font-semibold">
                        {evaluator.fmf_credential}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleStatus(evaluator.id, evaluator.status)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      evaluator.status === 'active'
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {evaluator.status === 'active' ? 'Activo' : 'Inactivo'}
                  </button>
                  <button
                    onClick={() => handleDelete(evaluator.id, evaluator.full_name)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Eliminar evaluador"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{evaluator.email}</span>
                </div>

                {evaluator.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{evaluator.phone}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Registrado: {new Date(evaluator.created_at).toLocaleDateString('es-MX')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
