import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "../Machinery/Machinary.css";
import { useTranslation } from "react-i18next";


const MachineryUpdate = () => {
  const { t } = useTranslation(); 
  const [machines, setMachines] = useState([]);
  const navigate = useNavigate();
  const [machineryName, setMachineryName] = useState("");
  const [rentType, setRentType] = useState("");
  const [machineryImg, setMachineryImg] = useState("");

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const uid = localStorage.getItem("uid");
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/machines`,
          { uid }
        );
        console.log("client data :", response);

        setMachines(response.data);
      } catch (error) {
        console.log("Error fetching machine data:", error);
        
      }
    };

    fetchMachines();
  }, []);

  const handleEditClick = (item) => {
   
    navigate(`/Machinery-Update/edit-machine/${item.Machine_id}`);
  };

  const handleDeleteClick = (Machine_id) => {
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-2">
  <p className="text-gray-800 font-medium">
    {t('deleteConfirmation')}
  </p>
  <div className="flex justify-end gap-4">
    <button
      className="bg-gray-300 text-gray-800 px-4 py-1 rounded hover:bg-gray-400"
      onClick={() => {
        toast.info(t('cancelToastMessage'));
        closeToast();
      }}
    >
      {t('cancelButton')}
    </button>
    <button
      className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
      onClick={async () => {
        try {
          const response = await axios.delete(
            `${import.meta.env.VITE_BACKEND_URL}/api/machine/machines/${Machine_id}`
          );
          if (response.status === 200) {
            setMachines((machines) =>
              machines.filter(
                (machine) => machine.Machine_id !== Machine_id
              )
            );
            toast.success(t('deleteSuccessToast'));
          }
        } catch (error) {
          console.log("Error deleting machine:", error);
          toast.error(t('deleteErrorToast'));
        }
        closeToast();
      }}
    >
      {t('deleteButton')}
    </button>
  </div>
</div>

      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        hideProgressBar: true,
      }
    );
  };
  



  return (
    <div className="bg-[#4C4C4D] py-12 px-1 mt-10">
  <h2
    className="text-center text-[#FEC111] 
      text-lg sm:text-xl md:text-3xl 
      font-extrabold mb-6"
  >
    {t('deleteUpdateMachinesTitle')}
  </h2>

  <div className="overflow-x-auto overflow-auto scrollbar-none">
    <div className="flex space-x-4 py-4">
      {machines.map((item) => (
        <motion.div
          key={item.Machine_id}
          className="flex-shrink-0 bg-[#333333] text-[#F5F5F5] rounded-lg shadow-lg"
          style={{ width: "14rem" }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <img
            className="h-36 w-full object-cover rounded-t-lg"
            src={item.image}
            alt={`Machine ${item.Machine_id}`}
          />
          <div className="p-4">
            <h5 className="text-sm font-semibold text-[#FEC111] flex justify-center items-start">
              {item.Machine_name}
            </h5>
            <div className="flex justify-between">
              <button
                onClick={() => handleEditClick(item)}
                className="w-1/2 bg-[#F8981D] text-black py-1 rounded-md font-semibold hover:bg-[#D9781A] transition-all"
              >
                {t('editButton')}
              </button>
              <button
                onClick={() => handleDeleteClick(item.Machine_id)}
                className="w-1/3 bg-red-600 text-black py-1 rounded-md font-semibold hover:bg-red-700 transition-all"
              >
                {t('deleteButton')}
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
</div>

  );
};

export default MachineryUpdate;
