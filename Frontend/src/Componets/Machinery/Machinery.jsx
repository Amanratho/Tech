import React, { useState, useMemo } from "react";
import { useGetMachinesQuery } from "../../redux/functional/machineApiSlice";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaTractor, FaPlus, FaSearch, FaFilter } from "react-icons/fa";

function Machinery() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const uid = localStorage.getItem("uid");

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");

  const {
    data: machines = [],
    error,
    isLoading,
  } = useGetMachinesQuery(uid, {
    skip: !uid,
    keepUnusedDataFor: 1000,
  });

  // Unique Rent Types nikalne ke liye (Filter Dropdown ke liye)
  const uniqueRentTypes = useMemo(() => {
    const types = new Set(machines.map((m) => m.RentType).filter(Boolean));
    return ["All", ...Array.from(types)];
  }, [machines]);

  // Filter & Search Logic
  const filteredMachines = useMemo(() => {
    return machines.filter((machine) => {
      const matchesSearch = machine.Machine_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === "All" || machine.RentType === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [machines, searchQuery, filterType]);

  const handleCardClick = (machine) => {
    navigate("/start-entry", {
      state: {
        rentType: machine.RentType,
        machineId: machine.Machine_id,
        machineName: machine.Machine_name,
      },
    });
  };

  // 1. SKELETON LOADING
  if (isLoading) {
    return (
      <div className="bg-[#121212] py-4 px-4 pb-24 min-h-screen overflow-x-hidden">
        {/* Skeleton Search Bar */}
        <div className="h-12 w-full bg-[#1E1E1E] rounded-xl animate-pulse mb-6 border border-[#2C2C2C]"></div>
        <div className="flex justify-between items-end mb-4">
          <div className="h-3 w-28 bg-[#1E1E1E] rounded animate-pulse"></div>
          <div className="h-3 w-16 bg-[#1E1E1E] rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full h-52 bg-[#1E1E1E] rounded-3xl animate-pulse border border-[#2C2C2C]"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) return null;

  return (
    // FIX: Added overflow-x-hidden to completely block horizontal scroll & white space
    <div className="bg-[#121212] pt-4 pb-24 min-h-screen relative font-sans w-full overflow-x-hidden">

      {/* 2. SEARCH & FILTER BAR */}
      {/* FIX: Removed -mx-4 which was causing the right-side gap */}
      <div className="sticky top-[60px] z-10 bg-[#121212]/95 backdrop-blur-md py-3 px-4 mb-6 shadow-sm">
        <div className="flex gap-2 h-12">

          {/* Search Input */}
          <div className="relative flex-1 h-full">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
            <input
              type="text"
              placeholder={t("searchMachine") || "Search machines..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-full bg-[#1E1E1E] text-white border border-[#333] rounded-full py-2 pl-11 pr-5 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-all text-sm placeholder-gray-600 shadow-inner"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative w-[38%] h-full">
            <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--primary)] text-xs z-10" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full h-full bg-[#1E1E1E] text-[var(--primary)] font-bold border border-[#333] rounded-full py-2 pl-9 pr-8 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-all text-xs appearance-none cursor-pointer shadow-inner"
            >
              {uniqueRentTypes.map((type) => (
                <option key={type} value={type} className="bg-[#121212] text-white">
                  {type}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500 text-[10px]">▼</div>
          </div>

        </div>
      </div>

      {/* 3. SECTION HEADER */}
      <div className="px-4 mb-4 flex justify-between items-end">
        <h2 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
          {t("exploreMachines") || "YOUR MACHINES"}
        </h2>
        <span className="text-[10px] text-[var(--primary)] font-bold bg-[var(--primary)]/10 px-2 py-0.5 rounded border border-[var(--primary)]/20">
          {filteredMachines.length} Found
        </span>
      </div>

      {/* 4. 2-COLUMN PREMIUM GRID AREA */}
      <div className="px-4">
        {machines.length === 0 ? (
          // IF NO MACHINES AT ALL
          <div
            onClick={() => navigate("/add-machinery")}
            className="w-full h-40 border-2 border-dashed border-[#333] hover:border-[var(--primary)] rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors active:scale-95"
          >
            <div className="w-12 h-12 bg-[#1E1E1E] rounded-full flex items-center justify-center text-[var(--primary)] shadow-lg shadow-[var(--primary)]/10">
              <FaPlus size={18} />
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Add Your First Machine</p>
          </div>
        ) : filteredMachines.length === 0 ? (
          // IF SEARCH YIELDS NO RESULTS
          <div className="text-center py-10 text-gray-500 text-sm font-semibold">
            No machines found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence>
              {filteredMachines.map((item, index) => (

                // ENTIRE CARD IS CLICKABLE (Full Image Background)
                <motion.div
                  key={item.Machine_id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleCardClick(item)}
                  className="relative w-full h-52 rounded-3xl overflow-hidden shadow-xl border border-[#2C2C2C] cursor-pointer group bg-[#1E1E1E]"
                >

                  {/* Background Image */}
                  {item.image ? (
                    <img
                      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                      src={item.image}
                      alt={item.Machine_name}
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-gray-700 opacity-50 bg-[#121212]">
                      <FaTractor size={40} className="mb-2" />
                    </div>
                  )}

                  {/* Dark Gradient Overlay (Crucial for text visibility) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/60 to-transparent"></div>

                  {/* Top Right 'Live' Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 shadow-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]"></div>
                    <span className="text-[8px] text-white font-extrabold tracking-widest uppercase">Live</span>
                  </div>

                  {/* Floating Content at Bottom */}
                  <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col justify-end">
                    <h5 className="text-white text-base font-extrabold truncate drop-shadow-lg leading-tight mb-1">
                      {item.Machine_name}
                    </h5>

                    <div className="flex items-center justify-between">
                      <p className="text-[9px] text-gray-300 font-bold uppercase tracking-wider bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded border border-white/5">
                        {item.RentType || "Rate"}
                      </p>

                      {/* Visual indicator that it's clickable (Instead of a big button) */}
                      <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-black flex items-center justify-center shadow-lg shadow-[var(--primary)]/30">
                        <span className="text-[10px] ml-0.5">▶</span>
                      </div>
                    </div>
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default Machinery;