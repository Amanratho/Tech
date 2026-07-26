import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGetPaymentsQuery, useUpdatePaymentMutation } from "../../redux/functional/paymentApiSlice";
import { openPhoneDialer } from "../../utils/capacitorLinks";
import { toast } from "../../utils/toastService";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaSearch,
    FaUser,
    FaPhoneAlt,
    FaChevronRight,
    FaArrowLeft,
    FaMoneyBillWave,
    FaTimes,
    FaCheckCircle,
    FaExclamationCircle
} from "react-icons/fa";

const PaymentTracking = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const uid = localStorage.getItem("uid");

    const { data: paymentData = [], error, isLoading, refetch } = useGetPaymentsQuery(uid, { skip: !uid });
    const [updatePayment] = useUpdatePaymentMutation();

    const [uniqueUsers, setUniqueUsers] = useState([]);
    const [selectedUserEntries, setSelectedUserEntries] = useState([]);

    const [isSummaryVisible, setIsSummaryVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState(0);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all");

    // Form states for pre-filling and editing
    const [editCustomerName, setEditCustomerName] = useState("");
    const [editMobileNumber, setEditMobileNumber] = useState("");
    const [editMachineId, setEditMachineId] = useState("");
    const [activeReminderId, setActiveReminderId] = useState(null);

    const location = useLocation();

    // Auto-open and pre-fill modal if redirected from Reminder module
    React.useEffect(() => {
        if (location.state && location.state.fromReminder) {
            const { customerName, mobileNumber, pendingAmount, machineId, reminderId, paidAmount } = location.state;

            setEditCustomerName(customerName || "");
            setEditMobileNumber(mobileNumber || "");
            setEditMachineId(machineId || "");
            setPaymentAmount(pendingAmount || 0);
            setActiveReminderId(reminderId);

            setSelectedEntry({
                _id: reminderId,
                pendingAmount: pendingAmount || 0,
                paidAmount: paidAmount || 0
            });

            setIsModalOpen(true);

            // Clear router state to prevent re-triggering on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // --- LOGIC: AGGREGATE DATA ---
    React.useEffect(() => {
        if (paymentData.length > 0) {
            const users = paymentData.reduce((acc, data) => {
                const existingUser = acc.find(user => user.mobileNumber === data.mobileNumber);
                if (existingUser) {
                    existingUser.paidAmount += Number(data.paidAmount);
                    existingUser.pendingAmount += Number(data.pendingAmount);
                    existingUser.totalAmount += Number(data.totalAmount);
                } else {
                    acc.push({
                        ...data,
                        paidAmount: Number(data.paidAmount),
                        pendingAmount: Number(data.pendingAmount),
                        totalAmount: Number(data.totalAmount)
                    });
                }
                return acc;
            }, []);
            setUniqueUsers(users);
        }
    }, [paymentData]);

    // --- HANDLERS ---
    const handleViewSummary = (mobileNumber) => {
        const userEntries = paymentData.filter(data => String(data.mobileNumber) === String(mobileNumber));
        userEntries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setSelectedUserEntries(userEntries);
        setIsSummaryVisible(true);
    };

    const handleHideSummary = () => {
        setIsSummaryVisible(false);
        setSelectedUserEntries([]);
    };

    const handleMarkPaid = (entry) => {
        setSelectedEntry(entry);
        setPaymentAmount(entry.pendingAmount);
        setEditCustomerName(entry.customerName || "");
        setEditMobileNumber(entry.mobileNumber || "");
        setEditMachineId(entry.machineId || "");
        setActiveReminderId(entry._id);
        setIsModalOpen(true);
    };

    const handlePaymentSubmit = async () => {
        const numericPaymentAmount = Number(paymentAmount);

        if (numericPaymentAmount > 0) {
            if (numericPaymentAmount > selectedEntry.pendingAmount) {
                toast.warn("Payment amount cannot exceed the pending amount.");
                return;
            }

            const newPendingAmount = Math.max(selectedEntry.pendingAmount - numericPaymentAmount, 0);
            const newPaidAmount = selectedEntry.paidAmount + numericPaymentAmount;

            try {
                await updatePayment({
                    _id: selectedEntry._id,
                    pendingAmount: newPendingAmount,
                    paidAmount: newPaidAmount,
                    // Send editable fields back if they were changed
                    customerName: editCustomerName,
                    mobileNumber: editMobileNumber,
                    machineId: editMachineId,
                    reminderId: activeReminderId // Can be used by backend to trigger reminder status change
                }).unwrap();

                toast.success("Payment updated successfully!");
                setIsModalOpen(false);
                refetch();

                const updatedEntries = selectedUserEntries.map(entry =>
                    entry._id === selectedEntry._id
                        ? { ...entry, pendingAmount: newPendingAmount, paidAmount: newPaidAmount }
                        : entry
                );
                setSelectedUserEntries(updatedEntries);

            } catch (error) {
                console.error("Error updating payment:", error);
                toast.error("Error updating payment.");
            }
        } else {
            toast.error("Please enter a valid amount.");
        }
    };

    // --- FILTER LOGIC ---
    const filteredUsers = uniqueUsers.filter(
        (user) =>
            (user.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.mobileNumber.toString().includes(searchQuery)) &&
            (filterType === "all" ||
                (filterType === "pending" && user.pendingAmount > 0) ||
                (filterType === "paid" && user.pendingAmount <= 0))
    );

    const slideUp = {
        hidden: { y: "100%" },
        visible: { y: 0, transition: { type: "spring", damping: 25, stiffness: 200 } },
        exit: { y: "100%" }
    };

    if (isLoading) return <div className="p-5 text-[var(--text-main)]">Loading Khata...</div>;
    if (error) return <div className="p-5 text-red-500">Error loading data</div>;

    return (
        <div className="bg-[var(--bg-main)] min-h-screen pb-28 relative overflow-hidden">

            {/* 1. MAIN SCREEN */}
            <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md border-b border-[var(--border-color)] pb-2">
                <div className="px-4 py-3 flex justify-between items-center">
                    <h2 className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest">
                        {t('paymentTrackingTitle') || "PAYMENT TRACKING"}
                    </h2>
                    <span className="text-[9px] bg-white text-[var(--primary)] px-2 py-0.5 rounded border border-[var(--border-color)]">
                        {filteredUsers.length} Clients
                    </span>
                </div>

                <div className="px-4 mb-3">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-2.5 text-[var(--text-muted)] text-xs" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('searchPlaceholder') || "Search client..."}
                            className="w-full bg-white text-[var(--text-main)] pl-9 pr-3 py-2 rounded-full text-xs outline-none border border-[var(--border-color)] focus:border-[var(--primary)] transition-colors placeholder-[var(--text-muted)]"
                        />
                    </div>
                </div>

                <div className="px-4 flex gap-2">
                    {[
                        { label: t("filterAll") || "All Clients", val: "all" },
                        { label: t("filterPending") || "Pending Due", val: "pending" },
                        { label: t("filterPaid") || "Fully Paid", val: "paid" },
                    ].map((f) => (
                        <button
                            key={f.val}
                            onClick={() => setFilterType(f.val)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${filterType === f.val
                                ? "bg-[var(--primary)] text-black border-[var(--primary)]"
                                : "bg-transparent text-[var(--text-muted)] border-[var(--border-color)]"
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-3 mt-3 space-y-2">
                {filteredUsers.length === 0 ? (
                    <div className="text-center text-[var(--text-muted)] mt-10 text-xs">No clients found</div>
                ) : (
                    filteredUsers.map((user, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleViewSummary(user.mobileNumber)}
                            className="bg-white p-3 rounded-xl border border-[var(--border-color)] active:bg-gray-100 flex justify-between items-center group cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)]">
                                    <FaUser />
                                </div>
                                <div>
                                    <h3 className="text-[var(--text-main)] text-sm font-bold">{user.customerName}</h3>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); openPhoneDialer(user.mobileNumber); }}
                                        className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5"
                                    >
                                        <FaPhoneAlt size={8} /> {user.mobileNumber}
                                    </button>
                                </div>
                            </div>

                            {/* STATUS SECTION (Cleaned Up) */}
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    {user.pendingAmount > 0 ? (
                                        <>
                                            <span className="block text-[9px] text-red-400 uppercase font-bold tracking-wider">Pending</span>
                                            <span className="block text-sm font-bold text-red-500">
                                                ₹{user.pendingAmount.toLocaleString()}
                                            </span>
                                        </>
                                    ) : (
                                        // No "Status" label here, just the badge
                                        <span className="block text-xs font-bold text-green-500  px-3 py-1">
                                            Paid
                                        </span>
                                    )}
                                </div>
                                <FaChevronRight className="text-[var(--text-muted)] text-xs" />
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* 2. SUMMARY VIEW */}
            <AnimatePresence>
                {isSummaryVisible && (
                    <motion.div
                        variants={slideUp}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed inset-0 z-40 bg-[var(--bg-main)] flex flex-col"
                    >
                        <div className="px-4 mt-16 py-3 border-b border-[var(--border-color)] flex items-center gap-3 bg-[var(--bg-main)]">
                            <button onClick={handleHideSummary} className="p-2 -ml-2 text-[var(--text-main)]">
                                <FaArrowLeft />
                            </button>
                            <div>
                                <h2 className="text-[var(--text-main)] text-sm font-bold">
                                    {selectedUserEntries[0]?.customerName || "Client"}
                                </h2>
                                <p className="text-[10px] text-[var(--text-muted)]">{t('transactionHistory')}</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-3">
                            {selectedUserEntries.map((entry) => (
                                <div key={entry._id} className="bg-white p-3 rounded-xl border border-[var(--border-color)]">

                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[var(--text-muted)] text-[10px]">
                                            {format(new Date(entry.createdAt), "dd MMM yyyy")}
                                        </span>

                                        {entry.pendingAmount <= 0 ? (
                                            <span className="flex items-center gap-1 text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                                                <FaCheckCircle size={10} /> {t('statusPaid')}
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                                                <FaExclamationCircle size={10} /> {t('statusDue')}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-end mb-3">
                                        <div>
                                            <p className="text-[10px] text-[var(--text-muted)]">{t('totalBillAmount') || "Total Bill"}</p>
                                            <p className="text-[var(--text-main)] text-sm font-bold">₹{entry.totalAmount}</p>
                                        </div>
                                        <div className="text-right">
                                            {entry.pendingAmount > 0 ? (
                                                <>
                                                    <p className="text-[10px] text-[var(--text-muted)]">{t('pendingDue')}</p>
                                                    <p className="text-red-500 text-base font-bold">₹{entry.pendingAmount}</p>
                                                </>
                                            ) : (
                                                // Changed: No "Amount Paid" text needed if fully paid, simplifies view
                                                <span className="text-green-500 text-sm font-bold">{t('statusPaid')}</span>
                                            )}
                                        </div>
                                    </div>

                                    {entry.pendingAmount > 0 && (
                                        <button
                                            onClick={() => handleMarkPaid(entry)}
                                            className="w-full py-2 bg-[var(--primary)] text-black rounded-lg text-xs font-bold flex items-center justify-center gap-2 active:bg-yellow-600"
                                        >
                                            <FaMoneyBillWave /> {t('dueButton') || "Collect Payment"}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 3. PAYMENT MODAL */}
            <AnimatePresence>
                {isModalOpen && selectedEntry && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-xs rounded-2xl p-5 border border-[var(--border-color)]"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-[var(--text-main)] text-sm font-bold">{t('collectPaymentTitle')}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)]"><FaTimes /></button>
                            </div>

                            <label className="text-[var(--text-muted)] text-[10px] block mb-1">{t('customerNameLabel')}</label>
                            <input
                                type="text"
                                value={editCustomerName}
                                onChange={(e) => setEditCustomerName(e.target.value)}
                                className="w-full bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-color)] rounded-lg py-2 px-3 mb-3 focus:border-[var(--primary)] outline-none text-xs"
                            />

                            <label className="text-[var(--text-muted)] text-[10px] block mb-1">{t('mobileNumberLabel')}</label>
                            <input
                                type="text"
                                value={editMobileNumber}
                                onChange={(e) => setEditMobileNumber(e.target.value)}
                                className="w-full bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-color)] rounded-lg py-2 px-3 mb-3 focus:border-[var(--primary)] outline-none text-xs"
                            />

                            {/* <label className="text-[var(--text-muted)] text-[10px] block mb-1">Machine/Rent Type</label>
                            <input
                                type="text"
                                value={editMachineId}
                                onChange={(e) => setEditMachineId(e.target.value)}
                                className="w-full bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-color)] rounded-lg py-2 px-3 mb-3 focus:border-[var(--primary)] outline-none text-xs"
                            /> */}

                            <p className="text-[var(--text-muted)] text-xs mb-1">{t('totalPendingBalance')}</p>
                            <p className="text-red-500 text-lg font-bold mb-4">₹{selectedEntry.pendingAmount}</p>

                            <label className="text-[var(--text-muted)] text-xs mb-1 block">{t('enterPaymentAmount')}</label>
                            <div className="relative mb-6">
                                <span className="absolute left-3 top-2 text-[var(--text-muted)]">₹</span>
                                <input
                                    type="number"
                                    min={0}
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="w-full bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-color)] rounded-lg py-2 pl-7 pr-3 focus:border-[var(--primary)] outline-none"
                                    autoFocus
                                />
                            </div>

                            <button
                                onClick={handlePaymentSubmit}
                                className="w-full py-3 bg-green-500 text-[var(--text-main)] rounded-xl font-bold text-sm shadow-lg shadow-green-500/20 active:scale-95 transition-transform"
                            >
                                {t('submitButton') || "Confirm Payment"}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default PaymentTracking;