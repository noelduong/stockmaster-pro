import { clsx } from "@/lib/cx";

interface Props {
  name: string;
  className?: string;
  filled?: boolean;
  size?: number;
}

export function MaterialIcon({ name, className, filled, size }: Props) {
  const style = filled
    ? {
        fontVariationSettings: "'FILL' 1",
        fontSize: size ? `${size}px` : undefined,
      }
    : size
      ? { fontSize: `${size}px` }
      : undefined;
  return (
    <span
      className={clsx("material-symbols-outlined", className)}
      style={style}
      aria-hidden
    >
      {name}
    </span>
  );
}
