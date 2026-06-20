/**
 * utils/formatters.js
 * Flojava Marketplace — Pure Formatting & Calculation Utilities
 *
 * Versi disederhanakan dari formatters.tsx (TypeScript) agar bisa langsung
 * dipakai di project ini (Vite + React JS biasa, tanpa TypeScript compiler).
 *
 * Fungsi yang membutuhkan field yang BELUM ada di database (discount, stock
 * status detail, origin, dll) DIHAPUS dulu — bukan dihilangkan permanen,
 * cukup ditambahkan kembali nanti saat skema database di-upgrade (Tahap 4
 * roadmap). Fungsi inti (format harga, berat, rating, teks) tetap dipakai
 * penuh karena tidak tergantung skema kopi yang detail.
 *
 * Prinsip desain (dipertahankan dari versi asli):
 *   1. Pure functions — output hanya bergantung pada input
 *   2. Fail-safe — input tidak valid menghasilkan fallback aman, bukan throw
 *   3. Locale-aware — semua format angka pakai Intl API
 */

const LOCALE_ID = 'id-ID';

const CURRENCY_FORMAT_OPTIONS = {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
};

const COMPACT_FORMAT_OPTIONS = {
  style: 'currency',
  currency: 'IDR',
  notation: 'compact',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
};

const MIN_DISPLAY_DISCOUNT_PERCENT = 1;
const KG_THRESHOLD_GRAMS = 1000;
const ELLIPSIS = '\u2026';

// ── Internal primitives ──────────────────────────────────────────────────

function isFiniteNumber(value) {
  return Number.isFinite(value);
}

function isNonNegative(value) {
  return value >= 0;
}

function roundTo(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

// Cache instance Intl.NumberFormat — mahal untuk dibuat ulang setiap render
const formatterCache = new Map();

function getFormatter(locale, options) {
  const key = `${locale}:${JSON.stringify(options)}`;
  if (!formatterCache.has(key)) {
    formatterCache.set(key, new Intl.NumberFormat(locale, options));
  }
  return formatterCache.get(key);
}

// ── Price formatters ─────────────────────────────────────────────────────

/**
 * Format angka ke string harga Rupiah Indonesia.
 * formatPrice(89000) → "Rp 89.000"
 * formatPrice(NaN)   → "Harga tidak tersedia"
 */
export function formatPrice(amount) {
  if (!isFiniteNumber(amount) || !isNonNegative(amount)) {
    return 'Harga tidak tersedia';
  }
  try {
    return getFormatter(LOCALE_ID, CURRENCY_FORMAT_OPTIONS).format(amount);
  } catch {
    return `Rp ${Math.round(amount).toLocaleString(LOCALE_ID)}`;
  }
}

/**
 * Format harga ke notasi kompak untuk ruang UI sempit.
 * formatPriceCompact(1500000) → "Rp 1,5 jt"
 */
export function formatPriceCompact(amount) {
  if (!isFiniteNumber(amount) || !isNonNegative(amount)) {
    return 'Harga tidak tersedia';
  }
  try {
    return getFormatter(LOCALE_ID, COMPACT_FORMAT_OPTIONS).format(amount);
  } catch {
    return formatPrice(amount);
  }
}

// ── Discount calculators (dipertahankan, dipakai saat kolom diskon ada) ──

/**
 * Hitung persentase diskon dari dua harga. Selalu 0 untuk input invalid.
 * calcDiscountPercent(125000, 99000) → 21
 */
export function calcDiscountPercent(originalPrice, discountedPrice) {
  if (
    !isFiniteNumber(originalPrice) || !isNonNegative(originalPrice) ||
    !isFiniteNumber(discountedPrice) || !isNonNegative(discountedPrice)
  ) return 0;

  if (originalPrice === 0) return 0;
  if (discountedPrice >= originalPrice) return 0;

  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

/**
 * Format label badge diskon, mis. "−21%". null jika di bawah threshold.
 */
export function formatDiscountBadge(discountPercent) {
  if (!isFiniteNumber(discountPercent) || discountPercent < MIN_DISPLAY_DISCOUNT_PERCENT) {
    return null;
  }
  const clamped = Math.min(100, Math.max(0, Math.round(discountPercent)));
  return `\u2212${clamped}%`;
}

// ── Weight formatters ────────────────────────────────────────────────────

/**
 * Format berat dengan unit kontekstual (gram/kilogram).
 * formatWeight(250)  → "250 g"
 * formatWeight(1500) → "1,5 kg"
 */
export function formatWeight(grams) {
  if (!isFiniteNumber(grams) || !isNonNegative(grams)) {
    return 'Berat tidak valid';
  }
  const NBSP = '\u00A0';
  if (grams < KG_THRESHOLD_GRAMS) {
    return `${Math.round(grams)}${NBSP}g`;
  }
  const kg = roundTo(grams / KG_THRESHOLD_GRAMS, 1);
  const kgStr = kg.toLocaleString(LOCALE_ID, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
  return `${kgStr}${NBSP}kg`;
}

// ── Text formatters ──────────────────────────────────────────────────────

/**
 * Truncate string di batas kata (word boundary), bukan potong sembarang.
 * truncateText('Arabica Gayo Single Origin', 20) → "Arabica Gayo Single…"
 */
export function truncateText(text, maxLength) {
  if (typeof text !== 'string') return '';

  const trimmed = text.trim();
  if (trimmed.length === 0) return '';
  if (trimmed.length <= maxLength) return trimmed;

  const safeMax = Math.max(4, Math.floor(maxLength));
  const sliceAt = safeMax - 1;
  const sliced = trimmed.slice(0, sliceAt);

  const lastSpace = sliced.lastIndexOf(' ');
  const zoneStart = Math.floor(sliceAt / 2);

  if (lastSpace > zoneStart) {
    return `${sliced.slice(0, lastSpace).trimEnd()}${ELLIPSIS}`;
  }
  return `${sliced.trimEnd()}${ELLIPSIS}`;
}

export function truncateProductName(name) {
  return truncateText(name, 40);
}

export function truncateProductDescription(description) {
  return truncateText(description, 80);
}

// ── Rating formatters (disimpan untuk dipakai saat fitur ulasan dibuat) ──

/**
 * Format skor rating ke 1 desimal, locale Indonesia. null jika di luar range.
 * formatRatingScore(4.8) → "4,8"
 */
export function formatRatingScore(score) {
  if (!isFiniteNumber(score) || score < 0 || score > 5) return null;
  return score.toLocaleString(LOCALE_ID, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

/**
 * Format jumlah ulasan, kompak untuk angka besar. null jika 0/invalid.
 * formatReviewCount(1200) → "(1,2 rb ulasan)"
 */
export function formatReviewCount(count) {
  if (!isFiniteNumber(count) || count <= 0) return null;
  const formatted = count.toLocaleString(LOCALE_ID, {
    notation: count >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  });
  return `(${formatted} ulasan)`;
}

// ── Stock helper (disederhanakan — DB cuma punya kolom `stock` angka) ────

/**
 * Hasilkan pesan stok dari angka stok mentah (kolom `stock` di DB sekarang).
 * Threshold "hampir habis" sengaja dibuat konfigurabel (default 5).
 *
 * formatStockMessageSimple(0)  → { short: "Habis", long: "Stok sedang habis" }
 * formatStockMessageSimple(3)  → { short: "Sisa 3", long: "Hanya tersisa 3 item" }
 * formatStockMessageSimple(50) → { short: null, long: null }
 */
export function formatStockMessageSimple(stockQty, lowStockThreshold = 5) {
  if (!isFiniteNumber(stockQty) || stockQty < 0) {
    return { short: null, long: null };
  }
  if (stockQty === 0) {
    return { short: 'Habis', long: 'Stok sedang habis' };
  }
  if (stockQty <= lowStockThreshold) {
    return { short: `Sisa ${stockQty}`, long: `Hanya tersisa ${stockQty} item` };
  }
  return { short: null, long: null };
}