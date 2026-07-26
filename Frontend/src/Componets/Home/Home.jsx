import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useGetMachinesQuery } from "../../redux/functional/machineApiSlice";
import { useGetPaymentsQuery, useGetPendingRemindersQuery } from "../../redux/functional/paymentApiSlice";
import Tracker from "../Tracker/Tracker";
import { format, isToday, isPast } from "date-fns";
import {
  FaPlus,
  FaFileInvoice,
  FaHistory,
  FaTools,
  FaTractor,
  FaChevronRight,
  FaSearch,
  FaMoneyBillWave,
  FaWallet,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaArrowRight,
  FaUser,
  FaBoxes,
  FaCalculator,
} from "react-icons/fa";

// ─── 1. GREETING & METRICS SUMMARY HEADER ────────────────────────────
function DashboardHeader() {
  const { t } = useTranslation();
  const uid = localStorage.getItem("uid");

  // RTK Query Data
  const { data: payments = [] } = useGetPaymentsQuery(uid, { skip: !uid });
  const { data: reminders = [] } = useGetPendingRemindersQuery(uid, { skip: !uid });
  const { data: machines = [] } = useGetMachinesQuery({ uid }, { skip: !uid });

  // Calculate Time-based Greeting
  const hour = new Date().getHours();
  let greetingKey = "greetingMorning";
  if (hour >= 12 && hour < 17) greetingKey = "greetingAfternoon";
  if (hour >= 17) greetingKey = "greetingEvening";

  // Calculate Metrics
  const metrics = useMemo(() => {
    let todayIncomeSum = 0;
    let todayEntriesCount = 0;
    let totalPendingSum = 0;

    payments.forEach((p) => {
      const pDate = new Date(p.createdAt);
      if (isToday(pDate)) {
        todayIncomeSum += Number(p.paidAmount || 0);
        todayEntriesCount += 1;
      }
      totalPendingSum += Number(p.pendingAmount || 0);
    });

    // Check overdue reminders
    const overdueCount = reminders.filter((r) => {
      if (!r.reminderDate) return false;
      const date = new Date(r.reminderDate);
      return isPast(date) && !isToday(date);
    }).length;

    return {
      todayIncome: todayIncomeSum,
      todayEntries: todayEntriesCount,
      totalPending: totalPendingSum,
      totalMachines: machines.length,
      overdueCount,
    };
  }, [payments, reminders, machines]);

  return (
    <div className="px-4 pt-3 pb-2 space-y-4">
      {/* Personalized Greeting */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[#1a1c1c] text-lg font-extrabold tracking-tight">
            {t(greetingKey) || "Welcome 👋"}
          </h1>
          <p className="text-[#4f4633] text-xs font-medium">
            {t("greetingSubtitle") || "Here is your business overview today"}
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-[#e2e2e2] px-3 py-1.5 rounded-full shadow-sm text-xs font-bold text-[#795900]">
          <FaCalendarAlt className="text-[#795900] text-xs" />
          <span>{format(new Date(), "dd MMM yyyy")}</span>
        </div>
      </div>

      {/* 2x2 Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Today's Income */}
        <div className="bg-white border border-[#e2e2e2] rounded-2xl p-3.5 shadow-sm space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-[#4f4633] uppercase tracking-wider">
              {t("todayIncome") || "Today's Income"}
            </span>
            <div className="w-7 h-7 rounded-xl bg-[#dcfce7] border border-[#bbf7d0] text-[#16a34a] flex items-center justify-center">
              <FaWallet size={12} />
            </div>
          </div>
          <p className="text-lg font-extrabold text-[#16a34a] tracking-tight">
            ₹{metrics.todayIncome.toLocaleString("en-IN")}
          </p>
        </div>

        {/* Total Pending */}
        <div className="bg-white border border-[#e2e2e2] rounded-2xl p-3.5 shadow-sm space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-[#4f4633] uppercase tracking-wider">
              {t("totalPendingDues") || "Total Pending"}
            </span>
            <div className="w-7 h-7 rounded-xl bg-[#fee2e2] border border-[#fecaca] text-[#dc2626] flex items-center justify-center">
              <FaMoneyBillWave size={12} />
            </div>
          </div>
          <p className="text-lg font-extrabold text-[#dc2626] tracking-tight">
            ₹{metrics.totalPending.toLocaleString("en-IN")}
          </p>
        </div>

        {/* Today's Entries */}
        <div className="bg-white border border-[#e2e2e2] rounded-2xl p-3.5 shadow-sm space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-[#4f4633] uppercase tracking-wider">
              {t("activeWorkEntries") || "Today Entries"}
            </span>
            <div className="w-7 h-7 rounded-xl bg-[#fffdf0] border border-[#fbc02d]/40 text-[#795900] flex items-center justify-center">
              <FaFileInvoice size={12} />
            </div>
          </div>
          <p className="text-lg font-extrabold text-[#1a1c1c] tracking-tight">
            {metrics.todayEntries}
          </p>
        </div>

        {/* Total Machines */}
        <div className="bg-white border border-[#e2e2e2] rounded-2xl p-3.5 shadow-sm space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-[#4f4633] uppercase tracking-wider">
              {t("totalMachinesCount") || "My Machines"}
            </span>
            <div className="w-7 h-7 rounded-xl bg-[#fffdf0] border border-[#fbc02d]/40 text-[#795900] flex items-center justify-center">
              <FaBoxes size={12} />
            </div>
          </div>
          <p className="text-lg font-extrabold text-[#1a1c1c] tracking-tight">
            {metrics.totalMachines}
          </p>
        </div>
      </div>

      {/* Overdue Payment Alert Banner (Conditional) */}
      {metrics.overdueCount > 0 && (
        <Link
          to="/pending-payments"
          className="flex items-center justify-between bg-red-50 border border-red-200 rounded-2xl p-3.5 shadow-sm active:scale-98 transition-transform cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
              <FaExclamationTriangle size={14} />
            </div>
            <div>
              <p className="text-xs font-bold text-red-700">
                {t("overdueAlertTitle") || "Pending Dues Follow-up Required"}
              </p>
              <p className="text-[10px] text-red-600 font-medium mt-0.5">
                {metrics.overdueCount} {t("overdueAlertMsg") || "reminders require urgent follow-up today."}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-full whitespace-nowrap">
            {t("viewDues") || "View Dues"}
          </span>
        </Link>
      )}
    </div>
  );
}

// ─── 2. QUICK ACTIONS SHORTCUTS ────────────────────────────────────
function QuickActions() {
  const { t } = useTranslation();

  const actions = [
    {
      title: t("paymentTracking") || "Payments",
      icon: <FaFileInvoice />,
      link: "/payment-tracking",
      color: "#16a34a",
      bg: "bg-green-50 border-green-200",
    },
    {
      title: t("billsHistory") || "Bills",
      icon: <FaHistory />,
      link: "/bill-history",
      color: "#2563eb",
      bg: "bg-blue-50 border-blue-200",
    },
    {
      title: t("machineStatus") || "Machine",
      icon: <FaTools />,
      link: "/machine-maintenance",
      color: "#ea580c",
      bg: "bg-orange-50 border-orange-200",
    },
    {
      title: t("calculator") || "Calculator",
      icon: <FaCalculator />,
      link: "/calculator",
      color: "#d97706",
      bg: "bg-amber-50 border-amber-200",
    },
  ];

  return (
    <div className="px-4 mt-2">
      <div className="bg-white border border-[#e2e2e2] rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-4 gap-3">
          {actions.map((action, idx) => (
            <Link
              key={idx}
              to={action.link}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div
                className={`w-12 h-12 rounded-2xl ${action.bg} border flex items-center justify-center group-active:scale-95 transition-transform shadow-sm`}
                style={{ color: action.color }}
              >
                <span className="text-base">{action.icon}</span>
              </div>
              <span className="text-[10px] text-[#4f4633] font-bold text-center leading-tight uppercase tracking-wider">
                {action.title.split(" ")[0]}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 3. MACHINE GALLERY SECTION ────────────────────────────────────
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
  } = useGetMachinesQuery({ uid }, { skip: !uid });

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
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-3" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2].map((i) => (
            <div key={i} className="w-40 h-44 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !uid) return null;

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="px-4 flex justify-between items-center mb-3">
        <div>
          <h2 className="text-[#1a1c1c] text-base font-bold tracking-tight">
            {t("exploreMachines") || "Explore Our Machines"}
          </h2>
          <p className="text-[#4f4633] text-[10px] font-semibold mt-0.5">
            {filteredMachines.length} {t("machinesCount") || "machines"} available
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSearch(!showSearch)}
            className="w-8 h-8 bg-white border border-[#e2e2e2] rounded-xl flex items-center justify-center text-[#4f4633] hover:text-[#795900] active:scale-90 transition-all shadow-sm cursor-pointer"
          >
            <FaSearch size={11} />
          </button>
          {machines.length > 0 && (
            <button
              type="button"
              onClick={() => navigate("/add-machinery")}
              className="w-8 h-8 bg-[#fbc02d] text-[#6c5000] rounded-xl flex items-center justify-center font-bold active:scale-90 transition-all shadow-sm cursor-pointer"
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
            className="px-4 overflow-hidden mb-3"
          >
            <div className="relative">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4f4633] text-xs" />
              <input
                type="text"
                placeholder={t("searchMachine") || "Search machines..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-white text-[#1a1c1c] border border-[#e2e2e2] rounded-2xl py-2.5 pl-10 pr-4 focus:border-[#fbc02d] focus:ring-2 focus:ring-[#fbc02d] outline-none transition-all text-xs placeholder-[#4f4633] shadow-inner"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {machines.length === 0 ? (
        <div className="px-4">
          <div
            onClick={() => navigate("/add-machinery")}
            className="w-full py-8 border-2 border-dashed border-[#e2e2e2] hover:border-[#fbc02d] rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors active:scale-98 bg-white"
          >
            <div className="w-12 h-12 bg-[#fffdf0] border border-[#fbc02d]/40 rounded-2xl flex items-center justify-center text-[#795900] shadow-sm">
              <FaPlus size={18} />
            </div>
            <div className="text-center">
              <p className="text-[#1a1c1c] text-xs font-bold">
                {t("addYourMachine") || "Add Your First Machine"}
              </p>
              <p className="text-[#4f4633] text-[10px] mt-0.5 font-medium">
                Tap to register a machine
              </p>
            </div>
          </div>
        </div>
      ) : (
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
                className="relative flex-shrink-0 w-[155px] h-[190px] rounded-2xl overflow-hidden cursor-pointer group bg-white border border-[#e2e2e2] shadow-sm"
              >
                {item.image ? (
                  <img
                    className="absolute inset-0 w-full h-full object-cover group-active:scale-105 transition-transform duration-300"
                    src={item.image}
                    alt={item.Machine_name}
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-[#4f4633]/40 bg-gray-100">
                    <FaTractor size={36} />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                <div className="absolute bottom-0 left-0 w-full p-3 flex flex-col">
                  <h5 className="text-white text-xs font-extrabold truncate mb-1">
                    {item.Machine_name}
                  </h5>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-gray-200 font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-md">
                      {item.RentType || "Rate"}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-[#fbc02d] text-[#6c5000] flex items-center justify-center shadow-sm">
                      <FaChevronRight size={8} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            <div
              onClick={() => navigate("/add-machinery")}
              className="flex-shrink-0 w-[155px] h-[190px] rounded-2xl border-2 border-dashed border-[#e2e2e2] hover:border-[#fbc02d] bg-white flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors active:scale-95"
            >
              <div className="w-9 h-9 bg-[#fffdf0] border border-[#fbc02d]/40 rounded-xl flex items-center justify-center text-[#795900]">
                <FaPlus size={14} />
              </div>
              <span className="text-[#4f4633] text-[10px] font-bold uppercase tracking-wider">
                {t("addMachine") || "Add New"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 4. RECENT ACTIVITY FEED SECTION ────────────────────────────
function RecentActivitySection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const uid = localStorage.getItem("uid");

  const { data: payments = [] } = useGetPaymentsQuery(uid, { skip: !uid });

  const recentEntries = useMemo(() => {
    return [...payments]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
  }, [payments]);

  if (!uid || recentEntries.length === 0) return null;

  return (
    <div className="px-4 mt-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-[#1a1c1c] text-base font-bold tracking-tight">
          {t("recentActivityTitle") || "Recent Activity"}
        </h2>
        <Link
          to="/bill-history"
          className="text-xs font-bold text-[#795900] flex items-center gap-1 hover:underline"
        >
          <span>{t("viewAllHistory") || "View All"}</span>
          <FaArrowRight size={10} />
        </Link>
      </div>

      <div className="space-y-2.5">
        {recentEntries.map((entry) => (
          <div
            key={entry._id}
            onClick={() => navigate("/bill-history")}
            className="bg-white border border-[#e2e2e2] rounded-2xl p-3.5 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#f9f9f9] border border-[#e2e2e2] flex items-center justify-center text-[#4f4633]">
                <FaUser size={12} />
              </div>
              <div>
                <h4 className="text-[#1a1c1c] text-xs font-bold">
                  {entry.customerName || "Customer Entry"}
                </h4>
                <p className="text-[10px] text-[#4f4633] mt-0.5">
                  {format(new Date(entry.createdAt), "dd MMM yyyy • hh:mm a")}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs font-extrabold text-[#1a1c1c]">
                ₹{entry.totalAmount?.toLocaleString()}
              </p>
              <span
                className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                  entry.pendingAmount > 0
                    ? "bg-[#fee2e2] text-[#dc2626] border border-red-200"
                    : "bg-[#dcfce7] text-[#16a34a] border border-green-200"
                }`}
              >
                {entry.pendingAmount > 0
                  ? `Due ₹${entry.pendingAmount}`
                  : (t("statusPaid") || "Paid")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN HOME COMPONENT ─────────────────────────────────────
function Home() {
  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] min-h-screen pt-16 pb-24 font-body-md overflow-x-hidden">
      {/* 1. Dashboard Header with Greeting & Metric Cards */}
      <DashboardHeader />

      {/* 2. Quick Action Shortcuts */}
      <QuickActions />

      {/* 3. Work Tracker Widget */}
      <div className="mt-6">
        <div className="px-4 mb-2">
          <h2 className="text-[#1a1c1c] text-base font-bold tracking-tight">
            Work Tracker
          </h2>
        </div>
        <Tracker />
      </div>

      {/* 4. Machine Gallery */}
      <MachineSection />

      {/* 5. Recent Activity Feed */}
      <RecentActivitySection />
    </div>
  );
}

export default Home;