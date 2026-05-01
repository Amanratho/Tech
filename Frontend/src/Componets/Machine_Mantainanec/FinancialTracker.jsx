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
      showToast(t("entryAddedSuccess"));
      setShowModal(false);
    } catch { showToast(t("entryAddFailed"), "error"); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMaintenance(id).unwrap();
      showToast(t("entryDeletedSuccess"));
      setDeleteId(null);
    } catch { showToast(t("entryDeleteFailed"), "error"); }
  };

  const chips = modalType === "expense" ? EXPENSE_CHIPS : INCOME_CHIPS;
  const filtered = ledgerFilter === "all" ? entries : entries.filter(e => e.type === ledgerFilter);

  return (
    <div className="space-y-3">
      {/* Financial Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#121212] p-3 rounded-lg border border-[#333]">
          <p className="text-[10px] text-gray-500 flex items-center gap-1 mb-1">
            <FaReceipt className="text-red-500" /> {t("totalExpenseLabel")}
          </p>
          <p className="text-red-500 text-sm font-bold">₹{totalExpense.toLocaleString()}</p>
        </div>
        <div className="bg-[#121212] p-3 rounded-lg border border-[#333]">
          <p className="text-[10px] text-gray-500 flex items-center gap-1 mb-1">
            <FaWallet className="text-emerald-500" /> {t("extraIncomeLabel")}
          </p>
          <p className="text-emerald-500 text-sm font-bold">₹{totalIncome.toLocaleString()}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button onClick={() => openModal("expense")}
          className="flex-1 py-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/20 active:bg-red-500 active:text-white transition-colors">
          <FaPlus size={9}/> {t("addExpenseButton")}
        </button>
        <button onClick={() => openModal("income")}
          className="flex-1 py-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 active:bg-emerald-500 active:text-white transition-colors">
          <FaPlus size={9}/> {t("addIncomeButton")}
        </button>
      </div>

      {/* View Details Toggle */}
      <button onClick={() => setShowLedger(!showLedger)}
        className="w-full py-2 rounded-xl text-[10px] font-bold tracking-wide flex items-center justify-center gap-1.5 bg-[#121212] text-gray-400 border border-[#333] active:text-[var(--primary)] transition-colors">
        {showLedger ? t("hideDetailsButton") : t("viewDetailsButton")}
        {showLedger ? <FaChevronUp size={9}/> : <FaChevronDown size={9}/>}
      </button>

      {/* Transaction Ledger */}
      <AnimatePresence>
        {showLedger && (
          <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden">
            <div className="bg-[#121212] rounded-xl border border-[#333] p-3">
              <h4 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">{t("transactionLedger")}</h4>
              
              {/* Filter Tabs */}
              <div className="flex gap-1.5 mb-3">
                {["all","income","expense"].map(f => (
                  <button key={f} onClick={() => setLedgerFilter(f)}
                    className={`px-3 py-1 rounded-full text-[9px] font-bold border transition-all ${
                      ledgerFilter === f ? "bg-[var(--primary)] text-black border-[var(--primary)]" : "bg-transparent text-gray-500 border-[#333]"
                    }`}>
                    {f === "all" ? t("filterAllLabel") : f === "income" ? t("incomeType") : t("expenseType")}
                  </button>
                ))}
              </div>

              {/* Entries List */}
              {filtered.length === 0 ? (
                <p className="text-gray-600 text-[10px] text-center py-4">{t("noTransactions")}</p>
              ) : (
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {filtered.map(entry => (
                    <div key={entry._id} className="flex items-center justify-between bg-[#1E1E1E] p-2.5 rounded-lg border border-[#2C2C2C]">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          entry.type === "income" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                        }`}>
                          {entry.type === "income" ? <FaArrowUp size={9}/> : <FaArrowDown size={9}/>}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-[11px] font-medium truncate">{entry.description || (entry.type === "income" ? t("incomeType") : t("expenseType"))}</p>
                          <p className="text-gray-600 text-[9px]">{new Date(entry.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-bold ${entry.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                          {entry.type === "income" ? "+" : "-"}₹{entry.amount.toLocaleString()}
                        </span>
                        <button onClick={() => setDeleteId(entry._id)}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-gray-600 active:text-red-400">
                          <FaTrashAlt size={8}/>
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

      {/* Add Entry Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{y:"100%",opacity:0}} animate={{y:0,opacity:1}} exit={{y:"100%",opacity:0}}
              transition={{type:"spring",damping:25,stiffness:200}}
              className="bg-[#1E1E1E] w-full max-w-sm rounded-3xl p-5 border border-[#333] mb-4 sm:mb-0 max-h-[85vh] overflow-y-auto">
              
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  {modalType === "expense" ? <FaReceipt className="text-red-400"/> : <FaWallet className="text-emerald-400"/>}
                  {t("addEntryTitle")}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-500 p-1"><FaTimes/></button>
              </div>

              {/* Type Selector */}
              <div className="flex gap-2 mb-4">
                {["expense","income"].map(tp => (
                  <button key={tp} onClick={() => setModalType(tp)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      modalType === tp
                        ? tp === "expense" ? "bg-red-500 text-white border-red-500" : "bg-emerald-500 text-white border-emerald-500"
                        : "bg-transparent text-gray-500 border-[#333]"
                    }`}>
                    {tp === "expense" ? t("expenseType") : t("incomeType")}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <div className="mb-3">
                <label className="text-gray-400 text-[10px] block mb-1">{t("amountLabel")} (₹)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={t("enterAmount")}
                  className="w-full bg-[#121212] text-white px-3 py-2.5 rounded-xl text-sm border border-[#333] focus:border-[var(--primary)] outline-none transition-colors"/>
              </div>

              {/* Description */}
              <div className="mb-2">
                <label className="text-gray-400 text-[10px] block mb-1">{t("descriptionLabel")}</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder={t("enterDescription")}
                  className="w-full bg-[#121212] text-white px-3 py-2.5 rounded-xl text-xs border border-[#333] focus:border-[var(--primary)] outline-none transition-colors"/>
              </div>

              {/* Quick Chips */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {chips.map(c => (
                  <button key={c} onClick={() => setDescription(t(c))}
                    className={`px-2.5 py-1 rounded-full text-[9px] font-bold border transition-all ${
                      description === t(c)
                        ? "bg-[var(--primary)] text-black border-[var(--primary)]"
                        : "bg-[#121212] text-gray-400 border-[#333]"
                    }`}>
                    {t(c)}
                  </button>
                ))}
              </div>

              {/* Date */}
              <div className="mb-5">
                <label className="text-gray-400 text-[10px] block mb-1">{t("dateLabel")}</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full bg-[#121212] text-white px-3 py-2.5 rounded-xl text-xs border border-[#333] focus:border-[var(--primary)] outline-none transition-colors"/>
              </div>

              {/* Save */}
              <button onClick={handleSave} disabled={isAdding || !amount}
                className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                  modalType === "expense" ? "bg-red-500 text-white shadow-red-500/20" : "bg-emerald-500 text-white shadow-emerald-500/20"
                }`}>
                {isAdding ? <><FaSpinner className="animate-spin" size={14}/> {t("savingButton")}</> : <><FaCheck size={12}/> {t("saveButton")}</>}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.9,opacity:0}}
              className="bg-[#1E1E1E] w-full max-w-xs rounded-2xl p-5 border border-[#333] text-center">
              <FaExclamationTriangle size={24} className="text-red-500 mx-auto mb-3"/>
              <p className="text-white text-sm font-bold mb-1">{t("deleteEntryConfirm")}</p>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 bg-[#121212] border border-[#333] text-white rounded-xl text-xs font-bold active:scale-95 transition-all">
                  {t("cancelButton")}
                </button>
                <button onClick={() => handleDelete(deleteId)} disabled={isDeleting}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-xs font-bold active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1">
                  {isDeleting ? <FaSpinner className="animate-spin" size={12}/> : <FaTrashAlt size={10}/>}
                  {t("deleteButton")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{y:80,opacity:0}} animate={{y:0,opacity:1}} exit={{y:80,opacity:0}}
            className={`fixed bottom-20 left-4 right-4 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold shadow-xl border ${
              toast.type === "success" ? "bg-green-900/90 text-green-300 border-green-700" : "bg-red-900/90 text-red-300 border-red-700"
            }`}>
            {toast.type === "success" ? <FaCheck size={14}/> : <FaExclamationTriangle size={14}/>}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FinancialTracker;
