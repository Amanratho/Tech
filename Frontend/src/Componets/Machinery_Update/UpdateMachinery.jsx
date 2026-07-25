
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { toast } from "../../utils/toastService";
import { useTranslation } from "react-i18next";
import { FaPen, FaTrashAlt, FaArrowLeft, FaArchive } from "react-icons/fa";
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
        setMachines(response.data);
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
    <div className="bg-[var(--bg-main)] min-h-screen pb-20 relative overflow-hidden font-sans">

      {/* STICKY HEADER */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[var(--border-color)] mt-16 px-4 py-3 flex items-center justify-between">
        <button onClick={() => window.history.back()} className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-2 -ml-2 transition-colors">
          <FaArrowLeft size={14} />
        </button>
        <h2 className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest text-center mr-6">
          {t('deleteUpdateMachinesTitle') || "MANAGE MACHINERY"}
        </h2>
        <div></div> {/* Flex spacer */}
      </div>

      <div className="px-4 mt-4 max-w-md mx-auto space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full h-40 bg-white rounded-xl animate-pulse border border-[var(--border-color)]"></div>
            ))}
          </div>
        ) : machines.length === 0 ? (
          <div className="text-center text-[var(--text-muted)] mt-20 text-xs">
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
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl border border-[var(--border-color)] overflow-hidden shadow-lg relative group"
              >
                {/* Image Section */}
                <div className="relative h-40 w-full">
                  <img
                    className="h-full w-full object-cover opacity-80"
                    src={item.image || "https://via.placeholder.com/400x200"}
                    alt={item.Machine_name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent"></div>

                  {/* Top Left Badge: ID */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[9px] text-[var(--primary)] font-bold uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded border border-[var(--border-color)] backdrop-blur-sm shadow-md">
                      ID: {item.Machine_id}
                    </span>
                  </div>

                  {/* Bottom Info Title */}
                  <div className="absolute bottom-3 left-3 right-20">
                    <h3 className="text-[var(--text-main)] text-lg font-bold drop-shadow-md truncate">
                      {item.Machine_name}
                    </h3>
                  </div>

                  {/* Floating Action Buttons */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-[var(--primary)] text-[var(--primary)] flex items-center justify-center shadow-lg active:bg-[var(--primary)] active:text-black transition-all"
                    >
                      <FaPen size={12} />
                    </button>

                    <button
                      onClick={() => handleDeleteClick(item.Machine_id)}
                      className="w-9 h-9 rounded-full bg-orange-500/10 backdrop-blur-sm border border-orange-500/50 text-orange-500 flex items-center justify-center shadow-lg hover:bg-orange-500/20 active:bg-orange-500 active:text-[var(--text-main)] transition-all"
                      title={t('archiveMachineTitle') || "Archive / Mark as Sold"}
                    >
                      <FaArchive size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!machineToDelete}
        onCancel={() => setMachineToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        variant="danger"
        title={t('confirmMachineArchiveTitle') || "Archive Machine?"}
        message={t('archiveConfirmation') || "This will mark the machine as sold/archived. All historical income & expense data will be preserved for your P&L reports. You can still see this machine in the Maintenance section."}
        confirmText={t('archiveButton') || "Archive"}
        cancelText={t('cancelButton') || "Cancel"}
      />
    </div>
  );
};

export default MachineryUpdate;