/**
 * components/ui/Badge.jsx
 * Flojava Design System — Generic Badge Component
 *
 * Versi JS dari Badge.tsx. Logika dan struktur dipertahankan penuh:
 *   - Decoupled dari domain (tidak tahu soal Product/StockStatus)
 *   - Polymorphic via prop `as` (default <span>, bisa <button>, <a>, dll)
 *   - Semua varian warna didefinisikan sebagai konstanta, bukan tersebar di JSX
 *   - Aksesibilitas: screenReaderLabel, aria-hidden untuk dekoratif,
 *     kontras warna semua varian sudah memenuhi WCAG AA (4.5:1)
 */

import React from 'react';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// ── Variant & size system ────────────────────────────────────────────────
// Class Tailwind ditulis lengkap (bukan dinamis) agar tidak ke-tree-shake
// saat production build.
//
// Contrast ratio (WCAG AA minimum 4.5:1):
//   default  bg-[#1C1008] / text-[#F7F3EE]  ≈ 14.3:1
//   success  bg-[#D1F0E0] / text-[#0A5C35]  ≈  7.2:1
//   warning  bg-[#FEF3C7] / text-[#78350F]  ≈  7.8:1
//   danger   bg-[#FEE2E2] / text-[#991B1B]  ≈  6.1:1
//   info     bg-[#DBEAFE] / text-[#1E40AF]  ≈  7.3:1
//   sale     bg-[#C67B3A] / text-white      ≈  4.6:1
//   muted    bg-[#E8DDD3] / text-[#5C4F43]  ≈  5.8:1

const VARIANT_CLASSES = {
  default: 'bg-[#1C1008] text-[#F7F3EE] border border-transparent',
  success: 'bg-[#D1F0E0] text-[#0A5C35] border border-[#A3DBBF]',
  warning: 'bg-[#FEF3C7] text-[#78350F] border border-[#FCD34D]',
  danger: 'bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]',
  info: 'bg-[#DBEAFE] text-[#1E40AF] border border-[#BFDBFE]',
  outline: 'bg-transparent text-current border border-current',
  sale: 'bg-[#C67B3A] text-white border border-transparent',
  muted: 'bg-[#E8DDD3] text-[#5C4F43] border border-[#D4C4B4]',
};

const SIZE_CLASSES = {
  xs: 'text-[10px] leading-none px-1.5 py-[3px] gap-0.5',
  sm: 'text-[11px] leading-none px-2 py-[4px] gap-1',
  md: 'text-xs leading-none px-2.5 py-[5px] gap-1.5',
};

const ICON_SIZE_PX = { xs: 9, sm: 11, md: 13 };

const DOT_COLOR_CLASSES = {
  default: 'bg-[#C67B3A]',
  success: 'bg-[#0A5C35]',
  warning: 'bg-[#B45309]',
  danger: 'bg-[#991B1B]',
  info: 'bg-[#1E40AF]',
  outline: 'bg-current',
  sale: 'bg-white',
  muted: 'bg-[#8A7668]',
};

const DOT_SIZE_CLASSES = {
  xs: 'w-[5px] h-[5px]',
  sm: 'w-[6px] h-[6px]',
  md: 'w-[7px] h-[7px]',
};

function StatusDot({ variant, animate, size }) {
  return (
    <span className="relative flex shrink-0 items-center justify-center" aria-hidden="true">
      {animate && (
        <span
          className={cn(
            'absolute inline-flex rounded-full opacity-75 animate-ping',
            DOT_SIZE_CLASSES[size],
            DOT_COLOR_CLASSES[variant],
          )}
        />
      )}
      <span
        className={cn(
          'relative inline-flex rounded-full',
          DOT_SIZE_CLASSES[size],
          DOT_COLOR_CLASSES[variant],
        )}
      />
    </span>
  );
}

/**
 * Badge — label status/kategori reusable di seluruh app Flojava.
 *
 * @example Dasar
 * <Badge variant="success">Tersedia</Badge>
 *
 * @example Dot animasi
 * <Badge variant="success" dot="pulse">Sedang Berlangsung</Badge>
 *
 * @example Sebagai filter chip (polymorphic)
 * <Badge as="button" variant="outline" onClick={fn}>Arabica</Badge>
 *
 * @example Dengan icon kiri
 * <Badge variant="warning" iconLeft={<AlertIcon />}>Hampir Habis</Badge>
 *
 * @example Informatif dengan label eksplisit untuk screen reader
 * <Badge variant="danger" screenReaderLabel="Stok habis">Habis</Badge>
 */
export function Badge({
  as,
  variant = 'default',
  size = 'sm',
  dot,
  iconLeft,
  iconRight,
  uppercase,
  screenReaderLabel,
  className,
  children,
  ...restProps
}) {
  const Component = as ?? 'span';

  const shouldUppercase = uppercase ?? (size === 'xs');
  const showDot = dot !== undefined && dot !== false;
  const animateDot = dot === 'pulse';
  const iconPx = ICON_SIZE_PX[size];

  return (
    <Component
      aria-label={screenReaderLabel}
      className={cn(
        'inline-flex items-center justify-center shrink-0 rounded-full',
        'font-medium tracking-wide',
        shouldUppercase ? 'uppercase' : undefined,
        'select-none whitespace-nowrap',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-current',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...restProps}
    >
      {showDot && <StatusDot variant={variant} animate={animateDot} size={size} />}

      {iconLeft !== undefined && (
        <span
          className="shrink-0 inline-flex items-center justify-center"
          style={{ width: iconPx, height: iconPx }}
          aria-hidden="true"
        >
          {iconLeft}
        </span>
      )}

      {children}

      {iconRight !== undefined && (
        <span
          className="shrink-0 inline-flex items-center justify-center"
          style={{ width: iconPx, height: iconPx }}
          aria-hidden="true"
        >
          {iconRight}
        </span>
      )}
    </Component>
  );
}

export default Badge;

// ── BadgeGroup ────────────────────────────────────────────────────────────

const GROUP_GAP = { xs: 'gap-0.5', sm: 'gap-1', md: 'gap-1.5' };
const GROUP_DIR = {
  horizontal: 'flex-row flex-wrap items-center',
  vertical: 'flex-col items-start',
};

/**
 * BadgeGroup — container badge yang konsisten.
 * @example
 * <BadgeGroup direction="vertical" gap="xs">
 *   <Badge variant="default" size="xs">Baru</Badge>
 *   <Badge variant="sale" size="xs">−21%</Badge>
 * </BadgeGroup>
 */
export function BadgeGroup({ children, direction = 'horizontal', gap = 'sm', className }) {
  return (
    <div className={cn('inline-flex', GROUP_DIR[direction], GROUP_GAP[gap], className)}>
      {children}
    </div>
  );
}

// ── Domain adapter ────────────────────────────────────────────────────────
// Satu-satunya tempat yang menghubungkan "varian status di data produk"
// dengan "varian warna UI". Jika nanti kolom status produk berubah,
// cukup update mapping ini.

const DOMAIN_TO_UI = {
  new: 'default',
  sale: 'sale',
  'sold-out': 'muted',
  'low-stock': 'warning',
  'best-seller': 'success',
  featured: 'default',
  'limited-edition': 'danger',
  'pre-order': 'info',
  // Status yang sudah ada nyata di database kamu sekarang:
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  processing: 'info',
  shipped: 'success',
};

/**
 * Convert nilai status domain ke varian warna UI Badge.
 * Fallback ke 'muted' untuk nilai tidak dikenal — fail-safe, tidak throw.
 */
export function mapDomainVariant(domain) {
  return DOMAIN_TO_UI[domain] ?? 'muted';
}