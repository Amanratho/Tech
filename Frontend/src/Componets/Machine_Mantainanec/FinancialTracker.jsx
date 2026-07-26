import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  useGetMaintenanceByMachineQuery,
  useAddMaintenanceMutation,
  useDeleteMaintenanceMutation,
} from "../../redux/functional/maintenanceApiSlice";
import {
  FaTimes,
  FaPlus,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle,
  FaTrashAlt,
  FaArrowUp,
  FaArrowDown,
  FaChevronDown,
  FaChevronUp,
  FaWallet,
  FaReceipt,
} from "react-icons/fa";

const EXPENSE_CHIPS = ["chipFuel","chipRepair","chipOilLubricant","chipSpareParts","chipTransport","chipLabour","chipInsurance","chipOther"];
const INCOME_CHIPS = ["chipScrapSale","chipRentalBonus","chipOvertime","chipLateFee","chipOther"];

const FinancialTracker = ({ machineId, uid }) => {
  const { t } = useTranslation();
  const { data: mData, isLoading } = useGetMaintenanceByMachineQuery(machineId, { skip: !machineId });
  const [addMaintenance, { isLoading: isAdding }] = useAddMaintenanceMutation();
  const [deleteMaintenance, { isLoading: isDeleting }] = useDeleteMaintenanceMutation();

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [showLedger, setShowLedger] = useState(false);
  const [ledgerFilter, setLedgerFilter] = useState("all");
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });

  const totalIncome = mData?.totalIncome || 0;
  const totalExpense = mData?.totalExpense || 0;
  const entries = mData?.data || [];

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "success" }), 3000);
  };

  const openModal = (type) => {
    setModalType(type);
    setAmount("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) return;
    try {
      await addMaintenance({ type: modalType, amount: Number(amount), description, date, machineId, uid }).unwrap();
      showToast(t("entryAddedSuccess") || "Entry added successfully!");
      setShowModal(false);
    } catch {
      showToast(t("entryAddFailed") || "Failed to add entry.", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMaintenance({ id, machineId }).unwrap();
      showToast(t("entryDeletedSuccess") || "Entry deleted successfully!");
      setDeleteId(null);
    } catch {
      showToast(t("entryDeleteFailed") || "Failed to delete entry.", "error");
    }
  };

  const chips = modalType === "expense" ? EXPENSE_CHIPS : INCOME_CHIPS;
  const filtered = ledgerFilter === "all" ? entries : entries.filter(e => e.type === ledgerFilter);

  return (
    <div className="space-y-4">
      {/* Financial Summary (Maintenance vs Extra Income) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#f9f9f9] p-3 rounded-xl border border-[#e2e2e2] shadow-inner">
          <p className="text-[10px] text-[#4f4633] font-semibold flex items-center gap-1.5 mb-1">
            <FaReceipt className="text-[#dc2626]" /> {t("totalExpenseLabel") || "Maintenance Expense"}
          </p>
          <p className="text-[#dc2626] text-base font-extrabold">₹{totalExpense.toLocaleString()}</p>
        </div>
        <div className="bg-[#f9f9f9] p-3 rounded-xl border border-[#e2e2e2] shadow-inner">
          <p className="text-[10px] text-[#4f4633] font-semibold flex items-center gap-1.5 mb-1">
            <FaWallet className="text-[#16a34a]" /> {t("extraIncomeLabel") || "Extra Income"}
          </p>
          <p className="text-[#16a34a] text-base font-extrabold">₹{totalIncome.toLocaleString()}</p>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => openModal("expense")}
          className="flex-1 py-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 bg-[#fee2e2] text-[#dc2626] border border-[#fecaca] hover:bg-[#fca5a5]/30 active:scale-95 transition-all cursor-pointer shadow-sm"
        >
          <FaPlus size={10} /> {t("addExpenseButton") || "Add Expense"}
        </button>
        <button
          type="button"
          onClick={() => openModal("income")}
          className="flex-1 py-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 bg-[#dcfce7] text-[#16a34a] border border-[#bbf7d0] hover:bg-[#86efac]/30 active:scale-95 transition-all cursor-pointer shadow-sm"
        >
          <FaPlus size={10} /> {t("addIncomeButton") || "Add Income"}
        </button>
      </div>

      {/* Ledger Details Toggle */}
      <button
        type="button"
        onClick={() => setShowLedger(!showLedger)}
        className="w-full py-2.5 rounded-2xl text-xs font-bold tracking-wide flex items-center justify-center gap-2 bg-[#f9f9f9] hover:bg-[#eeeeee] text-[#4f4633] border border-[#e2e2e2] transition-colors cursor-pointer"
      >
        <span>{showLedger ? (t("hideDetailsButton") || "Hide Ledger History") : (t("viewDetailsButton") || "View Ledger History")}</span>
        {showLedger ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
      </button>

      {/* Transaction Ledger */}
      <AnimatePresence>
        {showLedger && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2] p-4 space-y-3">
              <h4 className="text-[#4f4633] text-xs font-bold uppercase tracking-widest">
                {t("transactionLedger") || "Transaction History"}
              </h4>

              {/* Filter Tabs */}
              <div className="flex gap-2">
                {["all", "income", "expense"].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setLedgerFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      ledgerFilter === f
                        ? "bg-[#fbc02d] text-[#6c5000] border-[#795900] font-bold shadow-sm"
                        : "bg-white text-[#4f4633] border-[#e2e2e2]"
                    }`}
                  >
                    {f === "all" ? (t("filterAllLabel") || "All") : f === "income" ? (t("incomeType") || "Income") : (t("expenseType") || "Expense")}
                  </button>
                ))}
              </div>

              {/* Entries List */}
              {filtered.length === 0 ? (
                <p className="text-[#4f4633] text-xs text-center py-6 font-medium">
                  {t("noTransactions") || "No maintenance or income transactions recorded."}
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {filtered.map((entry) => (
                    <div
                      key={entry._id}
                      className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#e2e2e2] shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                            entry.type === "income" ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#fee2e2] text-[#dc2626]"
                          }`}
                        >
                          {entry.type === "income" ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[#1a1c1c] text-xs font-bold truncate">
                            {entry.description || (entry.type === "income" ? (t("incomeType") || "Income") : (t("expenseType") || "Expense"))}
                          </p>
                          <p className="text-[#4f4633] text-[10px]">
                            {new Date(entry.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`text-xs font-extrabold ${entry.type === "income" ? "text-[#16a34a]" : "text-[#dc2626]"}`}>
                          {entry.type === "income" ? "+" : "-"}₹{Number(entry.amount || 0).toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => setDeleteId(entry._id)}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[#4f4633] hover:text-[#dc2626] hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <FaTrashAlt size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ADD ENTRY MODAL ── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-sm rounded-3xl p-6 border border-[#e2e2e2] mb-4 sm:mb-0 max-h-[85vh] overflow-y-auto shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-[#e2e2e2]">
                <h3 className="text-[#1a1c1c] font-bold text-base flex items-center gap-2">
                  {modalType === "expense" ? <FaReceipt className="text-[#dc2626]" /> : <FaWallet className="text-[#16a34a]" />}
                  {t("addEntryTitle") || (modalType === "expense" ? "Add Maintenance Expense" : "Add Extra Income")}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-[#4f4633] hover:text-black p-1 rounded-full cursor-pointer"
                >
                  <FaTimes size={16} />
                </button>
              </div>

              {/* Type Switcher */}
              <div className="flex gap-2">
                {["expense", "income"].map((tp) => (
                  <button
                    key={tp}
                    type="button"
                    onClick={() => setModalType(tp)}
                    className={`flex-1 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                      modalType === tp
                        ? tp === "expense"
                          ? "bg-[#fee2e2] text-[#dc2626] border-[#fecaca] shadow-sm"
                          : "bg-[#dcfce7] text-[#16a34a] border-[#bbf7d0] shadow-sm"
                        : "bg-[#f9f9f9] text-[#4f4633] border-[#e2e2e2]"
                    }`}
                  >
                    {tp === "expense" ? (t("expenseType") || "Expense") : (t("incomeType") || "Income")}
                  </button>
                ))}
              </div>

              {/* Curved Amount Input */}
              <div>
                <label className="text-[#4f4633] text-xs font-semibold block mb-1">
                  {t("amountLabel") || "Amount"} (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={t("enterAmount") || "Enter amount in ₹..."}
                  className="w-full bg-[#f9f9f9] text-[#1a1c1c] px-4 py-3 rounded-2xl text-sm font-bold border border-[#e2e2e2] focus:border-[#fbc02d] focus:ring-2 focus:ring-[#fbc02d] outline-none transition-all shadow-inner"
                />
              </div>

              {/* Curved Description Input */}
              <div>
                <label className="text-[#4f4633] text-xs font-semibold block mb-1">
                  {t("descriptionLabel") || "Description / Category"}
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("enterDescription") || "e.g. Engine Oil, Fuel, Overtime..."}
                  className="w-full bg-[#f9f9f9] text-[#1a1c1c] px-4 py-3 rounded-2xl text-xs font-medium border border-[#e2e2e2] focus:border-[#fbc02d] focus:ring-2 focus:ring-[#fbc02d] outline-none transition-all shadow-inner"
                />
              </div>

              {/* Quick Chips */}
              <div>
                <p className="text-[10px] text-[#4f4633] font-bold uppercase tracking-wider mb-2">
                  Quick Select Categories
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {chips.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setDescription(t(c) || c)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        description === (t(c) || c)
                          ? "bg-[#fbc02d] text-[#6c5000] border-[#795900] font-bold shadow-sm"
                          : "bg-[#f9f9f9] text-[#4f4633] border-[#e2e2e2] hover:bg-[#e8e8e8]"
                      }`}
                    >
                      {t(c) || c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Curved Date Input */}
              <div>
                <label className="text-[#4f4633] text-xs font-semibold block mb-1">
                  {t("dateLabel") || "Date"}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#f9f9f9] text-[#1a1c1c] px-4 py-3 rounded-2xl text-xs font-medium border border-[#e2e2e2] focus:border-[#fbc02d] focus:ring-2 focus:ring-[#fbc02d] outline-none transition-all cursor-pointer shadow-inner"
                />
              </div>

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSave}
                disabled={isAdding || !amount}
                className={`w-full py-4 rounded-2xl font-bold text-sm shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ${
                  modalType === "expense"
                    ? "bg-[#dc2626] text-white hover:bg-red-700 shadow-red-500/20"
                    : "bg-[#16a34a] text-white hover:bg-green-700 shadow-green-500/20"
                }`}
              >
                {isAdding ? (
                  <>
                    <FaSpinner className="animate-spin" size={14} /> {t("savingButton") || "Saving..."}
                  </>
                ) : (
                  <>
                    <FaCheck size={14} /> {t("saveButton") || "Save Transaction"}
                  </>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-xs rounded-3xl p-6 border border-[#e2e2e2] text-center shadow-2xl space-y-3"
            >
              <FaExclamationTriangle size={28} className="text-[#dc2626] mx-auto" />
              <p className="text-[#1a1c1c] text-sm font-bold">
                {t("deleteEntryConfirm") || "Are you sure you want to delete this transaction?"}
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-3 bg-[#f9f9f9] border border-[#e2e2e2] text-[#1a1c1c] rounded-2xl text-xs font-bold active:scale-95 transition-all cursor-pointer"
                >
                  {t("cancelButton") || "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteId)}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-[#dc2626] text-white rounded-2xl text-xs font-bold active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-red-500/20"
                >
                  {isDeleting ? <FaSpinner className="animate-spin" size={12} /> : <FaTrashAlt size={12} />}
                  {t("deleteButton") || "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            className={`fixed bottom-20 left-4 right-4 z-[60] flex items-center gap-2 px-4 py-3.5 rounded-2xl text-xs font-bold shadow-2xl border ${
              toast.type === "success"
                ? "bg-[#16a34a] text-white border-green-600"
                : "bg-[#dc2626] text-white border-red-600"
            }`}
          >
            {toast.type === "success" ? <FaCheck size={14} /> : <FaExclamationTriangle size={14} />}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FinancialTracker;
