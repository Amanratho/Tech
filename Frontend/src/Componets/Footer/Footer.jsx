import React from "react";
import { FaInstagram, FaLinkedin, FaTwitter, FaEnvelope } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-[var(--bg-main)] text-[var(--text-main)] py-8 border-t border-[var(--border-color)]">
      <div className="container mx-auto px-6 text-center">
        
        {/* 1. BRAND NAME */}
        <h2 className="text-xl font-bold text-[var(--primary)] tracking-wide mb-2">
            RentVeda
        </h2>
        
        {/* Tagline */}
        <p className="text-[var(--text-muted)] text-xs mb-6">
            {t("tagline") || "Rent machinery with ease."}
        </p>

        {/* 2. SOCIAL ICONS (Centered) */}
        <div className="flex justify-center gap-5 mb-6">
            <a href="https://instagram.com" className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
                <FaInstagram size={20} />
            </a>
            <a href="https://twitter.com" className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
                <FaTwitter size={20} />
            </a>
            <a href="https://linkedin.com" className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
                <FaLinkedin size={20} />
            </a>
        </div>

        {/* 3. EMAIL (At the bottom as requested) */}
        <div className="mb-6">
            <a 
                href="mailto:techdiary562@gmail.com" 
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-[var(--border-color)] text-[var(--text-main)] text-xs hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all shadow-sm"
            >
                <FaEnvelope /> techdiary562@gmail.com
            </a>
        </div>

        {/* 4. COPYRIGHT */}
        <div className="border-t border-[var(--border-color)] pt-6">
            <p className="text-[10px] text-[var(--text-muted)]">
                &copy; {new Date().getFullYear()} RentVeda. All rights reserved.
            </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;