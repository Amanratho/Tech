import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslation } from 'react-i18next';


const StartEntry = () => {
  const { t } = useTranslation();
  // console.log(t('addNewEntry'))

  const navigate = useNavigate();
  const location = useLocation();
  const { rentType, machineId, machineName } = location.state || {};

  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [total, setTotal] = useState(null);
  const [paidAmount, setPaidAmount] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [jobWork, setJobWork] = useState("");

  // UseEffect to calculate based on rentType
  useEffect(() => {
    if (rentType && price && quantity) {
      handleCalculate();
    }
  }, [rentType, price, quantity]);

  const handleCalculate = () => {
    const priceVal = Number(price) || 0;
    const quantityVal = Number(quantity) || 0;

    if (priceVal <= 0 || quantityVal <= 0) {
      toast.warn("Price and quantity must be greater than 0.");
      return;
    }

    let calculatedTotal = 0;

    switch (rentType) {
      case "Acre":
      case "Quantity":
      case "Days":
      case "Contract":
      case "Kilometers":
      case "Foot":
        calculatedTotal = priceVal * quantityVal;
        break;
      case "Hour":
        const hours = Math.floor(quantityVal);
        const minutes = (quantityVal - hours) * 100;
        const totalHours = hours + minutes / 60;
        calculatedTotal = priceVal * totalHours;
        break;
      default:
        return;
    }

    // Set total with 2 decimal places
    const finalTotal = parseFloat(calculatedTotal.toFixed(2));

    setTotal(finalTotal);
    setPendingAmount(finalTotal);
    setPaidAmount(0);
  };

  const handlePaidAmountChange = (e) => {
    const paid = Number(e.target.value) || 0;
    const validPaidAmount = Math.min(paid, total);
    setPaidAmount(validPaidAmount);
    setPendingAmount(total - validPaidAmount);
  };

  const handlePendingAmountChange = (e) => {
    const pending = Number(e.target.value) || 0;
    const validPendingAmount = Math.min(pending, total);
    setPendingAmount(validPendingAmount);
    setPaidAmount(total - validPendingAmount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || !mobileNumber || !price || !quantity) {
      toast.error("Please fill all required fields.");
      return;
    }

    const token = localStorage.getItem("token");
    const uid = localStorage.getItem("uid");

    const entryData = {
      customerName,
      mobileNumber,
      address,
      operatorName,
      price: Number(price),
      quantity: Number(quantity),
      paidAmount: Number(paidAmount),
      pendingAmount: Number(pendingAmount),
      rentType: rentType,
      uid: uid,
      machineId: machineId,
      jobWork,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/rentals/add-entry`,
        entryData
      );
      toast.success("Entry added successfully!");
      navigate("/invoice", { state: { entryData, machineName } });
      resetForm();
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
      toast.error("Error: " + (error.response?.data?.message || error.message));
    }
  };

  const resetForm = () => {
    setCustomerName("");
    setMobileNumber("");
    setAddress("");
    setOperatorName("");
    setJobWork("");
    setPrice("");
    setQuantity("");
    setTotal(null);
    setPaidAmount(0);
    setPendingAmount(null);
  };

  const handleMobileNumberChange = async (e) => {
    const mobile = e.target.value;
    setMobileNumber(mobile);

    if (mobile.length === 10) {
      // Mobile number complete hone par fetch karega
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/rentals/customer/${mobile}`
        );
        if (response.data) {
          setCustomerName(response.data.customerName);
          setAddress(response.data.address);
        } else {
          setCustomerName(""); // Agar customer nahi mila to blank
          setAddress("");
        }
      } catch (error) {
        setCustomerName("");
        setAddress("");
      }
    }
  };


  return (
    <div className="bg-[#4C4C4D] min-h-screen flex flex-col my-12 items-center py-10 px-4">
      <h1 className="text-3xl font-bold text-[#F5F5F5] mb-8"> {t('addNewEntry')}</h1>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#333333] shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
           {t('rentalDetails')}
          </h2>
          <form className="space-y-4">
            <div>
              <label
                htmlFor="Number"
                className="block text-sm ps-2 font-medium text-white"
              >
                {t('mobileNumber')}
              </label>
              <input
                type="tel"
                id="Number"
                placeholder={t('enterMobileNumber')}
                maxLength={10}
                pattern="\d{10}"
                required
                value={mobileNumber}
                onChange={handleMobileNumberChange} // 🆕 Update ho gaya
                className="mt-1 block w-full border border-[#4C4C4D] rounded-md shadow-sm p-1 focus:ring-[#FEC111] focus:border-[#FEC111]"
              />
            </div>
            <div>
              <label
                htmlFor="CustomerName"
                className="block text-sm ps-2 font-medium text-white"
              >
                {t('customerName')}
              </label>
              <input
                type="text"
                id="CustomerName"
                placeholder={t('enterCustomerName')}
                required
                value={customerName} // 🆕 Auto-fill ke liye value set ki
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-1 block w-full border border-[#4C4C4D] rounded-md shadow-sm p-1 focus:ring-[#FEC111] focus:border-[#FEC111]"
              />
            </div>

            <div>
              <label
                htmlFor="Address"
                className="block text-sm ps-2 font-medium text-white"
              >
                {t('customerAddress')}
              </label>
              <input
                type="text"
                id="Address"
                placeholder={t('clientAddress')}
                value={address} // 🆕 Auto-fill ke liye value set ki
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 block w-full border border-[#4C4C4D] rounded-md shadow-sm p-1 focus:ring-[#FEC111] focus:border-[#FEC111]"
              />
            </div>

            <div>
              <label
                htmlFor="OperatorName"
                className="block text-sm ps-2 font-medium text-white"
              >
                {t('operatorName')}
              </label>
              <input
                type="text"
                id="OperatorName"
                placeholder={t('enterOperatorName')}
                required
                onChange={(e) => setOperatorName(e.target.value)}
                className="mt-1 block w-full border border-[#4C4C4D] rounded-md shadow-sm p-1  focus:ring-[#FEC111] focus:border-[#FEC111]"
              />
            </div>
            <div>
              <label
                htmlFor="jobWork"
                className="block text-sm ps-2 font-medium text-white "
              >
                {t('jobWork')}
              </label>
              <input
                type="text"
                id="jobWork"
                placeholder={t('enterJobWork')}
                required
                onChange={(e) => setJobWork(e.target.value)}
                className="mt-1 block w-full border border-[#4C4C4D] rounded-md shadow-sm p-1  focus:ring-[#FEC111] focus:border-[#FEC111]"
              />
            </div>
          </form>
        </div>

        <div className="w-full max-w-6xl space-y-6">
          <div className="bg-[#FEC111] text-[#4C4C4D] shadow-md rounded-lg p-1">
            <h2 className="text-lg font-bold mb-2">{t('rentalCalculator')}</h2>
            <div className="Calculate bg-[#333333] rounded-lg pb-2">
              <label
                htmlFor="price"
                className="block text-sm font-medium text-[#FEC111] p-2"
              >
               {t('rentPrice')}
              </label>
              <input
                type="number"
                id="Price"
                placeholder="0"
                min={0}
                required
                className="w-1/2 block mx-1 ps-1 border border-[#4C4C4D] rounded-md shadow-sm focus:ring-[#FEC111] focus:border-[#FEC111]"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-[#FEC111] p-2"
              >
               {rentType} 
                {t('enterRentType')} 
              </label>
              <input
                type="number"
                id="Quantity"
                min={1}
                placeholder={`Enter ${rentType}`}
                required
                className="w-1/2 block ml-1 border border-[#4C4C4D] rounded-md shadow-sm ps-1 focus:ring-[#FEC111] focus:border-[#FEC111]"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            {/* <button
              type="button"
              className="w-full bg-[#4C4C4D] text-[#FEC111] font-bold p-1 mt-2 rounded-md shadow hover:bg-[#D9781A] focus:outline-none focus:ring-2 focus:ring-[#FEC111]"
              onClick={handleCalculate}
            >
              Calculate
            </button> */}
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 text-[#4C4C4D]">
            {total !== null ? (
              <div className="font-bold text-[#4C4C4D]">
                <p className="text-[20px] font-semibold">{t('total')} ₹ {total}</p>
                <div className="flex gap-4 mt-4">
                  <div>
                    <label
                      htmlFor="pending_amount"
                      className="block text-red-600 font-semibold"
                    >
                     {t('pendingAmount')}
                    </label>
                    <input
                      type="number"
                      id="pending_amount"
                      min="0"
                      placeholder="₹"
                      value={pendingAmount || ""}
                      onChange={handlePendingAmountChange}
                      required
                      className="w-full border border-[#4C4C4D] rounded-md shadow-sm focus:ring-[#FEC111] focus:border-[#FEC111]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="pay"
                      className="block text-green-600 font-semibold"
                    >
                      {t('paidAmount')}
                    </label>
                    <input
                      type="number"
                      id="pay"
                      min="0"
                      placeholder="₹"
                      value={paidAmount || ""}
                      onChange={handlePaidAmountChange}
                      required
                      className="w-full border border-[#4C4C4D] rounded-md shadow-sm focus:ring-[#FEC111] focus:border-[#FEC111]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="font-bold text-[#4C4C4D]">
                {t('total')} ₹{total}
                <div className="flex gap-4 mt-4">
                  <div>
                    <label
                      htmlFor="pending_amount"
                      className="block text-red-600 font-semibold"
                    >
                      {t('pendingAmount')}
                    </label>
                    <input
                      type="number"
                      id="pending_amount"
                      min="0"
                      placeholder="₹"
                      value={pendingAmount || ""}
                      onChange={handlePendingAmountChange}
                      required
                      className="w-full border border-[#4C4C4D] rounded-md shadow-sm focus:ring-[#FEC111] focus:border-[#FEC111]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="pay"
                      className="block text-green-600 font-semibold"
                    >
                     {t('paidAmount')}
                    </label>
                    <input
                      type="number"
                      id="pay"
                      min="0"
                      placeholder="₹"
                      value={paidAmount || ""}
                      onChange={handlePaidAmountChange}
                      required
                      className="w-full border border-[#4C4C4D] rounded-md shadow-sm focus:ring-[#FEC111] focus:border-[#FEC111]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4">
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full bg-[#FEC111] text-[#4C4C4D] font-bold py-2 rounded-md shadow hover:bg-[#D9781A] focus:outline-none focus:ring-2 focus:ring-[#FEC111]"
            >
             {t('submitEntry')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartEntry;
