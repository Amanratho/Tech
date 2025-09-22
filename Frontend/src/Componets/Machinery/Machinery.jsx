import React, { useState, useEffect } from "react";
import { useGetMachinesQuery } from "../../redux/functional/machineApiSlice";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Machinary.css";
import { useTranslation } from "react-i18next";

function Machinery() {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const uid = localStorage.getItem("uid");


  const {
    data: machines = [],
    error,
    isLoading,
    refetch,
  } = useGetMachinesQuery(uid, {
    skip: !uid,
    keepUnusedDataFor: 1000,
  });

  const handleButtonClick = (machine) => {
    navigate("/start-entry", {
      state: {
        rentType: machine.RentType,
        machineId: machine.Machine_id,
        machineName: machine.Machine_name,
      },
    });
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching machine data</p>;

  return (
    <div className="bg-[#4C4C4D] px-3 py-2">
      <h2
        className="text-center text-[#FEC111] 
          text-lg sm:text-xl md:text-3xl 
          font-extrabold mb-6"
      >
        {t("exploreMachines")}
      </h2>

      <div className="overflow-x-auto overflow-auto scrollbar-none">
        <div className="flex space-x-4 px-1 py-4">
          {(machines.length > 0
            ? machines
            : [
                {
                  _id: "dummy",
                  Machine_name: t("addYourMachine"),
                  image: "/placeholder.jpg",
                },
              ]
          ).map((item) => (
            <motion.div
              key={item._id}
              className="flex-shrink-0 bg-[#333333] text-[#F5F5F5] rounded-lg shadow-lg"
              style={{ width: "14rem" }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <img
                className="h-36 w-full object-cover rounded-t-lg"
                src={item.image}
                alt={`Machine ${item._id}`}
              />
              <div className="p-4">
                <h5 className="text-sm font-semibold text-[#FEC111] flex justify-center items-start">
                  {item.Machine_name}
                </h5>
                {item._id === "dummy" ? (
                  <button
                    onClick={() => (window.location.href = "/add-machinery")}
                    className="w-full bg-[#F8981D] text-[#4C4C4D] py-1 rounded-md font-semibold hover:bg-[#D9781A] transition-all"
                  >
                    {t("addMachine")}
                  </button>
                ) : (
                  <button
                    onClick={() => handleButtonClick(item)}
                    className="w-full bg-[#F8981D] text-[#4C4C4D] py-1 rounded-md font-semibold hover:bg-[#D9781A] transition-all"
                  >
                    {t("newEntry")}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Machinery;
