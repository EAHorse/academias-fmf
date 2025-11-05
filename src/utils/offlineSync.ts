import { supabase } from '../lib/supabase';

const OFFLINE_QUEUE_KEY = 'offline_queue';
const CACHED_DATA_KEY = 'cached_data';

interface OfflineAction {
  id: string;
  table: string;
  action: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

export function isOnline(): boolean {
  return navigator.onLine;
}

export async function queueOfflineAction(table: string, action: 'insert' | 'update' | 'delete', data: any) {
  const queue = getOfflineQueue();
  const newAction: OfflineAction = {
    id: crypto.randomUUID(),
    table,
    action,
    data,
    timestamp: Date.now()
  };
  queue.push(newAction);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  return newAction;
}

export function getOfflineQueue(): OfflineAction[] {
  const queue = localStorage.getItem(OFFLINE_QUEUE_KEY);
  return queue ? JSON.parse(queue) : [];
}

export function clearOfflineQueue() {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
}

export async function syncOfflineData() {
  if (!isOnline()) {
    return { success: false, message: 'No hay conexión a internet' };
  }

  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { success: true, message: 'No hay datos para sincronizar' };
  }

  const results = [];
  const failedActions: OfflineAction[] = [];

  for (const action of queue) {
    try {
      if (action.action === 'insert') {
        const { error } = await supabase.from(action.table).insert([action.data]);
        if (error) throw error;
      } else if (action.action === 'update') {
        const { error } = await supabase.from(action.table).update(action.data).eq('id', action.data.id);
        if (error) throw error;
      } else if (action.action === 'delete') {
        const { error } = await supabase.from(action.table).delete().eq('id', action.data.id);
        if (error) throw error;
      }
      results.push({ success: true, action });
    } catch (error) {
      console.error('Error syncing action:', error);
      failedActions.push(action);
      results.push({ success: false, action, error });
    }
  }

  if (failedActions.length > 0) {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(failedActions));
    return {
      success: false,
      message: `${results.filter(r => r.success).length} de ${queue.length} acciones sincronizadas`,
      results
    };
  }

  clearOfflineQueue();
  return {
    success: true,
    message: `Todas las ${queue.length} acciones sincronizadas exitosamente`,
    results
  };
}

export function cacheData(key: string, data: any) {
  const cache = getCachedData();
  cache[key] = {
    data,
    timestamp: Date.now()
  };
  localStorage.setItem(CACHED_DATA_KEY, JSON.stringify(cache));
}

export function getCachedData(key?: string) {
  const cache = localStorage.getItem(CACHED_DATA_KEY);
  const parsed = cache ? JSON.parse(cache) : {};

  if (key) {
    return parsed[key]?.data || null;
  }

  return parsed;
}

export function clearCache(key?: string) {
  if (key) {
    const cache = getCachedData();
    delete cache[key];
    localStorage.setItem(CACHED_DATA_KEY, JSON.stringify(cache));
  } else {
    localStorage.removeItem(CACHED_DATA_KEY);
  }
}

export function setupOnlineListener(callback: (isOnline: boolean) => void) {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));

  return () => {
    window.removeEventListener('online', () => callback(true));
    window.removeEventListener('offline', () => callback(false));
  };
}
