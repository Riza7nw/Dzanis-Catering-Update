/**
 * Domain Type Definitions: Orders & Inquiries
 * Mendefinisikan tipe data form pemesanan, lead prospek, dan event bus payload.
 */

export interface OrderModalPrefill {
  packageName?: string;
  customDetails?: string;
  portionCount?: number;
  eventDate?: string;
  minOrder?: number;
}

export interface FormOrderState {
  packageName: string;
  customDetails: string;
  customerName: string;
  customerAddress: string;
  deliveryLat: string;
  deliveryLng: string;
  eventDate: string;
  portionCount: number;
  notes: string;
}

export interface OrderLead {
  id?: number | string;
  clientName: string;
  whatsapp: string;
  email?: string | null;
  eventType?: string | null;
  eventDate?: string | null;
  guestCount?: number | null;
  budgetRange?: string | null;
  selectedPackage?: string | null;
  venueAddress?: string | null;
  notes?: string | null;
  status?: 'new' | 'contacted' | 'quoted' | 'verified' | 'cancelled';
  createdAt?: string;
}

export interface CustomMenuSelection {
  mainMenu?: string;
  sideDishes: string[];
  orderMode: 'default' | 'custom';
}
