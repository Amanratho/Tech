import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetPendingRemindersQuery,
  useUpdateReminderDetailsMutation,
  useDeleteOrCompleteReminderMutation,
} from "../../redux/functional/paymentApiSlice";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { format, isPast, isToday } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
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
  const [editAmount, setEditAmount] = useState(0);

  // Helper: Get status label and color styling for dates
  const getDateStatus = (dateString) => {
    if (!dateString) return { label: "No Date", color: "text-gray-500", bg: "bg-gray-500/10", border: "border-gray-500/20" };
    const date = new Date(dateString);
    if (isToday(date)) {
      return { label: "Due Today", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    }
    if (isPast(date)) {
      return { label: "Overdue", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" };
    }
    return { label: "Upcoming", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" };
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
    setEditAmount(reminder.pendingAmount);
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
      toast.error("Please pick a reminder date");
      return;
    }
    if (editAmount <= 0) {
      toast.error("Amount must be greater than zero");
      return;
    }

    try {
      await updateReminder({
        _id: selectedReminder._id,
        reminderDate: editDate,
        pendingAmount: Number(editAmount),
      }).unwrap();

      toast.success("Reminder details updated successfully!");
      setIsEditModalOpen(false);
      refetch();
    } catch (err) {
      console.error("Error saving edits:", err);
      toast.error(err.data?.message || "Failed to update reminder details");
    }
  };

  // Action: Mark PAID or CANCEL
  const handleAction = async (reminderId, action) => {
    const actionText = action === "PAID" ? "mark as Paid" : "delete reminder";
    const confirmAction = window.confirm(`Are you sure you want to ${actionText}?`);
    if (!confirmAction) return;

    try {
      await performAction({
        _id: reminderId,
        action: action, // 'PAID' or 'DELETE'/'CANCEL'
      }).unwrap();

      toast.success(
        action === "PAID"
          ? "Payment completed successfully!"
          : "Reminder cleared!"
      );
      refetch();
    } catch (err) {
      console.error("Action failed:", err);
      toast.error(err.data?.message || "Action failed");
    }
  };

  if (isLoading) return <div className="p-5 text-white bg-[#121212] min-h-screen">Loading active reminders...</div>;
  if (error) return <div className="p-5 text-red-500 bg-[#121212] min-h-screen">Error loading active reminders</div>;

  return (
    <div className="bg-[#121212] min-h-screen pb-20 relative overflow-hidden">
      {/* 1. APP HEADER */}
      <div className="sticky top-0 mt-16 z-30 bg-[#121212]/95 backdrop-blur-md border-b border-[#2C2C2C] px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full active:bg-[#2C2C2C] text-white"
        >
          <FaChevronLeft />
        </button>
        <div>
          <h1 className="text-white text-lg font-bold tracking-wide">
            {t("pendingReminders") || "Payment Reminders"}
          </h1>
          <p className="text-[10px] text-[var(--primary)] font-medium uppercase tracking-wider">
            {reminders.length} Active Dues
          </p>
        </div>
      </div>

      {/* 2. SEARCH & QUICK FILTER PILLS */}
      <div className="sticky top-[116px] z-20 bg-[#121212]/95 backdrop-blur-md border-b border-[#2C2C2C] pb-3">
        <div className="px-4 mt-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-2.5 text-gray-500 text-xs" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name or mobile..."
              className="w-full bg-[#1E1E1E] text-white pl-9 pr-3 py-2 rounded-full text-xs outline-none border border-[#333] focus:border-[var(--primary)] transition-colors placeholder-gray-600 font-medium"
            />
          </div>
        </div>

        <div className="px-4 mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { label: "All Reminders", val: "all" },
            { label: "Overdue", val: "overdue" },
            { label: "Due Today", val: "today" },
            { label: "Upcoming", val: "upcoming" },
          ].map((f) => (
            <button
              key={f.val}
              onClick={() => setFilterStatus(f.val)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all whitespace-nowrap ${
                filterStatus === f.val
                  ? "bg-[var(--primary)] text-black border-[var(--primary)]"
                  : "bg-transparent text-gray-500 border-[#333]"
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
          <div className="text-center text-gray-600 py-20 text-xs font-semibold">
            No pending reminders match the filter
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
                className="bg-[#1E1E1E] p-4 rounded-xl border border-[#2C2C2C] flex flex-col gap-3 shadow-lg hover:border-[#3c3c3c] transition-all relative overflow-hidden"
              >
                {/* Visual Accent Glow on the side based on status */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    dateStatus.label === "Overdue"
                      ? "bg-red-500"
                      : dateStatus.label === "Due Today"
                      ? "bg-amber-500"
                      : "bg-blue-500"
                  }`}
                />

                {/* Header row: Customer & Date status pill */}
                <div className="flex justify-between items-start pl-1">
                  <div className="flex items-center gap-3">
                    {/* Call Button */}
                    <a
                      href={`tel:${rem.customerMobile || rem.mobileNumber}`}
                      className="w-8 h-8 rounded-full bg-[#1A2E1A] border border-[#2C5E2C] flex items-center justify-center flex-shrink-0 text-green-500 active:bg-green-600 active:text-white transition-colors"
                    >
                      <FaPhoneAlt size={12} />
                    </a>

                    <div>
                      <h3 className="text-white text-sm font-extrabold flex items-center gap-1.5">
                        <FaUser size={9} className="text-gray-500" />
                        {rem.customerName}
                      </h3>
                      <p className="text-[10px] text-gray-500 mt-0.5">
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

                {/* Middle row: Machine ID & Target reminder Date */}
                <div className="flex justify-between items-center text-xs pl-1 mt-1 bg-[#121212]/50 p-2 rounded-lg border border-[#262626]">
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                      Rent Item
                    </p>
                    <p className="text-white font-bold text-[10px] mt-0.5 truncate max-w-[120px]">
                      {rem.rentType} Work
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                      Follow Up
                    </p>
                    <p className="text-gray-300 font-bold text-[10px] mt-0.5 flex items-center gap-1 justify-end">
                      <FaCalendarAlt size={8} className="text-[var(--primary)]" />
                      {rem.reminderDate
                        ? format(new Date(rem.reminderDate), "dd MMM yyyy")
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Amount Row */}
                <div className="flex justify-between items-center pl-1 border-t border-[#2a2a2a] pt-3">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                      Pending Dues
                    </p>
                    <p className="text-red-500 text-base font-extrabold tracking-tight mt-0.5">
                      ₹{rem.pendingAmount.toLocaleString()}
                    </p>
                  </div>

                  {/* Actions Column */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(rem)}
                      className="w-8 h-8 rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300 flex items-center justify-center border border-[#3b3b3b] active:scale-90 transition-transform"
                      title="Edit Reminder"
                    >
                      <FaEdit size={10} />
                    </button>
                    <button
                      onClick={() => handleAction(rem._id, "DELETE")}
                      className="w-8 h-8 rounded-full bg-red-950/40 hover:bg-red-900/60 text-red-400 flex items-center justify-center border border-red-900/30 active:scale-90 transition-transform"
                      title="Delete Reminder"
                    >
                      <FaTrashAlt size={10} />
                    </button>
                    <button
                      onClick={() => handleAction(rem._id, "PAID")}
                      className="px-3 h-8 bg-green-500 text-white rounded-lg text-[10px] font-black flex items-center gap-1 active:scale-95 transition-transform shadow-md shadow-green-500/10"
                    >
                      <FaCheckCircle size={10} /> Complete
                    </button>
                  </div>
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
              className="bg-[#1E1E1E] w-full max-w-sm rounded-2xl p-5 border border-[#333] shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-4 border-b border-[#2d2d2d] pb-2">
                <h3 className="text-white text-sm font-black uppercase tracking-wider">
                  Edit Reminder
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-500 hover:text-white p-1"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                {/* Client Reference */}
                <div className="bg-[#121212] p-3 rounded-xl border border-[#2c2c2c]">
                  <p className="text-gray-500 text-[9px] font-bold uppercase tracking-wider">
                    Customer
                  </p>
                  <p className="text-white text-xs font-bold mt-0.5">
                    {selectedReminder.customerName}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium">
                    {selectedReminder.customerMobile || selectedReminder.mobileNumber}
                  </p>
                </div>

                {/* Edit Pending Amount */}
                <div>
                  <label className="text-gray-400 text-[10px] font-bold mb-1.5 block uppercase tracking-wider">
                    Pending Amount Due
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-red-500 font-bold">₹</span>
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-full bg-[#121212] text-red-400 font-bold border border-[#333] rounded-lg py-2 pl-7 pr-3 focus:border-[var(--primary)] outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Edit Reminder Date */}
                <div>
                  <label className="text-gray-400 text-[10px] font-bold mb-1.5 block uppercase tracking-wider">
                    Reminder Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full bg-[#121212] text-white border border-[#333] rounded-lg py-2 px-3 focus:border-[var(--primary)] outline-none text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 bg-transparent hover:bg-white/5 text-gray-400 rounded-xl font-bold text-xs border border-[#333] active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 py-2.5 bg-[var(--primary)] text-black rounded-xl font-black text-xs active:scale-95 transition-all shadow-md shadow-[var(--primary)]/10"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PendingPayments;
