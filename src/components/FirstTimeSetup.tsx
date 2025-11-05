import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, AlertCircle } from 'lucide-react';

export default function FirstTimeSetup() {
  const [needsSetup, setNeedsSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: 'superadmin@fmf.local',
    password: 'superadmin1994'
  });

  useEffect(() => {
    checkIfSuperAdminExists();
  }, []);

  const checkIfSuperAdminExists = async () => {
    try {
      const { data, error } = await supabase
        .from('evaluators')
        .select('id')
        .eq('role', 'super_admin')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking super admin:', error);
      }

      setNeedsSetup(!data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Error al crear usuario super administrador');

      const { error: evaluatorError } = await supabase
        .from('evaluators')
        .insert([{
          user_id: authData.user.id,
          full_name: 'Super Administrador',
          email: formData.email,
          fmf_credential: 'SUPER-ADMIN',
          role: 'super_admin',
          status: 'active'
        }]);

      if (evaluatorError) throw evaluatorError;

      setNeedsSetup(false);
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Error al crear super administrador');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!needsSetup) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Configuración Inicial
          </h2>
          <p className="text-gray-600">
            No existe un super administrador en el sistema. Crea las credenciales para continuar.
          </p>
        </div>

        <form onSubmit={createSuperAdmin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="superadmin@fmf.local"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Importante:</p>
                <p>El super administrador es el único que puede crear otros administradores. Guarda estas credenciales en un lugar seguro.</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={creating}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {creating ? 'Creando...' : 'Crear Super Administrador'}
          </button>
        </form>
      </div>
    </div>
  );
}
