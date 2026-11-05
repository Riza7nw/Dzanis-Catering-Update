/**
 * Service: Lead & Order Ingestion Service
 * Mengirim inquiry pelanggan ke endpoint POST /api/leads di backend `dzaniez-back`
 * secara non-blocking (fire-and-forget) sebelum membuka WhatsApp.
 */

import type { BackendLeadPayload, BackendLeadResponse } from '../../types/api';
import { getApiBaseUrl, getCommonApiHeaders } from './apiConfig.ts';

/**
 * Mengirimkan data lead pemesanan ke backend secara non-blocking.
 * Jika backend sedang offline, fungsi ini gagal secara diam (silent-fail)
 * agar tidak menghalangi proses pengalihan ke WhatsApp.
 */
export async function submitLead(payload: BackendLeadPayload): Promise<BackendLeadResponse> {
  const apiBase = getApiBaseUrl();
  if (!apiBase) {
    return { success: false, message: 'Backend tidak dikonfigurasi, inquiry langsung diteruskan ke WhatsApp' };
  }
  const endpoint = `${apiBase}/api/leads`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        ...getCommonApiHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
      signal: AbortSignal.timeout(3000), // Timeout pendek 3 detik agar tidak menghambat UX
    });

    if (res.ok) {
      const data: BackendLeadResponse = await res.json();
      return {
        success: Boolean(data.success),
        message: data.message || 'Lead berhasil dicatat',
        lead_id: data.lead_id,
      };
    }
  } catch (err) {
    // Non-blocking error handling: Log peringatan saja tanpa throw exception
    console.warn('[leadService] Lead ingestion skipped (backend offline):', (err as Error)?.message || err);
  }

  return {
    success: false,
    message: 'Backend offline, inquiry langsung diteruskan ke WhatsApp',
  };
}
