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
    if (!dateString) return { label: t("reminderStatusNoDate") || "No Date",  color: "text-[var(--text-muted)]",  bg: "bg-gray-500/10",  border: "border-gray-500/20" };
    const date = new Date(dateString);
    if (isToday(date)) {
      return { label: t("reminderStatusDueToday") || "Due Today", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    }
    if (isPast(date)) {
      return { label: t("reminderStatusOverdue")  || "Overdue",   color: "text-red-400",   bg: "bg-red-500/10",   border: "border-red-500/20" };
    }
    return { label: t("reminderStatusUpcoming") || "Upcoming", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" };
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

  // Open Edit Modal
  const handleOpenEdit = (reminder) => {
    setSelectedReminder(reminder);
    // Format date to YYYY-MM-DD for the HTML5 input
    const dateFormatted = reminder.reminderDate
      ? new Date(reminder.reminderDate).toISOString().split("T")[0]
      : "";
    setEditDate(dateFormatted);
    setIsEditModalOpen(true);
  };

  // Submit edits
  const handleSaveEdit = async () => {
    if (!editDate) {
      toast.error(t("reminderPickDateError") || "Please pick a reminder date");
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

  // Called when user confirms inside the modal
  const handleConfirmedAction = async () => {
    const { reminderId, action } = confirmDialog;
    setConfirmDialog({ open: false, reminderId: null, action: null });
    try {
      await performAction({ _id: reminderId, action }).unwrap();
      toast.success(
        action === "PAID"
          ? (t("reminderMarkedPaidSuccess")    || "Payment completed successfully!")
          : (t("reminderClearedSuccess")       || "Reminder cleared!")
      );
      refetch();
    } catch (err) {
      console.error("Action failed:", err);
      toast.error(err.data?.message || (t("reminderActionFailed") || "Action failed"));
    }
  };

  if (isLoading) return <div className="p-5 text-[var(--text-main)] bg-[var(--bg-main)] min-h-screen">{t("reminderLoading") || "Loading active reminders..."}</div>;
  if (error)     return <div className="p-5 text-red-500 bg-[var(--bg-main)] min-h-screen">{t("reminderLoadError") || "Error loading active reminders"}</div>;

  return (
    <div className="bg-[var(--bg-main)] min-h-screen pb-20 relative overflow-hidden">
      {/* 1. APP HEADER */}
      <div className="sticky top-0 mt-16 z-30 bg-white/95 backdrop-blur-md border-b border-[var(--border-color)] px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full active:bg-[var(--bg-input)] text-[var(--text-main)]"
        >
          <FaChevronLeft />
        </button>
        <div>
          <h1 className="text-[var(--text-main)] text-lg font-bold tracking-wide">
            {t("pendingReminders") || "Payment Reminders"}
          </h1>
          <p className="text-[10px] text-[var(--primary)] font-medium uppercase tracking-wider">
            {reminders.length} {t("reminderActiveDues") || "Active Dues"}
          </p>
        </div>
      </div>

      {/* 2. SEARCH & QUICK FILTER PILLS */}
      <div className="sticky top-[116px] z-20 bg-white/95 backdrop-blur-md border-b border-[var(--border-color)] pb-3">
        <div className="px-4 mt-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-2.5 text-[var(--text-muted)] text-xs" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("reminderSearchPlaceholder") || "Search by customer name or mobile..."}
              className="w-full bg-white text-[var(--text-main)] pl-9 pr-3 py-2 rounded-full text-xs outline-none border border-[var(--border-color)] focus:border-[var(--primary)] transition-colors placeholder-[var(--text-muted)] font-medium"
            />
          </div>
        </div>

        <div className="px-4 mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { label: t("reminderFilterAll")      || "All Reminders", val: "all" },
            { label: t("reminderFilterOverdue")  || "Overdue",       val: "overdue" },
            { label: t("reminderFilterToday")    || "Due Today",     val: "today" },
            { label: t("reminderFilterUpcoming") || "Upcoming",      val: "upcoming" },
          ].map((f) => (
            <button
              key={f.val}
              onClick={() => setFilterStatus(f.val)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all whitespace-nowrap ${
                filterStatus === f.val
                  ? "bg-[var(--primary)] text-black border-[var(--primary)]"
                  : "bg-transparent text-[var(--text-muted)] border-[var(--border-color)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. REMINDER TILES LIST */}
      <div className="px-4 mt-4 space-y-3">
        {filteredReminders.length === 0 ? (
          <div className="text-center text-[var(--text-muted)] py-20 text-xs font-semibold">
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
                className="bg-white p-4 rounded-xl border border-[var(--border-color)] flex flex-col gap-3 shadow-lg hover:border-[var(--border-color)] transition-all relative overflow-hidden"
              >
                {/* Visual Accent Glow on the side based on status */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    dateStatus.label === (t("reminderStatusOverdue")  || "Overdue")
                      ? "bg-red-500"
                      : dateStatus.label === (t("reminderStatusDueToday") || "Due Today")
                      ? "bg-amber-500"
                      : "bg-blue-500"
                  }`}
                />

                {/* Header row: Customer & Date status pill */}
                <div className="flex justify-between items-start pl-1">
                  <div className="flex items-center gap-3">
                    {/* Call Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); openPhoneDialer(rem.customerMobile || rem.mobileNumber); }}
                      className="w-8 h-8 rounded-full bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0 text-green-500 active:bg-green-600 active:text-[var(--text-main)] transition-colors"
                    >
                      <FaPhoneAlt size={12} />
                    </button>

                    <div>
                      <h3 className="text-[var(--text-main)] text-sm font-extrabold flex items-center gap-1.5">
                        <FaUser size={9} className="text-[var(--text-muted)]" />
                        {rem.customerName}
                      </h3>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                        {rem.customerMobile || rem.mobileNumber}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${dateStatus.color} ${dateStatus.bg} ${dateStatus.border}`}
                  >
                    {dateStatus.label}
                  </span>
                </div>

                {/* Middle row: Follow-up Date & Pending Amount */}
                <div className="flex justify-between items-center text-xs pl-1 mt-1 bg-[var(--bg-main)]/50 p-2.5 rounded-lg border border-[var(--border-color)]">
                  <div>
                    <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-bold">
                      {t("reminderFollowUp") || "Follow Up"}
                    </p>
                    <p className="text-[var(--text-muted)] font-bold text-[11px] mt-0.5 flex items-center gap-1">
                      <FaCalendarAlt size={9} className="text-[var(--primary)]" />
                      {rem.reminderDate
                        ? format(new Date(rem.reminderDate), "dd MMM yyyy")
                        : "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-bold">
                      {t("reminderPendingDues") || "Pending Dues"}
                    </p>
                    <p className="text-emerald-400 text-base font-extrabold tracking-tight mt-0.5 flex items-center gap-1 justify-end">
                      <FaMoneyBillWave size={11} className="text-emerald-500/60" />
                      ₹{rem.pendingAmount?.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex justify-end items-center pl-1 pt-2 gap-2">
                  <button
                    onClick={() => handleOpenEdit(rem)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-[var(--text-muted)] flex items-center justify-center border border-[var(--border-color)] active:scale-90 transition-transform"
                    title={t("reminderEditTitle") || "Edit Reminder"}
                  >
                    <FaEdit size={10} />
                  </button>
                  <button
                    onClick={() => handleAction(rem._id, "DELETE")}
                    className="w-8 h-8 rounded-full bg-red-950/40 hover:bg-red-900/60 text-red-400 flex items-center justify-center border border-red-900/30 active:scale-90 transition-transform"
                    title={t("reminderDeleteTitle") || "Delete Reminder"}
                  >
                    <FaTrashAlt size={10} />
                  </button>
                  <button
                    onClick={() => {
                      navigate("/payment-tracking", {
                        state: {
                          fromReminder: true,
                          customerName: rem.customerName,
                          mobileNumber: rem.customerMobile || rem.mobileNumber,
                          pendingAmount: rem.pendingAmount,
                          machineId: rem.machineId || rem.rentType,
                          reminderId: rem._id,
                          paidAmount: rem.paidAmount || 0
                        }
                      });
                    }}
                    className="px-3 h-8 bg-green-500 text-[var(--text-main)] rounded-lg text-[10px] font-black flex items-center gap-1 active:scale-95 transition-transform shadow-md shadow-green-500/10"
                  >
                    <FaCheckCircle size={10} /> {t("reminderCompleteBtn") || "Complete"}
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* 4. EDIT REMINDER DETAILS MODAL */}
      <AnimatePresence>
        {isEditModalOpen && selectedReminder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-2xl p-5 border border-[var(--border-color)] shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-4 border-b border-[var(--border-color)] pb-2">
                <h3 className="text-[var(--text-main)] text-sm font-black uppercase tracking-wider">
                  {t("reminderEditModalTitle") || "Edit Reminder"}
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                {/* Client Reference */}
                <div className="bg-[var(--bg-main)] p-3 rounded-xl border border-[var(--border-color)]">
                  <p className="text-[var(--text-muted)] text-[9px] font-bold uppercase tracking-wider">
                    {t("reminderModalCustomer") || "Customer"}
                  </p>
                  <p className="text-[var(--text-main)] text-xs font-bold mt-0.5">
                    {selectedReminder.customerName}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] font-medium">
                    {selectedReminder.customerMobile || selectedReminder.mobileNumber}
                  </p>
                </div>

                {/* Removed Edit Pending Amount block */}

                {/* Edit Reminder Date */}
                <div>
                  <label className="text-[var(--text-muted)] text-[10px] font-bold mb-1.5 block uppercase tracking-wider">
                    {t("reminderModalDateLabel") || "Reminder Date"}
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={editDate}
                      min={today}
                      onChange={handleEditDateChange}
                      className="w-full bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-color)] rounded-lg py-2 px-3 focus:border-[var(--primary)] outline-none text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 bg-transparent hover:bg-gray-50 text-[var(--text-muted)] rounded-xl font-bold text-xs border border-[var(--border-color)] active:scale-95 transition-all"
                >
                  {t("cancelButton") || "Cancel"}
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 py-2.5 bg-[var(--primary)] text-black rounded-xl font-black text-xs active:scale-95 transition-all shadow-md shadow-[var(--primary)]/10"
                >
                  {t("reminderSaveChanges") || "Save Changes"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── GLOBAL CONFIRM MODAL ─────────────────────────────────── */}
      <ConfirmModal
        isOpen={confirmDialog.open}
        onCancel={() => setConfirmDialog({ open: false, reminderId: null, action: null })}
        onConfirm={handleConfirmedAction}
        variant={confirmDialog.action === "PAID" ? "success" : "danger"}
        title={
          confirmDialog.action === "PAID"
            ? (t("confirmPaidTitle")   || "Mark as Paid?")
            : (t("confirmDeleteTitle") || "Delete Reminder?")
        }
        message={
          confirmDialog.action === "PAID"
            ? (t("confirmPaidMessage")   || "This will mark the payment as completed and remove it from your pending list.")
            : (t("confirmDeleteMessage") || "This reminder will be permanently deleted. This action cannot be undone.")
        }
        confirmText={
          confirmDialog.action === "PAID"
            ? (t("reminderCompleteBtn") || "Mark Paid")
            : (t("deleteButton")        || "Delete")
        }
        cancelText={t("cancelButton") || "Cancel"}
      />
    </div>
  );
};

export default PendingPayments;
