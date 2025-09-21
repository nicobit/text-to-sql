import React from "react";

export interface FilterChipProps {
  label: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  /** For accessibility: if provided, will be used instead of label in aria-label */
  ariaLabel?: string;
}

const cx = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

export default function FilterChip({
  label,
  active = false,
  onClick,
  className,
  disabled = false,
  ariaLabel,
}: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={ariaLabel}
      className={cx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border focus:outline-none transition-colors",
        active
          ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-500"
          : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {label}
    </button>
  );
}

export type { FilterChipProps as TFilterChipProps };
