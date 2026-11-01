/**
 * API Type Definitions: Raw Backend DTOs & Response Envelopes
 * Merefleksikan kontrak data mentah dari backend `dzaniez-back`
 * untuk diadaptasi oleh Anti-Corruption Layer (ACL).
 */

export interface BackendCustomSlotDto {
  name: string;
  default_item: string;
  options: string;
}

export interface BackendPackageDto {
  id: string;
  slug: string;
  name?: string;
  nama?: string;
  category?: string;
  price_per_pax?: number;
  harga?: number;
  min_pax?: number;
  minOrder?: number;
  badge?: string | null;
  description?: string;
  deskripsi?: string;
  deskripsiSingkat?: string;
  image?: string;
  foto?: string;
  gambar?: string;
  items?: string[] | string;
  menuUtama?: string[];
  laukPendamping?: string[];
  custom_slots?: BackendCustomSlotDto[] | string | null;
  is_active?: number | boolean;
  tags?: string[];
  badges?: string[];
  populer?: boolean;
  isPopular?: boolean;
}

export interface BackendMenuCatalogResponse {
  company_name?: string;
  tagline?: string;
  contact?: Record<string, unknown>;
  general_policies?: Record<string, unknown>;
  packages: BackendPackageDto[];
}

export interface BackendCertDto {
  id: number | string;
  title?: string;
  label?: string;
  issuer?: string;
  detail?: string;
  cert_number?: string;
  meta?: string;
  valid_until?: string;
  date?: string;
  category?: 'sertifikat' | 'legalitas' | string;
  document_url?: string;
  file_type?: 'image' | 'pdf' | string;
  is_active?: number | boolean;
  badge?: string;
  created_at?: string | null;
}

export interface BackendCertResponse {
  certifications: BackendCertDto[];
  total?: number;
}

export interface BackendLeadPayload {
  client_name: string;
  whatsapp: string;
  email?: string | null;
  event_type?: string | null;
  event_date?: string | null;
  guest_count?: number | null;
  budget_range?: string | null;
  selected_package?: string | null;
  venue_address?: string | null;
  notes?: string | null;
  status?: string;
}

export interface BackendLeadResponse {
  success: boolean;
  message: string;
  lead_id?: number;
}
