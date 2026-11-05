/**
 * Pure Utility: Kalkulasi Harga & Porsi Pemesanan
 * Logika perhitungan subtotal, batas porsi (MoQ), dan harga snack tanpa dependensi DOM.
 */

/**
 * Menghitung batas jumlah porsi yang valid berdasarkan batas minimum pemesanan (MoQ).
 */
export function clampQuantity(rawQty: number | string, minOrder = 20, maxOrder = 500): number {
  const parsed = typeof rawQty === 'number' ? rawQty : parseInt(String(rawQty), 10);
  if (isNaN(parsed) || parsed < minOrder) return minOrder;
  if (parsed > maxOrder) return maxOrder;
  return parsed;
}

/**
 * Menghitung total harga paket nasi kotak (kuantitas * harga satuan).
 */
export function calculatePackageTotal(qty: number, unitPrice: number): number {
  const safeQty = Math.max(0, qty);
  const safePrice = Math.max(0, unitPrice);
  return safeQty * safePrice;
}

/**
 * Menghitung total harga paket snack box dari daftar harga item terpilih dan jumlah box.
 */
export function calculateSnackSubtotal(
  itemPrices: number[],
  boxCount: number
): { pricePerBox: number; totalPrice: number } {
  const pricePerBox = itemPrices.reduce((sum, p) => sum + (Number(p) || 0), 0);
  const safeBoxes = Math.max(0, boxCount);
  return {
    pricePerBox,
    totalPrice: pricePerBox * safeBoxes,
  };
}
