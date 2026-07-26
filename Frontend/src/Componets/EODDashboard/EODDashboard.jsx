import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { toast } from "../../utils/toastService";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  FaWallet,
  FaChartBar,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarAlt,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaReceipt,
  FaCalendarCheck,
} from "react-icons/fa";
import {
  MdExpandMore,
  MdInfo,
  MdWarning,
  MdTrendingUp,
  MdQueryStats,
} from "react-icons/md";

const toISO = (date) => date.toISOString().split("T")[0];

const getToday = () => {
  const d = new Date();
  return { start: toISO(d), end: toISO(d) };
};
const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return { start: toISO(d), end: toISO(d) };
};
const getThisWeek = () => {
  const d = new Date();
  const day = d.getDay(); // 0 = Sun
  const mon = new Date(d);
  mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return { start: toISO(mon), end: toISO(d) };
};
const getThisMonth = () => {
  const d = new Date();
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  return { start: toISO(first), end: toISO(d) };
};

const AnimatedNumber = ({ value }) => {
  return (
    <span>
      {value === null || value === undefined ? "—" : `₹${Number(value).toLocaleString("en-IN")}`}
    </span>
  );
};

const EODDashboard = () => {
  const { t } = useTranslation();
  const uid = localStorage.getItem("uid");

  const QUICK_FILTERS = [
    { id: "today",     label: t("eodFilterToday")     || "Today",      icon: FaCalendarDay,   fn: getToday },
    { id: "yesterday", label: t("eodFilterYesterday") || "Yesterday",  icon: FaCalendarCheck, fn: getYesterday },
    { id: "week",      label: t("eodFilterThisWeek")  || "This Week",  icon: FaCalendarWeek,  fn: getThisWeek },
    { id: "month",     label: t("eodFilterThisMonth") || "This Month", icon: FaCalendarAlt,   fn: getThisMonth },
    { id: "custom",    label: t("eodFilterCustom")    || "Custom",     icon: MdExpandMore,    fn: null },
  ];

  const [activeFilter, setActiveFilter] = useState("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [lastRange, setLastRange] = useState(null);

  const todayISO = toISO(new Date());

  // ── Fetch summary from API ──
  const fetchSummary = useCallback(
    async ({ start, end } = {}) => {
      if (!uid) {
        toast.error(t("eodLoginRequired") || "Please log in to view your dashboard.");
        return;
      }
      if (!start || !end) return;

      setIsLoading(true);
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/rentals/eod-summary`, {
          params: { uid, startDate: start, endDate: end },
        });
        setSummary(data);
        setLastRange({ start, end });
      } catch (err) {
        console.error("EOD fetch error:", err);
        toast.error(t("eodFetchError") || "Failed to load summary. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [uid, t]
  );

  // ── Auto-fetch "Today" on initial mount ──
  useEffect(() => {
    const range = getToday();
    fetchSummary(range);
  }, [fetchSummary]);

  const handleQuickFilter = (filter) => {
    setActiveFilter(filter.id);
    if (filter.id === "custom") {
      setShowCustomPicker((prev) => !prev);
      return;
    }
    setShowCustomPicker(false);
    const range = filter.fn();
    fetchSummary(range);
  };

  const handleCustomSubmit = () => {
    if (!customStart || !customEnd) {
      toast.error(t("eodSelectBothDates") || "Please select both start and end dates.");
      return;
    }
    if (new Date(customStart) > new Date(customEnd)) {
      toast.error(t("eodEndDateError") || "End date cannot be before start date.");
      return;
    }
    fetchSummary({ start: customStart, end: customEnd });
    setShowCustomPicker(false);
  };

  const rangeLabel = lastRange
    ? lastRange.start === lastRange.end
      ? lastRange.start
      : `${lastRange.start} → ${lastRange.end}`
    : null;

  const netIsPositive = summary ? summary.netProfit >= 0 : true;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[#f9f9f9] text-[#1a1c1c] min-h-screen flex flex-col font-body-md pt-16 pb-[112px]"
    >
      {/* ── MAIN CONTENT CANVAS ── */}
      <main className="flex-1 w-full max-w-2xl mx-auto p-4 space-y-6">
        {/* ── FILTERS SECTION ── */}
        <section className="w-full">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {QUICK_FILTERS.map((f) => {
              const isActive = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  id={`filter-${f.id}`}
                  onClick={() => handleQuickFilter(f)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-full border text-xs font-semibold font-label-md transition-all duration-200 cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                    isActive
                      ? "border-[#795900] bg-[#fbc02d] text-[#6c5000] shadow-sm font-bold"
                      : "border-[#d3c5ad] text-[#4f4633] bg-[#eeeeee] hover:bg-[#e8e8e8]"
                  }`}
                >
                  <span>{f.label}</span>
                  {f.id === "custom" && (
                    <MdExpandMore
                      className={`text-base transition-transform duration-200 ${
                        showCustomPicker ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* ── EXPANDABLE CUSTOM DATE PICKER ── */}
          <AnimatePresence>
            {showCustomPicker && (
              <motion.div
                key="custom-picker"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-3"
              >
                <div className="p-5 rounded-2xl bg-[#eeeeee] border border-[#e2e2e2] shadow-sm space-y-4">
                  <p className="text-xs font-bold text-[#4f4633] uppercase tracking-widest">
                    {t("eodCustomRange") || "Custom Range"}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Start Date */}
                    <div>
                      <label className="block text-[#4f4633] font-label-sm text-label-sm mb-1.5 text-xs font-medium">
                        {t("eodFrom") || "From Date"}
                      </label>
                      <input
                        type="date"
                        value={customStart}
                        max={todayISO}
                        onChange={(e) => {
                          setCustomStart(e.target.value);
                          if (customEnd && e.target.value > customEnd) setCustomEnd("");
                        }}
                        className="w-full bg-white border border-[#d3c5ad] rounded-2xl p-3 text-[#1a1c1c] font-label-md text-label-md focus:border-[#fbc02d] focus:ring-2 focus:ring-[#fbc02d] outline-none transition-all cursor-pointer shadow-inner"
                      />
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="block text-[#4f4633] font-label-sm text-label-sm mb-1.5 text-xs font-medium">
                        {t("eodTo") || "To Date"}
                      </label>
                      <input
                        type="date"
                        value={customEnd}
                        min={customStart || undefined}
                        max={todayISO}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className={`w-full bg-white border border-[#d3c5ad] rounded-2xl p-3 text-[#1a1c1c] font-label-md text-label-md focus:border-[#fbc02d] focus:ring-2 focus:ring-[#fbc02d] outline-none transition-all cursor-pointer shadow-inner ${
                          !customStart ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={!customStart}
                      />
                    </div>
                  </div>

                  <button
                    id="apply-custom-range-btn"
                    onClick={handleCustomSubmit}
                    className="w-full py-3.5 bg-[#fbc02d] text-[#6c5000] rounded-2xl font-label-md text-label-md font-bold transition-all duration-200 active:scale-95 shadow-md hover:bg-[#f8bd2a] cursor-pointer"
                  >
                    {t("eodApplyRange") || "Apply Date Range"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── LOADING SKELETON ── */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 gap-4"
          >
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-36 bg-white rounded-2xl border border-[#e2e2e2] animate-pulse"
              />
            ))}
          </motion.div>
        )}

        {/* ── METRIC GRID & BREAKDOWN TABLE ── */}
        {!isLoading && summary && (
          <>
            <section className="grid grid-cols-2 gap-4">
              {/* Total Income */}
              <div className="bg-white rounded-2xl p-4 border border-[#e2e2e2] relative overflow-hidden flex flex-col justify-between min-h-[140px] shadow-[0_2px_12px_rgba(22,163,74,0.1)] hover:shadow-[0_4px_18px_rgba(22,163,74,0.15)] transition-shadow">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#dcfce7] rounded-full blur-2xl opacity-70"></div>
                <div className="flex justify-between items-start z-10">
                  <span className="text-[#4f4633] font-label-sm text-label-sm uppercase font-semibold">
                    {t("eodTotalIncome") || "Total Income"}
                  </span>
                  <div className="bg-[#dcfce7] p-2 rounded-xl flex items-center justify-center">
                    <FaWallet className="text-[#16a34a] text-lg" />
                  </div>
                </div>
                <div className="z-10 mt-3">
                  <div className="font-headline-lg-mobile text-headline-lg-mobile text-[#16a34a] text-2xl font-extrabold">
                    <AnimatedNumber value={summary.totalIncome} />
                  </div>
                  <div className="flex items-center gap-1 text-[#16a34a] font-label-sm text-label-sm mt-1 text-xs font-medium">
                    <FaArrowUp className="text-[10px]" />
                    <span>{summary.entryCount} {summary.entryCount === 1 ? (t("eodEntry") || "entry") : (t("eodEntries") || "entries")}</span>
                  </div>
                </div>
              </div>

              {/* Total Expenses */}
              <div className="bg-white rounded-2xl p-4 border border-[#e2e2e2] relative overflow-hidden flex flex-col justify-between min-h-[140px] shadow-[0_2px_12px_rgba(220,38,38,0.1)] hover:shadow-[0_4px_18px_rgba(220,38,38,0.15)] transition-shadow">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#fee2e2] rounded-full blur-2xl opacity-70"></div>
                <div className="flex justify-between items-start z-10">
                  <span className="text-[#4f4633] font-label-sm text-label-sm uppercase font-semibold">
                    {t("eodExpenses") || "Total Expenses"}
                  </span>
                  <div className="bg-[#fee2e2] p-2 rounded-xl flex items-center justify-center">
                    <FaArrowDown className="text-[#dc2626] text-lg" />
                  </div>
                </div>
                <div className="z-10 mt-3">
                  <div className="font-headline-lg-mobile text-headline-lg-mobile text-[#dc2626] text-2xl font-extrabold">
                    <AnimatedNumber value={summary.totalExpenses} />
                  </div>
                  <div className="flex items-center gap-1 text-[#4f4633] font-label-sm text-label-sm mt-1 text-xs font-medium">
                    <MdInfo className="text-xs opacity-70" />
                    <span>{t("eodMaintExpenses") || "Maintenance & Costs"}</span>
                  </div>
                </div>
              </div>

              {/* Pending Dues */}
              <div className="bg-white rounded-2xl p-4 border border-[#e2e2e2] relative overflow-hidden flex flex-col justify-between min-h-[140px] shadow-[0_2px_12px_rgba(217,119,6,0.1)] hover:shadow-[0_4px_18px_rgba(217,119,6,0.15)] transition-shadow">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#fef3c7] rounded-full blur-2xl opacity-70"></div>
                <div className="flex justify-between items-start z-10">
                  <span className="text-[#4f4633] font-label-sm text-label-sm uppercase font-semibold">
                    {t("eodPendingDues") || "Pending Dues"}
                  </span>
                  <div className="bg-[#fef3c7] p-2 rounded-xl flex items-center justify-center">
                    <FaClock className="text-[#d97706] text-lg" />
                  </div>
                </div>
                <div className="z-10 mt-3">
                  <div className="font-headline-lg-mobile text-headline-lg-mobile text-[#d97706] text-2xl font-extrabold">
                    <AnimatedNumber value={summary.totalPending} />
                  </div>
                  <div className="flex items-center gap-1 text-[#d97706] font-label-sm text-label-sm mt-1 text-xs font-medium">
                    <MdWarning className="text-xs" />
                    <span>Requires follow-up</span>
                  </div>
                </div>
              </div>

              {/* Net Profit (Highlighted) */}
              <div className="bg-gradient-to-br from-white via-[#fffbeb] to-[#fbc02d]/25 rounded-2xl p-4 border-2 border-[#fbc02d] relative overflow-hidden flex flex-col justify-between min-h-[140px] shadow-[0_4px_20px_rgba(251,192,45,0.25)] hover:shadow-[0_6px_25px_rgba(251,192,45,0.35)] transition-shadow">
                <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-[#fbc02d] rounded-full blur-2xl opacity-50"></div>
                <div className="flex justify-between items-start z-10">
                  <span className="text-[#6c5000] font-label-sm text-label-sm uppercase font-bold tracking-widest">
                    {t("eodNetProfit") || "Net Profit"}
                  </span>
                  <div className="bg-[#fbc02d] text-[#6c5000] p-2 rounded-xl flex items-center justify-center shadow-sm">
                    <MdTrendingUp className="text-xl text-[#6c5000]" />
                  </div>
                </div>
                <div className="z-10 mt-3">
                  <div className="font-headline-lg-mobile text-headline-lg-mobile text-[#6c5000] text-2xl font-extrabold">
                    <AnimatedNumber value={summary.netProfit} />
                  </div>
                  <div className="flex items-center gap-1 text-[#6c5000] font-label-sm text-label-sm mt-1 font-semibold text-xs">
                    <span>{netIsPositive ? "Net Profit" : "Net Deficit"}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ── BREAKDOWN TABLE ── */}
            <section className="bg-white rounded-2xl border border-[#e2e2e2] overflow-hidden shadow-sm mt-6">
              <div className="p-4 border-b border-[#e2e2e2] bg-[#f9f9f9] flex items-center justify-between">
                <h2 className="font-headline-md text-headline-md text-[#1a1c1c] flex items-center gap-2 text-base font-bold">
                  <FaReceipt className="text-[#795900] text-[20px]" />
                  {t("eodBreakdown") || "Financial Breakdown"}
                </h2>
                <span className="text-xs font-semibold text-[#4f4633] bg-[#eeeeee] px-2.5 py-1 rounded-full border border-[#e2e2e2]">
                  {summary.entryCount} {summary.entryCount === 1 ? (t("eodEntry") || "entry") : (t("eodEntries") || "entries")}
                </span>
              </div>
              <div className="divide-y divide-[#e2e2e2]">
                <div className="flex justify-between items-center p-4 hover:bg-[#f9f9f9] transition-colors">
                  <div className="text-[#1a1c1c] font-body-md text-body-md font-medium">
                    {t("eodTotalBilled") || "Total Billed"}
                  </div>
                  <div className="text-[#1a1c1c] font-label-md text-label-md font-bold">
                    ₹{Number(summary.totalBilled || 0).toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 hover:bg-[#f9f9f9] transition-colors">
                  <div className="text-[#1a1c1c] font-body-md text-body-md font-medium flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#16a34a]"></div>
                    {t("eodCollected") || "Collected (Income)"}
                  </div>
                  <div className="text-[#16a34a] font-label-md text-label-md font-bold">
                    + ₹{Number(summary.totalIncome || 0).toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 hover:bg-[#f9f9f9] transition-colors">
                  <div className="text-[#1a1c1c] font-body-md text-body-md font-medium flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#dc2626]"></div>
                    {t("eodMaintExpenses") || "Maintenance Expenses"}
                  </div>
                  <div className="text-[#dc2626] font-label-md text-label-md font-bold">
                    - ₹{Number(summary.totalExpenses || 0).toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 hover:bg-[#f9f9f9] transition-colors">
                  <div className="text-[#1a1c1c] font-body-md text-body-md font-medium flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#d97706]"></div>
                    {t("eodStillPending") || "Still Pending"}
                  </div>
                  <div className="text-[#d97706] font-label-md text-label-md font-bold">
                    ₹{Number(summary.totalPending || 0).toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 bg-[#fbc02d]/15 border-t-2 border-[#fbc02d]">
                  <div className="text-[#1a1c1c] font-headline-md text-headline-md font-bold">
                    {t("eodNetProfitRow") || "Net Profit"}
                  </div>
                  <div className="text-[#6c5000] font-headline-md text-headline-md font-extrabold text-lg">
                    ₹{Number(summary.netProfit || 0).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ── EMPTY STATE ── */}
        {!isLoading && !summary && (
          <section className="flex flex-col items-center justify-center p-12 mt-6 text-center">
            <div className="w-20 h-20 bg-[#eeeeee] rounded-full flex items-center justify-center mb-4 text-[#817661] border border-[#e2e2e2]">
              <MdQueryStats className="text-4xl text-[#817661]" />
            </div>
            <h3 className="font-headline-md text-headline-md text-[#1a1c1c] mb-1 text-lg font-bold">
              {t("eodEmptyTitle") || "No data for selected period"}
            </h3>
            <p className="font-body-md text-body-md text-[#4f4633] text-sm max-w-xs">
              {t("eodEmptySubtitle") || "Select a time period from the filters above to view your end of day dashboard."}
            </p>
          </section>
        )}
      </main>
    </motion.div>
  );
};

export default EODDashboard;
