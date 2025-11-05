export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      evaluators: {
        Row: {
          id: string
          full_name: string
          email: string
          fmf_credential: string
          phone: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          fmf_credential: string
          phone?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          fmf_credential?: string
          phone?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      academies: {
        Row: {
          id: string
          name: string
          address: string | null
          contact_person: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          contact_person?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          contact_person?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      kpi_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          weight: number
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          weight?: number
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          weight?: number
          order_index?: number
          created_at?: string
        }
      }
      kpis: {
        Row: {
          id: string
          category_id: string
          name: string
          description: string | null
          max_score: number
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          description?: string | null
          max_score?: number
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          description?: string | null
          max_score?: number
          order_index?: number
          created_at?: string
        }
      }
      evaluations: {
        Row: {
          id: string
          academy_id: string
          evaluator_id: string
          evaluation_date: string
          total_score: number
          category: string | null
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          academy_id: string
          evaluator_id: string
          evaluation_date?: string
          total_score?: number
          category?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          academy_id?: string
          evaluator_id?: string
          evaluation_date?: string
          total_score?: number
          category?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      evaluation_scores: {
        Row: {
          id: string
          evaluation_id: string
          kpi_id: string
          score: number
          comments: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          evaluation_id: string
          kpi_id: string
          score?: number
          comments?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          evaluation_id?: string
          kpi_id?: string
          score?: number
          comments?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
