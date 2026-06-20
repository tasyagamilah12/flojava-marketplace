/**
 * types/product.js
 * Flojava Marketplace — Product Domain Constants & Validators (REFERENSI)
 *
 * ⚠️ STATUS: BELUM DIPAKAI DI MANA PUN — disimpan sebagai referensi siap
 * pakai untuk Tahap 4 roadmap (upgrade skema database kopi detail).
 *
 * File asli (types/product.ts) ~95% berisi `interface`/`type` TypeScript
 * yang TIDAK PUNYA WUJUD APAPUN saat runtime — saat dikompilasi ke
 * JavaScript, semuanya hilang total. Tidak ada "versi JS" untuk itu,
 * karena memang tidak ada kode yang dijalankan.
 *
 * Yang ada di file ini hanyalah bagian yang BENAR-BENAR kode nyata saat
 * runtime di versi TypeScript-nya:
 *   1. Daftar nilai union type → konstanta array/objek
 *   2. toRatingScore() → validator dengan pengecekan range asli
 *   3. Type guard → fungsi boolean biasa
 *
 * SEMUA fungsi di sini (kecuali toRatingScore) memvalidasi field yang
 * BELUM ADA di tabel `products` kamu sekarang (yang cuma punya kolom
 * stock berupa angka, bukan StockStatus union). Jangan dipanggil di kode
 * production sampai skema database benar-benar di-upgrade.
 */

// ── Daftar nilai union type (Section 2 di file asli) ─────────────────────
// Berguna nanti untuk: <select> dropdown form tambah produk, validasi
// input, atau parameter filter pencarian.

export const STOCK_STATUSES = ['in-stock', 'low-stock', 'out-of-stock', 'pre-order'];

export const BADGE_VARIANTS = [
  'new', 'sale', 'sold-out', 'low-stock',
  'best-seller', 'featured', 'limited-edition', 'pre-order',
];

export const ROAST_LEVELS = ['light', 'medium', 'medium-dark', 'dark', 'extra-dark'];

export const COFFEE_VARIETIES = ['arabica', 'robusta', 'liberica', 'excelsa', 'blend'];

export const GRIND_TYPES = [
  'whole-bean', 'coarse', 'medium-coarse', 'medium', 'fine', 'extra-fine',
];

export const PROCESS_METHODS = ['natural', 'washed', 'honey', 'wet-hulled', 'anaerobic', 'other'];

export const PACKAGING_SIZES = [100, 200, 250, 500, 1000]; // gram

export const SORT_OPTIONS = ['price-asc', 'price-desc', 'rating', 'newest', 'popular'];

// ── Validator dengan logika asli (Section 1 di file asli) ────────────────

/**
 * Validasi skor rating selalu di rentang 0.0–5.0.
 * Di versi TypeScript ini juga berfungsi sebagai "branded type constructor"
 * (toRatingScore) — di JS biasa, branding hilang, tapi pengecekan range-nya
 * tetap berguna dan dipertahankan.
 *
 * toRatingScore(4.3) → 4.3
 * toRatingScore(7)   → throws RangeError
 */
export function toRatingScore(value) {
  if (value < 0 || value > 5) {
    throw new RangeError(`RatingScore harus 0–5, dapat: ${value}`);
  }
  return value;
}

// ── Type guard (Section 7 di file asli) ───────────────────────────────────
// Catatan: di TypeScript, fungsi-fungsi ini juga melakukan *type narrowing*
// (memberi tahu compiler "setelah ini, tipe X dijamin begini"). Itu manfaat
// khusus TypeScript yang tidak ada gunanya di JS biasa — yang tersisa di
// JS cuma nilai boolean hasil pengecekannya.

export function isValidStockStatus(value) {
  return typeof value === 'string' && STOCK_STATUSES.includes(value);
}

export function isValidRoastLevel(value) {
  return typeof value === 'string' && ROAST_LEVELS.includes(value);
}

/**
 * Cek apakah sebuah objek punya bentuk minimal ProductSummary yang valid.
 * BELUM BISA DIPAKAI sekarang — mengasumsikan field `stock.status` (object
 * bersarang) padahal tabel `products` kamu cuma punya kolom `stock` angka.
 */
export function isProductSummary(value) {
  if (typeof value !== 'object' || value === null) return false;

  return (
    typeof value.id === 'string' &&
    typeof value.slug === 'string' &&
    typeof value.name === 'string' &&
    typeof value.price === 'number' &&
    typeof value.weight === 'number' &&
    isValidStockStatus(value.stock?.status) &&
    typeof value.thumbnail === 'object' && value.thumbnail !== null
  );
}

/**
 * Predicate: apakah produk sedang diskon aktif?
 * BELUM BISA DIPAKAI sekarang — field `discount` belum ada di tabel `products`.
 */
export function isOnSale(product) {
  return (
    product.discount !== undefined &&
    product.discount.discountedPrice < product.discount.originalPrice
  );
}

/**
 * Predicate: apakah produk tidak bisa dibeli?
 * Versi yang SUDAH BISA dipakai sekarang ada di components/ProductCard.jsx
 * (cek langsung `stock > 0` dari kolom angka) — fungsi ini versi untuk
 * skema StockStatus union di masa depan.
 */
export function isUnavailable(product) {
  return product.stock?.status === 'out-of-stock';
}

/**
 * Predicate: apakah stok hampir habis?
 * BELUM BISA DIPAKAI sekarang — lihat catatan isUnavailable() di atas.
 */
export function isLowStock(product) {
  return product.stock?.status === 'low-stock';
}