import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus } from 'lucide-react';

export default function EvaluatorRegistration() {
  const { isSuperAdmin } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    fmf_credential: '',
    phone: '',
    password: '',
    role: 'evaluator' as 'super_admin' | 'admin' | 'evaluator'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Error creating user');

      const { error: evaluatorError } = await supabase
        .from('evaluators')
        .insert([{
          user_id: authData.user.id,
          full_name: formData.full_name,
          email: formData.email,
          fmf_credential: formData.fmf_credential,
          phone: formData.phone,
          role: formData.role,
          status: 'active'
        }]);

      if (evaluatorError) throw evaluatorError;

      setMessage({ type: 'success', text: 'Evaluador registrado exitosamente' });
      setFormData({ full_name: '', email: '', fmf_credential: '', phone: '', password: '', role: 'evaluator' });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Error al registrar evaluador'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <UserPlus className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Registro de Evaluador FMF</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre Completo *
          </label>
          <input
            type="text"
            required
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Juan Pérez García"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo Electrónico *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="evaluador@ejemplo.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Credencial FMF *
          </label>
          <input
            type="text"
            required
            value={formData.fmf_credential}
            onChange={(e) => setFormData({ ...formData, fmf_credential: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="FMF-2024-001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="+52 55 1234 5678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña *
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rol *
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as 'super_admin' | 'admin' | 'evaluator' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="evaluator">Evaluador</option>
            {isSuperAdmin && <option value="admin">Administrador</option>}
          </select>
          <p className="mt-1 text-sm text-gray-600">
            {formData.role === 'evaluator' && (
              <><strong>Evaluador:</strong> Solo puede crear evaluaciones y ver sus reportes.</>
            )}
            {formData.role === 'admin' && (
              <><strong>Administrador:</strong> Acceso completo al sistema incluyendo gestión de KPIs, academias y evaluadores.</>
            )}
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Registrando...' : 'Registrar Evaluador'}
        </button>
      </form>
    </div>
  );
}
