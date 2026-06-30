/**
 * components/ui/StarRating.jsx
 * Flojava Design System — Decimal-Accurate Star Rating Component
 *
 * Versi JS dari StarRating.tsx. Belum dipakai di mana pun saat ini karena
 * fitur ulasan/rating belum ada di database — disiapkan di sini supaya
 * siap pakai begitu tabel `reviews` dibuat (lihat roadmap Tahap 4+).
 *
 * Strategi render: setiap bintang adalah satu <path> SVG dengan
 * linearGradient unik (hard stop, bukan fade) supaya rating desimal seperti
 * 4.3 bisa direpresentasikan akurat — bukan dibulatkan ke 4 atau 5.
 *
 * useId() dipakai supaya gradient ID unik per instance — penting karena
 * SVG gradient ID bersifat global dalam satu dokumen; dua <StarRating>
 * di halaman yang sama tidak boleh berbagi ID gradient.
 */

import React, { useId } from 'react';
import { formatRatingScore, formatReviewCount } from '../../../../utils/formatters';

const STAR_COUNT = 5;

const STAR_PATH =
  'M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.48L10 14.27l-4.94 2.42.94-5.48-4-3.9 5.53-.8z';

const COLOR_FILLED = '#C67B3A';
const COLOR_EMPTY = '#D4C4B4';
const STAR_GAP = 2;
const STAR_UNIT = 20 + STAR_GAP;
const SVG_WIDTH = STAR_COUNT * STAR_UNIT - STAR_GAP;
const SVG_HEIGHT = 20;

const SIZE_PX = { xs: 10, sm: 12, md: 16, lg: 20 };
const LABEL_GAP = { xs: 'gap-1', sm: 'gap-1', md: 'gap-1.5', lg: 'gap-2' };
const LABEL_FONT = {
  xs: 'text-[10px]',
  sm: 'text-[11px]',
  md: 'text-[13px]',
  lg: 'text-[14px]',
};

/**
 * Hitung fill percentage untuk setiap bintang dari sebuah score.
 * calcStarFills(4.3) → [100, 100, 100, 100, 30]
 */
function calcStarFills(score) {
  const clamped = Math.max(0, Math.min(5, score));
  return [1, 2, 3, 4, 5].map((starIndex) => {
    if (clamped >= starIndex) return 100;
    if (clamped <= starIndex - 1) return 0;
    return Math.round((clamped - (starIndex - 1)) * 100);
  });
}

/**
 * Generate aria-label informatif dalam Bahasa Indonesia.
 * buildAriaLabel(4.3, 127) → "Rating 4,3 dari 5 — 127 ulasan"
 */
function buildAriaLabel(score, reviewCount) {
  if (score === 0) return 'Belum ada ulasan';

  const scoreStr = score.toLocaleString('id-ID', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const base = `Rating ${scoreStr} dari 5`;

  if (reviewCount === undefined || reviewCount <= 0) return base;

  const countStr = reviewCount.toLocaleString('id-ID', {
    notation: reviewCount >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  });
  return `${base} — ${countStr} ulasan`;
}

function StarShape({ gradientId, fillPercent, offsetX }) {
  const isFullyFilled = fillPercent >= 100;
  const isEmpty = fillPercent <= 0;

  const fillColor = isFullyFilled
    ? COLOR_FILLED
    : isEmpty
    ? COLOR_EMPTY
    : `url(#${gradientId})`;

  return (
    <g transform={`translate(${offsetX}, 0)`}>
      {!isFullyFilled && !isEmpty && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={COLOR_FILLED} />
            <stop offset={`${fillPercent}%`} stopColor={COLOR_FILLED} />
            <stop offset={`${fillPercent}%`} stopColor={COLOR_EMPTY} />
            <stop offset="100%" stopColor={COLOR_EMPTY} />
          </linearGradient>
        </defs>
      )}
      <path
        d={STAR_PATH}
        fill={fillColor}
        stroke={COLOR_FILLED}
        strokeWidth={isEmpty ? 0.5 : 0}
        strokeLinejoin="round"
      />
    </g>
  );
}

function StarDisplay({ fills, idPrefix, heightPx }) {
  const aspectRatio = SVG_WIDTH / SVG_HEIGHT;
  const renderedWidth = Math.round(heightPx * aspectRatio);

  return (
    <svg
      width={renderedWidth}
      height={heightPx}
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      role="presentation"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {fills.map((fillPercent, index) => (
        <StarShape
          key={index}
          gradientId={`${idPrefix}-star-${index}`}
          fillPercent={fillPercent}
          offsetX={index * STAR_UNIT}
        />
      ))}
    </svg>
  );
}

function RatingLabel({ score, reviewCount, showScore, showReviewCount, size }) {
  const scoreText = formatRatingScore(score);
  const countText = reviewCount !== undefined ? formatReviewCount(reviewCount) : null;

  if (!showScore && (!showReviewCount || countText === null)) return null;

  return (
    <span className={`flex items-center gap-0.5 ${LABEL_FONT[size]}`} aria-hidden="true">
      {showScore && scoreText !== null && (
        <span className="font-medium text-[#3D1F0D]">{scoreText}</span>
      )}
      {showReviewCount && countText !== null && (
        <span className="text-[#8A7668]">{countText}</span>
      )}
    </span>
  );
}

/**
 * StarRating — komponen rating bintang akurat untuk desimal.
 *
 * @example
 * <StarRating score={4.3} reviewCount={127} />
 * <StarRating score={4.8} reviewCount={203} size="lg" showScore />
 * <StarRating score={0} /> // → tampil "Belum ada ulasan"
 */
export function StarRating({
  score,
  reviewCount,
  size = 'sm',
  showScore = false,
  showReviewCount = true,
  showEmptyState = true,
  emptyStateLabel = 'Belum ada ulasan',
  ariaLabel,
  className,
}) {
  const instanceId = useId();

  const safeScore = Number.isFinite(score) && score >= 0 && score <= 5 ? score : 0;
  const hasRating = safeScore > 0;
  const hasReviews = reviewCount !== undefined && reviewCount > 0;

  if (!hasRating && showEmptyState) {
    return (
      <div
        className={`inline-flex items-center ${LABEL_GAP[size]} ${className ?? ''}`}
        aria-label={ariaLabel !== undefined ? ariaLabel : emptyStateLabel}
        role="img"
      >
        <StarDisplay fills={[0, 0, 0, 0, 0]} idPrefix={instanceId} heightPx={SIZE_PX[size]} />
        <span className={`${LABEL_FONT[size]} text-[#8A7668] italic`} aria-hidden="true">
          {emptyStateLabel}
        </span>
      </div>
    );
  }

  const fills = calcStarFills(safeScore);
  const autoLabel =
    ariaLabel !== undefined ? ariaLabel : buildAriaLabel(safeScore, hasReviews ? reviewCount : undefined);

  return (
    <div
      className={`inline-flex items-center ${LABEL_GAP[size]} ${className ?? ''}`}
      aria-label={autoLabel || undefined}
      role="img"
    >
      <StarDisplay fills={fills} idPrefix={instanceId} heightPx={SIZE_PX[size]} />
      <RatingLabel
        score={safeScore}
        reviewCount={reviewCount}
        showScore={showScore}
        showReviewCount={showReviewCount}
        size={size}
      />
    </div>
  );
}

export default StarRating;

/**
 * StarRatingCompact — preset untuk ProductCard. Size sm, tanpa skor teks.
 * @example
 * <StarRatingCompact score={4.3} reviewCount={127} />
 */
export function StarRatingCompact({ score, reviewCount, className }) {
  return (
    <StarRating
      score={score}
      reviewCount={reviewCount}
      size="sm"
      showScore={false}
      showReviewCount={true}
      className={className}
    />
  );
}

/**
 * StarRatingDetailed — preset untuk halaman detail produk.
 * @example
 * <StarRatingDetailed score={4.8} reviewCount={203} size="lg" />
 */
export function StarRatingDetailed({ score, reviewCount, size = 'md', className }) {
  return (
    <StarRating
      score={score}
      reviewCount={reviewCount}
      size={size}
      showScore={true}
      showReviewCount={true}
      className={className}
    />
  );
}