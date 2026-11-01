/**
 * Service: Certifications & Legal Documents Service
 * Mengambil data sertifikat dan dokumen legalitas resmi dari backend /api/certifications
 * dengan fallback data statis tersentralisasi dan kompatibilitas template penuh.
 */

import type { CertificationItem } from '../../types/cert';
import type { BackendCertDto, BackendCertResponse } from '../../types/api';
import { getApiBaseUrl, getCommonApiHeaders, DEFAULT_TIMEOUT_MS } from './apiConfig';

export interface ShowcaseCertificateItem extends CertificationItem {
  no: string;
  date: string;
  docUrl: string;
}

export interface LegalCardItem extends CertificationItem {
  label: string;
  detail: string;
  status: string;
  document_url: string;
  file_type: 'image' | 'pdf';
}

export const defaultShowcaseCertificates: ShowcaseCertificateItem[] = [
  {
    id: 1,
    title: 'Sertifikat Halal Indonesia',
    issuer: 'BPJPH & Majelis Ulama Indonesia',
    certNumber: 'ID33110001234560723',
    no: 'ID33110001234560723',
    validUntil: '8 APRIL 2024',
    date: '8 APRIL 2024',
    badge: 'HALAL',
    category: 'sertifikat',
    documentUrl: '/images/brand/halal-cert.png',
    docUrl: '/images/brand/halal-cert.png',
    fileType: 'image',
    isActive: true,
  },
  {
    id: 2,
    title: 'Sertifikat Laik Higiene Sanitasi (SLHS)',
    issuer: 'Dinas Kesehatan Kabupaten Majalengka',
    certNumber: '440/089/SLHS/2023',
    no: '440/089/SLHS/2023',
    validUntil: '14 MEI 2023',
    date: '14 MEI 2023',
    badge: 'SLHS',
    category: 'sertifikat',
    documentUrl: '/images/brand/halal-cert.png',
    docUrl: '/images/brand/halal-cert.png',
    fileType: 'image',
    isActive: true,
  },
  {
    id: 3,
    title: 'Sertifikat Penjamah Makanan',
    issuer: 'Higiene Sanitasi Makanan & K3',
    certNumber: '057/SK-PM/2024',
    no: '057/SK-PM/2024',
    validUntil: '26 JUNI 2024',
    date: '26 JUNI 2024',
    badge: 'K3',
    category: 'sertifikat',
    documentUrl: '/images/brand/halal-cert.png',
    docUrl: '/images/brand/halal-cert.png',
    fileType: 'image',
    isActive: true,
  },
  {
    id: 4,
    title: 'Sertifikat Pangan',
    issuer: 'Pengawasan Keamanan Pangan Olahan',
    certNumber: '220/KP/2024',
    no: '220/KP/2024',
    validUntil: '2 JULI 2024',
    date: '2 JULI 2024',
    badge: 'PANGAN',
    category: 'sertifikat',
    documentUrl: '/images/brand/halal-cert.png',
    docUrl: '/images/brand/halal-cert.png',
    fileType: 'image',
    isActive: true,
  },
  {
    id: 5,
    title: 'Nomor Induk Berusaha (NIB Resmi)',
    issuer: 'Terdaftar resmi di sistem OSS Indonesia',
    certNumber: '1209230045678',
    no: '1209230045678',
    validUntil: '10 JANUARI 2023',
    date: '10 JANUARI 2023',
    badge: 'LEGAL',
    category: 'sertifikat',
    documentUrl: '/images/brand/halal-cert.png',
    docUrl: '/images/brand/halal-cert.png',
    fileType: 'image',
    isActive: true,
  },
];

export const defaultLegalDocuments: LegalCardItem[] = [
  {
    id: 'legal-nib',
    title: 'NIB / Izin Usaha',
    label: 'NIB / Izin Usaha',
    issuer: 'Legalitas usaha untuk menjalankan aktivitas usaha katering secara resmi.',
    detail: 'Legalitas usaha untuk menjalankan aktivitas usaha katering secara resmi.',
    certNumber: '123456789012345',
    validUntil: 'Aktif Permanen',
    badge: 'Legal',
    status: 'Legal',
    category: 'legalitas',
    documentUrl: '/images/brand/halal-cert.png',
    document_url: '/images/brand/halal-cert.png',
    fileType: 'image',
    file_type: 'image',
    isActive: true,
  },
  {
    id: 'legal-lab',
    title: 'Uji Lab Mikrobiologi & Air Bersih',
    label: 'Uji Lab Mikrobiologi & Air Bersih',
    issuer: 'Hasil uji kualitas air dan sanitasi dapur sesuai standar keamanan pangan.',
    detail: 'Hasil uji kualitas air dan sanitasi dapur sesuai standar keamanan pangan.',
    certNumber: 'Bebas Cemaran Kimia & Mikrobiologi',
    validUntil: 'Periode Berjalan',
    badge: 'Uji Lab',
    status: 'Uji Lab',
    category: 'legalitas',
    documentUrl: '/images/brand/halal-cert.png',
    document_url: '/images/brand/halal-cert.png',
    fileType: 'image',
    file_type: 'image',
    isActive: true,
  },
  {
    id: 'legal-sop',
    title: 'Pangan Sanitasi & Kesehatan',
    label: 'Pangan Sanitasi & Kesehatan',
    issuer: 'Sertifikat kesehatan untuk operasional dapur dan keamanan makanan.',
    detail: 'Sertifikat kesehatan untuk operasional dapur dan keamanan makanan.',
    certNumber: 'Prosedur Masker, Sarung Tangan & Sanitasi',
    validUntil: 'Standar Mutu Harian',
    badge: 'Sanitasi',
    status: 'Sanitasi',
    category: 'legalitas',
    documentUrl: '/images/brand/halal-cert.png',
    document_url: '/images/brand/halal-cert.png',
    fileType: 'image',
    file_type: 'image',
    isActive: true,
  },
  {
    id: 'legal-izin',
    title: 'Legalitas & Izin Lainnya',
    label: 'Legalitas & Izin Lainnya',
    issuer: 'Dokumen pendukung terkait proses bisnis dan pengelolaan usaha.',
    detail: 'Dokumen pendukung terkait proses bisnis dan pengelolaan usaha.',
    certNumber: 'Kelayakan Usaha Jasa Boga',
    validUntil: 'Aktif',
    badge: 'Dokumen',
    status: 'Dokumen',
    category: 'legalitas',
    documentUrl: '/images/brand/halal-cert.png',
    document_url: '/images/brand/halal-cert.png',
    fileType: 'image',
    file_type: 'image',
    isActive: true,
  },
];

function normalizeCertDto(dto: BackendCertDto, index = 0): ShowcaseCertificateItem & LegalCardItem {
  const title = dto.title || dto.label || 'Dokumen Resmi';
  const issuer = dto.issuer || dto.detail || 'Lembaga Penerbit';
  const certNumber = dto.cert_number || dto.meta || '-';
  const validUntil = dto.valid_until || dto.date || '-';
  const category = (dto.category || 'sertifikat').toLowerCase() === 'legalitas' ? 'legalitas' : 'sertifikat';
  const badge = dto.badge || (category === 'sertifikat' ? 'RESMI' : 'LEGAL');
  const docUrl = dto.document_url || '/images/brand/halal-cert.png';
  const fileType: 'image' | 'pdf' = dto.file_type === 'pdf' || docUrl.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image';

  return {
    id: dto.id || index + 1,
    title,
    label: title,
    issuer,
    detail: issuer,
    certNumber,
    no: certNumber,
    validUntil,
    date: validUntil,
    category,
    documentUrl: docUrl,
    docUrl,
    document_url: docUrl,
    fileType,
    file_type: fileType,
    badge,
    status: badge,
    isActive: dto.is_active !== 0 && dto.is_active !== false,
  };
}

/**
 * Mengambil seluruh data sertifikat dan dokumen legalitas aktif dari backend.
 */
export async function getCertifications(): Promise<(ShowcaseCertificateItem & LegalCardItem)[]> {
  try {
    const apiBase = getApiBaseUrl();
    const res = await fetch(`${apiBase}/api/certifications?active=true`, {
      headers: getCommonApiHeaders(),
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    });

    if (res.ok) {
      const data: BackendCertResponse = await res.json();
      const rawList = Array.isArray(data)
        ? data
        : Array.isArray(data?.certifications)
        ? data.certifications
        : [];

      if (rawList.length > 0) {
        return rawList.map(normalizeCertDto).filter((c) => c.isActive);
      }
    }
  } catch {
    // Fallback senyap ke dataset lokal jika offline
  }

  return [...defaultShowcaseCertificates.map((c, i) => normalizeCertDto(c as any, i)), ...defaultLegalDocuments.map((c, i) => normalizeCertDto(c as any, i))];
}

/**
 * Mengambil dokumen khusus kategori Sertifikasi Resmi untuk slider.
 */
export async function getShowcaseCertificates(): Promise<ShowcaseCertificateItem[]> {
  const all = await getCertifications();
  const filtered = all.filter((c) => c.category === 'sertifikat');
  return filtered.length > 0 ? filtered : defaultShowcaseCertificates;
}

/**
 * Mengambil dokumen khusus kategori Kebijakan & Legalitas untuk grid kebijakan.
 */
export async function getLegalDocuments(): Promise<LegalCardItem[]> {
  const all = await getCertifications();
  const filtered = all.filter((c) => c.category === 'legalitas');
  return filtered.length > 0 ? filtered : defaultLegalDocuments;
}
