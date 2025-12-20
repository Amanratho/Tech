  import React, { useState } from "react";
  import { motion } from "framer-motion";
  import { toast } from "react-toastify";
  import { useTranslation } from "react-i18next";
  import { FaUser, FaEnvelope, FaCommentDots, FaPaperPlane, FaChevronLeft } from "react-icons/fa";

  const Contact = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      message: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      // ... logic same as before ...
      // For demo, just simulating delay
      setTimeout(() => {
          setLoading(false);
          toast.success("Message Sent!");
          setFormData({ name: "", email: "", message: "" });
      }, 1500);
    };

    return (
      // FULL SCREEN APP VIEW: No center flex, no gray background outside
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-main)' }}>
        
        {/* 1. APP HEADER (Top Bar) */}
        <div className="flex items-center px-4 py-4 sticky top-0 z-10" style={{ backgroundColor: 'var(--bg-main)' }}>
          {/* Back Button Simulation (Common in apps) */}
          <button className="p-2 rounded-full mr-4 active:bg-[#2C2C2C]">
              <FaChevronLeft className="text-white text-lg" />
          </button>
          <h1 className="text-xl font-bold tracking-wide text-white">
            {t('contactUs')}
          </h1>
        </div>

        {/* 2. SCROLLABLE CONTENT AREA */}
        <div className="flex-1 px-5 pt-4 pb-8 overflow-y-auto">
          
          <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Have a question about machinery? Fill the form below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Name Input - Rounded Capsule Style */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaUser className="text-gray-500 text-sm group-focus-within:text-[var(--primary)] transition-colors" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder={t('fullNamePlaceholder')}
                className="block w-full pl-12 pr-4 py-3 rounded-full text-sm outline-none border border-transparent focus:border-[var(--primary)] transition-all"
                style={{ 
                  backgroundColor: 'var(--bg-input)', 
                  color: 'var(--text-main)' 
                }}
              />
            </div>

            {/* Email Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-500 text-sm group-focus-within:text-[var(--primary)] transition-colors" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder={t('emailPlaceholder')}
                className="block w-full pl-12 pr-4 py-3 rounded-full text-sm outline-none border border-transparent focus:border-[var(--primary)] transition-all"
                style={{ 
                  backgroundColor: 'var(--bg-input)', 
                  color: 'var(--text-main)' 
                }}
              />
            </div>

            {/* Message Input - Standard rounded corners because it's multiline */}
            <div className="relative group">
              <div className="absolute top-4 left-4 pointer-events-none">
                <FaCommentDots className="text-gray-500 text-sm group-focus-within:text-[var(--primary)] transition-colors" />
              </div>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                placeholder={t('messagePlaceholder')}
                className="block w-full pl-12 pr-4 py-3 rounded-3xl text-sm outline-none border border-transparent focus:border-[var(--primary)] transition-all resize-none"
                style={{ 
                  backgroundColor: 'var(--bg-input)', 
                  color: 'var(--text-main)' 
                }}
              />
            </div>

          </form>
        </div>

        {/* 3. BOTTOM ACTION AREA (Sticky Button at bottom) */}
        <div className="p-5 pb-8 sticky bottom-0" style={{ backgroundColor: 'var(--bg-main)' }}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-full font-bold text-base shadow-lg flex items-center justify-center gap-2"
            style={{ 
              backgroundColor: 'var(--primary)', 
              color: '#000000' 
            }}
          >
            {loading ? (
              <span className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"></span>
            ) : (
              <>
                {t('sendMessage')} <FaPaperPlane className="text-sm" />
              </>
            )}
          </motion.button>
        </div>

      </div>
    );
  };

  export default Contact;