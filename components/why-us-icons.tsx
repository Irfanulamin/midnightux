/*
 * The six Why Choose Us card icons, from the Figma bento (node 330:13398).
 *
 * Inlined as components rather than committed as .svg files in public/. Each one
 * is a single path under 2.3kB, so a file per icon would be six HTTP requests
 * and six entries in Next's image optimizer cache to save nothing. Inline also
 * means they take `currentColor`, so the colour comes from the caller's
 * `text-coral` and stays a token rather than a hex baked into an asset.
 *
 * Figma fills them #FD7C5A, which IS --color-coral, so nothing here needs a new
 * token. Note that is NOT the hero chart's #ff884d: the two oranges are close
 * but different values and the design uses both.
 *
 * Geometry is the Figma's, untouched, including the two icons whose art is not
 * square (Responsive is 24 x 15.77, Fast Delivery is a bordered disc rather than
 * a path). Every viewBox is preserved as exported so nothing is stretched.
 */

type IconProps = { className?: string };

/** 12-point badge. Custom Design. */
export function IconCustomDesign({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M13.733 1.223L14.312 2.85C14.3983 3.09246 14.5345 3.31412 14.7118 3.50066C14.8891 3.6872 15.1036 3.83447 15.3414 3.93295C15.5791 4.03144 15.8349 4.07895 16.0922 4.07241C16.3495 4.06587 16.6025 4.00543 16.835 3.895L18.395 3.154C19.958 2.411 21.589 4.042 20.846 5.605L20.105 7.165C19.9942 7.39742 19.9336 7.65051 19.9269 7.90788C19.9202 8.16525 19.9676 8.42115 20.0661 8.65901C20.1647 8.89687 20.312 9.11138 20.4988 9.28864C20.6855 9.4659 20.9073 9.60196 21.15 9.688L22.777 10.266C24.407 10.846 24.407 13.152 22.777 13.733L21.15 14.312C20.9075 14.3983 20.6859 14.5345 20.4993 14.7118C20.3128 14.8891 20.1655 15.1036 20.067 15.3414C19.9686 15.5791 19.9211 15.8349 19.9276 16.0922C19.9341 16.3495 19.9946 16.6025 20.105 16.835L20.846 18.395C21.589 19.958 19.958 21.589 18.395 20.846L16.835 20.105C16.6026 19.9944 16.3496 19.9338 16.0923 19.9271C15.8351 19.9204 15.5793 19.9678 15.3414 20.0662C15.1036 20.1646 14.8891 20.3118 14.7118 20.4984C14.5345 20.6849 14.3983 20.9065 14.312 21.149L13.733 22.777C13.153 24.407 10.847 24.407 10.267 22.777L9.688 21.149C9.6016 20.9066 9.46532 20.6851 9.28796 20.4986C9.11061 20.3122 8.89613 20.165 8.65836 20.0667C8.4206 19.9683 8.16485 19.9209 7.90762 19.9275C7.65039 19.9341 7.3974 19.9945 7.165 20.105L5.605 20.845C4.042 21.589 2.411 19.958 3.154 18.395L3.895 16.835C4.00577 16.6024 4.06648 16.3492 4.07319 16.0917C4.0799 15.8342 4.03247 15.5781 3.93397 15.3401C3.83546 15.1021 3.68807 14.8874 3.50135 14.71C3.31463 14.5325 3.09272 14.3963 2.85 14.31L1.223 13.732C-0.407 13.152 -0.407 10.845 1.223 10.265L2.85 9.687C3.09273 9.60101 3.3147 9.46503 3.50156 9.28786C3.68843 9.11068 3.83603 8.89625 3.93481 8.65845C4.03359 8.42064 4.08135 8.16475 4.07501 7.90732C4.06867 7.64989 4.00837 7.39666 3.898 7.164L3.156 5.604C2.413 4.04 4.044 2.409 5.608 3.152L7.168 3.894C7.40035 4.00429 7.65325 4.06463 7.91036 4.07115C8.16748 4.07767 8.42311 4.03021 8.66075 3.93183C8.89839 3.83346 9.11277 3.68636 9.29005 3.50002C9.46733 3.31368 9.60358 3.09224 9.69 2.85L10.268 1.223C10.846 -0.407 13.152 -0.407 13.732 1.223H13.733Z" />
    </svg>
  );
}

/** Upward triangle. Affordable Start. */
export function IconAffordable({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M11.8923 0L22.2846 18H1.50003L11.8923 0Z" />
    </svg>
  );
}

/*
 * Arch. Fully Responsive.
 *
 * The only icon the Figma does not draw square: the art is 24 x 15.7738, and its
 * own viewBox says so. Squaring it here would squash the dome, so the caller
 * sizes it on width and lets the height follow.
 */
export function IconResponsive({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 15.7738"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M23.3912 15.7738C23.9884 13.9709 24.1493 12.0521 23.8604 10.1749C23.5715 8.2978 22.8413 6.51603 21.7296 4.97614C20.618 3.43625 19.1567 2.18221 17.4659 1.31713C15.7752 0.452045 13.9032 0.000630577 12.004 6.60161e-07C10.1048 -0.000629257 8.23251 0.449543 6.54117 1.3135C4.84984 2.17746 3.38772 3.43054 2.27505 4.96969C1.16237 6.50884 0.430912 8.29012 0.140815 10.1671C-0.149283 12.044 0.0102663 13.963 0.606343 15.7662L12 12L23.3912 15.7738Z" />
    </svg>
  );
}

/** Bookmark. Clear Communication. */
export function IconCommunication({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M0 0H24V24L12 16L0 24V0Z" />
    </svg>
  );
}

/** Four-point sparkle. One Solution. */
export function IconOneSolution({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12 0C12 0 11.4996 10.3944 0 12C0 12 9.8718 12.189 12 24C12 24 12.678 13.7892 24 12C24 12 13.242 10.4862 12 0Z" />
    </svg>
  );
}

/*
 * Ringed disc. Fast Delivery.
 *
 * Not a path in the Figma either: it is a 24px circle filled #ff884d with a
 * 4.8px rgba(255,255,255,0.4) border, i.e. the ring is a border drawn INSIDE the
 * 24px box. Reproduced as an SVG rather than a bordered div so it sizes and
 * aligns identically to the other five, with the ring as a stroke on the inset
 * radius so the whole mark still measures 24.
 *
 * This is the one icon that is #ff884d rather than coral, so it does not read
 * currentColor.
 */
export function IconFastDelivery({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <circle cx="12" cy="12" r="12" fill="#ff884d" />
      <circle
        cx="12"
        cy="12"
        r="9.6"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.4"
        strokeWidth="4.8"
      />
    </svg>
  );
}
