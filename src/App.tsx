import { useState, useEffect } from 'react';
import AcademyForm from './components/AcademyForm';
import AcademyList from './components/AcademyList';
import EvaluationForm from './components/EvaluationForm';
import EvaluationReport from './components/EvaluationReport';
import KPIManagement from './components/KPIManagement';
import InstallPrompt from './components/InstallPrompt';
import { Building2, ClipboardCheck, FileText, Wifi, WifiOff, RefreshCw, List, Settings } from 'lucide-react';
import { isOnline, syncOfflineData, getOfflineQueue, setupOnlineListener } from './utils/offlineSync';

type View = 'academies' | 'academiesList' | 'evaluation' | 'reports' | 'kpiManagement';

function App() {
  const [currentView, setCurrentView] = useState<View>('evaluation');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [online, setOnline] = useState(isOnline());
  const [syncing, setSyncing] = useState(false);
  const [pendingActions, setPendingActions] = useState(0);

  useEffect(() => {
    const updatePendingActions = () => {
      setPendingActions(getOfflineQueue().length);
    };

    updatePendingActions();
    const interval = setInterval(updatePendingActions, 1000);

    const cleanup = setupOnlineListener(async (isOnlineNow) => {
      setOnline(isOnlineNow);
      if (isOnlineNow) {
        await handleSync();
      }
    });

    return () => {
      clearInterval(interval);
      cleanup();
    };
  }, []);

  const handleSync = async () => {
    if (!isOnline()) {
      return;
    }

    setSyncing(true);
    try {
      const result = await syncOfflineData();
      if (result.success) {
        setPendingActions(0);
      }
    } catch (error) {
      console.error('Error syncing:', error);
    } finally {
      setSyncing(false);
    }
  };

  const navItems = [
    { id: 'evaluation' as View, label: 'Nueva Evaluación', icon: ClipboardCheck },
    { id: 'reports' as View, label: 'Reportes', icon: FileText },
    { id: 'academies' as View, label: 'Nueva Academia', icon: Building2 },
    { id: 'academiesList' as View, label: 'Ver Academias', icon: List },
    { id: 'kpiManagement' as View, label: 'Gestión de KPIs', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => {
                setCurrentView('evaluation');
                setCategoryFilter(undefined);
              }}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">FMF</span>
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-gray-800">Sistema de Evaluación</h1>
                <p className="text-xs text-gray-600">Academias de Fútbol - Federación Mexicana de Fútbol</p>
              </div>
            </button>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {online ? (
                  <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-medium">
                    <Wifi className="w-4 h-4" />
                    En línea
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-lg text-xs font-medium">
                    <WifiOff className="w-4 h-4" />
                    Sin conexión
                  </div>
                )}
                {pendingActions > 0 && (
                  <button
                    onClick={handleSync}
                    disabled={!online || syncing}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-medium hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Sincronizando...' : `${pendingActions} pendiente${pendingActions > 1 ? 's' : ''}`}
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    currentView === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {currentView === 'academies' && <AcademyForm />}
        {currentView === 'academiesList' && (
          <AcademyList
            categoryFilter={categoryFilter}
            onClearFilter={() => setCategoryFilter(undefined)}
          />
        )}
        {currentView === 'kpiManagement' && <KPIManagement />}
        {currentView === 'evaluation' && (
          <EvaluationForm
            onEvaluationComplete={(evaluationId) => {
              setCurrentView('reports');
            }}
          />
        )}
        {currentView === 'reports' && <EvaluationReport />}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-gray-600 text-sm">
            © 2024 Federación Mexicana de Fútbol - Sistema de Evaluación de Academias
          </p>
        </div>
      </footer>

      <InstallPrompt />
    </div>
  );
}

export default App;
