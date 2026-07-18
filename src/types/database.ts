export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PaymentStatus = "menunggu" | "lunas" | "ditolak";
export type OrderStatus = "masuk" | "diproses" | "selesai" | "dibatalkan";

type OrderRow = {
  id: string;
  order_code: string;
  service_id: string | null;
  full_name: string;
  whatsapp: string;
  faculty: string | null;
  major: string | null;
  group_name: string | null;
  nim: string | null;
  birth_place: string | null;
  birth_date: string | null;
  address: string | null;
  motto: string | null;
  customer_note: string | null;
  total_price: number;
  photo_path: string | null;
  payment_proof_path: string | null;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  admin_note: string | null;
  terms_accepted: boolean;
  extra_data: Json | null;
  created_at: string;
  updated_at: string;
};

type OrderInsert = {
  id?: string;
  order_code: string;
  service_id?: string | null;
  full_name: string;
  whatsapp: string;
  faculty?: string | null;
  major?: string | null;
  group_name?: string | null;
  nim?: string | null;
  birth_place?: string | null;
  birth_date?: string | null;
  address?: string | null;
  motto?: string | null;
  customer_note?: string | null;
  total_price?: number;
  photo_path?: string | null;
  payment_proof_path?: string | null;
  payment_status?: PaymentStatus;
  order_status?: OrderStatus;
  admin_note?: string | null;
  terms_accepted: boolean;
  extra_data?: Json | null;
  created_at?: string;
  updated_at?: string;
};

type ServiceRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  quota: number | null;
  deadline: string | null;
  image_url: string | null;
  requirements: string | null;
  form_config: Json | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type SettingsRow = {
  id: number;
  website_name: string | null;
  whatsapp_number: string | null;
  qris_owner_name: string | null;
  qris_image_url: string | null;
  payment_instruction: string | null;
  terms_and_conditions: string | null;
  created_at: string;
  updated_at: string;
};

type FacultyRow = {
  id: number;
  name: string;
  code: string;
  sort_order: number;
  is_active: boolean;
};

type StudyProgramRow = {
  id: number;
  faculty_id: number;
  name: string;
  degree: string;
  sort_order: number;
  is_active: boolean;
};

export type Database = {
  public: {
    Tables: {
      orders: {
        Row: OrderRow;
        Insert: OrderInsert;
        Update: Partial<OrderRow>;
        Relationships: [
          {
            foreignKeyName: "orders_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      services: {
        Row: ServiceRow;
        Insert: Omit<ServiceRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<ServiceRow>;
        Relationships: [];
      };
      settings: {
        Row: SettingsRow;
        Insert: Omit<SettingsRow, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<SettingsRow>;
        Relationships: [];
      };
      faculties: {
        Row: FacultyRow;
        Insert: Omit<FacultyRow, "id"> & { id?: number };
        Update: Partial<FacultyRow>;
        Relationships: [];
      };
      study_programs: {
        Row: StudyProgramRow;
        Insert: Omit<StudyProgramRow, "id"> & { id?: number };
        Update: Partial<StudyProgramRow>;
        Relationships: [
          {
            foreignKeyName: "study_programs_faculty_id_fkey";
            columns: ["faculty_id"];
            isOneToOne: false;
            referencedRelation: "faculties";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type Service = Database["public"]["Tables"]["services"]["Row"];
export type Settings = Database["public"]["Tables"]["settings"]["Row"];
export type Faculty = Database["public"]["Tables"]["faculties"]["Row"];
export type StudyProgram =
  Database["public"]["Tables"]["study_programs"]["Row"];
