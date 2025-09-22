import React, { useState } from "react";
import { useGetPaymentsQuery, useUpdatePaymentMutation } from "../../redux/functional/paymentApiSlice";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

const PaymentTracking = () => {
  const { t } = useTranslation();
  const uid = localStorage.getItem("uid");

  
  const { data: paymentData = [], error, isLoading, refetch } = useGetPaymentsQuery(uid, { skip: !uid });
  const [updatePayment] = useUpdatePaymentMutation();

  const [selectedUserEntries, setSelectedUserEntries] = useState([]);
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [filterType, setFilterType] = useState("pending");

  
  React.useEffect(() => {
    if (paymentData.length > 0) {
      const users = paymentData.reduce((acc, data) => {
        const existingUser = acc.find(user => user.mobileNumber === data.mobileNumber);
        if (existingUser) {
          existingUser.paidAmount += Number(data.paidAmount);
          existingUser.pendingAmount += Number(data.pendingAmount);
          existingUser.totalAmount += Number(data.totalAmount);
        } else {
          acc.push({ ...data });
        }
        return acc;
      }, []);

      setUniqueUsers(users);
    }
  }, [paymentData]);

  const handleViewSummary = (mobileNumber) => {
    const userEntries = paymentData.filter(data => String(data.mobileNumber) === String(mobileNumber));
    setSelectedUserEntries(userEntries);
    setIsSummaryVisible(true);
  };

  const handleHideSummary = () => {
    setIsSummaryVisible(false);
  };

  const handleMarkPaid = (entry) => {
    setSelectedEntry(entry);
    setPaymentAmount(entry.pendingAmount);
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
        }).unwrap();

        toast.success("Payment updated successfully!");
        setIsModalOpen(false);
        refetch(); 
      } catch (error) {
        console.error("Error updating payment:", error);
        toast.error("Error updating payment.");
      }
    } else {
      toast.error("Please enter a valid amount.");
    }
  };

 
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching payment data.</p>;

  
  const filteredUsers = uniqueUsers.filter(
    (user) =>
      (user.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.mobileNumber.toString().includes(searchQuery)) &&
      (filterType === "all" ||
        (filterType === "pending" && user.pendingAmount > 0) ||
        (filterType === "paid" && user.pendingAmount === 0))
  );



  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center py-4 mt-12 px-2">
      <h2 className="text-yellow-400 text-xl font-bold text-center py-2 px-4 rounded-lg mb-6">
      {t('paymentTrackingTitle')}
      </h2>

      
      <div className="mb-4 w-full flex flex-wrap items-center gap-3 max-w-6xl">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-1/2 p-2 border rounded-lg text-sm focus:ring-yellow-400 focus:border-yellow-400"
        />
        <div className="">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-2 border rounded-lg text-sm focus:ring-yellow-400 focus:border-yellow-400"
          >
            <option value="all"> {t('filterAll')}</option>
            <option value="pending"> {t('filterPending')}</option>
            <option value="paid"> {t('filterPaid')}</option>
          </select>
        </div>
      </div>

    
      <div
        className={`w-full max-w-6xl bg-white shadow-md rounded-lg mb-2 p-2 overflow-x-auto ${
          isSummaryVisible ? "blur-sm" : ""
        }`}
      >
        <table className="w-full table-auto">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="text-center font-bold">{t('customerNamept')}</th>
              <th className="text-center font-bold">{t('contactNumber')}</th>
              <th className="text-center font-bold">{t('pendingAmountpt')}</th>
              <th className="text-center font-bold">{t('paidAmountpt')}</th>
              <th className="text-center font-bold">{t('totalAmount')}</th>
              <th className="text-center font-bold">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr
                key={index}
                className={`border-b ${
                  index % 2 === 0 ? "bg-gray-100" : "bg-white"
                }`}
              >
                <td className="text-center py-2 text-sm">
                  {user.customerName}
                </td>
                <td className="text-center text-sm">
                  <a
                    href={`tel:${user.mobileNumber}`}
                    className="no-underline text-black"
                  >
                    {user.mobileNumber}
                  </a>
                </td>
                <td className="text-center text-sm text-red-500">
                  ₹ {user.pendingAmount}
                </td>
                <td className="text-center text-sm text-green-500">
                  ₹ {user.paidAmount}
                </td>
                <td className="text-center text-sm">₹ {user.totalAmount}</td>
                <td className="text-center text-sm">
                  <button
                    onClick={() => handleViewSummary(user.mobileNumber)}
                    className="bg-green-500 text-white font-semibold px-3 py-1 rounded text-xs sm:text-sm hover:bg-green-600"
                  >
                   {t('viewDetailsButton')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      
      {isSummaryVisible && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg p-6 overflow-hidden">
            <button
              onClick={handleHideSummary}
              className="bg-red-500 text-white px-4 py-1 rounded mb-4"
            >
              {t('hideSummaryButton')}
            </button>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full table-auto">
                <thead className="bg-yellow-400 text-gray-800">
                  <tr>
                    <th className="text-center font-bold">{t('no')}</th>
                    <th className="text-center font-bold">{t('customerName')}</th>
                    <th className="text-center font-bold">{t('date')}</th>
                    <th className="text-center font-bold">{t('pendingAmount')}</th>
                    <th className="text-center font-bold">{t('paidAmount')}</th>
                    <th className="text-center font-bold">{t('totalAmount')}</th>
                    <th className="text-center font-bold">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedUserEntries.length > 0 ? (
                    selectedUserEntries.map((entry, index) => (
                      <tr
                        key={entry._id}
                        className={`text-sm text-black hover:font-semibold hover:cursor-pointer transition duration-150 ${
                          index % 2 === 0 ? "bg-gray-300" : "bg-white"
                        }`}
                      >
                        <td className="text-center text-sm">{index + 1}</td>
                        <td className="text-center text-sm">
                          {entry.customerName}
                        </td>
                        <td className="text-center text-sm">
                          <a
                            
                            className="no-underline text-black"
                          >
                             {format(new Date(entry.createdAt), "dd-MM-yyyy")}
                          </a>
                        </td>
                        <td className="text-center text-sm text-red-600">
                          ₹ {entry.pendingAmount}
                        </td>
                        <td className="text-sm text-center text-green-600">
                          ₹ {entry.paidAmount}
                        </td>
                        <td className="text-sm text-center">
                          ₹ {entry.totalAmount}
                        </td>
                        <td className="py-1 text-sm text-center">
                          <button
                            onClick={() => handleMarkPaid(entry)}
                            className={`px-3 py-1 rounded text-xs sm:text-sm ${
                              entry.pendingAmount === 0
                                ? "bg-gray-400 text-white cursor-not-allowed"
                                : "bg-green-500 text-white hover:bg-green-600"
                            }`}
                            disabled={entry.pendingAmount === 0}
                          >
                           {entry.pendingAmount === 0 ? t('doneButton') : t('dueButton')}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-3 px-4 text-center">
                      {t('noPaymentData')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

 
      {isModalOpen && selectedEntry && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-gray-500 bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">
            {t('markPaymentTitle')} {selectedEntry.customerName}
            </h3>
            <input
              type="number"
              min={0}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              placeholder= {t('enterPaymentAmount')}
            />
            <div className="flex justify-between">
              <button
                onClick={handlePaymentSubmit}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                 {t('submitButton')}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                 {t('closeButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTracking;
