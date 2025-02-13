import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "../Machinery/Machinary.css";


const MachineryUpdate = () => {
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
          "http://localhost:3000/api/machines",
          { uid }
        );
        console.log("client data :", response);

        setMachines(response.data);
      } catch (error) {
        console.log("Error fetching machine data:", error);
        toast.error("Error fetching machine data.");
      }
    };

    fetchMachines();
  }, []);

  const handleEditClick = (item) => {
    // Redirect to edit page or open a modal with existing details
    navigate(`/Machinery-Update/edit-machine/${item.Machine_id}`);
  };

  const handleDeleteClick = (Machine_id) => {
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-2">
          <p className="text-gray-800 font-medium">
            Are you sure you want to delete this machine?
          </p>
          <div className="flex justify-end gap-4">
            <button
              className="bg-gray-300 text-gray-800 px-4 py-1 rounded hover:bg-gray-400"
              onClick={() => {
                toast.info("Deletion cancelled");
                closeToast();
              }}
            >
              Cancel
            </button>
            <button
              className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
              onClick={async () => {
                try {
                  const response = await axios.delete(
                    `http://localhost:3000/api/machine/machines/${Machine_id}`
                  );
                  if (response.status === 200) {
                    setMachines((machines) =>
                      machines.filter(
                        (machine) => machine.Machine_id !== Machine_id
                      )
                    );
                    toast.success("Machine deleted successfully!");
                  }
                } catch (error) {
                  console.log("Error deleting machine:", error);
                  toast.error("Error deleting machine.");
                }
                closeToast();
              }}
            >
              Delete
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
  
  // const handleDeleteConfirmed = async (Machine_id) => {
  //   try {
  //     const response = await axios.delete(
  //       `http://localhost:3000/api/machine/machines/${Machine_id}`
  //     );
  //     if (response.status === 200) {
  //       setMachines(
  //         machines.filter((machine) => machine.Machine_id !== Machine_id)
  //       );
  //       toast.success("Machine deleted successfully!");
  //     }
  //   } catch (error) {
  //     console.log("Error deleting machine:", error);
  //     toast.error("Error deleting machine.");
  //   }
  // };


  return (
    <div className="bg-[#4C4C4D] py-12 px-1 mt-10">
      <h2
        className="text-center text-[#FEC111] 
          text-lg sm:text-xl md:text-3xl 
          font-extrabold mb-6"
      >
        Delete and Update Machines
      </h2>

      <div className="overflow-x-auto overflow-auto scrollbar-none">
        <div className="flex space-x-4 py-4">
          {machines.map((item) => (
            <motion.div
              key={item.Machine_id}
              className="flex-shrink-0 bg-[#333333] text-[#F5F5F5] rounded-lg shadow-lg"
              style={{ width: "14rem" }} // Adjusted width for better responsiveness
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <img
                className="h-36 w-full object-cover rounded-t-lg" // Adjusted height for better responsiveness
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
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item.Machine_id)}
                    className="w-1/3 bg-red-600 text-black py-1 rounded-md font-semibold hover:bg-red-700 transition-all"
                  >
                    Delete
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
