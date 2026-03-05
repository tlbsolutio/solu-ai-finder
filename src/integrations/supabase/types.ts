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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      cart_equipes: {
        Row: {
          id: string
          session_id: string
          nom: string
          mission: string | null
          charge_estimee: number | null
          ai_generated: boolean
          validated: boolean
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          nom: string
          mission?: string | null
          charge_estimee?: number | null
          ai_generated?: boolean
          validated?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          nom?: string
          mission?: string | null
          charge_estimee?: number | null
          ai_generated?: boolean
          validated?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_equipes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cart_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_irritants: {
        Row: {
          id: string
          session_id: string
          intitule: string
          type: string | null
          gravite: number | null
          impact: string | null
          description: string | null
          ai_generated: boolean
          validated: boolean
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          intitule: string
          type?: string | null
          gravite?: number | null
          impact?: string | null
          description?: string | null
          ai_generated?: boolean
          validated?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          intitule?: string
          type?: string | null
          gravite?: number | null
          impact?: string | null
          description?: string | null
          ai_generated?: boolean
          validated?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_irritants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cart_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_outils: {
        Row: {
          id: string
          session_id: string
          nom: string
          type_outil: string | null
          niveau_usage: number | null
          problemes: string | null
          ai_generated: boolean
          validated: boolean
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          nom: string
          type_outil?: string | null
          niveau_usage?: number | null
          problemes?: string | null
          ai_generated?: boolean
          validated?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          nom?: string
          type_outil?: string | null
          niveau_usage?: number | null
          problemes?: string | null
          ai_generated?: boolean
          validated?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_outils_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cart_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_pack_resumes: {
        Row: {
          id: string
          session_id: string
          bloc: number
          resume: string | null
          score_maturite: number | null
          alertes: Json | null
          quickwins_ids: string[] | null
          objets_generes_count: number | null
          generated_at: string | null
        }
        Insert: {
          id?: string
          session_id: string
          bloc: number
          resume?: string | null
          score_maturite?: number | null
          alertes?: Json | null
          quickwins_ids?: string[] | null
          objets_generes_count?: number | null
          generated_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          bloc?: number
          resume?: string | null
          score_maturite?: number | null
          alertes?: Json | null
          quickwins_ids?: string[] | null
          objets_generes_count?: number | null
          generated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_pack_resumes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cart_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_processus: {
        Row: {
          id: string
          session_id: string
          nom: string
          type: string | null
          niveau_criticite: string | null
          description: string | null
          ai_generated: boolean
          validated: boolean
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          nom: string
          type?: string | null
          niveau_criticite?: string | null
          description?: string | null
          ai_generated?: boolean
          validated?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          nom?: string
          type?: string | null
          niveau_criticite?: string | null
          description?: string | null
          ai_generated?: boolean
          validated?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_processus_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cart_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_questions: {
        Row: {
          id: string
          code: string | null
          bloc: number
          section: string | null
          texte: string
          type_reponse: string
          actif: boolean
          ordre: number
        }
        Insert: {
          id?: string
          code?: string | null
          bloc: number
          section?: string | null
          texte: string
          type_reponse?: string
          actif?: boolean
          ordre?: number
        }
        Update: {
          id?: string
          code?: string | null
          bloc?: number
          section?: string | null
          texte?: string
          type_reponse?: string
          actif?: boolean
          ordre?: number
        }
        Relationships: []
      }
      cart_quick_scans: {
        Row: {
          id: string
          owner_id: string | null
          description_libre: string | null
          reponses_rapides: Json | null
          resultats: Json | null
          created_at: string
          sector_detected: string | null
        }
        Insert: {
          id?: string
          owner_id?: string | null
          description_libre?: string | null
          reponses_rapides?: Json | null
          resultats?: Json | null
          created_at?: string
          sector_detected?: string | null
        }
        Update: {
          id?: string
          owner_id?: string | null
          description_libre?: string | null
          reponses_rapides?: Json | null
          resultats?: Json | null
          created_at?: string
          sector_detected?: string | null
        }
        Relationships: []
      }
      cart_quickwins: {
        Row: {
          id: string
          session_id: string
          bloc_source: number | null
          intitule: string
          categorie: string | null
          impact: string | null
          effort: string | null
          description: string | null
          statut: string
          priorite_calculee: string | null
          ai_generated: boolean
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          bloc_source?: number | null
          intitule: string
          categorie?: string | null
          impact?: string | null
          effort?: string | null
          description?: string | null
          statut?: string
          priorite_calculee?: string | null
          ai_generated?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          bloc_source?: number | null
          intitule?: string
          categorie?: string | null
          impact?: string | null
          effort?: string | null
          description?: string | null
          statut?: string
          priorite_calculee?: string | null
          ai_generated?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_quickwins_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cart_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_reponses: {
        Row: {
          id: string
          session_id: string
          question_id: string | null
          code_question: string | null
          bloc: number | null
          reponse_brute: string | null
          importance: number | null
          answered_at: string | null
          pack_batch_id: string | null
        }
        Insert: {
          id?: string
          session_id: string
          question_id?: string | null
          code_question?: string | null
          bloc?: number | null
          reponse_brute?: string | null
          importance?: number | null
          answered_at?: string | null
          pack_batch_id?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          question_id?: string | null
          code_question?: string | null
          bloc?: number | null
          reponse_brute?: string | null
          importance?: number | null
          answered_at?: string | null
          pack_batch_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_reponses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "cart_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_reponses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cart_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_sessions: {
        Row: {
          id: string
          owner_id: string
          nom: string
          tier: string
          status: string
          packs_completed: number
          pack_status_json: Json
          final_generation_done: boolean
          ai_resume_executif: string | null
          ai_forces: string | null
          ai_dysfonctionnements: string | null
          ai_plan_optimisation: string | null
          ai_vision_cible: string | null
          ai_analyse_transversale: string | null
          analyse_status: string
          notes_internes: string | null
          created_at: string
          updated_at: string
          sector_id: string | null
          sector_confidence: number | null
          ai_cartography_json: Json | null
          ai_impact_quantification: Json | null
          ai_cross_pack_analysis: Json | null
          ai_target_vision: Json | null
        }
        Insert: {
          id?: string
          owner_id: string
          nom?: string
          tier?: string
          status?: string
          packs_completed?: number
          pack_status_json?: Json
          final_generation_done?: boolean
          ai_resume_executif?: string | null
          ai_forces?: string | null
          ai_dysfonctionnements?: string | null
          ai_plan_optimisation?: string | null
          ai_vision_cible?: string | null
          ai_analyse_transversale?: string | null
          analyse_status?: string
          notes_internes?: string | null
          created_at?: string
          updated_at?: string
          sector_id?: string | null
          sector_confidence?: number | null
          ai_cartography_json?: Json | null
          ai_impact_quantification?: Json | null
          ai_cross_pack_analysis?: Json | null
          ai_target_vision?: Json | null
        }
        Update: {
          id?: string
          owner_id?: string
          nom?: string
          tier?: string
          status?: string
          packs_completed?: number
          pack_status_json?: Json
          final_generation_done?: boolean
          ai_resume_executif?: string | null
          ai_forces?: string | null
          ai_dysfonctionnements?: string | null
          ai_plan_optimisation?: string | null
          ai_vision_cible?: string | null
          ai_analyse_transversale?: string | null
          analyse_status?: string
          notes_internes?: string | null
          created_at?: string
          updated_at?: string
          sector_id?: string | null
          sector_confidence?: number | null
          ai_cartography_json?: Json | null
          ai_impact_quantification?: Json | null
          ai_cross_pack_analysis?: Json | null
          ai_target_vision?: Json | null
        }
        Relationships: []
      }
      cart_subscriptions: {
        Row: {
          id: string
          owner_id: string
          status: string
          payment_ref: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          status?: string
          payment_ref?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          status?: string
          payment_ref?: string | null
          created_at?: string
        }
        Relationships: []
      }
      cart_taches: {
        Row: {
          id: string
          session_id: string
          nom: string
          frequence: string | null
          double_saisie: boolean
          description: string | null
          ai_generated: boolean
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          nom: string
          frequence?: string | null
          double_saisie?: boolean
          description?: string | null
          ai_generated?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          nom?: string
          frequence?: string | null
          double_saisie?: boolean
          description?: string | null
          ai_generated?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_taches_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cart_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_content: {
        Row: {
          audience: string
          created_at: string
          cta: string
          goal: string
          h1: string
          id: string
          intro_text: string
          meta_description: string
          page_name: string
          seo_keywords: string[]
          seo_title: string
          slug: string
          target_keywords: string[]
          updated_at: string
        }
        Insert: {
          audience: string
          created_at?: string
          cta: string
          goal: string
          h1: string
          id?: string
          intro_text: string
          meta_description: string
          page_name: string
          seo_keywords: string[]
          seo_title: string
          slug: string
          target_keywords: string[]
          updated_at?: string
        }
        Update: {
          audience?: string
          created_at?: string
          cta?: string
          goal?: string
          h1?: string
          id?: string
          intro_text?: string
          meta_description?: string
          page_name?: string
          seo_keywords?: string[]
          seo_title?: string
          slug?: string
          target_keywords?: string[]
          updated_at?: string
        }
        Relationships: []
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
    Enums: {},
  },
} as const
