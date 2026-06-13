/**
 * RentVeda — LoaderButton
 *
 * A drop-in replacement for your action buttons that handles the isLoading state:
 *   • Disables itself automatically when loading
 *   • Shows an inline spinner + loading text
 *   • Drops opacity to visually convey "busy"
 *   • Supports two visual variants:
 *       "primary"  → gold background, black text  (default — matches your CTA buttons)
 *       "outline"  → transparent bg, white text    (for secondary actions)
 *
 * Usage:
 *   <LoaderButton
 *     isLoading={isLoading}
 *     loadingText="Saving…"
 *     onClick={handleSubmit}
 *   >
 *     SAVE ENTRY
 *   </LoaderButton>
 */

import React from "react";
import { InlineLoader } from "./Loader";

/**
 * @param {boolean}     isLoading     - Controls spinner & disabled state
 * @param {string}      loadingText   - Text shown while loading, e.g. "Saving…"
 * @param {"primary"|"outline"} variant
 * @param {string}      className     - Extra Tailwind classes (merged on top)
 * @param {function}    onClick       - Click handler
 * @param {"button"|"submit"} type   - HTML button type
 * @param {ReactNode}   children      - Normal button label
 * @param {ReactNode}   icon          - Optional icon to show before label (hidden when loading)
 */
const LoaderButton = ({
  isLoading = false,
  loadingText = "Loading…",
  variant = "primary",
  className = "",
  onClick,
  type = "button",
  children,
  icon,
  ...rest
}) => {
  // ── Base styles shared across both variants ──
  const base =
    "w-full flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-200 active:scale-95 focus:outline-none";

  // ── Variant-specific styles ──
  const variants = {
    primary:
      "bg-[var(--primary)] text-black shadow-lg shadow-[var(--primary)]/20 hover:bg-[var(--primary-hover)]",
    outline:
      "bg-transparent border border-[#333] text-white hover:border-[var(--primary)]",
  };

  // ── Disabled / loading visual override ──
  const loadingStyle = isLoading ? "opacity-60 cursor-not-allowed active:scale-100" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className={`${base} ${variants[variant] ?? variants.primary} ${loadingStyle} ${className}`}
      {...rest}
    >
      {isLoading ? (
        <>
          {/* Spinner color adapts to variant */}
          <span
            className={`rv-btn-spinner ${variant === "outline" ? "rv-btn-spinner--light" : ""}`}
          />
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default LoaderButton;
