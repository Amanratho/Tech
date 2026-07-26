import React, { useState, useMemo } from "react";
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
  FaCogs,
  FaFilter,
} from "react-icons/fa";
import FinancialTracker from "./FinancialTracker";

// ─── Machine Card Component ──────────────────────────────────
const MachineCard = ({ machine, toggleShowDetails, showDetails }) => {
  const { t } = useTranslation();
  const uid = localStorage.getItem("uid");
  const isArchived = machine.isActive === false;

  // Aggregations from backend summary
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all ${
        isArchived ? "border-orange-300 bg-orange-50/20" : "border-[#e2e2e2]"
      }`}
    >
      {/* ── CARD MAIN BAR (Clickable header) ── */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3.5">
          {/* Image Thumbnail */}
          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#f9f9f9] border border-[#e2e2e2] flex-shrink-0">
            <img
              className="h-full w-full object-cover"
              src={machine.image || "https://via.placeholder.com/200x200?text=Machine"}
              alt={machine.Machine_name}
            />
          </div>

          {/* Machine Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="text-[#1a1c1c] text-base font-bold truncate">
                {machine.Machine_name}
              </h3>
              {isArchived && (
                <span className="text-[9px] text-orange-600 font-bold uppercase tracking-wider bg-orange-100 px-2 py-0.5 rounded-full flex items-center gap-1 border border-orange-200">
                  <FaArchive size={8} /> {t("soldLabel") || "SOLD"}
                </span>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-[#795900] font-semibold bg-[#fffdf0] border border-[#fbc02d]/40 px-2 py-0.5 rounded-md text-[11px]">
                <FaMoneyBillWave size={10} className="text-[#795900]" />
                ₹{totalAmount.toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1 text-[#4f4633] bg-[#f9f9f9] border border-[#e2e2e2] px-2 py-0.5 rounded-md text-[11px] font-medium">
                <FaTools size={9} className="text-[#4c616c]" />
                {totalWork} {machine.RentType || "Units"}
              </span>
            </div>
          </div>
        </div>

        {/* Net Profit Pill & Expansion Toggle */}
        <div className="pt-2 border-t border-[#f3f3f3] flex items-center justify-between gap-2">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
              netProfit >= 0
                ? "bg-[#dcfce7] text-[#16a34a] border-[#bbf7d0]"
                : "bg-[#fee2e2] text-[#dc2626] border-[#fecaca]"
            }`}
          >
            <FaChartLine size={11} />
            <span>Net Profit: ₹{netProfit.toLocaleString()}</span>
          </div>

          <button
            type="button"
            onClick={() => toggleShowDetails(machine.Machine_id)}
            className="flex items-center gap-1 text-xs font-bold text-[#795900] hover:text-[#5c4300] bg-[#fffdf0] hover:bg-[#fff9d6] border border-[#fbc02d]/50 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <span>{showDetails ? "Hide Maintenance" : "Manage & Details"}</span>
            {showDetails ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
          </button>
        </div>
      </div>

      {/* ── EXPANDED DETAILS & FINANCIAL TRACKER DRAWER ── */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden bg-[#f9f9f9] border-t border-[#e2e2e2]"
          >
            <div className="p-4 space-y-4">
              {/* Financial Status Summary Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-xl border border-[#e2e2e2] shadow-sm">
                  <p className="text-[10px] text-[#4f4633] font-semibold flex items-center gap-1.5 mb-1">
                    <FaCheckCircle className="text-[#16a34a]" /> {t("doneAmountLabel") || "Collected Rent"}
                  </p>
                  <p className="text-[#16a34a] text-base font-extrabold">₹{totalPaidAmount.toLocaleString()}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#e2e2e2] shadow-sm">
                  <p className="text-[10px] text-[#4f4633] font-semibold flex items-center gap-1.5 mb-1">
                    <FaExclamationCircle className="text-[#dc2626]" /> {t("dueAmountLabel") || "Pending Dues"}
                  </p>
                  <p className="text-[#dc2626] text-base font-extrabold">₹{totalPendingAmount.toLocaleString()}</p>
                </div>
              </div>

              {/* Net Profit Summary Box */}
              <div className="bg-white p-4 rounded-xl border border-[#fbc02d] shadow-sm flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#fbc02d]/15 rounded-bl-full pointer-events-none" />
                <div>
                  <p className="text-xs text-[#6c5000] font-extrabold uppercase tracking-wider mb-0.5">
                    {t("netProfitLabel") || "Net Profit"}
                  </p>
                  <p className="text-[10px] text-[#4f4633]">
                    ({t("totalIncomeLabel") || "Rent"} + {t("extraIncomeLabel") || "Income"} − {t("totalExpenseLabel") || "Expenses"})
                  </p>
                </div>
                <h4
                  className={`font-black text-2xl tracking-tight ${
                    netProfit >= 0 ? "text-[#16a34a]" : "text-[#dc2626]"
                  }`}
                >
                  ₹{netProfit.toLocaleString()}
                </h4>
              </div>

              {/* Embedded Financial Tracker */}
              <div className="bg-white p-4 rounded-xl border border-[#e2e2e2] shadow-sm">
                <FinancialTracker machineId={machine.Machine_id} uid={uid} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main Machine Maintenance App ─────────────────────────────
const MachineMaintenanceApp = () => {
  const { t } = useTranslation();
  const uid = localStorage.getItem("uid");
  const { data: machines = [], isLoading, error } = useGetMachineSummaryQuery(
    { uid, includeArchived: true },
    { skip: !uid }
  );
  const [showDetails, setShowDetails] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const toggleShowDetails = (machineId) => {
    setShowDetails((prev) => ({ ...prev, [machineId]: !prev[machineId] }));
  };

  const processedMachines = useMemo(() => {
    let mapped = [...machines]; // Copy immutable RTK Query array

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
    <div className="bg-[#f9f9f9] text-[#1a1c1c] min-h-screen pt-16 pb-28 font-body-md">
      {/* ── STICKY TOP APP BAR ── */}
      <header className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#e2e2e2] shadow-sm">
        <div className="px-4 py-3 max-w-2xl mx-auto space-y-3">
          {/* Curved Search Input */}
          <div className="relative">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4f4633] text-xs" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder") || "Search machine name or ID..."}
              className="w-full bg-[#f9f9f9] text-[#1a1c1c] pl-9 pr-4 py-2.5 rounded-2xl text-xs outline-none border border-[#e2e2e2] focus:border-[#fbc02d] focus:ring-2 focus:ring-[#fbc02d] transition-all placeholder-[#4f4633] shadow-inner"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { label: t("filterAllLabel") || "All", val: "all" },
              { label: t("filterTopEarner") || "Top Earner", val: "highest_income" },
              { label: t("filterLowestEarner") || "Lowest Earner", val: "lowest_income" },
              { label: t("filterMostActive") || "Most Active", val: "most_active" },
            ].map((f) => (
              <button
                key={f.val}
                type="button"
                onClick={() => setFilterType(f.val)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  filterType === f.val
                    ? "bg-[#fbc02d] text-[#6c5000] border-[#795900] shadow-sm font-bold"
                    : "bg-[#f9f9f9] text-[#4f4633] border-[#e2e2e2] hover:bg-[#e8e8e8]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT LIST ── */}
      <main className="max-w-2xl mx-auto px-4 mt-4 space-y-4">
        {isLoading ? (
          <div className="space-y-3 pt-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-white rounded-2xl border border-[#e2e2e2] animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-red-600 text-xs text-center font-semibold">
            {error.message || "Failed to load machines. Please try again."}
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
          <div className="bg-white border border-[#e2e2e2] rounded-2xl p-10 text-center text-[#4f4633] text-xs font-semibold">
            {t("noMachinesFound") || "No machines found matching your criteria."}
          </div>
        )}
      </main>
    </div>
  );
};

export default MachineMaintenanceApp;