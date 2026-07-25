import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlay, FaPause, FaCheck, FaHistory, FaPlus, FaMinus, FaMapMarkerAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const Tracker = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("TIME"); 
  const [timerStatus, setTimerStatus] = useState("IDLE"); 
  
  // States
  const [time, setTime] = useState(0);
  const [count, setCount] = useState(0);
  const [distance, setDistance] = useState(0); 
  const [startTime, setStartTime] = useState(null);

  // 🔥 FIX 1: GPS Coords ko useRef me daala taaki re-render pe GPS na tute
  const lastCoordsRef = useRef(null);
  
  useEffect(() => {
    const savedStatus = localStorage.getItem("rentveda_timer_status");
    const savedStartTime = localStorage.getItem("rentveda_startTime");
    const savedPausedTime = localStorage.getItem("rentveda_pausedTime");
    const savedCount = localStorage.getItem("rentveda_count");
    const savedDistance = localStorage.getItem("rentveda_distance"); 
    const savedTab = localStorage.getItem("rentveda_activeTab");

    if (savedTab) setActiveTab(savedTab);
    if (savedCount) setCount(Number(savedCount));
    if (savedDistance) setDistance(Number(savedDistance));

    if (savedStatus === "RUNNING" && savedStartTime) {
      setTimerStatus("RUNNING");
      setStartTime(Number(savedStartTime));
      const elapsed = Math.floor((Date.now() - Number(savedStartTime)) / 1000);
      setTime(elapsed > 0 ? elapsed : 0);
    } else if (savedStatus === "PAUSED" && savedPausedTime) {
      setTimerStatus("PAUSED");
      setTime(Number(savedPausedTime));
    }
  }, []);
 
  // TIMER INTERVAL
  useEffect(() => {
    let interval;
    if (timerStatus === "RUNNING" && startTime) {
      interval = setInterval(() => {
        setTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerStatus, startTime]);

  // Haversine Formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  };

  // 🔥 FIX 2: Stable GPS Tracking Logic
  useEffect(() => {
    let watchId;
    if (timerStatus === "RUNNING" && activeTab === "DISTANCE") {
      if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            
            // Ignore inaccurate signals (greater than 50 meters off)
            if (accuracy > 50) return;

            const prevCoords = lastCoordsRef.current;
            if (prevCoords) {
              const dist = calculateDistance(prevCoords.lat, prevCoords.lon, latitude, longitude);
              // Avoid fake jumps (ignore if jump is too big in 1 second)
              if (dist > 0.001 && dist < 2) { 
                setDistance((prev) => prev + dist);
              }
            }
            lastCoordsRef.current = { lat: latitude, lon: longitude };
          },
          (error) => {
            // Error Code 1 is Permission Denied. Code 3 is Timeout (we ignore timeout loops now)
            if (error.code === 1) {
               toast.error("Please give Location Permission!", { theme: "light", toastId: "gps_err" });
            }
          },
          // Optimized for driving tracking
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
      }
    } else if (timerStatus === "IDLE") {
      lastCoordsRef.current = null; // Clear coords when stopped
    }
    
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [timerStatus, activeTab]); 
  
  useEffect(() => { localStorage.setItem("rentveda_count", count.toString()); }, [count]);
  useEffect(() => { localStorage.setItem("rentveda_distance", distance.toString()); }, [distance]);
  useEffect(() => { localStorage.setItem("rentveda_activeTab", activeTab); }, [activeTab]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
 
  const handleStart = () => {
    const now = Date.now();
    const calculatedStartTime = timerStatus === "PAUSED" ? now - (time * 1000) : now;
    
    setStartTime(calculatedStartTime);
    setTimerStatus("RUNNING");
    
    localStorage.setItem("rentveda_timer_status", "RUNNING");
    localStorage.setItem("rentveda_startTime", calculatedStartTime.toString());

    if (activeTab === "DISTANCE") {
      toast.info("GPS Tracking Started 🛰️", { toastId: "gps_start" });
    }
  };

  const handlePause = () => {
    setTimerStatus("PAUSED");
    localStorage.setItem("rentveda_timer_status", "PAUSED");
    localStorage.setItem("rentveda_pausedTime", time.toString());
  };

  const handleDoneTime = () => {
    localStorage.setItem("rentveda_pending_time_entry", time.toString()); 
    setTimerStatus("IDLE");
    setTime(0);
    setStartTime(null);
    localStorage.removeItem("rentveda_timer_status");
    localStorage.removeItem("rentveda_startTime");
    localStorage.removeItem("rentveda_pausedTime");
    toast.success(t('timeSavedSuccess', 'Time saved! Will auto-fill in next bill.'));
  };

  const handleIncrement = () => setCount(prev => prev + 1);
  const handleDecrement = () => setCount(prev => (prev > 0 ? prev - 1 : 0));
  
  const handleDoneCount = () => {
    localStorage.setItem("rentveda_pending_count_entry", count.toString());
    setCount(0);
    localStorage.removeItem("rentveda_count");
    toast.success(t('countSavedSuccess', 'Count saved! Will auto-fill in next bill.'));
  };

  const handleDoneDistance = () => {
    const finalKM = distance.toFixed(2);
    localStorage.setItem("rentveda_pending_km_entry", finalKM); // Exact key
    setTimerStatus("IDLE");
    setDistance(0);
    lastCoordsRef.current = null;
    localStorage.removeItem("rentveda_distance");
    toast.success(`${finalKM} KM saved! Will auto-fill in next bill.`);
  };

  return (
    <div className="px-4 mb-6 bg-transparent w-full">
      <div className="bg-white rounded-2xl p-4 border border-[var(--border-color)] shadow-[var(--shadow-card)] relative overflow-hidden">
        
        <div className="absolute right-0 top-0 w-24 h-24 bg-[var(--primary)]/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex bg-[var(--bg-input)] p-1 rounded-lg border border-[var(--border-color)]">
            <button onClick={() => timerStatus === "IDLE" && setActiveTab("TIME")} className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${activeTab === 'TIME' ? 'bg-[var(--primary)] text-[var(--text-on-primary)] shadow-sm' : 'text-[var(--text-muted)]'}`}>
              {t('time', 'TIME')}
            </button>
            <button onClick={() => timerStatus === "IDLE" && setActiveTab("COUNT")} className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${activeTab === 'COUNT' ? 'bg-[var(--primary)] text-[var(--text-on-primary)] shadow-sm' : 'text-[var(--text-muted)]'}`}>
              {t('count', 'COUNT')}
            </button>
            <button onClick={() => timerStatus === "IDLE" && setActiveTab("DISTANCE")} className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${activeTab === 'DISTANCE' ? 'bg-[var(--primary)] text-[var(--text-on-primary)] shadow-sm' : 'text-[var(--text-muted)]'}`}>
              KM
            </button>
          </div>
          
          <button className="w-8 h-8 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] active:scale-95 transition-all">
            <FaHistory size={12} />
          </button>
        </div>

        <div className="min-h-[90px] flex flex-col justify-center items-center">
          <AnimatePresence mode="wait">
            
            {/* TIME UI */}
            {activeTab === "TIME" && (
              <motion.div key="timer" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-center w-full">
                <div className="text-4xl font-black text-[var(--text-main)] tracking-widest mb-1 font-mono">{formatTime(time)}</div>
                <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest">{t('liveSession', 'LIVE SESSION')}</p>
                <div className="flex gap-2 mt-4 w-full">
                  {timerStatus === "IDLE" && (
                    <button onClick={handleStart} className="flex-1 bg-[var(--text-main)] text-white py-3 rounded-xl font-bold text-xs uppercase flex justify-center items-center gap-2 active:scale-95 transition-all"><FaPlay size={10} /> {t('startTracker', 'START')}</button>
                  )}
                  {timerStatus === "RUNNING" && (
                    <button onClick={handlePause} className="flex-1 bg-amber-50 text-amber-600 border border-amber-200 py-3 rounded-xl font-bold text-xs uppercase flex justify-center items-center gap-2 active:scale-95 transition-all"><FaPause size={10} /> {t('pause', 'PAUSE')}</button>
                  )}
                  {timerStatus === "PAUSED" && (
                    <button onClick={handleStart} className="flex-1 bg-[var(--primary)] text-[var(--text-on-primary)] py-3 rounded-xl font-bold text-xs uppercase flex justify-center items-center gap-2 active:scale-95 transition-all"><FaPlay size={10} /> {t('resume', 'RESUME')}</button>
                  )}
                  {(timerStatus === "RUNNING" || timerStatus === "PAUSED") && (
                     <button onClick={handleDoneTime} className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold text-xs uppercase flex justify-center items-center gap-2 active:scale-95 transition-all shadow-lg shadow-green-500/20"><FaCheck size={10} /> {t('doneAndSave', 'DONE')}</button>
                  )}
                </div>
              </motion.div>
            )}

            {/* COUNT UI */}
            {activeTab === "COUNT" && (
              <motion.div key="counter" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="w-full flex flex-col items-center">
                <div className="flex items-center justify-center gap-6 mb-2">
                  <button onClick={handleDecrement} className="w-12 h-12 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-full text-[var(--text-main)] flex items-center justify-center active:scale-90 transition-all hover:border-[var(--primary)]"><FaMinus size={14} /></button>
                  <div className="text-5xl font-black text-[var(--primary)] w-20 text-center">{count}</div>
                  <button onClick={handleIncrement} className="w-12 h-12 bg-[var(--primary)] text-[var(--text-on-primary)] rounded-full flex items-center justify-center active:scale-90 transition-all shadow-lg shadow-[var(--primary)]/20"><FaPlus size={14} /></button>
                </div>
                <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest">{t('manualCount', 'MANUAL COUNT')}</p>
                <button onClick={handleDoneCount} disabled={count === 0} className={`w-full mt-4 py-3 rounded-xl font-bold text-xs uppercase flex justify-center items-center gap-2 transition-all ${count > 0 ? "bg-green-500 text-white shadow-lg shadow-green-500/20 active:scale-95" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}><FaCheck size={10} /> {t('saveCount', 'SAVE COUNT')}</button>
              </motion.div>
            )}

            {/* DISTANCE (KM) UI */}
            {activeTab === "DISTANCE" && (
              <motion.div key="distance" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="w-full flex flex-col items-center">
                <div className="flex items-center justify-center gap-3 mb-1">
                  <FaMapMarkerAlt className={timerStatus === "RUNNING" ? "text-red-500 animate-pulse" : "text-[var(--text-muted)]"} size={22} />
                  <div className="text-5xl font-black text-[var(--text-main)] font-mono">{distance.toFixed(2)}</div>
                  <span className="text-xl font-bold text-[var(--primary)] mt-3">KM</span>
                </div>
                <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-1">Live GPS Tracking</p>
                <div className="flex gap-2 mt-4 w-full">
                  {timerStatus === "IDLE" && (
                    <button onClick={handleStart} className="flex-1 bg-[var(--text-main)] text-white py-3 rounded-xl font-bold text-xs uppercase flex justify-center items-center gap-2 active:scale-95 transition-all"><FaPlay size={10} /> START DRIVE</button>
                  )}
                  {timerStatus === "RUNNING" && (
                    <button onClick={handlePause} className="flex-1 bg-amber-50 text-amber-600 border border-amber-200 py-3 rounded-xl font-bold text-xs uppercase flex justify-center items-center gap-2 active:scale-95 transition-all"><FaPause size={10} /> PAUSE</button>
                  )}
                  {timerStatus === "PAUSED" && (
                    <button onClick={handleStart} className="flex-1 bg-[var(--primary)] text-[var(--text-on-primary)] py-3 rounded-xl font-bold text-xs uppercase flex justify-center items-center gap-2 active:scale-95 transition-all"><FaPlay size={10} /> RESUME</button>
                  )}
                  {(timerStatus === "RUNNING" || timerStatus === "PAUSED") && (
                     <button onClick={handleDoneDistance} className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold text-xs uppercase flex justify-center items-center gap-2 active:scale-95 transition-all shadow-lg shadow-green-500/20"><FaCheck size={10} /> DONE</button>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Tracker;