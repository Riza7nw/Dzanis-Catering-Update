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
    issuer: 'BPJPH Kementerian Agama RI & Majelis Ulama Indonesia',
    certNumber: 'ID32110001234560723',
    no: 'ID32110001234560723',
    validUntil: 'Aktif Terverifikasi',
    date: 'Aktif Berlaku',
    badge: 'HALAL RESMI',
    category: 'sertifikat',
    documentUrl: '/images/brand/halal-cert.png',
    docUrl: '/images/brand/halal-cert.png',
    fileType: 'image',
    isActive: true,
  },
  {
    id: 2,
    title: 'Sertifikat Laik Higiene Sanitasi (SLHS) Jasaboga',
    issuer: 'Dinas Kesehatan Kabupaten Majalengka',
    certNumber: '440/089/SLHS.JB/DINKES/2024',
    no: '440/089/SLHS.JB/DINKES/2024',
    validUntil: 'Aktif Terdaftar',
    date: 'Aktif Berlaku',
    badge: 'DINKES SLHS',
    category: 'sertifikat',
    documentUrl: '/images/brand/halal-cert.png',
    docUrl: '/images/brand/halal-cert.png',
    fileType: 'image',
    isActive: true,
  },
  {
    id: 3,
    title: 'Sertifikat Higiene Sanitasi Penjamah Makanan',
    issuer: 'Balai Pelatihan Higiene Sanitasi Makanan & K3',
    certNumber: '057/SK-PM/DINKES/2024',
    no: '057/SK-PM/DINKES/2024',
    validUntil: 'Aktif Terverifikasi',
    date: 'Aktif Berlaku',
    badge: 'K3 PANGAN',
    category: 'sertifikat',
    documentUrl: '/images/brand/halal-cert.png',
    docUrl: '/images/brand/halal-cert.png',
    fileType: 'image',
    isActive: true,
  },
  {
    id: 4,
    title: 'Nomor Induk Berusaha (NIB OSS RBA)',
    issuer: 'Kementerian Investasi / BKPM RI (KBLI 56210)',
    certNumber: '1209230045678',
    no: '1209230045678',
    validUntil: 'Aktif Selama Operasional',
    date: 'Aktif Permanen',
    badge: 'NIB RESMI',
    category: 'sertifikat',
    documentUrl: '/images/brand/halal-cert.png',
    docUrl: '/images/brand/halal-cert.png',
    fileType: 'image',
    isActive: true,
  },
  {
    id: 5,
    title: 'Uji Laboratorium Mutu Air & Mikrobiologi Pangan',
    issuer: 'Pengawasan Keamanan Pangan Olahan & Labkesda',
    certNumber: '220/KP-LAB/2024',
    no: '220/KP-LAB/2024',
    validUntil: 'Bebas Cemaran Kimia & Bakteri Patogen',
    date: 'Teruji Lab',
    badge: 'UJI LAB',
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
    title: 'NIB & Izin Usaha Jasa Boga (KBLI 56210)',
    label: 'NIB & Izin Usaha Jasa Boga (KBLI 56210)',
    issuer: 'Pemerintah RI via Sistem OSS RBA Kementerian Investasi / BKPM',
    detail: 'Legalitas resmi penyelenggaraan jasa boga (catering) untuk event kantor, dinas pemerintah, pernikahan, dan komersial.',
    certNumber: '1209230045678',
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
    id: 'legal-slhs',
    title: 'Sertifikat Laik Higiene Sanitasi (SLHS)',
    label: 'Sertifikat Laik Higiene Sanitasi (SLHS)',
    issuer: 'Dinas Kesehatan Kabupaten Majalengka',
    detail: 'Pengakuan resmi bahwa dapur produksi, perlengkapan masak, dan air bersih Dzanis Catering memenuhi baku mutu kesehatan pangan.',
    certNumber: '440/089/SLHS.JB/DINKES/2024',
    validUntil: 'Aktif Terverifikasi',
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
    id: 'legal-lab',
    title: 'Uji Lab Mikrobiologi Pangan & Air Bersih',
    label: 'Uji Lab Mikrobiologi Pangan & Air Bersih',
    issuer: 'Laboratorium Kesehatan Daerah & Standar Keamanan Pangan',
    detail: 'Pengujian berkala kualitas air dan olahan makanan bebas bakteri patogen (E. coli & Salmonella) demi proteksi kesehatan konsumen.',
    certNumber: 'Bebas Cemaran Kimia & Mikrobiologi',
    validUntil: 'Pengawasan Berkala',
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
    id: 'legal-pajak',
    title: 'Administrasi Perpajakan & Faktur SPK',
    label: 'Administrasi Perpajakan & Faktur SPK',
    issuer: 'KPP Pratama Majalengka — Siap SPK & LPJ Instansi',
    detail: 'Mendukung kelengkapan berkas pengadaan B2B/B2G: Kwitansi Resmi bermeterai, Surat Pesanan Kerja (SPK), dan e-Billing/Faktur Pajak.',
    certNumber: 'NPWP Terdaftar & Tertib Administrasi',
    validUntil: 'Siap Administrasi',
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
    if (!apiBase) throw new Error('Backend API belum dikonfigurasi (PUBLIC_API_URL)');
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
 * Mengambil dokumen khusus kategori Sertifikasi Resmi untuk showcase/grid.
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
