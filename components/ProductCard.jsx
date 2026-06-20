/**
 * components/ProductCard.jsx
 * Flojava Marketplace — Product Card Component
 *
 * Versi disederhanakan dari ProductCard.tsx, disesuaikan dengan skema
 * database YANG SEBENARNYA ADA SEKARANG (tabel `products`):
 *   id, vendor_id, name, price, stock, description, image_url
 *
 * Field yang di-skip untuk sekarang (origin, discount, rating, badges
 * domain kopi) karena belum ada kolomnya di database — tapi props untuk
 * itu disediakan sebagai OPSIONAL, jadi kalau nanti skema di-upgrade
 * (roadmap Tahap 4), komponen ini tidak perlu ditulis ulang, cukup
 * field optionalnya mulai diisi data sungguhan.
 *
 * Dipertahankan dari desain asli:
 *   - Sub-komponen didefinisikan di luar ProductCard (tidak re-create tiap render)
 *   - useCallback untuk stabilkan referensi handler
 *   - Wishlist optimistic UI (state lokal sync dari prop via effect)
 *   - Skeleton loader dengan struktur DOM yang sama (cegah layout shift)
 *   - Fallback gambar inline SVG saat <img> gagal load (tanpa request tambahan)
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Badge, BadgeGroup } from './ui/Badge';
import { StarRatingCompact } from './ui/StarRating';
import {
  formatPrice,
  formatDiscountBadge,
  formatStockMessageSimple,
  truncateProductDescription,
  truncateProductName,
} from '../utils/formatters';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// ── Sub-komponen: gambar produk + fallback ───────────────────────────────

function ImageFallback({ name }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#E8DDD3] to-[#D4C4B4] select-none pointer-events-none"
      aria-hidden="true"
    >
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="24" cy="24" rx="18" ry="13" fill="#C67B3A" opacity=".25" />
        <ellipse cx="24" cy="24" rx="13" ry="9" fill="#C67B3A" opacity=".35" />
        <path d="M24 16 C20 20 20 28 24 32 C28 28 28 20 24 16Z" fill="#C67B3A" opacity=".6" />
      </svg>
      <span className="mt-2 text-[10px] tracking-widest uppercase text-[#8A7668] font-medium">
        {truncateProductName(name)}
      </span>
    </div>
  );
}

function CardImage({ imageUrl, productName, isUnavailable, onError, hasError }) {
  return (
    <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#E8DDD3]">
      {!hasError && imageUrl ? (
        <img
          src={imageUrl}
          alt={productName}
          onError={onError}
          loading="lazy"
          className={cn(
            'w-full h-full object-cover transition-transform duration-300 ease-out',
            'group-hover:scale-[1.04]',
            isUnavailable ? 'grayscale-[40%]' : undefined,
          )}
        />
      ) : (
        <ImageFallback name={productName} />
      )}
    </div>
  );
}

// ── Sub-komponen: badge stok/diskon di atas gambar ───────────────────────

function ImageOverlayBadges({ stockShort, discountLabel }) {
  const hasAnything = stockShort !== null || discountLabel !== null;
  if (!hasAnything) return null;

  return (
    <div className="absolute top-2.5 left-2.5 z-10">
      <BadgeGroup direction="vertical" gap="xs">
        {discountLabel !== null && (
          <Badge variant="sale" size="xs" aria-hidden="true">
            {discountLabel}
          </Badge>
        )}
        {stockShort !== null && (
          <Badge variant="warning" size="xs" screenReaderLabel={stockShort}>
            {stockShort}
          </Badge>
        )}
      </BadgeGroup>
    </div>
  );
}

function OutOfStockOverlay() {
  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center bg-[#FAF6F0]/60 backdrop-blur-[2px]"
      aria-hidden="true"
    >
      <span className="font-serif text-[13px] font-semibold text-[#3D1F0D] tracking-[0.14em] uppercase border border-[#3D1F0D]/60 rounded px-4 py-1.5 bg-white/80">
        Stok Habis
      </span>
    </div>
  );
}

function WishlistButton({ isWishlisted, productName, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'absolute top-2.5 right-2.5 z-20',
        'w-8 h-8 rounded-full flex items-center justify-center',
        'bg-white/85 backdrop-blur-sm transition-all duration-150',
        'hover:bg-white hover:scale-110 active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C67B3A] focus-visible:ring-offset-1',
      )}
      aria-label={isWishlisted ? `Hapus ${productName} dari wishlist` : `Tambah ${productName} ke wishlist`}
      aria-pressed={isWishlisted}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={isWishlisted ? '#C67B3A' : 'none'}
        stroke={isWishlisted ? '#C67B3A' : '#3D1F0D'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}

// ── Sub-komponen: harga ──────────────────────────────────────────────────

function PriceDisplay({ price, discountedPrice }) {
  const hasDiscount = discountedPrice !== undefined && discountedPrice !== null && discountedPrice < price;
  const effectivePrice = hasDiscount ? discountedPrice : price;

  return (
    <div className="flex flex-col gap-0.5">
      {hasDiscount && (
        <span className="text-[11px] text-[#8A7668] line-through" aria-label={`Harga normal ${formatPrice(price)}`}>
          {formatPrice(price)}
        </span>
      )}
      <span
        className={cn('font-medium leading-none text-base', hasDiscount ? 'text-[#C67B3A]' : 'text-[#3D1F0D]')}
        aria-label={`Harga ${formatPrice(effectivePrice)}`}
      >
        {formatPrice(effectivePrice)}
      </span>
    </div>
  );
}

// ── Sub-komponen: tombol tambah ke keranjang ─────────────────────────────

const CART_BUTTON_CONFIG = {
  available: {
    label: 'Tambah',
    ariaLabel: (name) => `Tambah ${name} ke keranjang`,
    disabled: false,
  },
  unavailable: {
    label: 'Habis',
    ariaLabel: () => 'Produk sedang tidak tersedia',
    disabled: true,
  },
};

function AddToCartButton({ isAvailable, productName, onClick }) {
  const config = isAvailable ? CART_BUTTON_CONFIG.available : CART_BUTTON_CONFIG.unavailable;
  const isDisabled = config.disabled;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      className={cn(
        'flex items-center gap-1.5 shrink-0 h-8 px-3.5 rounded-lg',
        'text-[11px] font-medium tracking-wide whitespace-nowrap',
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#C67B3A]',
        !isDisabled && ['bg-[#1C1008] text-[#F7F3EE]', 'hover:bg-[#3D1F0D]', 'active:scale-95'],
        isDisabled && ['bg-[#E8DDD3] text-[#8A7668]', 'cursor-not-allowed'],
      )}
      aria-label={config.ariaLabel(productName)}
    >
      {!isDisabled && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      )}
      {config.label}
    </button>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────

/**
 * ProductCardSkeleton — placeholder saat data belum tersedia.
 * @example
 * {isLoading && Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={i} />)}
 */
export function ProductCardSkeleton({ className }) {
  return (
    <article
      className={cn('flex flex-col bg-white rounded-2xl border border-[#3D1F0D]/[0.07] overflow-hidden animate-pulse', className)}
      aria-label="Memuat produk..."
      aria-busy="true"
    >
      <div className="w-full aspect-[4/3] bg-[#E8DDD3]" />
      <div className="flex flex-col gap-2.5 p-4">
        <div className="h-4 w-4/5 bg-[#E8DDD3] rounded-full" />
        <div className="h-4 w-3/5 bg-[#E8DDD3] rounded-full" />
        <div className="h-3 w-2/5 bg-[#E8DDD3] rounded-full" />
        <div className="flex items-center justify-between pt-3 mt-1 border-t border-[#E8DDD3]">
          <div className="flex flex-col gap-1.5">
            <div className="h-2.5 w-20 bg-[#E8DDD3] rounded-full" />
            <div className="h-4 w-24 bg-[#E8DDD3] rounded-full" />
          </div>
          <div className="h-8 w-20 bg-[#E8DDD3] rounded-lg" />
        </div>
      </div>
    </article>
  );
}

// ── ProductCard utama ──────────────────────────────────────────────────────

/**
 * ProductCard — kartu produk utama Flojava Marketplace.
 *
 * Props `product` mengikuti bentuk response API kamu sekarang:
 *   { id, name, price, stock, description, image_url, vendor_name? }
 *
 * Props opsional untuk fitur masa depan (belum ada datanya, aman jika tidak diisi):
 *   product.rating: { score, reviewCount }
 *   product.discountedPrice: number
 *
 * @example
 * <ProductCard
 *   product={p}
 *   isWishlisted={wishlist.has(p.id)}
 *   onAddToCart={handleAddToCart}
 *   onWishlistToggle={handleWishlistToggle}
 *   onCardClick={handleCardClick}
 * />
 */
export function ProductCard({
  product,
  isWishlisted = false,
  onAddToCart,
  onWishlistToggle,
  onCardClick,
  className,
  isLoading = false,
}) {
  const [imgError, setImgError] = useState(false);
  const [localWishlisted, setLocalWishlisted] = useState(isWishlisted);

  useEffect(() => {
    setLocalWishlisted(isWishlisted);
  }, [isWishlisted]);

  const handleImgError = useCallback(() => setImgError(true), []);

  const handleWishlistClick = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      setLocalWishlisted((prev) => !prev);
      onWishlistToggle?.(product.id);
    },
    [onWishlistToggle, product?.id],
  );

  const handleCartClick = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      const stockQty = Number(product?.stock ?? 0);
      if (stockQty > 0) {
        onAddToCart?.(product.id);
      }
    },
    [onAddToCart, product?.id, product?.stock],
  );

  const handleCardClick = useCallback(() => {
    const stockQty = Number(product?.stock ?? 0);
    if (stockQty > 0) {
      onCardClick?.(product.id);
    }
  }, [onCardClick, product?.id, product?.stock]);

  const handleCardKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCardClick();
      }
    },
    [handleCardClick],
  );

  if (isLoading || !product) {
    return <ProductCardSkeleton className={className} />;
  }

  const stockQty = Number(product.stock ?? 0);
  const isAvailable = stockQty > 0;
  const stockMsg = formatStockMessageSimple(stockQty);
  const displayName = product.name ?? 'Produk';
  const truncName = truncateProductName(displayName);
  const truncDesc = product.description ? truncateProductDescription(product.description) : null;

  // Field opsional — aman jika belum ada di response API
  const discountedPrice = product.discountedPrice;
  const discountLabel =
    discountedPrice && discountedPrice < product.price
      ? formatDiscountBadge(Math.round(((product.price - discountedPrice) / product.price) * 100))
      : null;
  const rating = product.rating;

  const cardAriaLabel = [displayName, !isAvailable ? 'Stok habis' : null, rating ? `Rating ${rating.score} dari 5` : null]
    .filter(Boolean)
    .join(', ');

  return (
    <article
      className={cn(
        'group relative flex flex-col bg-white rounded-2xl border border-[#3D1F0D]/[0.07] overflow-hidden',
        isAvailable && 'cursor-pointer',
        isAvailable && [
          'transition-all duration-200 ease-out',
          'hover:-translate-y-1',
          'hover:shadow-[0_8px_32px_rgba(60,20,5,0.12)]',
          'hover:border-[#3D1F0D]/[0.14]',
        ],
        !isAvailable && 'opacity-80',
        className,
      )}
      aria-label={cardAriaLabel}
      tabIndex={onCardClick ? 0 : undefined}
      role={onCardClick ? 'button' : undefined}
      onClick={onCardClick ? handleCardClick : undefined}
      onKeyDown={onCardClick ? handleCardKeyDown : undefined}
    >
      <div className="relative">
        <CardImage
          imageUrl={product.image_url}
          productName={displayName}
          isUnavailable={!isAvailable}
          onError={handleImgError}
          hasError={imgError}
        />

        <ImageOverlayBadges stockShort={stockMsg.short} discountLabel={discountLabel} />

        <WishlistButton isWishlisted={localWishlisted} productName={displayName} onClick={handleWishlistClick} />

        {!isAvailable && <OutOfStockOverlay />}
      </div>

      <div className="flex flex-col gap-1.5 p-4 flex-1">
        {product.vendor_name && (
          <p className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#C67B3A] truncate">
            {product.vendor_name}
          </p>
        )}

        <h3
          className="font-serif font-semibold leading-snug text-[17px] text-[#1C1008] line-clamp-2"
          title={displayName}
        >
          {truncName}
        </h3>

        {truncDesc !== null && (
          <p className="text-[12px] text-[#8A7668] leading-relaxed line-clamp-2">{truncDesc}</p>
        )}

        {rating ? (
          <StarRatingCompact score={rating.score} reviewCount={rating.reviewCount} />
        ) : (
          <span className="text-[11px] text-[#8A7668] italic">Belum ada ulasan</span>
        )}

        <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-[#E8DDD3]">
          <PriceDisplay price={product.price} discountedPrice={discountedPrice} />
          <AddToCartButton isAvailable={isAvailable} productName={displayName} onClick={handleCartClick} />
        </div>
      </div>
    </article>
  );
}

export default ProductCard;

// ── ProductCardGrid ────────────────────────────────────────────────────────

/**
 * ProductCardGrid — menampilkan daftar ProductCard dalam grid responsif,
 * dengan loading skeleton dan empty state.
 *
 * @example
 * <ProductCardGrid products={products} isLoading={isFetching} onAddToCart={handleAddToCart} />
 */
export function ProductCardGrid({
  products,
  isLoading = false,
  skeletonCount = 8,
  emptyMessage = 'Tidak ada produk yang ditemukan.',
  onAddToCart,
  onWishlistToggle,
  onCardClick,
}) {
  return (
    <section aria-label="Daftar produk" aria-busy={isLoading}>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isLoading ? 'Memuat produk...' : `${products.length} produk ditemukan`}
      </div>

      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: skeletonCount }, (_, i) => <ProductCardSkeleton key={`skeleton-${i}`} />)
          : products.length > 0
          ? products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onWishlistToggle={onWishlistToggle}
                onCardClick={onCardClick}
              />
            ))
          : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center" role="status">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D4C4B4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mb-4">
                  <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                  <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                  <line x1="6" x2="6" y1="2" y2="4" />
                  <line x1="10" x2="10" y1="2" y2="4" />
                  <line x1="14" x2="14" y1="2" y2="4" />
                </svg>
                <p className="text-[14px] text-[#8A7668] font-medium">{emptyMessage}</p>
              </div>
            )}
      </div>
    </section>
  );
}