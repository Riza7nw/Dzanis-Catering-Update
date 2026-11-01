/**
 * Domain Type Definitions: Certifications & Legal Documents
 * Mendefinisikan tipe entitas sertifikat, dokumen legalitas, dan payload lightbox.
 */

export type DocumentFileType = 'image' | 'pdf';
export type DocumentCategory = 'sertifikat' | 'legalitas';

export interface CertificationItem {
  id: number | string;
  title: string;
  issuer: string;
  certNumber: string;
  validUntil: string;
  category: DocumentCategory;
  documentUrl: string;
  fileType: DocumentFileType;
  isActive: boolean;
  badge: string;
}

export interface DocumentLightboxPayload {
  title: string;
  issuer: string;
  certNumber: string;
  validUntil: string;
  badge: string;
  documentUrl: string;
  fileType: DocumentFileType;
}
