import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { toast } from "../../utils/toastService";
import { useTranslation } from "react-i18next";
import { FaPen, FaTractor, FaArchive, FaPlus } from "react-icons/fa";
import ConfirmModal from "../ConfirmModal/ConfirmModal";

const MachineryUpdate = () => {
  const { t } = useTranslation();
  const [machines, setMachines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [machineToDelete, setMachineToDelete] = useState(null); // holds Machine_id
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        setIsLoading(true);
        const uid = localStorage.getItem("uid");
        const response = await axios.post(
          `${API_BASE_URL}/api/machines`,
          { uid }
        );
        setMachines(response.data || []);
      } catch (error) {
        console.error("Error fetching machine data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMachines();
  }, []);

  const handleEditClick = (item) => {
    navigate(`/Machinery-Update/edit-machine/${item.Machine_id}`);
  };

  // Opens the confirm modal
  const handleDeleteClick = (Machine_id) => {
    setMachineToDelete(Machine_id);
  };

  // Called when user confirms archiving in the modal
  const confirmDelete = async () => {
    if (!machineToDelete) return;
    setIsDeleting(true);
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/machine/machines/${machineToDelete}`
      );
      if (response.status === 200) {
        setMachines((prev) => prev.filter((m) => m.Machine_id !== machineToDelete));
        toast.success(t('archiveSuccessToast') || "Machine archived successfully! Historical data preserved.", { theme: "light" });
      }
    } catch (error) {
      console.error("Error archiving machine:", error);
      toast.error(t('archiveErrorToast') || "Failed to archive machine", { theme: "light" });
    } finally {
      setIsDeleting(false);
      setMachineToDelete(null);
    }
  };

  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] min-h-screen pt-16 pb-28 font-body-md relative">
      <main className="max-w-2xl mx-auto px-4 mt-4 space-y-4">
        {/* Header Action Row */}
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-[#1a1c1c] text-base font-bold tracking-tight">
              {t("manageMachinery") || "Manage Machines"}
            </h2>
            <p className="text-[#4f4633] text-[10px] font-semibold mt-0.5">
              {machines.length} registered machines
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/add-machinery")}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#fbc02d] text-[#6c5000] rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-transform cursor-pointer"
          >
            <FaPlus size={11} />
            <span>{t("addMachine") || "Add New"}</span>
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full h-36 bg-white rounded-2xl animate-pulse border border-[#e2e2e2]"></div>
            ))}
          </div>
        ) : machines.length === 0 ? (
          <div className="bg-white border border-[#e2e2e2] rounded-2xl p-12 text-center text-[#4f4633] text-xs font-semibold">
            No machines found. Register a new machine first.
          </div>
        ) : (
          <AnimatePresence>
            {machines.map((item, index) => (
              <motion.div
                key={item.Machine_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.04 }}
                className="bg-white rounded-2xl border border-[#e2e2e2] overflow-hidden shadow-sm hover:shadow-md transition-shadow relative group"
              >
                {/* Image Section */}
                <div className="relative h-44 w-full bg-gray-100">
                  {item.image ? (
                    <img
                      className="h-full w-full object-cover"
                      src={item.image}
                      alt={item.Machine_name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[#4f4633]/30">
                      <FaTractor size={48} />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                  {/* Pricing Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-extrabold text-[#6c5000] bg-[#fbc02d] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      {item.RentType || "Rate"}
                    </span>
                  </div>

                  {/* Machine Name */}
                  <div className="absolute bottom-3 left-3 right-28">
                    <h3 className="text-white text-base font-extrabold drop-shadow-sm truncate">
                      {item.Machine_name}
                    </h3>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditClick(item)}
                      className="w-9 h-9 rounded-xl bg-white hover:bg-gray-100 text-[#1a1c1c] flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer"
                      title="Edit Machine"
                    >
                      <FaPen size={12} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteClick(item.Machine_id)}
                      className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-[#dc2626] border border-red-200 flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer"
                      title={t('archiveMachineTitle') || "Archive Machine"}
                    >
                      <FaArchive size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </main>

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!machineToDelete}
        onCancel={() => setMachineToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        variant="danger"
        title={t('confirmMachineArchiveTitle') || "Archive Machine?"}
        message={t('archiveConfirmation') || "This will mark the machine as sold/archived. All historical income & expense data will be preserved for your reports."}
        confirmText={t('archiveButton') || "Archive"}
        cancelText={t('cancelButton') || "Cancel"}
      />
    </div>
  );
};

export default MachineryUpdate;