interface PlaceholderImageProps {
  gradient: string;
}

export function PlaceholderImage({ gradient }: PlaceholderImageProps) {
  return (
    <div className="placeholder-img" style={{ background: gradient }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
  );
}
