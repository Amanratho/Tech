import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useGetMachineSummaryQuery } from "../../redux/functional/machineApiSlice";
import {
  FaChevronDown,
  FaChevronUp,
  FaTools,
  FaMoneyBillWave,
  FaCheckCircle,
  FaExclamationCircle,
  FaSearch,
  FaChartLine,
  FaArchive,
} from "react-icons/fa";
import FinancialTracker from "./FinancialTracker";

// ─── Machine Card ────────────────────────────────────────────
const MachineCard = ({ machine, toggleShowDetails, showDetails }) => {
  const { t } = useTranslation();
  const uid = localStorage.getItem("uid");
  const isArchived = machine.isActive === false;

  // Rental and Maintenance aggregations from backend summary
  const totalPaidAmount = machine.totalPaidAmount || 0;
  const totalPendingAmount = machine.totalPendingAmount || 0;
  const totalAmount = machine.calculatedTotalAmount || 0;
  const totalWork = machine.calculatedTotalWork || 0;
  const totalExpense = machine.totalExpense || 0;
  const totalExtraIncome = machine.totalIncome || 0;

  // NET PROFIT = Rent Billed + Extra Income - Expenses
  const netProfit = totalAmount + totalExtraIncome - totalExpense;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl border overflow-hidden shadow-lg flex flex-col ${isArchived ? 'border-orange-500/30 opacity-75' : 'border-[var(--border-color)]'}`}
    >
      {/* Image + Badge header */}
      <div
        className="relative h-36 w-full cursor-pointer"
        onClick={() => toggleShowDetails(machine.Machine_id)}
      >
        <img
          className="h-full w-full object-cover opacity-80 transition-opacity hover:opacity-100"
          src={machine.image || "https://via.placeholder.com/400x200"}
          alt={`${t("machineCardTitle")} ${machine.Machine_name}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/90 via-[#121212]/40 to-transparent" />

        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <div>
            <div className="flex gap-2 items-center mb-1.5 flex-wrap">
              <span className="text-[10px] text-[var(--primary)] font-bold tracking-wider bg-white/80 px-2 py-0.5 rounded border border-[var(--border-color)] flex items-center gap-1.5 backdrop-blur-sm shadow-md">
                <FaMoneyBillWave size={9} /> ₹{totalAmount.toLocaleString()}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-bold tracking-wider bg-white/80 px-2 py-0.5 rounded border border-[var(--border-color)] flex items-center gap-1.5 backdrop-blur-sm shadow-md">
                <FaTools size={9} /> {totalWork}{" "}
                <span className="text-[8px] font-normal text-[var(--text-muted)] uppercase">
                  {machine.RentType || "Units"}
                </span>
              </span>
              {/* Net Profit Badge */}
              <span
                className={`text-[10px] font-bold tracking-wider bg-white/80 px-2 py-0.5 rounded border flex items-center gap-1.5 backdrop-blur-sm shadow-md ${
                  netProfit >= 0
                    ? "text-green-400 border-green-500/30"
                    : "text-red-400 border-red-500/30"
                }`}
              >
                <FaChartLine size={9} /> Net: ₹{netProfit.toLocaleString()}
              </span>
            </div>

            <h3 className="text-[var(--text-main)] text-base font-bold drop-shadow-md flex items-center gap-2">
              {machine.Machine_name}
              {isArchived && (
                <span className="text-[9px] text-orange-400 font-bold uppercase tracking-wider bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/30 flex items-center gap-1">
                  <FaArchive size={8} /> {t('soldLabel') || 'SOLD'}
                </span>
              )}
            </h3>
          </div>

          <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] shadow-md">
            {showDetails ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white"
          >
            <div className="p-4 border-t border-[var(--border-color)] space-y-4">
              {/* Rental + Financial Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[var(--bg-main)] p-3 rounded-lg border border-[var(--border-color)]">
                  <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mb-1">
                    <FaCheckCircle className="text-green-500" /> {t("doneAmountLabel")}
                  </p>
                  <p className="text-green-500 text-sm font-bold">₹{totalPaidAmount.toLocaleString()}</p>
                </div>
                <div className="bg-[var(--bg-main)] p-3 rounded-lg border border-[var(--border-color)]">
                  <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mb-1">
                    <FaExclamationCircle className="text-red-500" /> {t("dueAmountLabel")}
                  </p>
                  <p className="text-red-500 text-sm font-bold">₹{totalPendingAmount.toLocaleString()}</p>
                </div>
              </div>

              {/* Net Profit Highlight */}
              <div className="bg-[var(--bg-main)] p-4 rounded-xl border border-[var(--primary)]/40 shadow-[0_0_15px_rgba(255,215,0,0.07)] flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-[var(--primary)]/10 rounded-bl-full pointer-events-none" />
                <div>
                  <p className="text-[10px] text-[var(--primary)] font-bold uppercase tracking-wider mb-0.5">
                    {t("netProfitLabel") || "Net Profit"}
                  </p>
                  <p className="text-[9px] text-[var(--text-muted)]">
                    ({t("totalIncomeLabel")} + {t("extraIncomeLabel")} - {t("totalExpenseLabel")})
                  </p>
                </div>
                <h3
                  className={`font-black text-xl tracking-tight ${
                    netProfit >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  ₹{netProfit.toLocaleString()}
                </h3>
              </div>

              {/* Financial Tracker (Add/View Income & Expenses) */}
              <FinancialTracker machineId={machine.Machine_id} uid={uid} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main Page ───────────────────────────────────────────────
const MachineMaintenanceApp = () => {
  const { t } = useTranslation();
  const uid = localStorage.getItem("uid");
  const { data: machines = [], isLoading, error } = useGetMachineSummaryQuery({ uid, includeArchived: true }, { skip: !uid });
  const [showDetails, setShowDetails] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const toggleShowDetails = (machineId) => {
    setShowDetails((prev) => ({ ...prev, [machineId]: !prev[machineId] }));
  };

  const processedMachines = useMemo(() => {
    let mapped = [...machines]; // Create a copy of RTK Query immutable array

    if (searchQuery) {
      mapped = mapped.filter(
        (m) =>
          m.Machine_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(m.Machine_id).includes(searchQuery)
      );
    }

    if (filterType === "highest_income")
      mapped.sort((a, b) => b.calculatedTotalAmount - a.calculatedTotalAmount);
    else if (filterType === "lowest_income")
      mapped.sort((a, b) => a.calculatedTotalAmount - b.calculatedTotalAmount);
    else if (filterType === "most_active")
      mapped.sort((a, b) => b.calculatedTotalWork - a.calculatedTotalWork);

    return mapped;
  }, [machines, searchQuery, filterType]);

  return (
    <div className="bg-[var(--bg-main)] min-h-screen pb-20 relative overflow-hidden">
      {/* STICKY HEADER */}
      <div className="sticky top-0 mt-16 z-20 bg-white/95 backdrop-blur-md border-b border-[var(--border-color)] pb-2">
        <div className="px-4 py-3 flex justify-between items-center">
          <h2 className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest">
            {t("machineStatusTitle")}
          </h2>
          <span className="text-[9px] bg-white text-[var(--primary)] px-2 py-0.5 rounded border border-[var(--border-color)]">
            {processedMachines.length} {t("machinesCount")}
          </span>
        </div>

        <div className="px-4 mb-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-2.5 text-[var(--text-muted)] text-xs" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder") || "Search machine..."}
              className="w-full bg-white text-[var(--text-main)] pl-9 pr-3 py-2 rounded-full text-xs outline-none border border-[var(--border-color)] focus:border-[var(--primary)] transition-colors placeholder-[var(--text-muted)]"
            />
          </div>
        </div>

        <div className="px-4 flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {[
            { label: t("filterAllLabel"), val: "all" },
            { label: t("filterTopEarner"), val: "highest_income" },
            { label: t("filterLowestEarner"), val: "lowest_income" },
            { label: t("filterMostActive"), val: "most_active" },
          ].map((f) => (
            <button
              key={f.val}
              onClick={() => setFilterType(f.val)}
              className={`whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                filterType === f.val
                  ? "bg-[var(--primary)] text-black border-[var(--primary)]"
                  : "bg-transparent text-[var(--text-muted)] border-[var(--border-color)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="px-4 mt-3 space-y-4">
        {isLoading ? (
          <div className="text-center text-[var(--text-muted)] mt-10 text-xs animate-pulse">
            {t("loadingMachines")}
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-400 text-xs text-center">
            {error.message || "Failed to load machines"}
          </div>
        ) : processedMachines.length > 0 ? (
          processedMachines.map((machine) => (
            <MachineCard
              key={machine.Machine_id}
              machine={machine}
              toggleShowDetails={toggleShowDetails}
              showDetails={showDetails[machine.Machine_id] || false}
            />
          ))
        ) : (
          <div className="text-center text-[var(--text-muted)] mt-10 text-xs">
            {t("noMachinesFound")}
          </div>
        )}
      </div>
    </div>
  );
};

export default MachineMaintenanceApp;