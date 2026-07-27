import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaExclamationTriangle, FaInfoCircle, FaTrashAlt, FaTimes, FaExclamationCircle } from "react-icons/fa";

const ConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText,
  cancelText,
  variant = "danger",
  isLoading = false,
  isAlert = false
}) => {
  const { t } = useTranslation();

  const handleClose = () => {
    if (onCancel) {
      onCancel();
    } else if (onConfirm) {
      onConfirm();
    }
  };

  const variants = {
    danger: {
      icon: FaExclamationCircle,
      iconBg: "bg-red-500/10",
      iconColor: "text-red-500",
      ringColor: "border-red-200",
      btnBg: "bg-red-500 hover:bg-red-600 shadow-red-500/20",
      glowBg: "bg-red-500",
    },
    delete: {
      icon: FaTrashAlt,
      iconBg: "bg-red-500/10",
      iconColor: "text-red-500",
      ringColor: "border-red-200",
      btnBg: "bg-red-500 hover:bg-red-600 shadow-red-500/20",
      glowBg: "bg-red-500",
    },
    warning: {
      icon: FaExclamationTriangle,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
      ringColor: "border-amber-200",
      btnBg: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20",
      glowBg: "bg-amber-500",
    },
    success: {
      icon: FaInfoCircle,
      iconBg: "bg-[var(--primary)]/10",
      iconColor: "text-[var(--primary)]",
      ringColor: "border-[var(--primary)]/25",
      btnBg: "bg-[var(--primary)] hover:bg-[var(--primary-hover)] shadow-[var(--primary)]/20",
      glowBg: "bg-[var(--primary)]",
    },
  };

  const v = variants[variant] || variants.danger;
  const Icon = v.icon;

  const resolvedTitle =
    title || t("confirmModalDefaultTitle") || "Are you sure?";
  const resolvedMessage =
    message || t("confirmModalDefaultMessage") || "This action cannot be undone.";
  const resolvedConfirm =
    confirmText || (isAlert ? (t("okButton") || "OK") : (t("confirmModalConfirm") || "Confirm"));
  const resolvedCancel =
    cancelText || t("cancelButton") || "Cancel";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="confirm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4">
            <motion.div
              key="confirm-panel"
              initial={{ scale: 0.92, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className={`relative w-full max-w-xs bg-white rounded-3xl border ${v.ringColor} shadow-2xl overflow-hidden p-6`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-28 h-28 ${v.glowBg} rounded-full blur-3xl opacity-10 pointer-events-none`} />

              {/* Close 'X' Button - Always Visible & Functional */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-[#f9f9f9] hover:bg-[#e8e8e8] text-[#4f4633] hover:text-[#1a1c1c] flex items-center justify-center transition-all z-20 cursor-pointer border border-[#e2e2e2] active:scale-90"
                aria-label="Close modal"
              >
                <FaTimes size={12} />
              </button>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`w-14 h-14 rounded-2xl ${v.iconBg} flex items-center justify-center mb-4 border ${v.ringColor}`}>
                  <Icon size={22} className={v.iconColor} />
                </div>
                <h3 className="text-[#1a1c1c] font-black text-sm tracking-wide mb-2">
                  {resolvedTitle}
                </h3>
                <p className="text-[#4f4633] text-xs leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: resolvedMessage }} />

                <div className="flex gap-3 w-full">
                  {!isAlert && (
                    <button
                      type="button"
                      onClick={onCancel}
                      disabled={isLoading}
                      className="flex-1 py-2.5 rounded-2xl bg-transparent border border-[#e2e2e2] text-[#4f4633] font-bold text-xs hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {resolvedCancel}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isLoading}
                    className={`flex-1 py-2.5 rounded-2xl text-white font-black text-xs shadow-lg ${v.btnBg} active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer`}
                  >
                    {isLoading ? (
                      <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t("processing")}</>
                    ) : (
                      resolvedConfirm
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
