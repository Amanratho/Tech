import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetPendingRemindersQuery,
  useUpdateReminderDetailsMutation,
  useDeleteOrCompleteReminderMutation,
} from "../../redux/functional/paymentApiSlice";
import { toast } from "../../utils/toastService";
import { useTranslation } from "react-i18next";
import { format, isPast, isToday } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import { openPhoneDialer } from "../../utils/capacitorLinks";
import {
  FaChevronLeft,
  FaSearch,
  FaUser,
  FaPhoneAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaClock,
  FaEdit,
  FaTrashAlt,
  FaCheckCircle,
  FaTimes,
  FaBell,
} from "react-icons/fa";

const PendingPayments = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const uid = localStorage.getItem("uid");

  // RTK Query hooks
  const {
    data: reminders = [],
    error,
    isLoading,
    refetch,
  } = useGetPendingRemindersQuery(uid, { skip: !uid });

  const [updateReminder] = useUpdateReminderDetailsMutation();
  const [performAction] = useDeleteOrCompleteReminderMutation();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, overdue, today, upcoming

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [editDate, setEditDate] = useState("");

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({ open: false, reminderId: null, action: null });

  // Today's date in YYYY-MM-DD for min attribute on date picker
  const today = new Date().toISOString().split("T")[0];

  // Validated date change handler — blocks past dates
  const handleEditDateChange = (e) => {
    const selectedDate = e.target.value;
    if (selectedDate < today) {
      setEditDate("");
      toast.warn(t('reminderPastDateError') || "Reminder date cannot be in the past", { theme: "light" });
      return;
    }
    setEditDate(selectedDate);
  };

  // Helper: Get status label and color styling for dates
  const getDateStatus = (dateString) => {
    if (!dateString) return { label: t("reminderStatusNoDate") || "No Date", color: "text-[#4f4633]", bg: "bg-gray-100", border: "border-gray-200" };
    const date = new Date(dateString);
    if (isToday(date)) {
      return { label: t("reminderStatusDueToday") || "Due Today", color: "text-[#d97706]", bg: "bg-[#fef3c7]", border: "border-amber-200" };
    }
    if (isPast(date)) {
      return { label: t("reminderStatusOverdue")  || "Overdue",   color: "text-[#dc2626]", bg: "bg-[#fee2e2]", border: "border-red-200" };
    }
    return { label: t("reminderStatusUpcoming") || "Upcoming", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
  };

  // Filter Logic
  const filteredReminders = reminders.filter((rem) => {
    const matchesSearch =
      rem.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rem.mobileNumber.includes(searchQuery) ||
      (rem.customerMobile && rem.customerMobile.includes(searchQuery));

    if (!matchesSearch) return false;

    if (filterStatus === "all") return true;

    const date = new Date(rem.reminderDate);
    const today = isToday(date);
    const past = isPast(date) && !today;

    if (filterStatus === "overdue") return past;
    if (filterStatus === "today") return today;
    if (filterStatus === "upcoming") return !past && !today;

    return true;
  });

  // Action: Open Edit Modal
  const handleOpenEdit = (reminder) => {
    setSelectedReminder(reminder);
    setEditDate(reminder.reminderDate ? reminder.reminderDate.split("T")[0] : "");
    setIsEditModalOpen(true);
  };

  // Action: Save Edits
  const handleSaveEdit = async () => {
    if (!editDate) {
      toast.warn(t("reminderSelectValidDate") || "Please select a valid date.");
      return;
    }
    if (editDate < today) {
      toast.warn(t('reminderPastDateError') || "Reminder date cannot be in the past", { theme: "light" });
      return;
    }

    try {
      await updateReminder({
        _id: selectedReminder._id,
        reminderDate: editDate,
      }).unwrap();

      toast.success(t("reminderUpdatedSuccess") || "Reminder details updated successfully!");
      setIsEditModalOpen(false);
      refetch();
    } catch (err) {
      console.error("Error saving edits:", err);
      toast.error(err.data?.message || (t("reminderUpdateFailed") || "Failed to update reminder details"));
    }
  };

  // Action: Mark PAID or CANCEL — opens confirm modal
  const handleAction = (reminderId, action) => {
    setConfirmDialog({ open: true, reminderId, action });
  };

  // Confirm Modal Handler
  const handleConfirmAction = async () => {
    const { reminderId, action } = confirmDialog;
    if (!reminderId || !action) return;

    try {
      await performAction({ id: reminderId, action }).unwrap();
      if (action === "COMPLETE") {
        toast.success(t("reminderMarkedCompleted") || "Reminder marked as completed!");
      } else {
        toast.success(t("reminderDeletedSuccess") || "Reminder deleted!");
      }
      refetch();
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
      toast.error(err.data?.message || (t("reminderActionFailed") || "Failed to perform action"));
    } finally {
      setConfirmDialog({ open: false, reminderId: null, action: null });
    }
  };

  if (isLoading) return <div className="p-5 text-[#1a1c1c] bg-[#f9f9f9] min-h-screen pt-20">{t("reminderLoading") || "Loading active reminders..."}</div>;
  if (error)     return <div className="p-5 text-red-500 bg-[#f9f9f9] min-h-screen pt-20">{t("reminderLoadError") || "Error loading active reminders"}</div>;

  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] min-h-screen pt-16 pb-28 font-body-md relative">
      {/* ── UNIFIED STICKY APP HEADER & SEARCH BAR ── */}
      <header className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#e2e2e2] shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 space-y-3">
          {/* Header Title Bar */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-xl bg-[#f9f9f9] hover:bg-[#e8e8e8] text-[#795900] flex items-center justify-center transition-colors cursor-pointer border border-[#e2e2e2]"
                aria-label="Back"
              >
                <FaChevronLeft className="text-sm" />
              </button>
              <div>
                <h1 className="text-[#1a1c1c] text-base font-bold tracking-tight">
                  {t("pendingReminders") || "Payment Reminders"}
                </h1>
                <p className="text-[10px] text-[#4f4633] font-semibold uppercase tracking-wider">
                  {reminders.length} {t("reminderActiveDues") || "Active Dues"}
                </p>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#fbc02d] text-[#6c5000] flex items-center justify-center shadow-sm">
              <FaBell className="text-base" />
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4f4633] text-xs" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("reminderSearchPlaceholder") || "Search by customer name or mobile..."}
              className="w-full bg-[#f9f9f9] text-[#1a1c1c] pl-9 pr-4 py-2.5 rounded-2xl text-xs outline-none border border-[#e2e2e2] focus:border-[#fbc02d] focus:ring-2 focus:ring-[#fbc02d] transition-all placeholder-[#4f4633] shadow-inner font-medium"
            />
          </div>

          {/* Quick Filter Pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { label: t("reminderFilterAll")      || "All Reminders", val: "all" },
              { label: t("reminderFilterOverdue")  || "Overdue",       val: "overdue" },
              { label: t("reminderFilterToday")    || "Due Today",     val: "today" },
              { label: t("reminderFilterUpcoming") || "Upcoming",      val: "upcoming" },
            ].map((f) => (
              <button
                key={f.val}
                type="button"
                onClick={() => setFilterStatus(f.val)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  filterStatus === f.val
                    ? "bg-[#fbc02d] text-[#6c5000] border-[#795900] font-bold shadow-sm"
                    : "bg-[#f9f9f9] text-[#4f4633] border-[#e2e2e2] hover:bg-[#e8e8e8]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── REMINDER TILES LIST ── */}
      <main className="max-w-2xl mx-auto px-4 mt-4 space-y-3">
        {filteredReminders.length === 0 ? (
          <div className="bg-white border border-[#e2e2e2] rounded-2xl p-12 text-center text-[#4f4633] text-xs font-semibold">
            {t("reminderNoResults") || "No pending reminders match the filter"}
          </div>
        ) : (
          filteredReminders.map((rem, index) => {
            const dateStatus = getDateStatus(rem.reminderDate);
            return (
              <motion.div
                key={rem._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="bg-white p-4 rounded-2xl border border-[#e2e2e2] flex flex-col gap-3 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
              >
                {/* Visual Accent Glow on the side based on status */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    dateStatus.label === (t("reminderStatusOverdue")  || "Overdue")
                      ? "bg-[#dc2626]"
                      : dateStatus.label === (t("reminderStatusDueToday") || "Due Today")
                      ? "bg-[#d97706]"
                      : "bg-blue-500"
                  }`}
                />

                {/* Header row: Customer & Date status pill */}
                <div className="flex justify-between items-start pl-1">
                  <div className="flex items-center gap-3">
                    {/* Call Button */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); openPhoneDialer(rem.customerMobile || rem.mobileNumber); }}
                      className="w-9 h-9 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0 text-green-600 hover:bg-green-100 transition-colors cursor-pointer"
                      title="Call Customer"
                    >
                      <FaPhoneAlt size={12} />
                    </button>

                    <div>
                      <h3 className="text-[#1a1c1c] text-sm font-bold flex items-center gap-1.5">
                        <FaUser size={9} className="text-[#4f4633]" />
                        {rem.customerName}
                      </h3>
                      <p className="text-[10px] text-[#4f4633] mt-0.5 font-medium">
                        {rem.customerMobile || rem.mobileNumber}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${dateStatus.color} ${dateStatus.bg} ${dateStatus.border}`}
                  >
                    {dateStatus.label}
                  </span>
                </div>

                {/* Middle row: Follow-up Date & Pending Amount */}
                <div className="flex justify-between items-center text-xs pl-1 mt-1 bg-[#f9f9f9] p-3 rounded-xl border border-[#e2e2e2]">
                  <div>
                    <p className="text-[9px] text-[#4f4633] uppercase tracking-widest font-semibold">
                      {t("reminderFollowUp") || "Follow Up Date"}
                    </p>
                    <p className="text-[#1a1c1c] font-bold text-xs mt-0.5 flex items-center gap-1">
                      <FaCalendarAlt size={10} className="text-[#795900]" />
                      {rem.reminderDate
                        ? format(new Date(rem.reminderDate), "dd MMM yyyy")
                        : "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-[#4f4633] uppercase tracking-widest font-semibold">
                      {t("reminderPendingDues") || "Pending Amount"}
                    </p>
                    <p className="text-[#16a34a] text-base font-extrabold tracking-tight mt-0.5 flex items-center gap-1 justify-end">
                      <FaMoneyBillWave size={12} className="text-[#16a34a]" />
                      ₹{rem.pendingAmount?.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex justify-end items-center pl-1 pt-1 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(rem)}
                    className="w-9 h-9 rounded-xl bg-[#f9f9f9] hover:bg-[#e8e8e8] text-[#4f4633] flex items-center justify-center border border-[#e2e2e2] transition-colors cursor-pointer"
                    title={t("reminderEditTitle") || "Edit Reminder"}
                  >
                    <FaEdit size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(rem._id, "DELETE")}
                    className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-[#dc2626] flex items-center justify-center border border-red-200 transition-colors cursor-pointer"
                    title={t("reminderDeleteTitle") || "Delete Reminder"}
                  >
                    <FaTrashAlt size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(rem._id, "COMPLETE")}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#16a34a] hover:bg-green-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <FaCheckCircle size={11} />
                    <span>{t("reminderMarkPaid") || "Mark Paid"}</span>
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </main>

      {/* ── EDIT REMINDER MODAL ── */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-3xl p-6 border border-[#e2e2e2] shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-[#e2e2e2]">
                <h3 className="text-[#1a1c1c] font-bold text-sm flex items-center gap-2">
                  <FaClock className="text-[#795900]" />
                  {t("reminderEditModalTitle") || "Edit Reminder Date"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-[#4f4633] p-1 rounded-full cursor-pointer"
                >
                  <FaTimes size={16} />
                </button>
              </div>

              {selectedReminder && (
                <div className="bg-[#f9f9f9] p-3 rounded-2xl border border-[#e2e2e2] space-y-1">
                  <p className="text-xs font-bold text-[#1a1c1c]">{selectedReminder.customerName}</p>
                  <p className="text-[10px] text-[#4f4633]">{selectedReminder.customerMobile || selectedReminder.mobileNumber}</p>
                  <p className="text-xs font-extrabold text-[#16a34a] pt-1">Due: ₹{selectedReminder.pendingAmount?.toLocaleString()}</p>
                </div>
              )}

              <div>
                <label className="text-[#4f4633] text-xs font-semibold block mb-1.5">
                  {t("reminderNewFollowUpDate") || "New Follow-up Date"}
                </label>
                <input
                  type="date"
                  value={editDate}
                  min={today}
                  onChange={handleEditDateChange}
                  className="w-full bg-[#f9f9f9] text-[#1a1c1c] px-4 py-3 rounded-2xl text-xs font-medium border border-[#e2e2e2] focus:border-[#fbc02d] focus:ring-2 focus:ring-[#fbc02d] outline-none transition-all cursor-pointer shadow-inner"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 bg-[#f9f9f9] border border-[#e2e2e2] text-[#1a1c1c] rounded-2xl text-xs font-bold active:scale-95 transition-all cursor-pointer"
                >
                  {t("reminderCancel") || "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="flex-1 py-3 bg-[#fbc02d] hover:bg-[#f8bd2a] text-[#6c5000] rounded-2xl text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-md shadow-[#fbc02d]/20"
                >
                  {t("reminderSaveDate") || "Save Date"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CONFIRM ACTION DIALOG ── */}
      <ConfirmModal
        isOpen={confirmDialog.open}
        title={
          confirmDialog.action === "COMPLETE"
            ? (t("reminderCompleteTitle") || "Mark as Completed?")
            : (t("reminderDeleteTitle")   || "Delete Reminder?")
        }
        message={
          confirmDialog.action === "COMPLETE"
            ? (t("reminderCompleteConfirmMsg") || "Are you sure you want to mark this reminder as completed?")
            : (t("reminderDeleteConfirmMsg")   || "Are you sure you want to delete this reminder? This action cannot be undone.")
        }
        confirmText={
          confirmDialog.action === "COMPLETE"
            ? (t("reminderMarkPaidBtn") || "Mark Paid")
            : (t("reminderDeleteBtn")   || "Delete")
        }
        cancelText={t("reminderCancelBtn") || "Cancel"}
        confirmColor={confirmDialog.action === "COMPLETE" ? "green" : "red"}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmDialog({ open: false, reminderId: null, action: null })}
      />
    </div>
  );
};

export default PendingPayments;
