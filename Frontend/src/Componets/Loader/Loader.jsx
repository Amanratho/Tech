/**
 * RentVeda — Reusable Loader Component
 *
 * Exports:
 *   1. <FullScreenLoader label="..." />   — fixed overlay; blocks the entire screen
 *   2. <InlineLoader size="sm" | "md" />  — tiny spinner for cards / sections
 *
 * Uses only framer-motion (already in the project) + our own Loader.css.
 * No new dependencies needed.
 */

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./Loader.css";

// ─── 1. FULL-SCREEN OVERLAY LOADER ────────────────────────────────────────────
/**
 * @param {boolean}  show    - Controls visibility (use AnimatePresence for unmount animation)
 * @param {string}   label   - Optional sub-label, e.g. "Generating Invoice…"
 *
 * Usage:
 *   <FullScreenLoader show={isLoading} label="Saving Entry…" />
 */
export const FullScreenLoader = ({ show = true, label = "Please wait…" }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="rv-overlay"
          className="rv-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          // Prevent underlying page from receiving pointer events
          style={{ pointerEvents: "all" }}
        >
          {/* Spinning ring + pulsing logo mark */}
          <div className="rv-overlay-ring">
            <div className="rv-overlay-dot">
              <span>RV</span>
            </div>
          </div>

          {/* Sub-label */}
          {label && (
            <motion.p
              className="rv-overlay-label"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.25 }}
            >
              {label}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── 2. INLINE LOADER ─────────────────────────────────────────────────────────
/**
 * @param {"sm" | "md"} size  - "sm" (default 14 px) or "md" (20 px)
 * @param {string} className  - Additional Tailwind / custom classes
 *
 * Usage:
 *   <InlineLoader />
 *   <InlineLoader size="md" className="my-4" />
 */
export const InlineLoader = ({ size = "sm", className = "" }) => {
  return (
    <span className={`rv-inline ${size === "md" ? "rv-inline--md" : ""} ${className}`}>
      <span className="rv-inline-ring" />
    </span>
  );
};

// ─── DEFAULT EXPORT (convenience) ─────────────────────────────────────────────
export default FullScreenLoader;
