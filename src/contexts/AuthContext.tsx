import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface Evaluator {
  id: string;
  full_name: string;
  email: string;
  fmf_credential: string;
  status: string;
  role: 'super_admin' | 'admin' | 'evaluator';
}

interface AuthContextType {
  user: User | null;
  evaluator: Evaluator | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, fmfCredential: string, password: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [evaluator, setEvaluator] = useState<Evaluator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadEvaluator(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch((error) => {
      console.error('Error getting session:', error);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadEvaluator(session.user.id);
      } else {
        setEvaluator(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadEvaluator = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('evaluators')
        .select('id, full_name, email, fmf_credential, status, role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error loading evaluator:', error);
        setEvaluator(null);
      } else {
        setEvaluator(data);
      }
    } catch (error) {
      console.error('Error loading evaluator:', error);
      setEvaluator(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signUp = async (fullName: string, email: string, fmfCredential: string, password: string, phone?: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Error creating user');

    const { error: evaluatorError } = await supabase
      .from('evaluators')
      .insert([{
        user_id: authData.user.id,
        full_name: fullName,
        email,
        fmf_credential: fmfCredential,
        phone,
        status: 'active'
      }]);

    if (evaluatorError) throw evaluatorError;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setEvaluator(null);
  };

  const isSuperAdmin = evaluator?.role === 'super_admin';
  const isAdmin = evaluator?.role === 'admin' || isSuperAdmin;

  return (
    <AuthContext.Provider value={{ user, evaluator, loading, isAdmin, isSuperAdmin, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
