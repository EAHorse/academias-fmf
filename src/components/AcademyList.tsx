import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, MapPin, Phone, Mail, User, Trash2, X, Award, ExternalLink } from 'lucide-react';

interface Academy {
  id: string;
  name: string;
  address: string | null;
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  certification_category: string | null;
  created_at: string;
}

interface AcademyListProps {
  categoryFilter?: string;
  onClearFilter?: () => void;
}

export default function AcademyList({ categoryFilter, onClearFilter }: AcademyListProps) {
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadAcademies();
  }, [categoryFilter]);

  const loadAcademies = async () => {
    try {
      let query = supabase
        .from('academies')
        .select('*')
        .order('name');

      if (categoryFilter) {
        query = query.eq('certification_category', categoryFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAcademies(data || []);
    } catch (error) {
      console.error('Error loading academies:', error);
      setMessage({ type: 'error', text: 'Error al cargar academias' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar la academia "${name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('academies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Academia eliminada exitosamente' });
      loadAcademies();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Error al eliminar academia'
      });
    }
  };

  const getCategoryColor = (category: string | null) => {
    if (!category) return { bg: 'bg-gray-50', border: 'border-gray-400', text: 'text-gray-900', badge: 'bg-gray-100 text-gray-700' };

    const colors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
      'Elite': { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-900', badge: 'bg-yellow-100 text-yellow-800' },
      'Avanzado': { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-900', badge: 'bg-green-100 text-green-800' },
      'Básico': { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-900', badge: 'bg-blue-100 text-blue-800' },
      'En Desarrollo': { bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-900', badge: 'bg-orange-100 text-orange-800' }
    };
    return colors[category] || { bg: 'bg-gray-50', border: 'border-gray-400', text: 'text-gray-900', badge: 'bg-gray-100 text-gray-700' };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-center text-gray-600">Cargando academias...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {categoryFilter ? `Academias ${categoryFilter}` : 'Academias Registradas'}
              </h2>
              <p className="text-sm text-gray-600">
                {academies.length} academia{academies.length !== 1 ? 's' : ''}
                {categoryFilter ? ` en categoría ${categoryFilter}` : ' en total'}
              </p>
            </div>
          </div>

          {categoryFilter && onClearFilter && (
            <button
              onClick={onClearFilter}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
              Limpiar filtro
            </button>
          )}
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

        {academies.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              {categoryFilter
                ? `No hay academias en la categoría "${categoryFilter}"`
                : 'No hay academias registradas'}
            </p>
            <p className="text-sm text-gray-500">
              {categoryFilter
                ? 'Intenta con otra categoría o limpia el filtro'
                : 'Ve a la sección "Nueva Academia" para registrar una'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {academies.map((academy) => {
              const colors = getCategoryColor(academy.certification_category);

              return (
                <div
                  key={academy.id}
                  className={`${colors.bg} border-2 ${colors.border} rounded-xl p-5 hover:shadow-xl transition-all duration-300 hover:scale-105 group`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-white bg-opacity-60 rounded-lg group-hover:scale-110 transition-transform">
                        <Building2 className="w-6 h-6 text-gray-700" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-2 leading-tight">
                          {academy.name}
                        </h3>
                        {academy.certification_category && (
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
                            <Award className="w-3 h-3" />
                            {academy.certification_category}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(academy.id, academy.name)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Eliminar academia"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 text-sm bg-white bg-opacity-40 rounded-lg p-4">
                    {academy.address && (
                      <div className="flex items-start gap-2 text-gray-700">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="leading-relaxed">{academy.address}</span>
                      </div>
                    )}

                    {academy.contact_person && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <User className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">{academy.contact_person}</span>
                      </div>
                    )}

                    {academy.contact_email && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <a
                          href={`mailto:${academy.contact_email}`}
                          className="truncate hover:underline"
                        >
                          {academy.contact_email}
                        </a>
                      </div>
                    )}

                    {academy.contact_phone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <a
                          href={`tel:${academy.contact_phone}`}
                          className="hover:underline"
                        >
                          {academy.contact_phone}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-300 border-opacity-30 flex items-center justify-between">
                    <p className="text-xs text-gray-600">
                      Registrada: {new Date(academy.created_at).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 font-medium">
                      Ver detalles
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
