/**
 * Direct Turso Cloud Build Loader (SSG Build Time Server-Only)
 *
 * ⚠️ PERINGATAN KEAMANAN KRITIS:
 * Modul ini HANYA boleh dieksekusi saat proses build SSG (Astro frontmatter / server-side).
 * JANGAN PERNAH mengimpor modul ini ke dalam src/scripts/*.ts atau tag <script> browser!
 * JANGAN gunakan prefix PUBLIC_ untuk kredensial Turso agar rahasia tidak bocor ke client bundle.
 */

import { createClient, type Client } from '@libsql/client';
import type { BackendPackageDto, BackendSnackItemDto } from '../../types/api';
import type { CertificationItem, DocumentCategory, DocumentFileType } from '../../types/cert';

let cachedClient: Client | null = null;
let clientInitAttempted = false;

/**
 * Mengambil kredensial Turso dari environment server/build
 */
function getTursoCredentials(): { url: string; authToken: string } {
  const url = (
    (typeof import.meta !== 'undefined' && import.meta.env?.TURSO_DATABASE_URL) ||
    process.env.TURSO_DATABASE_URL ||
    ''
  ).trim();

  const authToken = (
    (typeof import.meta !== 'undefined' && import.meta.env?.TURSO_AUTH_TOKEN) ||
    process.env.TURSO_AUTH_TOKEN ||
    ''
  ).trim();

  return { url, authToken };
}

/**
 * Menginisialisasi dan me-reuse instance @libsql/client
 */
export function getTursoClient(): Client | null {
  if (cachedClient) return cachedClient;
  if (clientInitAttempted) return null;

  const { url, authToken } = getTursoCredentials();
  if (!url) {
    clientInitAttempted = true;
    return null;
  }

  try {
    cachedClient = createClient({
      url,
      authToken: authToken || undefined,
    });
    clientInitAttempted = true;
    return cachedClient;
  } catch (err) {
    console.warn('[TursoBuildClient] Gagal inisialisasi client Turso:', (err as Error)?.message || err);
    clientInitAttempted = true;
    return null;
  }
}

/**
 * Memeriksa apakah Turso build client siap digunakan
 */
export function isTursoBuildConfigured(): boolean {
  const { url } = getTursoCredentials();
  return Boolean(url);
}

/**
 * 1. Mengambil data paket menu dan whitelist beranda langsung dari Turso
 */
export async function getBuildMenuCatalog(): Promise<{
  packages: BackendPackageDto[];
  whitelist: string[];
} | null> {
  const client = getTursoClient();
  if (!client) return null;

  try {
    const [pkgRes, settingsRes] = await Promise.all([
      client.execute('SELECT * FROM menu_packages ORDER BY id ASC'),
      client.execute("SELECT value FROM system_settings WHERE key = 'homepage_package_whitelist'"),
    ]);

    let whitelist: string[] = [];
    if (settingsRes.rows.length > 0) {
      try {
        const rawVal = settingsRes.rows[0].value;
        if (typeof rawVal === 'string') {
          const parsed = JSON.parse(rawVal);
          if (Array.isArray(parsed)) whitelist = parsed;
        }
      } catch {}
    }

    const packages: BackendPackageDto[] = pkgRes.rows.map((row: any) => {
      let parsedItems: string[] = [];
      if (typeof row.items === 'string') {
        try {
          const p = JSON.parse(row.items);
          parsedItems = Array.isArray(p) ? p : [row.items];
        } catch {
          parsedItems = row.items.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean);
        }
      } else if (Array.isArray(row.items)) {
        parsedItems = row.items;
      }

      let parsedCustomSlots = null;
      if (typeof row.custom_slots === 'string') {
        try {
          parsedCustomSlots = JSON.parse(row.custom_slots);
        } catch {}
      } else if (row.custom_slots) {
        parsedCustomSlots = row.custom_slots;
      }

      return {
        id: String(row.id || ''),
        slug: String(row.slug || row.id || ''),
        name: String(row.name || ''),
        nama: String(row.name || ''),
        category: String(row.category || 'Nasi Kotak'),
        price_per_pax: Number(row.price_per_pax || 0),
        harga: Number(row.price_per_pax || 0),
        min_pax: Number(row.min_pax || 20),
        badge: row.badge ? String(row.badge) : null,
        description: row.description ? String(row.description) : '',
        image: row.image || row.foto || '/images/menu/paket-20k.webp',
        foto: row.foto || row.image || '/images/menu/paket-20k.webp',
        items: parsedItems,
        custom_slots: parsedCustomSlots,
        can_customize: row.can_customize !== undefined ? Boolean(row.can_customize) : false,
        main_dish: row.main_dish ? String(row.main_dish) : null,
        is_active: row.is_active !== undefined ? Boolean(row.is_active) : true,
      };
    });

    console.log(`[TursoBuildClient] Berhasil memuat ${packages.length} paket menu dari Turso Cloud (SSG Snapshot).`);
    return { packages, whitelist };
  } catch (err) {
    console.warn('[TursoBuildClient] Query menu_packages gagal:', (err as Error)?.message || err);
    return null;
  }
}

/**
 * 2. Mengambil seluruh master jajanan satuan dari Turso
 */
export async function getBuildSnackItems(): Promise<BackendSnackItemDto[] | null> {
  const client = getTursoClient();
  if (!client) return null;

  try {
    const res = await client.execute('SELECT * FROM snack_items ORDER BY sort_order ASC, id ASC');
    const items: BackendSnackItemDto[] = res.rows.map((row: any) => ({
      id: String(row.id),
      name: String(row.name || ''),
      category: String(row.category || 'Lainnya'),
      price: Number(row.price || 0),
      is_active: Boolean(row.is_active),
      sort_order: Number(row.sort_order || 0),
    }));

    console.log(`[TursoBuildClient] Berhasil memuat ${items.length} master snack dari Turso Cloud.`);
    return items;
  } catch (err) {
    console.warn('[TursoBuildClient] Query snack_items gagal:', (err as Error)?.message || err);
    return null;
  }
}

/**
 * 3. Mengambil sertifikasi & legalitas aktif dari Turso
 */
export async function getBuildCertifications(): Promise<CertificationItem[] | null> {
  const client = getTursoClient();
  if (!client) return null;

  try {
    const res = await client.execute('SELECT * FROM certifications WHERE is_active = 1 ORDER BY id ASC');
    const certs: CertificationItem[] = res.rows.map((row: any) => {
      const docUrl = String(row.document_url || '');
      const defaultType = docUrl.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image';

      return {
        id: row.id,
        title: String(row.title || row.label || 'Dokumen Resmi'),
        issuer: String(row.issuer || row.detail || 'Dzanis Catering'),
        certNumber: String(row.cert_number || row.meta || '-'),
        validUntil: String(row.valid_until || row.date || 'Aktif Berlaku'),
        category: (String(row.category || 'sertifikat').toLowerCase().includes('legal') ? 'legalitas' : 'sertifikat') as DocumentCategory,
        badge: String(row.badge || (row.category === 'legalitas' ? 'LEGALITAS' : 'RESMI')),
        documentUrl: docUrl,
        fileType: (row.file_type || defaultType) as DocumentFileType,
        isActive: Boolean(row.is_active),
      };
    });

    console.log(`[TursoBuildClient] Berhasil memuat ${certs.length} dokumen sertifikasi aktif dari Turso Cloud.`);
    return certs;
  } catch (err) {
    console.warn('[TursoBuildClient] Query certifications gagal:', (err as Error)?.message || err);
    return null;
  }
}

/**
 * 4. Mengambil nomor WhatsApp aktif dari Turso (fallback 6281324383858)
 */
export async function getBuildActiveContact(): Promise<{ phone: string; phoneDisplay: string }> {
  const DEFAULT_PHONE = '6281324383858';
  const DEFAULT_DISPLAY = '0813-2438-3858';

  const client = getTursoClient();
  if (!client) {
    return { phone: DEFAULT_PHONE, phoneDisplay: DEFAULT_DISPLAY };
  }

  try {
    const res = await client.execute("SELECT value FROM system_settings WHERE key = 'active_whatsapp_phone'");
    if (res.rows.length > 0 && res.rows[0].value) {
      const raw = String(res.rows[0].value).trim();
      let digits = raw.replace(/\D/g, '');
      if (digits.startsWith('0')) digits = '62' + digits.slice(1);

      if (digits) {
        let display = digits;
        if (digits.startsWith('62')) display = '0' + digits.slice(2);
        if (display.length >= 10) {
          display = `${display.slice(0, 4)}-${display.slice(4, 8)}-${display.slice(8)}`;
        }
        return { phone: digits, phoneDisplay: display };
      }
    }
  } catch (err) {
    console.warn('[TursoBuildClient] Query active_whatsapp_phone gagal:', (err as Error)?.message || err);
  }

  return { phone: DEFAULT_PHONE, phoneDisplay: DEFAULT_DISPLAY };
}
