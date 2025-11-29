export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      company_price: {
        Row: {
          attivo: boolean
          billable_rate: number
          created_at: string
          id: string
          prezzo_giornaliero: number
          ruolo: string
          updated_at: string
        }
        Insert: {
          attivo?: boolean
          billable_rate: number
          created_at?: string
          id?: string
          prezzo_giornaliero: number
          ruolo: string
          updated_at?: string
        }
        Update: {
          attivo?: boolean
          billable_rate?: number
          created_at?: string
          id?: string
          prezzo_giornaliero?: number
          ruolo?: string
          updated_at?: string
        }
        Relationships: []
      }
      costi_fissi: {
        Row: {
          attivo: boolean
          categoria: string
          created_at: string
          giorno_scadenza: number
          id: string
          importo_mensile: number
          note: string | null
          updated_at: string
          voce: string
        }
        Insert: {
          attivo?: boolean
          categoria: string
          created_at?: string
          giorno_scadenza: number
          id?: string
          importo_mensile: number
          note?: string | null
          updated_at?: string
          voce: string
        }
        Update: {
          attivo?: boolean
          categoria?: string
          created_at?: string
          giorno_scadenza?: number
          id?: string
          importo_mensile?: number
          note?: string | null
          updated_at?: string
          voce?: string
        }
        Relationships: []
      }
      fasi_progetto: {
        Row: {
          categoria: string
          created_at: string
          data_effettiva: string | null
          data_prevista: string
          fase: string
          id: string
          importo: number
          note: string | null
          progetto_id: string
          stato: Database["public"]["Enums"]["stato_movimento"]
          tipo: Database["public"]["Enums"]["tipo_movimento"]
          updated_at: string
        }
        Insert: {
          categoria: string
          created_at?: string
          data_effettiva?: string | null
          data_prevista: string
          fase: string
          id?: string
          importo: number
          note?: string | null
          progetto_id: string
          stato?: Database["public"]["Enums"]["stato_movimento"]
          tipo: Database["public"]["Enums"]["tipo_movimento"]
          updated_at?: string
        }
        Update: {
          categoria?: string
          created_at?: string
          data_effettiva?: string | null
          data_prevista?: string
          fase?: string
          id?: string
          importo?: number
          note?: string | null
          progetto_id?: string
          stato?: Database["public"]["Enums"]["stato_movimento"]
          tipo?: Database["public"]["Enums"]["tipo_movimento"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fasi_progetto_progetto_id_fkey"
            columns: ["progetto_id"]
            isOneToOne: false
            referencedRelation: "progetti"
            referencedColumns: ["id"]
          },
        ]
      }
      movimenti_fissi: {
        Row: {
          categoria: string
          costo_fisso_id: string
          created_at: string
          data_effettiva: string | null
          data_prevista: string
          id: string
          importo: number
          mese: string
          note: string | null
          stato: Database["public"]["Enums"]["stato_movimento"]
          updated_at: string
        }
        Insert: {
          categoria: string
          costo_fisso_id: string
          created_at?: string
          data_effettiva?: string | null
          data_prevista: string
          id?: string
          importo: number
          mese: string
          note?: string | null
          stato?: Database["public"]["Enums"]["stato_movimento"]
          updated_at?: string
        }
        Update: {
          categoria?: string
          costo_fisso_id?: string
          created_at?: string
          data_effettiva?: string | null
          data_prevista?: string
          id?: string
          importo?: number
          mese?: string
          note?: string | null
          stato?: Database["public"]["Enums"]["stato_movimento"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimenti_fissi_costo_fisso_id_fkey"
            columns: ["costo_fisso_id"]
            isOneToOne: false
            referencedRelation: "costi_fissi"
            referencedColumns: ["id"]
          },
        ]
      }
      progetti: {
        Row: {
          budget_totale: number
          cliente: string
          codice: string
          costi_stimati: number
          created_at: string
          data_fine: string | null
          data_inizio: string
          id: string
          nome: string
          probabilita: number
          stato: Database["public"]["Enums"]["stato_progetto"]
          updated_at: string
        }
        Insert: {
          budget_totale: number
          cliente: string
          codice: string
          costi_stimati: number
          created_at?: string
          data_fine?: string | null
          data_inizio: string
          id?: string
          nome: string
          probabilita?: number
          stato?: Database["public"]["Enums"]["stato_progetto"]
          updated_at?: string
        }
        Update: {
          budget_totale?: number
          cliente?: string
          codice?: string
          costi_stimati?: number
          created_at?: string
          data_fine?: string | null
          data_inizio?: string
          id?: string
          nome?: string
          probabilita?: number
          stato?: Database["public"]["Enums"]["stato_progetto"]
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          cassa_iniziale: number
          created_at: string
          id: string
          orizzonte_previsioni_mesi: number
          soglia_allerta_cassa: number
          updated_at: string
        }
        Insert: {
          cassa_iniziale?: number
          created_at?: string
          id?: string
          orizzonte_previsioni_mesi?: number
          soglia_allerta_cassa?: number
          updated_at?: string
        }
        Update: {
          cassa_iniziale?: number
          created_at?: string
          id?: string
          orizzonte_previsioni_mesi?: number
          soglia_allerta_cassa?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_approvals: {
        Row: {
          approved: boolean
          approved_at: string | null
          approved_by: string | null
          created_at: string
          email: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_user_approved: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
      stato_movimento: "Previsto" | "Incassato" | "Pagato"
      stato_progetto: "Attivo" | "In attesa" | "Chiuso"
      tipo_movimento: "Ricavo" | "Costo"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      stato_movimento: ["Previsto", "Incassato", "Pagato"],
      stato_progetto: ["Attivo", "In attesa", "Chiuso"],
      tipo_movimento: ["Ricavo", "Costo"],
    },
  },
} as const
