export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      account_roles: {
        Row: {
          account_id: string
          created_at: string
          role: Database["public"]["Enums"]["account_role"]
        }
        Insert: {
          account_id: string
          created_at?: string
          role: Database["public"]["Enums"]["account_role"]
        }
        Update: {
          account_id?: string
          created_at?: string
          role?: Database["public"]["Enums"]["account_role"]
        }
        Relationships: [
          {
            foreignKeyName: "account_roles_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          auth_project_ref: string
          auth_user_id: string
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_suspended: boolean
          last_seen_at: string
          updated_at: string
        }
        Insert: {
          auth_project_ref?: string
          auth_user_id: string
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_suspended?: boolean
          last_seen_at?: string
          updated_at?: string
        }
        Update: {
          auth_project_ref?: string
          auth_user_id?: string
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_suspended?: boolean
          last_seen_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          account_id: string
          conversation_id: number
          joined_at: string
          last_read_message_id: number | null
        }
        Insert: {
          account_id: string
          conversation_id: number
          joined_at?: string
          last_read_message_id?: number | null
        }
        Update: {
          account_id?: string
          conversation_id?: number
          joined_at?: string
          last_read_message_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_last_read_message_id_fkey"
            columns: ["last_read_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          gig_id: number | null
          id: number
          last_message_at: string | null
          last_message_preview: string | null
          order_id: number | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          gig_id?: number | null
          id?: never
          last_message_at?: string | null
          last_message_preview?: string | null
          order_id?: number | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          gig_id?: number | null
          id?: never
          last_message_at?: string | null
          last_message_preview?: string | null
          order_id?: number | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_offers: {
        Row: {
          accepted_at: string | null
          conversation_id: number
          created_at: string
          delivery_days: number
          description: string
          expires_at: string
          gig_id: number | null
          id: number
          order_id: number | null
          price: number
          revisions: number
          sender_account_id: string
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          conversation_id: number
          created_at?: string
          delivery_days: number
          description: string
          expires_at: string
          gig_id?: number | null
          id?: never
          order_id?: number | null
          price: number
          revisions?: number
          sender_account_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          conversation_id?: number
          created_at?: string
          delivery_days?: number
          description?: string
          expires_at?: string
          gig_id?: number | null
          id?: never
          order_id?: number | null
          price?: number
          revisions?: number
          sender_account_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_offers_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_offers_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_offers_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_offers_sender_account_id_fkey"
            columns: ["sender_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_profiles: {
        Row: {
          account_id: string
          created_at: string
          display_name: string | null
          tagline: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          display_name?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          display_name?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_profiles_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverables: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: number
          message: string | null
          order_id: number
          status: Database["public"]["Enums"]["delivery_status"]
          storage_paths: string[]
          submitted_at: string
          submitted_by_account_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: never
          message?: string | null
          order_id: number
          status?: Database["public"]["Enums"]["delivery_status"]
          storage_paths?: string[]
          submitted_at?: string
          submitted_by_account_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: never
          message?: string | null
          order_id?: number
          status?: Database["public"]["Enums"]["delivery_status"]
          storage_paths?: string[]
          submitted_at?: string
          submitted_by_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverables_submitted_by_account_id_fkey"
            columns: ["submitted_by_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          created_at: string
          id: number
          opened_by_account_id: string
          order_id: number
          reason: string
          resolution: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["dispute_status"]
        }
        Insert: {
          created_at?: string
          id?: never
          opened_by_account_id: string
          order_id: number
          reason: string
          resolution?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
        }
        Update: {
          created_at?: string
          id?: never
          opened_by_account_id?: string
          order_id?: number
          reason?: string
          resolution?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
        }
        Relationships: [
          {
            foreignKeyName: "disputes_opened_by_account_id_fkey"
            columns: ["opened_by_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_applications: {
        Row: {
          account_id: string
          created_at: string
          id: number
          motivation: string | null
          notes: string | null
          portfolio_links: string[]
          rejection_reason: string | null
          reviewed_at: string | null
          reviewer_account_id: string | null
          status: Database["public"]["Enums"]["expert_application_status"]
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          id?: never
          motivation?: string | null
          notes?: string | null
          portfolio_links?: string[]
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewer_account_id?: string | null
          status?: Database["public"]["Enums"]["expert_application_status"]
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          id?: never
          motivation?: string | null
          notes?: string | null
          portfolio_links?: string[]
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewer_account_id?: string | null
          status?: Database["public"]["Enums"]["expert_application_status"]
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_applications_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_applications_reviewer_account_id_fkey"
            columns: ["reviewer_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_profiles: {
        Row: {
          account_id: string
          application_status: Database["public"]["Enums"]["expert_application_status"]
          approved_at: string | null
          avatar_color: string | null
          avatar_text: string | null
          bio: string | null
          completed_orders: number
          created_at: string
          headline: string | null
          is_online: boolean
          level: string | null
          location: string | null
          member_since: string | null
          public_id: number
          rating: number
          response_time: string | null
          reviews_count: number
          service_description: string | null
          service_title: string | null
          skills: string[]
          updated_at: string
          username: string
        }
        Insert: {
          account_id: string
          application_status?: Database["public"]["Enums"]["expert_application_status"]
          approved_at?: string | null
          avatar_color?: string | null
          avatar_text?: string | null
          bio?: string | null
          completed_orders?: number
          created_at?: string
          headline?: string | null
          is_online?: boolean
          level?: string | null
          location?: string | null
          member_since?: string | null
          public_id?: never
          rating?: number
          response_time?: string | null
          reviews_count?: number
          service_description?: string | null
          service_title?: string | null
          skills?: string[]
          updated_at?: string
          username: string
        }
        Update: {
          account_id?: string
          application_status?: Database["public"]["Enums"]["expert_application_status"]
          approved_at?: string | null
          avatar_color?: string | null
          avatar_text?: string | null
          bio?: string | null
          completed_orders?: number
          created_at?: string
          headline?: string | null
          is_online?: boolean
          level?: string | null
          location?: string | null
          member_since?: string | null
          public_id?: never
          rating?: number
          response_time?: string | null
          reviews_count?: number
          service_description?: string | null
          service_title?: string | null
          skills?: string[]
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_profiles_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      gig_comments: {
        Row: {
          account_id: string
          body: string
          created_at: string
          gig_id: number
          id: number
          parent_comment_id: number | null
        }
        Insert: {
          account_id: string
          body: string
          created_at?: string
          gig_id: number
          id?: never
          parent_comment_id?: number | null
        }
        Update: {
          account_id?: string
          body?: string
          created_at?: string
          gig_id?: number
          id?: never
          parent_comment_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gig_comments_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gig_comments_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gig_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "gig_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      gig_media: {
        Row: {
          alt_text: string | null
          created_at: string
          gig_id: number
          gradient: string | null
          id: number
          media_type: string
          public_url: string | null
          sort_order: number
          storage_path: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          gig_id: number
          gradient?: string | null
          id?: never
          media_type?: string
          public_url?: string | null
          sort_order?: number
          storage_path?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          gig_id?: number
          gradient?: string | null
          id?: never
          media_type?: string
          public_url?: string | null
          sort_order?: number
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gig_media_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
        ]
      }
      gig_packages: {
        Row: {
          created_at: string
          delivery_days: number
          description: string
          features: string[]
          gig_id: number
          id: number
          price: number
          revisions: number
          sort_order: number
          subtitle: string | null
          tier_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_days: number
          description: string
          features?: string[]
          gig_id: number
          id?: never
          price: number
          revisions?: number
          sort_order?: number
          subtitle?: string | null
          tier_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_days?: number
          description?: string
          features?: string[]
          gig_id?: number
          id?: never
          price?: number
          revisions?: number
          sort_order?: number
          subtitle?: string | null
          tier_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gig_packages_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
        ]
      }
      gig_requirement_fields: {
        Row: {
          created_at: string
          field_type: string
          gig_id: number
          id: number
          is_required: boolean
          label: string
          placeholder: string | null
          sort_order: number
        }
        Insert: {
          created_at?: string
          field_type?: string
          gig_id: number
          id?: never
          is_required?: boolean
          label: string
          placeholder?: string | null
          sort_order?: number
        }
        Update: {
          created_at?: string
          field_type?: string
          gig_id?: number
          id?: never
          is_required?: boolean
          label?: string
          placeholder?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "gig_requirement_fields_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
        ]
      }
      gigs: {
        Row: {
          badge: string | null
          base_price: number
          category: string
          cover_gradient: string | null
          created_at: string
          delivery_days: number | null
          expert_account_id: string
          id: number
          published_at: string | null
          rating: number
          reviews_count: number
          short_description: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["gig_status"]
          title: string
          updated_at: string
        }
        Insert: {
          badge?: string | null
          base_price?: number
          category: string
          cover_gradient?: string | null
          created_at?: string
          delivery_days?: number | null
          expert_account_id: string
          id?: never
          published_at?: string | null
          rating?: number
          reviews_count?: number
          short_description?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["gig_status"]
          title: string
          updated_at?: string
        }
        Update: {
          badge?: string | null
          base_price?: number
          category?: string
          cover_gradient?: string | null
          created_at?: string
          delivery_days?: number | null
          expert_account_id?: string
          id?: never
          published_at?: string | null
          rating?: number
          reviews_count?: number
          short_description?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["gig_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gigs_expert_account_id_fkey"
            columns: ["expert_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          conversation_id: number
          created_at: string
          custom_offer_id: number | null
          id: number
          message_type: string
          sender_account_id: string
        }
        Insert: {
          body: string
          conversation_id: number
          created_at?: string
          custom_offer_id?: number | null
          id?: never
          message_type?: string
          sender_account_id: string
        }
        Update: {
          body?: string
          conversation_id?: number
          created_at?: string
          custom_offer_id?: number | null
          id?: never
          message_type?: string
          sender_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_custom_offer_id_fkey"
            columns: ["custom_offer_id"]
            isOneToOne: false
            referencedRelation: "custom_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_account_id_fkey"
            columns: ["sender_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          account_id: string
          body: string | null
          created_at: string
          id: number
          kind: Database["public"]["Enums"]["notification_kind"]
          read_at: string | null
          related_conversation_id: number | null
          related_order_id: number | null
          title: string
        }
        Insert: {
          account_id: string
          body?: string | null
          created_at?: string
          id?: never
          kind: Database["public"]["Enums"]["notification_kind"]
          read_at?: string | null
          related_conversation_id?: number | null
          related_order_id?: number | null
          title: string
        }
        Update: {
          account_id?: string
          body?: string | null
          created_at?: string
          id?: never
          kind?: Database["public"]["Enums"]["notification_kind"]
          read_at?: string | null
          related_conversation_id?: number | null
          related_order_id?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_conversation_id_fkey"
            columns: ["related_conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_events: {
        Row: {
          actor_account_id: string | null
          body: string | null
          created_at: string
          event_type: string
          id: number
          label: string
          metadata: Json
          order_id: number
        }
        Insert: {
          actor_account_id?: string | null
          body?: string | null
          created_at?: string
          event_type: string
          id?: never
          label: string
          metadata?: Json
          order_id: number
        }
        Update: {
          actor_account_id?: string | null
          body?: string | null
          created_at?: string
          event_type?: string
          id?: never
          label?: string
          metadata?: Json
          order_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_events_actor_account_id_fkey"
            columns: ["actor_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_requirements: {
        Row: {
          created_at: string
          id: number
          order_id: number
          payload: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: never
          order_id: number
          payload?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: never
          order_id?: number
          payload?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_requirements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cancelled_at: string | null
          completed_at: string | null
          created_at: string
          customer_account_id: string
          delivery_due_at: string | null
          delivery_status: Database["public"]["Enums"]["delivery_status"]
          expert_account_id: string
          gig_id: number
          gig_package_id: number
          id: number
          order_date: string
          order_number: string
          package_name_snapshot: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          price: number
          progress: number
          service_fee: number
          status: Database["public"]["Enums"]["order_status"]
          title_snapshot: string
          total: number
          updated_at: string
        }
        Insert: {
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          customer_account_id: string
          delivery_due_at?: string | null
          delivery_status?: Database["public"]["Enums"]["delivery_status"]
          expert_account_id: string
          gig_id: number
          gig_package_id: number
          id?: never
          order_date?: string
          order_number?: string
          package_name_snapshot: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          price: number
          progress?: number
          service_fee?: number
          status?: Database["public"]["Enums"]["order_status"]
          title_snapshot: string
          total: number
          updated_at?: string
        }
        Update: {
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          customer_account_id?: string
          delivery_due_at?: string | null
          delivery_status?: Database["public"]["Enums"]["delivery_status"]
          expert_account_id?: string
          gig_id?: number
          gig_package_id?: number
          id?: never
          order_date?: string
          order_number?: string
          package_name_snapshot?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          price?: number
          progress?: number
          service_fee?: number
          status?: Database["public"]["Enums"]["order_status"]
          title_snapshot?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_account_id_fkey"
            columns: ["customer_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_expert_account_id_fkey"
            columns: ["expert_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_gig_package_id_fkey"
            columns: ["gig_package_id"]
            isOneToOne: false
            referencedRelation: "gig_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          body: string
          created_at: string
          id: number
          order_id: number
          rating: number
          reviewee_account_id: string
          reviewer_account_id: string
          reviewer_avatar_color: string | null
          reviewer_display_name: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: never
          order_id: number
          rating: number
          reviewee_account_id: string
          reviewer_account_id: string
          reviewer_avatar_color?: string | null
          reviewer_display_name: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: never
          order_id?: number
          rating?: number
          reviewee_account_id?: string
          reviewer_account_id?: string
          reviewer_avatar_color?: string | null
          reviewer_display_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_account_id_fkey"
            columns: ["reviewee_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_account_id_fkey"
            columns: ["reviewer_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_order_deliverable_object: {
        Args: { object_name: string }
        Returns: boolean
      }
      can_manage_avatar_object: {
        Args: { object_name: string }
        Returns: boolean
      }
      can_manage_gig: { Args: { target_gig_id: number }; Returns: boolean }
      can_manage_gig_media_object: {
        Args: { object_name: string }
        Returns: boolean
      }
      compute_expert_response_time: {
        Args: { expert_account: string }
        Returns: string
      }
      has_role: {
        Args: { requested_role: Database["public"]["Enums"]["account_role"] }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { target_conversation_id: number }
        Returns: boolean
      }
      is_order_participant: {
        Args: { target_order_id: number }
        Returns: boolean
      }
      path_segment: {
        Args: { path: string; segment_index: number }
        Returns: string
      }
      requesting_account_id: { Args: never; Returns: string }
    }
    Enums: {
      account_role: "customer" | "expert" | "admin"
      delivery_status:
        | "not_started"
        | "submitted"
        | "revision_requested"
        | "accepted"
      dispute_status: "open" | "in_review" | "resolved" | "closed"
      expert_application_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
      gig_status: "draft" | "pending_review" | "published" | "archived"
      notification_kind:
        | "message"
        | "order"
        | "review"
        | "application"
        | "system"
      order_status:
        | "pending"
        | "in_progress"
        | "delivered"
        | "completed"
        | "cancelled"
        | "disputed"
        | "revision_requested"
      payment_status:
        | "none"
        | "pending"
        | "authorized"
        | "paid"
        | "released"
        | "refunded"
        | "held"
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
      account_role: ["customer", "expert", "admin"],
      delivery_status: [
        "not_started",
        "submitted",
        "revision_requested",
        "accepted",
      ],
      dispute_status: ["open", "in_review", "resolved", "closed"],
      expert_application_status: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
      ],
      gig_status: ["draft", "pending_review", "published", "archived"],
      notification_kind: [
        "message",
        "order",
        "review",
        "application",
        "system",
      ],
      order_status: [
        "pending",
        "in_progress",
        "delivered",
        "completed",
        "cancelled",
        "disputed",
        "revision_requested",
      ],
      payment_status: [
        "none",
        "pending",
        "authorized",
        "paid",
        "released",
        "refunded",
        "held",
      ],
    },
  },
} as const
