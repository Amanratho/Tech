import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { toast } from "../../utils/toastService";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  FaFilePdf,
  FaDownload,
  FaHistory,
  FaArrowLeft,
  FaFileInvoice,
  FaMoneyBillWave,
  FaWallet,
  FaExclamationCircle,
  FaChartBar,
} from "react-icons/fa";
import {
  MdUpdate,
  MdCalendarMonth,
  MdEvent,
} from "react-icons/md";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { InlineLoader } from "../Loader/Loader";
import ConfirmModal from "../ConfirmModal/ConfirmModal";

const Statement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [isGenerating, setIsGenerating] = useState(false);

  // ── Live Summary Dashboard State ──
  const [summaryData, setSummaryData] = useState({
    totalBillsCount: 0,
    totalBilledSum: 0,
    totalPaidSum: 0,
    totalPendingSum: 0,
  });
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // ── Confirm / Alert Modal State (No Toasts for Fetch Errors) ──
  const [alertModal, setAlertModal] = useState({
    show: false,
    title: "",
    message: "",
  });

  const today = new Date().toISOString().split("T")[0];
  const uid = localStorage.getItem("uid");

  // ── QUICK DATE SETTERS ──
  const setThisMonth = useCallback(() => {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split("T")[0];
    setStartDate(firstDay);
    setEndDate(today);
  }, [today]);

  const setLastMonth = () => {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1).toISOString().split("T")[0];
    const lastDay = new Date(date.getFullYear(), date.getMonth(), 0).toISOString().split("T")[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
  };

  // ── Auto-set "This Month" on mount if dates are empty ──
  useEffect(() => {
    if (!startDate && !endDate) {
      setThisMonth();
    }
  }, [startDate, endDate, setThisMonth]);

  // ── REACTIVE SUMMARY CALCULATOR ──
  const fetchLiveSummary = useCallback(async () => {
    if (!startDate || !endDate || !uid) return;

    if (new Date(startDate) > new Date(endDate)) {
      setSummaryData({ totalBillsCount: 0, totalBilledSum: 0, totalPaidSum: 0, totalPendingSum: 0 });
      return;
    }

    setIsSummaryLoading(true);
    try {
      const { data: allRentals } = await axios.post(`${API_BASE_URL}/api/rentals`, { uid });

      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const filteredData = allRentals.filter((item) => {
        const itemDate = new Date(item.createdAt);
        const isWithinDate = itemDate >= start && itemDate <= end;

        let matchesType = true;
        if (filterType === "Paid") matchesType = item.pendingAmount === 0;
        if (filterType === "Pending") matchesType = item.pendingAmount > 0;

        return isWithinDate && matchesType;
      });

      let billSum = 0;
      let paidSum = 0;
      let pendingSum = 0;

      filteredData.forEach((item) => {
        billSum += item.totalAmount || 0;
        paidSum += item.paidAmount || 0;
        pendingSum += item.pendingAmount || 0;
      });

      setSummaryData({
        totalBillsCount: filteredData.length,
        totalBilledSum: billSum,
        totalPaidSum: paidSum,
        totalPendingSum: pendingSum,
      });
    } catch (error) {
      console.error("Live Summary fetch error:", error);
      // STRICT RULE: No toasts for fetch error — use custom Alert Modal instead
      setAlertModal({
        show: true,
        title: t("statementFetchFailedTitle") || "Data Fetch Failed",
        message: t("statementFetchFailedMsg") || "Unable to load statement summary data. Please try again.",
      });
    } finally {
      setIsSummaryLoading(false);
    }
  }, [startDate, endDate, filterType, uid, t]);

  // Trigger reactive summary recalculation on filter changes
  useEffect(() => {
    fetchLiveSummary();
  }, [fetchLiveSummary]);

  // ── PDF GENERATOR LOGIC ──
  const generatePDFStatement = async () => {
    if (!startDate || !endDate) {
      toast.error(t("errorSelectDates") || "Please select both Start and End dates.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error(t("errorDateRange") || "End date cannot be earlier than Start date.");
      return;
    }

    setIsGenerating(true);
    try {
      const [rentalsResponse, machinesResponse] = await Promise.all([
        axios.post(`${API_BASE_URL}/api/rentals`, { uid }),
        axios.post(`${API_BASE_URL}/api/machines?includeArchived=true`, { uid }),
      ]);

      const allRentals = rentalsResponse.data;
      const allMachines = machinesResponse.data;

      const machineMap = {};
      allMachines.forEach((machine) => {
        machineMap[machine.Machine_id] = machine.Machine_name;
        if (machine._id) machineMap[machine._id] = machine.Machine_name;
      });

      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const filteredData = allRentals.filter((item) => {
        const itemDate = new Date(item.createdAt);
        const isWithinDate = itemDate >= start && itemDate <= end;

        let matchesType = true;
        if (filterType === "Paid") matchesType = item.pendingAmount === 0;
        if (filterType === "Pending") matchesType = item.pendingAmount > 0;

        return isWithinDate && matchesType;
      });

      if (filteredData.length === 0) {
        toast.warning(t("warningNoRecords") || "No records found for the selected dates.");
        setIsGenerating(false);
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(22);
      doc.setTextColor(254, 193, 17);
      doc.text("RentVeda", 14, 20);

      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text("Official Account Statement", 14, 28);

      doc.setFontSize(10);
      doc.setTextColor(50);
      doc.text(`Period: ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`, 14, 36);
      doc.text(`Type: ${filterType} Bills`, 14, 42);

      const tableColumns = ["Date", "Machine", "Customer", "Total Bill", "Paid", "Pending"];
      const tableRows = [];
      let totalBillSum = 0;
      let totalPaidSum = 0;
      let totalPendingSum = 0;

      filteredData.forEach((item) => {
        totalBillSum += item.totalAmount || 0;
        totalPaidSum += item.paidAmount || 0;
        totalPendingSum += item.pendingAmount || 0;

        const actualMachineName = machineMap[item.machineId] || "Unknown Machine";

        const rowData = [
          new Date(item.createdAt).toLocaleDateString(),
          actualMachineName,
          item.customerName || "N/A",
          `Rs. ${item.totalAmount || 0}`,
          `Rs. ${item.paidAmount || 0}`,
          `Rs. ${item.pendingAmount || 0}`,
        ];
        tableRows.push(rowData);
      });

      doc.autoTable({
        startY: 50,
        head: [tableColumns],
        body: tableRows,
        theme: "grid",
        headStyles: { fillColor: [30, 30, 30], textColor: [254, 193, 17] },
        styles: { fontSize: 9, cellPadding: 3 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      const finalY = doc.lastAutoTable.finalY || 50;
      doc.setFontSize(11);
      doc.setTextColor(20);
      doc.text("Summary:", 14, finalY + 10);

      doc.setFontSize(10);
      doc.text(`Total Billing: Rs. ${totalBillSum}`, 14, finalY + 18);
      doc.text(`Total Received: Rs. ${totalPaidSum}`, 14, finalY + 24);
      doc.setTextColor(220, 38, 38);
      doc.text(`Total Pending: Rs. ${totalPendingSum}`, 14, finalY + 30);

      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("Generated securely via RentVeda App", pageWidth / 2, 280, { align: "center" });

      doc.save(`RentVeda_Statement_${start.toLocaleDateString()}.pdf`);
      toast.success(t("successStatementDownloaded") || "Statement Downloaded Successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(t("errorGenerateStatement") || "Failed to generate statement.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="bg-[#f9f9f9] text-[#1a1c1c] min-h-screen font-body-md pt-16 pb-[140px]"
    >
      {/* ── MAIN CONTENT CANVAS ── */}
      <main className="w-full max-w-2xl mx-auto px-4 pt-4 pb-12 space-y-5">
        {/* Hero Section Banner */}
        <section className="bg-gradient-to-br from-white via-[#fffbeb] to-[#fbc02d]/20 border border-[#fbc02d] rounded-2xl p-4 shadow-sm relative overflow-hidden flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#fbc02d] text-[#6c5000] flex items-center justify-center shadow-md flex-shrink-0">
            <FaFilePdf className="text-xl text-[#6c5000]" />
          </div>
          <div>
            <h2 className="text-[#1a1c1c] text-sm font-bold">
              {t("generateReport") || "Generate Official Statement"}
            </h2>
            <p className="text-[#4f4633] text-xs mt-0.5">
              {t("downloadPdfDesc") || "Download PDF statements for your billing & financial records."}
            </p>
          </div>
        </section>

        {/* Quick Select Period */}
        <section className="space-y-2.5">
          <h3 className="text-[#4f4633] text-xs font-bold uppercase tracking-widest pl-1">
            {t("quickSelect") || "Quick Select Period"}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={setThisMonth}
              className="flex items-center justify-center gap-2 bg-white hover:bg-[#fffdf0] border border-[#e2e2e2] hover:border-[#fbc02d] rounded-2xl p-3.5 transition-all shadow-sm active:scale-95 cursor-pointer text-xs font-bold text-[#1a1c1c]"
            >
              <FaHistory className="text-[#795900] text-sm" />
              <span>{t("thisMonth") || "This Month"}</span>
            </button>
            <button
              type="button"
              onClick={setLastMonth}
              className="flex items-center justify-center gap-2 bg-white hover:bg-[#fffdf0] border border-[#e2e2e2] hover:border-[#fbc02d] rounded-2xl p-3.5 transition-all shadow-sm active:scale-95 cursor-pointer text-xs font-bold text-[#1a1c1c]"
            >
              <MdUpdate className="text-[#795900] text-base" />
              <span>{t("lastMonth") || "Last Month"}</span>
            </button>
          </div>
        </section>

        {/* Custom Date Range (Curved Inputs) */}
        <section className="space-y-2.5">
          <h3 className="text-[#4f4633] text-xs font-bold uppercase tracking-widest pl-1">
            {t("customRange") || "Custom Date Range"}
          </h3>
          <div className="bg-white border border-[#e2e2e2] rounded-2xl p-4 shadow-sm space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* From Date */}
              <div>
                <label className="block text-[#4f4633] text-xs font-semibold mb-1.5" htmlFor="fromDate">
                  {t("fromDate") || "From Date"}
                </label>
                <div className="relative">
                  <MdCalendarMonth className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4f4633] text-base pointer-events-none" />
                  <input
                    id="fromDate"
                    name="fromDate"
                    type="date"
                    value={startDate}
                    max={today}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#f9f9f9] text-[#1a1c1c] pl-10 pr-3 py-2.5 rounded-2xl text-xs font-medium border border-[#e2e2e2] focus:border-[#fbc02d] focus:ring-2 focus:ring-[#fbc02d] outline-none transition-all cursor-pointer shadow-inner"
                  />
                </div>
              </div>

              {/* To Date */}
              <div>
                <label className="block text-[#4f4633] text-xs font-semibold mb-1.5" htmlFor="toDate">
                  {t("toDate") || "To Date"}
                </label>
                <div className="relative">
                  <MdEvent className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4f4633] text-base pointer-events-none" />
                  <input
                    id="toDate"
                    name="toDate"
                    type="date"
                    value={endDate}
                    min={startDate}
                    max={today}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#f9f9f9] text-[#1a1c1c] pl-10 pr-3 py-2.5 rounded-2xl text-xs font-medium border border-[#e2e2e2] focus:border-[#fbc02d] focus:ring-2 focus:ring-[#fbc02d] outline-none transition-all cursor-pointer shadow-inner"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Record Type Filter Pills */}
        <section className="space-y-2.5">
          <h3 className="text-[#4f4633] text-xs font-bold uppercase tracking-widest pl-1">
            {t("recordType") || "Bill Filter Type"}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: "All", label: t("allBills") || "All Bills" },
              { val: "Paid", label: t("fullyPaidOnly") || "Fully Paid" },
              { val: "Pending", label: t("pendingDuesOnly") || "Pending Dues" },
            ].map((f) => (
              <button
                key={f.val}
                type="button"
                onClick={() => setFilterType(f.val)}
                className={`py-2.5 rounded-2xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                  filterType === f.val
                    ? "bg-[#fbc02d] text-[#6c5000] border-[#795900] font-bold shadow-sm"
                    : "bg-white text-[#4f4633] border-[#e2e2e2] hover:bg-[#f9f9f9]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── LIVE SUMMARY DASHBOARD ── */}
        <section className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between pl-1">
            <h3 className="text-[#4f4633] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <FaChartBar className="text-[#795900] text-sm" />
              {t("statementLiveSummary") || "Live Summary Dashboard"}
            </h3>
            {isSummaryLoading && <InlineLoader size="sm" />}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Total Bills */}
            <div className="bg-white border border-[#e2e2e2] rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[#4f4633] text-[10px] uppercase font-bold tracking-wider">
                  {t("statementTotalBills") || "Total Bills"}
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#fffdf0] border border-[#fbc02d]/40 flex items-center justify-center text-[#795900]">
                  <FaFileInvoice size={14} />
                </div>
              </div>
              <div>
                <p className="text-[#1a1c1c] text-xl font-extrabold tracking-tight">
                  {isSummaryLoading ? "..." : summaryData.totalBillsCount}
                </p>
              </div>
            </div>

            {/* Total Billed */}
            <div className="bg-white border border-[#e2e2e2] rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[#4f4633] text-[10px] uppercase font-bold tracking-wider">
                  {t("statementTotalBilled") || "Total Billed"}
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#fffdf0] border border-[#fbc02d]/40 flex items-center justify-center text-[#795900]">
                  <FaMoneyBillWave size={14} />
                </div>
              </div>
              <div>
                <p className="text-[#1a1c1c] text-xl font-extrabold tracking-tight">
                  {isSummaryLoading ? "..." : `₹${summaryData.totalBilledSum.toLocaleString("en-IN")}`}
                </p>
              </div>
            </div>

            {/* Total Paid */}
            <div className="bg-white border border-[#e2e2e2] rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[#4f4633] text-[10px] uppercase font-bold tracking-wider">
                  {t("statementTotalPaid") || "Total Paid"}
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#dcfce7] border border-[#bbf7d0] flex items-center justify-center text-[#16a34a]">
                  <FaWallet size={14} />
                </div>
              </div>
              <div>
                <p className="text-[#16a34a] text-xl font-extrabold tracking-tight">
                  {isSummaryLoading ? "..." : `₹${summaryData.totalPaidSum.toLocaleString("en-IN")}`}
                </p>
              </div>
            </div>

            {/* Pending Dues */}
            <div className="bg-white border border-[#e2e2e2] rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[#4f4633] text-[10px] uppercase font-bold tracking-wider">
                  {t("statementTotalPending") || "Pending Dues"}
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#fee2e2] border border-[#fecaca] flex items-center justify-center text-[#dc2626]">
                  <FaExclamationCircle size={14} />
                </div>
              </div>
              <div>
                <p className="text-[#dc2626] text-xl font-extrabold tracking-tight">
                  {isSummaryLoading ? "..." : `₹${summaryData.totalPendingSum.toLocaleString("en-IN")}`}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FIXED BOTTOM ACTION BUTTON (Placed ABOVE mobile bottom navbar at bottom-16 / 64px) ── */}
      <div className="fixed bottom-16 md:bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-[#e2e2e2] p-3 shadow-[0px_-4px_16px_rgba(0,0,0,0.08)] z-40">
        <div className="max-w-2xl mx-auto">
          <button
            type="button"
            onClick={generatePDFStatement}
            disabled={isGenerating}
            className={`w-full bg-[#fbc02d] hover:bg-[#f8bd2a] text-[#6c5000] font-bold text-sm py-3.5 rounded-2xl transition-all duration-200 active:scale-95 shadow-md shadow-[#fbc02d]/20 flex items-center justify-center gap-2 cursor-pointer ${
              isGenerating ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isGenerating ? (
              <div className="w-5 h-5 border-2 border-[#6c5000] border-t-transparent rounded-full animate-spin" />
            ) : (
              <FaDownload className="text-base text-[#6c5000]" />
            )}
            <span>
              {isGenerating
                ? t("generatingPdf") || "Generating Statement..."
                : t("downloadPdfBtn") || "Download PDF Statement"}
            </span>
          </button>
        </div>
      </div>

      {/* ── CONFIRM / ALERT MODAL FOR FETCH ERRORS (STRICT RULE: NO TOASTS) ── */}
      <ConfirmModal
        isOpen={alertModal.show}
        isAlert={true}
        title={alertModal.title}
        message={alertModal.message}
        confirmText={t("okButton") || "OK"}
        variant="warning"
        onConfirm={() => setAlertModal({ show: false, title: "", message: "" })}
      />
    </motion.div>
  );
};

export default Statement;