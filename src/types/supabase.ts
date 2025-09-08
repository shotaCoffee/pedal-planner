// Supabase Generated Types
// この型定義は実際のSupabaseプロジェクト作成後に、Supabase CLI で生成し直すことを推奨

import { LayoutData } from '../types'

export interface Database {
  public: {
    Tables: {
      effects: {
        Row: {
          id: string
          user_id: string
          name: string
          width_mm: number
          height_mm: number
          memo: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          width_mm: number
          height_mm: number
          memo?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          width_mm?: number
          height_mm?: number
          memo?: string | null
          created_at?: string
        }
      }
      boards: {
        Row: {
          id: string
          user_id: string
          name: string
          width_mm: number
          height_mm: number
          memo: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          width_mm: number
          height_mm: number
          memo?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          width_mm?: number
          height_mm?: number
          memo?: string | null
          created_at?: string
        }
      }
      layouts: {
        Row: {
          id: string
          user_id: string
          board_id: string
          name: string
          layout_data: LayoutData // JSONB
          signal_chain_memo: string | null
          general_memo: string | null
          share_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          board_id: string
          name: string
          layout_data: LayoutData
          signal_chain_memo?: string | null
          general_memo?: string | null
          share_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          board_id?: string
          name?: string
          layout_data?: LayoutData
          signal_chain_memo?: string | null
          general_memo?: string | null
          share_code?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}