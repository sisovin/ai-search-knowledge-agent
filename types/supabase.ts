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
      documents: {
        Row: {
          id: string
          title: string
          content: string
          url: string
          embedding: number[] | null
          created_at: string
          user_id: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          url: string
          embedding?: number[] | null
          created_at?: string
          user_id?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          url?: string
          embedding?: number[] | null
          created_at?: string
          user_id?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      search_history: {
        Row: {
          id: string
          query: string
          user_id: string
          results: Json | null
          timestamp: string
        }
        Insert: {
          id?: string
          query: string
          user_id: string
          results?: Json | null
          timestamp?: string
        }
        Update: {
          id?: string
          query?: string
          user_id?: string
          results?: Json | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_history_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_documents: {
        Args: {
          query_embedding: number[]
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: string
          title: string
          content: string
          url: string
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
