interface PlaceholderAvatarProps {
  initials: string;
  color: string;
  size?: number;
  fontSize?: string;
}

export function PlaceholderAvatar({ initials, color, size = 40, fontSize }: PlaceholderAvatarProps) {
  return (
    <div
      className="placeholder-avatar"
      style={{
        background: color,
        width: `${size}px`,
        height: `${size}px`,
        fontSize: fontSize || undefined,
        borderRadius: '50%',
      }}
    >
      {initials}
    </div>
  );
}
