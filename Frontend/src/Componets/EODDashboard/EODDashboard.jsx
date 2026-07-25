import React, { useState, useCallback } from "react";
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
  FaThLarge,
  FaReceipt,
  FaCalendarCheck,
} from "react-icons/fa";

// ─── Helpers ───────────────────────────────────────────────────────────────────
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

// QUICK_FILTERS is now built inside the component so labels are translatable

// ─── Animated Counter ──────────────────────────────────────────────────────────
const AnimatedNumber = ({ value }) => {
  return (
    <span>
      {value === null ? "—" : `₹${Number(value).toLocaleString("en-IN")}`}
    </span>
  );
};

// ─── Summary Card ─────────────────────────────────────────────────────────────
const SummaryCard = ({ icon: Icon, label, value, color, bg, border, glow, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.35, delay, ease: "easeOut" }}
    className={`relative bg-gradient-to-br ${bg} rounded-2xl p-4 border ${border} overflow-hidden shadow-lg`}
  >
    {/* Glow blob */}
    <div className={`absolute -top-4 -right-4 w-20 h-20 ${glow} rounded-full blur-2xl opacity-40 pointer-events-none`} />

    <div className="relative z-10">
      {/* Icon badge */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color === "green" ? "bg-green-500/15 text-green-400" : color === "red" ? "bg-red-500/15 text-red-400" : color === "amber" ? "bg-amber-500/15 text-amber-400" : "bg-blue-500/15 text-blue-400"}`}>
        <Icon size={16} />
      </div>

      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">{label}</p>
      <p className={`text-xl font-extrabold tracking-tight ${color === "green" ? "text-green-400" : color === "red" ? "text-red-400" : color === "amber" ? "text-amber-400" : "text-blue-400"}`}>
        <AnimatedNumber value={value} />
      </p>
    </div>
  </motion.div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const EODDashboard = () => {
  const { t } = useTranslation();
  const uid = localStorage.getItem("uid");

  // Built here so labels go through t()
  const QUICK_FILTERS = [
    { id: "today",     label: t("eodFilterToday")     || "Today",      icon: FaCalendarDay,   fn: getToday },
    { id: "yesterday", label: t("eodFilterYesterday") || "Yesterday",  icon: FaCalendarCheck, fn: getYesterday },
    { id: "week",      label: t("eodFilterThisWeek")  || "This Week",  icon: FaCalendarWeek,  fn: getThisWeek },
    { id: "month",     label: t("eodFilterThisMonth") || "This Month", icon: FaCalendarAlt,   fn: getThisMonth },
    { id: "custom",    label: t("eodFilterCustom")    || "Custom",     icon: FaThLarge,       fn: null },
  ];

  const [activeFilter, setActiveFilter] = useState("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState(null); // null = not yet fetched
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
      setSummary(null);
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
    [uid]
  );

  // ── Quick filter click ──
  const handleQuickFilter = (filter) => {
    setActiveFilter(filter.id);
    if (filter.id === "custom") {
      setShowCustomPicker(true);
      setSummary(null);
      return;
    }
    setShowCustomPicker(false);
    const range = filter.fn();
    fetchSummary(range);
  };

  // ── Custom range submit ──
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

  // ── Derived label for header ──
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
      className="bg-[var(--bg-main)] min-h-screen pb-28 pt-4 mt-12 font-sans"
    >
      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[var(--border-color)] px-4 py-2 flex items-center justify-between mb-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--primary)]/15 flex items-center justify-center">
            <FaChartBar size={13} className="text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="text-[var(--text-main)] text-xs font-black uppercase tracking-widest leading-tight">
              {t("eodBusinessSummary") || "Business Summary"}
            </h2>
            <p className="text-[var(--text-muted)] text-[9px] font-semibold uppercase tracking-wider">
              {t("eodDashboardTitle") || "EOD Dashboard"}
            </p>
          </div>
        </div>
        {rangeLabel && (
          <span className="text-[9px] font-bold text-[var(--text-muted)] bg-white border border-[var(--border-color)] px-2 py-1 rounded-full">
            {rangeLabel}
          </span>
        )}
      </div>

      <div className="px-4 max-w-lg mx-auto space-y-5">

        {/* ── QUICK DATE FILTER PILLS ── */}
        <div>
          <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mb-2 pl-1">
            {t("eodSelectPeriod") || "Select Period"}
          </p>
          <div className="grid grid-cols-5 gap-1.5">
            {QUICK_FILTERS.map((f) => {
              const Icon = f.icon;
              const isActive = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  id={`filter-${f.id}`}
                  onClick={() => handleQuickFilter(f)}
                  className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 border ${isActive
                    ? "bg-[var(--primary)] text-black border-[var(--primary)] shadow-md shadow-[var(--primary)]/20"
                    : "bg-white text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--primary)]"
                    }`}
                >
                  <Icon size={12} />
                  <span className="leading-none text-center">{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── CUSTOM DATE PICKER ── */}
        <AnimatePresence>
          {showCustomPicker && (
            <motion.div
              key="custom-picker"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white border border-[var(--border-color)] rounded-2xl p-4 space-y-3">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{t("eodCustomRange") || "Custom Range"}</p>

                <div className="grid grid-cols-2 gap-3">
                  {/* Start Date */}
                  <div>
                    <label className="block text-[var(--text-muted)] text-[10px] font-semibold mb-1 pl-1">{t("eodFrom") || "From"}</label>
                    <input
                      type="date"
                      value={customStart}
                      max={todayISO}
                      onChange={(e) => {
                        setCustomStart(e.target.value);
                        // Reset end if it's now invalid
                        if (customEnd && e.target.value > customEnd) setCustomEnd("");
                      }}
                      className="w-full bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-color)] rounded-xl py-2 px-3 focus:border-[var(--primary)] outline-none text-xs [color-scheme:dark] transition-colors"
                    />
                  </div>

                  {/* End Date — min is always customStart to prevent invalid ranges */}
                  <div>
                    <label className="block text-[var(--text-muted)] text-[10px] font-semibold mb-1 pl-1">{t("eodTo") || "To"}</label>
                    <input
                      type="date"
                      value={customEnd}
                      min={customStart || undefined}
                      max={todayISO}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className={`w-full bg-[var(--bg-main)] text-[var(--text-main)] border rounded-xl py-2 px-3 focus:border-[var(--primary)] outline-none text-xs [color-scheme:dark] transition-colors ${!customStart ? "border-[var(--border-color)] opacity-50 cursor-not-allowed" : "border-[var(--border-color)]"
                        }`}
                      disabled={!customStart}
                    />
                  </div>
                </div>

                <button
                  id="apply-custom-range-btn"
                  onClick={handleCustomSubmit}
                  className="w-full py-2.5 bg-[var(--primary)] text-black rounded-xl font-black text-xs tracking-wide active:scale-95 transition-all shadow-md shadow-[var(--primary)]/20"
                >
                  {t("eodApplyRange") || "Apply Range"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── LOADING STATE ── */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 gap-3"
          >
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-2xl border border-[var(--border-color)] animate-pulse" />
            ))}
          </motion.div>
        )}

        {/* ── SUMMARY CARDS ── */}
        {!isLoading && summary && (
          <>
            {/* Entry count pill */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white border border-[var(--border-color)] rounded-full px-3 py-1">
                <FaReceipt size={9} className="text-[var(--primary)]" />
                <span className="text-[10px] font-bold text-[var(--text-muted)]">
                  {summary.entryCount} {summary.entryCount === 1 ? (t("eodEntry") || "entry") : (t("eodEntries") || "entries")} {t("eodInPeriod") || "in period"}
                </span>
              </div>
            </div>

            {/* 2×2 metric grid */}
            <div className="grid grid-cols-2 gap-3">
              <SummaryCard
                icon={FaWallet}
                label={t("eodTotalIncome") || "Total Income"}
                value={summary.totalIncome}
                color="green"
                bg="from-[#0D1F0D] to-gray-200"
                border="border-green-900/40"
                glow="bg-green-500"
                delay={0}
              />
              <SummaryCard
                icon={FaArrowDown}
                label={t("eodExpenses") || "Expenses"}
                value={summary.totalExpenses}
                color="red"
                bg="from-[#1F0D0D] to-gray-200"
                border="border-red-900/40"
                glow="bg-red-500"
                delay={0.07}
              />
              <SummaryCard
                icon={FaClock}
                label={t("eodPendingDues") || "Pending Dues"}
                value={summary.totalPending}
                color="amber"
                bg="from-[#1F1700] to-gray-200"
                border="border-amber-900/40"
                glow="bg-amber-500"
                delay={0.12}
              />
              <SummaryCard
                icon={FaArrowUp}
                label={t("eodNetProfit") || "Net Profit"}
                value={summary.netProfit}
                color={netIsPositive ? "green" : "red"}
                bg={netIsPositive ? "from-[#0D1F0D] to-gray-200" : "from-[#1F0D0D] to-gray-200"}
                border={netIsPositive ? "border-green-900/40" : "border-red-900/40"}
                glow={netIsPositive ? "bg-green-500" : "bg-red-500"}
                delay={0.18}
              />
            </div>

            {/* ── BREAKDOWN CARD ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.35 }}
              className="bg-white border border-[var(--border-color)] rounded-2xl overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between">
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{t("eodBreakdown") || "Breakdown"}</p>
                <FaChartBar size={11} className="text-[var(--primary)]" />
              </div>

              {[
                { label: t("eodTotalBilled")    || "Total Billed",                    value: summary.totalBilled,   color: "text-[var(--primary)]" },
                { label: t("eodCollected")      || "Collected (Income)",              value: summary.totalIncome,   color: "text-green-400" },
                { label: t("eodMaintExpenses")  || "Maintenance Expenses",            value: summary.totalExpenses, color: "text-red-400" },
                { label: t("eodStillPending")   || "Still Pending",                   value: summary.totalPending,  color: "text-amber-400" },
                {
                  label: t("eodNetProfitRow") || "Net Profit (Income − Expenses)",
                  value: summary.netProfit,
                  color: netIsPositive ? "text-green-400" : "text-red-400",
                  bold: true,
                },
              ].map((row, i) => (
                <div
                  key={i}
                  className={`flex justify-between items-center px-4 py-3 text-xs ${i < 4 ? "border-b border-[var(--border-color)]" : ""
                    } ${row.bold ? "bg-gray-100" : ""}`}
                >
                  <span className={`text-[var(--text-muted)] ${row.bold ? "font-black text-[var(--text-muted)]" : "font-semibold"}`}>
                    {row.label}
                  </span>
                  <span className={`font-extrabold ${row.color}`}>
                    ₹{Number(row.value).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </motion.div>
          </>
        )}

        {/* ── EMPTY STATE ── */}
        {!isLoading && !summary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-white border border-[var(--border-color)] flex items-center justify-center mb-4 shadow-lg">
              <FaChartBar size={24} className="text-gray-700" />
            </div>
            <p className="text-[var(--text-muted)] text-sm font-bold">{t("eodEmptyTitle") || "Select a time period"}</p>
            <p className="text-gray-700 text-xs mt-1">{t("eodEmptySubtitle") || "Tap one of the filters above to load your summary"}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default EODDashboard;
