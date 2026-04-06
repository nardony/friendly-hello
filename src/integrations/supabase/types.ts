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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      balance_transactions: {
        Row: {
          admin_id: string | null
          amount: number
          created_at: string
          description: string | null
          id: string
          order_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          admin_id?: string | null
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          created_by: string
          credits_purchased: number
          email: string | null
          id: string
          landing_page_id: string | null
          name: string
          notes: string | null
          order_id: string | null
          purchase_type: string
          purchased_at: string
          status: string
          whatsapp: string
        }
        Insert: {
          created_at?: string
          created_by: string
          credits_purchased?: number
          email?: string | null
          id?: string
          landing_page_id?: string | null
          name: string
          notes?: string | null
          order_id?: string | null
          purchase_type?: string
          purchased_at?: string
          status?: string
          whatsapp: string
        }
        Update: {
          created_at?: string
          created_by?: string
          credits_purchased?: number
          email?: string | null
          id?: string
          landing_page_id?: string | null
          name?: string
          notes?: string | null
          order_id?: string | null
          purchase_type?: string
          purchased_at?: string
          status?: string
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_landing_page_id_fkey"
            columns: ["landing_page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_renewals: {
        Row: {
          created_at: string
          daily_limit: number
          id: string
          is_active: boolean
          last_renewed_at: string | null
          tier_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_limit?: number
          id?: string
          is_active?: boolean
          last_renewed_at?: string | null
          tier_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_limit?: number
          id?: string
          is_active?: boolean
          last_renewed_at?: string | null
          tier_name?: string
          user_id?: string
        }
        Relationships: []
      }
      homepage_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json | null
        }
        Relationships: []
      }
      landing_pages: {
        Row: {
          about_description: string | null
          about_title: string | null
          access_key: string | null
          background_image: string | null
          checkout_badge_text: string | null
          checkout_benefits: Json | null
          checkout_enabled: boolean | null
          checkout_product_description: string | null
          checkout_product_subtitle: string | null
          color_accent: string | null
          color_background: string | null
          color_icons: string | null
          color_primary: string | null
          color_text: string | null
          color_text_highlight: string | null
          created_at: string
          cta_subtitle: string | null
          cta_title: string | null
          custom_package_options: Json | null
          donation_description: string | null
          donation_enabled: boolean | null
          donation_pix_key: string | null
          donation_pix_name: string | null
          donation_qr_code: string | null
          donation_title: string | null
          facebook_pixel: string | null
          faqs: Json | null
          features: Json | null
          font_body: string | null
          font_heading: string | null
          google_analytics: string | null
          google_tag_manager: string | null
          hero_badge_text: string | null
          hero_cta_link: string | null
          hero_cta_text: string | null
          hero_daily_renewal_text: string | null
          hero_extra_prices: Json | null
          hero_extra_renewals: Json | null
          hero_image: string | null
          hero_subtitle: string | null
          hero_title: string | null
          hero_title_highlight: string | null
          how_it_works: Json | null
          id: string
          is_published: boolean
          logo_image: string | null
          logo_size: string | null
          meta_description: string | null
          meta_title: string | null
          nav_buttons: Json | null
          og_image: string | null
          pix_enabled: boolean | null
          pix_key: string | null
          pix_name: string | null
          pix_qr_base: string | null
          price_current: number | null
          price_installments: string | null
          price_original: number | null
          pricing_tiers: Json | null
          product_image: string | null
          promo_link: string | null
          promo_text: string | null
          section_order: Json | null
          secure_purchase_items: Json | null
          settings: Json | null
          slug: string
          social_proof_credits: Json | null
          social_proof_customers: Json | null
          social_proof_enabled: boolean | null
          social_proof_product_name: string | null
          testimonials: Json | null
          tiktok_pixel: string | null
          title: string
          updated_at: string
          user_id: string
          video_enabled: boolean | null
          video_hide_controls: boolean | null
          video_thumbnail: string | null
          video_title: string | null
          video_url: string | null
          whatsapp_message: string | null
          whatsapp_number: string | null
          why_choose_items: Json | null
        }
        Insert: {
          about_description?: string | null
          about_title?: string | null
          access_key?: string | null
          background_image?: string | null
          checkout_badge_text?: string | null
          checkout_benefits?: Json | null
          checkout_enabled?: boolean | null
          checkout_product_description?: string | null
          checkout_product_subtitle?: string | null
          color_accent?: string | null
          color_background?: string | null
          color_icons?: string | null
          color_primary?: string | null
          color_text?: string | null
          color_text_highlight?: string | null
          created_at?: string
          cta_subtitle?: string | null
          cta_title?: string | null
          custom_package_options?: Json | null
          donation_description?: string | null
          donation_enabled?: boolean | null
          donation_pix_key?: string | null
          donation_pix_name?: string | null
          donation_qr_code?: string | null
          donation_title?: string | null
          facebook_pixel?: string | null
          faqs?: Json | null
          features?: Json | null
          font_body?: string | null
          font_heading?: string | null
          google_analytics?: string | null
          google_tag_manager?: string | null
          hero_badge_text?: string | null
          hero_cta_link?: string | null
          hero_cta_text?: string | null
          hero_daily_renewal_text?: string | null
          hero_extra_prices?: Json | null
          hero_extra_renewals?: Json | null
          hero_image?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          hero_title_highlight?: string | null
          how_it_works?: Json | null
          id?: string
          is_published?: boolean
          logo_image?: string | null
          logo_size?: string | null
          meta_description?: string | null
          meta_title?: string | null
          nav_buttons?: Json | null
          og_image?: string | null
          pix_enabled?: boolean | null
          pix_key?: string | null
          pix_name?: string | null
          pix_qr_base?: string | null
          price_current?: number | null
          price_installments?: string | null
          price_original?: number | null
          pricing_tiers?: Json | null
          product_image?: string | null
          promo_link?: string | null
          promo_text?: string | null
          section_order?: Json | null
          secure_purchase_items?: Json | null
          settings?: Json | null
          slug: string
          social_proof_credits?: Json | null
          social_proof_customers?: Json | null
          social_proof_enabled?: boolean | null
          social_proof_product_name?: string | null
          testimonials?: Json | null
          tiktok_pixel?: string | null
          title?: string
          updated_at?: string
          user_id: string
          video_enabled?: boolean | null
          video_hide_controls?: boolean | null
          video_thumbnail?: string | null
          video_title?: string | null
          video_url?: string | null
          whatsapp_message?: string | null
          whatsapp_number?: string | null
          why_choose_items?: Json | null
        }
        Update: {
          about_description?: string | null
          about_title?: string | null
          access_key?: string | null
          background_image?: string | null
          checkout_badge_text?: string | null
          checkout_benefits?: Json | null
          checkout_enabled?: boolean | null
          checkout_product_description?: string | null
          checkout_product_subtitle?: string | null
          color_accent?: string | null
          color_background?: string | null
          color_icons?: string | null
          color_primary?: string | null
          color_text?: string | null
          color_text_highlight?: string | null
          created_at?: string
          cta_subtitle?: string | null
          cta_title?: string | null
          custom_package_options?: Json | null
          donation_description?: string | null
          donation_enabled?: boolean | null
          donation_pix_key?: string | null
          donation_pix_name?: string | null
          donation_qr_code?: string | null
          donation_title?: string | null
          facebook_pixel?: string | null
          faqs?: Json | null
          features?: Json | null
          font_body?: string | null
          font_heading?: string | null
          google_analytics?: string | null
          google_tag_manager?: string | null
          hero_badge_text?: string | null
          hero_cta_link?: string | null
          hero_cta_text?: string | null
          hero_daily_renewal_text?: string | null
          hero_extra_prices?: Json | null
          hero_extra_renewals?: Json | null
          hero_image?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          hero_title_highlight?: string | null
          how_it_works?: Json | null
          id?: string
          is_published?: boolean
          logo_image?: string | null
          logo_size?: string | null
          meta_description?: string | null
          meta_title?: string | null
          nav_buttons?: Json | null
          og_image?: string | null
          pix_enabled?: boolean | null
          pix_key?: string | null
          pix_name?: string | null
          pix_qr_base?: string | null
          price_current?: number | null
          price_installments?: string | null
          price_original?: number | null
          pricing_tiers?: Json | null
          product_image?: string | null
          promo_link?: string | null
          promo_text?: string | null
          section_order?: Json | null
          secure_purchase_items?: Json | null
          settings?: Json | null
          slug?: string
          social_proof_credits?: Json | null
          social_proof_customers?: Json | null
          social_proof_enabled?: boolean | null
          social_proof_product_name?: string | null
          testimonials?: Json | null
          tiktok_pixel?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          video_enabled?: boolean | null
          video_hide_controls?: boolean | null
          video_thumbnail?: string | null
          video_title?: string | null
          video_url?: string | null
          whatsapp_message?: string | null
          whatsapp_number?: string | null
          why_choose_items?: Json | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          coupon_code: string | null
          created_at: string
          credits: number
          customer_email: string
          customer_name: string
          customer_whatsapp: string
          id: string
          invite_link: string | null
          landing_page_id: string | null
          price: number
          status: string
          tier_id: string | null
          tier_name: string
          user_id: string
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string
          credits?: number
          customer_email: string
          customer_name: string
          customer_whatsapp: string
          id?: string
          invite_link?: string | null
          landing_page_id?: string | null
          price?: number
          status?: string
          tier_id?: string | null
          tier_name: string
          user_id: string
        }
        Update: {
          coupon_code?: string | null
          created_at?: string
          credits?: number
          customer_email?: string
          customer_name?: string
          customer_whatsapp?: string
          id?: string
          invite_link?: string | null
          landing_page_id?: string | null
          price?: number
          status?: string
          tier_id?: string | null
          tier_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_landing_page_id_fkey"
            columns: ["landing_page_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_balances: {
        Row: {
          balance: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
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
          role: Database["public"]["Enums"]["app_role"]
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
      update_user_balance: {
        Args: {
          _admin_id?: string
          _amount: number
          _description?: string
          _order_id?: string
          _type: string
          _user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
