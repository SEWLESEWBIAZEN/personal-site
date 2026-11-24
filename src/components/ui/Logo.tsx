type LogoProps = {
  /** "tile" draws the rounded square behind the glyphs; "glyph" draws the <S/> alone. */
  variant?: "tile" | "glyph";
  className?: string;
};

/**
 * The <S/> mark, same drawing as src/app/icon.svg.
 * Colors come from theme tokens so it follows light/dark mode.
 */
export function Logo({ variant = "tile", className }: LogoProps) {
  const tile = variant === "tile";
  const ink = tile ? "var(--bg)" : "var(--text)";

  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      {tile && <rect width="32" height="32" rx="7" fill="var(--text)" />}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4">
        <path stroke={ink} d="M8.2 11 4.4 16l3.8 5M23.8 11l3.8 5-3.8 5" />
        <path
          stroke={ink}
          d="M16.4 11.6c-.6-1-1.6-1.6-2.9-1.6-1.8 0-2.9 1.1-2.9 2.7 0 3.6 6.1 2.5 6.1 6.3 0 1.9-1.3 3-3.2 3-1.5 0-2.6-.7-3.2-1.8"
        />
        <path stroke="var(--blue)" d="M21.3 9.6 19 22.4" />
      </g>
    </svg>
  );
}
