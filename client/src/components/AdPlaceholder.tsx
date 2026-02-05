import clsx from "clsx";

interface AdPlaceholderProps {
  label?: string;
  className?: string;
  height?: string;
}

export function AdPlaceholder({ label = "Publicité", className, height = "h-24" }: AdPlaceholderProps) {
  return (
    <div className={clsx(
      "w-full bg-white flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md overflow-hidden",
      height,
      className
    )}>
      <span className="text-gray-400 font-semibold text-sm uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}
