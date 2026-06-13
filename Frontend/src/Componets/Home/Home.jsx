import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useGetMachinesQuery } from "../../redux/functional/machineApiSlice";
import { slides } from "../../assets/image/assest";
import Tracker from "../Tracker/Tracker";
import Footer from "../Footer/Footer";
import {
  FaPlus,
  FaFileInvoice,
  FaHistory,
  FaTools,
  FaTractor,
  FaChevronRight,
  FaSearch,
} from "react-icons/fa";

// ─── HERO BANNER (Carousel with content overlay) ────────────
function HeroBanner() {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [next]);

  return (
    <div className="relative w-full h-[50px]  sm:h-[260px] lg:h-[360px] overflow-hidden select-none">
      {/* Slides — blurred to hide baked-in text on images */}
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 bg-cover bg-center blur-[2px] scale-105"
          style={{ backgroundImage: `url(${slides[current].image})` }}
        />
      </AnimatePresence>

      {/* Dark overlays for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-[#121212]/30" />
      <div className="absolute inset-0 bg-[#121212]/50" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 pb-6 z-10">
        <motion.div
          key={`text-${current}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <p className="text-[10px] text-[var(--primary)] font-bold uppercase tracking-[0.2em] mb-1">
            {t("tagline") ? "MACHINERY RENTAL" : "MACHINERY RENTAL"}
          </p>
          <h1 className="text-white text-xl sm:text-2xl font-black leading-tight tracking-tight">
            {t("welcome") || "Welcome to RentVeda!"}
          </h1>
          <p className="text-gray-400 text-xs mt-1.5 max-w-[280px] leading-relaxed">
            {t("tagline") ||
              "Revolutionizing machinery rentals with simplicity and efficiency."}
          </p>
        </motion.div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-5 right-5 flex gap-1.5 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-5 h-1.5 bg-[var(--primary)]"
                : "w-1.5 h-1.5 bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── QUICK ACTIONS (Feature shortcuts) ───────────────────────
function QuickActions() {
  const { t } = useTranslation();

  const actions = [
    {
      title: t("addMachinery") || "Add Machine",
      icon: <FaPlus />,
      link: "/add-machinery",
      color: "#FEC111",
      bg: "from-amber-500/15 to-amber-600/5",
    },
    {
      title: t("paymentTracking") || "Payments",
      icon: <FaFileInvoice />,
      link: "/payment-tracking",
      color: "#4ade80",
      bg: "from-green-500/15 to-green-600/5",
    },
    {
      title: t("billsHistory") || "Bills",
      icon: <FaHistory />,
      link: "/bill-history",
      color: "#60a5fa",
      bg: "from-blue-500/15 to-blue-600/5",
    },
    {
      title: t("machineStatus") || "Status",
      icon: <FaTools />,
      link: "/machine-maintenance",
      color: "#f97316",
      bg: "from-orange-500/15 to-orange-600/5",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const item = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <div className="px-4 -mt-10 relative z-20">
      {/* Glass card container */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="bg-[#1E1E1E]/80 backdrop-blur-xl border border-[#2C2C2C] rounded-2xl p-4 shadow-2xl"
      >
        <div className="grid grid-cols-4 gap-3">
          {actions.map((action, idx) => (
            <motion.div key={idx} variants={item}>
              <Link
                to={action.link}
                className="flex flex-col items-center gap-2 no-underline hover:no-underline focus:no-underline group"
              >
                {/* Icon circle */}
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.bg} border border-white/5 flex items-center justify-center group-active:scale-90 transition-transform duration-200 shadow-lg`}
                  style={{ color: action.color }}
                >
                  <span className="text-base">{action.icon}</span>
                </div>
                {/* Label */}
                <span className="text-[9px] text-gray-400 font-bold text-center leading-tight uppercase tracking-wider">
                  {action.title.length > 10
                    ? action.title.split(" ")[0]
                    : action.title}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── MACHINE LIST SECTION ────────────────────────────────────
function MachineSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const uid = localStorage.getItem("uid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const {
    data: machines = [],
    error,
    isLoading,
  } = useGetMachinesQuery({ uid }, {
    skip: !uid,
    keepUnusedDataFor: 1000,
  });

  const filteredMachines = useMemo(() => {
    return machines.filter((m) =>
      m.Machine_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [machines, searchQuery]);

  const handleCardClick = (machine) => {
    navigate("/start-entry", {
      state: {
        rentType: machine.RentType,
        machineId: machine.Machine_id,
        machineName: machine.Machine_name,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="px-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <div className="h-3 w-28 bg-[#1E1E1E] rounded animate-pulse" />
          <div className="h-3 w-16 bg-[#1E1E1E] rounded animate-pulse" />
        </div>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-40 h-48 flex-shrink-0 bg-[#1E1E1E] rounded-2xl animate-pulse border border-[#2C2C2C]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !uid) return null;

  return (
    <div className="mt-6">
      {/* Section Header */}
      <div className="px-4 flex justify-between items-center mb-3">
        <div>
          <h2 className="text-white text-base font-bold tracking-tight">
            {t("exploreMachines") || "Your Machines"}
          </h2>
          <p className="text-gray-500 text-[10px] font-semibold mt-0.5">
            {filteredMachines.length} {t("machinesCount") || "machines"}{" "}
            available
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="w-8 h-8 bg-[#1E1E1E] border border-[#2C2C2C] rounded-xl flex items-center justify-center text-gray-400 hover:text-[var(--primary)] active:scale-90 transition-all"
          >
            <FaSearch size={11} />
          </button>
          {machines.length > 0 && (
            <button
              onClick={() => navigate("/add-machinery")}
              className="w-8 h-8 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-xl flex items-center justify-center text-[var(--primary)] active:scale-90 transition-all"
            >
              <FaPlus size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Search */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 overflow-hidden"
          >
            <div className="relative mb-3">
              <FaSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-600 text-xs" />
              <input
                type="text"
                placeholder={t("searchMachine") || "Search machines..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-[#1E1E1E] text-white border border-[#333] rounded-xl py-2.5 pl-10 pr-4 focus:border-[var(--primary)] outline-none transition-all text-sm placeholder-gray-600"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {machines.length === 0 ? (
        /* Empty state */
        <div className="px-4">
          <div
            onClick={() => navigate("/add-machinery")}
            className="w-full py-10 border-2 border-dashed border-[#2C2C2C] hover:border-[var(--primary)] rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors active:scale-[0.98]"
          >
            <div className="w-14 h-14 bg-[#1E1E1E] rounded-2xl flex items-center justify-center text-[var(--primary)] shadow-lg shadow-[var(--primary)]/10 border border-[#2C2C2C]">
              <FaPlus size={20} />
            </div>
            <div className="text-center">
              <p className="text-white text-sm font-bold">
                {t("addYourMachine") || "Add Your First Machine"}
              </p>
              <p className="text-gray-500 text-[10px] mt-1">
                Tap to get started
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Horizontal scrolling machine cards */
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-3 px-4 pb-2">
            {filteredMachines.map((item, index) => (
              <motion.div
                key={item.Machine_id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleCardClick(item)}
                className="relative flex-shrink-0 w-[155px] h-[195px] rounded-2xl overflow-hidden cursor-pointer group bg-[#1E1E1E] border border-[#2C2C2C] shadow-xl"
              >
                {/* Background Image */}
                {item.image ? (
                  <img
                    className="absolute inset-0 w-full h-full object-cover opacity-90 group-active:scale-110 transition-transform duration-500"
                    src={item.image}
                    alt={item.Machine_name}
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-gray-700 opacity-40 bg-[#161616]">
                    <FaTractor size={36} />
                  </div>
                )}

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />

                {/* Live badge */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
                  <span className="text-[7px] text-white/80 font-bold tracking-widest uppercase">
                    Live
                  </span>
                </div>

                {/* Content at bottom */}
                <div className="absolute bottom-0 left-0 w-full p-3 flex flex-col">
                  <h5 className="text-white text-sm font-extrabold truncate leading-tight mb-1.5 drop-shadow-md">
                    {item.Machine_name}
                  </h5>
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] text-gray-300/80 font-bold uppercase tracking-wider bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/5">
                      {item.RentType || "Rate"}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-black flex items-center justify-center shadow-md shadow-[var(--primary)]/30">
                      <FaChevronRight size={8} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Add machine card at end */}
            {filteredMachines.length > 0 && (
              <div
                onClick={() => navigate("/add-machinery")}
                className="flex-shrink-0 w-[155px] h-[195px] rounded-2xl border-2 border-dashed border-[#2C2C2C] hover:border-[var(--primary)] flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors active:scale-95"
              >
                <div className="w-10 h-10 bg-[#1E1E1E] rounded-xl flex items-center justify-center text-[var(--primary)] border border-[#333]">
                  <FaPlus size={14} />
                </div>
                <span className="text-gray-500 text-[9px] font-bold uppercase">
                  {t("addMachine") || "Add New"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN HOME COMPONENT ─────────────────────────────────────
function Home() {
  return (
    <div className="bg-[#121212] min-h-screen pb-20 overflow-x-hidden font-sans">
      {/* Spacer for fixed navbar */}
      <div className="h-16" />

      {/* 1. Hero Banner with auto-sliding images */}
      <HeroBanner />

      {/* 2. Quick Action Shortcuts (overlapping hero) */}
      <QuickActions />

      {/* 3. Tracker Widget */}
      <div className="mt-6">
        <div className="px-4 mb-3">
          <h2 className="text-white text-base font-bold tracking-tight">
            Work Tracker
          </h2>
        </div>
        <Tracker />
      </div>

      {/* 4. Machine Gallery */}
      <MachineSection />

      {/* 5. Footer */}
      <div className="mt-8">
        <Footer />
      </div>
    </div>
  );
}

export default Home;