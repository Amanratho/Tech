

// import React from "react";
// import { Link } from "react-router-dom";
// import { motion } from "framer-motion";
// import { assets } from "../../assets/image/assest";
// import { useTranslation } from "react-i18next";
// import { FaPlus, FaFileInvoice, FaHistory, FaTools } from "react-icons/fa";
// import Tracker from "../Tracker/Tracker";

// function Feature() {
//   const { t } = useTranslation();

//   const container = {
//     hidden: { opacity: 0 },
//     show: { opacity: 1, transition: { staggerChildren: 0.1 } }
//   };

//   const item = {
//     hidden: { opacity: 0, y: 15 },
//     show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
//   };

//   return (
//     <div className="bg-[var(--bg-main)] py-2">
//       <Tracker />
      
//       {/* 1. SECTION LABEL (Updated to RentVeda) */}
//       <div className="px-5 mb-3">
//         <h2 className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest">
//           {t('techDiaryFeatures') || "RENTVEDA FEATURES"}
//         </h2>
//       </div>

//       {/* 2. COMPACT PREMIUM GRID */}
//       <motion.div 
//         variants={container}
//         initial="hidden"
//         whileInView="show"
//         viewport={{ once: true }}
//         className="grid grid-cols-2 gap-3 px-4"
//       >
        
//         <FeatureCard
//           title={t('addMachinery') || "Add Machinery"}
//           bgImage={assets.AddMachinery}
//           link="/add-machinery"
//           icon={<FaPlus />}
//           color="#FEC111" // Primary Yellow
//           variants={item}
//         />

//         <FeatureCard
//           title={t('paymentTracking') || "Payment Tracking"}
//           bgImage={assets.PaymentTracking}
//           link="/payment-tracking"
//           icon={<FaFileInvoice />}
//           color="#4ade80" // Green
//           variants={item}
//         />

//         <FeatureCard
//           title={t('billsHistory') || "Bills History"}
//           bgImage={assets.BillHistory}
//           link="/bill-history"
//           icon={<FaHistory />}
//           color="#60a5fa" // Blue
//           variants={item}
//         />

//         <FeatureCard
//           title={t('machineStatus') || "Machine Status"}
//           bgImage={assets.MachineMaintenance}
//           link="/machine-maintenance"
//           icon={<FaTools />}
//           color="#f97316" // Orange
//           variants={item}
//         />

//       </motion.div>
//     </div>
//   );
// }

// // 3. PREMIUM CARD COMPONENT (No Blue Lines, No Boxy Feel)
// function FeatureCard({ title, bgImage, link, icon, color, variants }) {
//   return (
//     <motion.div variants={variants}>
//       {/* no-underline aur focus:no-underline zaroori hai blue line hatane ke liye.
//       */}
//       <Link 
//         to={link} 
//         className="block relative group rounded-2xl bg-gradient-to-br from-[#1E1E1E] to-[#161616] border border-[var(--border-color)] overflow-hidden active:scale-95 transition-all duration-300 shadow-lg no-underline hover:no-underline focus:no-underline text-[var(--text-main)]"
//       >
        
//         {/* Background Subtle Glow based on feature color */}
//         <div 
//           className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity duration-300" 
//           style={{ backgroundColor: color }}
//         ></div>

//         {/* Background Image (Made very subtle to add texture, not an ugly box) */}
//         <div 
//             className="absolute inset-0 bg-cover bg-center opacity-10 grayscale mix-blend-overlay group-hover:opacity-20 transition-all duration-300"
//             style={{ backgroundImage: `url(${bgImage})` }}
//         />

//         {/* Content */}
//         <div className="relative p-4 flex flex-col h-full min-h-[110px]">
            
//             {/* Sleek Icon Box */}
//             <div 
//                 className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--bg-main)] border border-[var(--border-color)] shadow-inner mb-3"
//                 style={{ color: color }}
//             >
//                 <span className="text-lg">{icon}</span>
//             </div>

//             {/* Title Text (Clean, Bold, No Underline) */}
//             <h3 className="text-[var(--text-main)] text-sm font-bold leading-tight m-0 p-0 tracking-wide">
//                 {title}
//             </h3>
//         </div>

//       </Link>
//     </motion.div>
//   );
// }

// export default Feature;

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { assets } from "../../assets/image/assest";
import { useTranslation } from "react-i18next";
import { FaPlus, FaFileInvoice, FaHistory, FaTools } from "react-icons/fa";
import Tracker from "../Tracker/Tracker";

function Feature() {
  const { t } = useTranslation();

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    // 🔥 FIX: Yahan maine 'pb-24' (Padding Bottom) add kar diya hai. 
    // Isse bottom navigation bar ke liye ekdum mast space ban jayegi aur overlap nahi hoga.
    <div className="bg-[var(--bg-main)] pt-2 pb-24">
      <Tracker />
      
      {/* 1. SECTION LABEL (Updated to RentVeda) */}
      <div className="px-5 mb-3 mt-2">
        <h2 className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest">
          {t('techDiaryFeatures') || "RENTVEDA FEATURES"}
        </h2>
      </div>

      {/* 2. COMPACT PREMIUM GRID */}
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-2 gap-3 px-4"
      >
        
        <FeatureCard
          title={t('addMachinery') || "Add Machinery"}
          bgImage={assets.AddMachinery}
          link="/add-machinery"
          icon={<FaPlus />}
          color="#FEC111" // Primary Yellow
          variants={item}
        />

        <FeatureCard
          title={t('paymentTracking') || "Payment Tracking"}
          bgImage={assets.PaymentTracking}
          link="/payment-tracking"
          icon={<FaFileInvoice />}
          color="#4ade80" // Green
          variants={item}
        />

        <FeatureCard
          title={t('billsHistory') || "Bills History"}
          bgImage={assets.BillHistory}
          link="/bill-history"
          icon={<FaHistory />}
          color="#60a5fa" // Blue
          variants={item}
        />

        <FeatureCard
          title={t('machineStatus') || "Machine Status"}
          bgImage={assets.MachineMaintenance}
          link="/machine-maintenance"
          icon={<FaTools />}
          color="#f97316" // Orange
          variants={item}
        />

      </motion.div>
    </div>
  );
}

// 3. PREMIUM CARD COMPONENT (No Blue Lines, No Boxy Feel)
function FeatureCard({ title, bgImage, link, icon, color, variants }) {
  return (
    <motion.div variants={variants}>
      <Link 
        to={link} 
        className="block relative group rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-[var(--border-color)] overflow-hidden active:scale-95 transition-all duration-300 shadow-[var(--shadow-card)] no-underline hover:no-underline focus:no-underline text-[var(--text-main)]"
      >
        
        {/* Background Subtle Glow based on feature color */}
        <div 
          className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity duration-300" 
          style={{ backgroundColor: color }}
        ></div>

        {/* Background Image */}
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-10 grayscale mix-blend-overlay group-hover:opacity-20 transition-all duration-300"
            style={{ backgroundImage: `url(${bgImage})` }}
        />

        {/* Content */}
        <div className="relative p-4 flex flex-col h-full min-h-[110px]">
            
            {/* Sleek Icon Box */}
            <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--bg-main)] border border-[var(--border-color)] shadow-inner mb-3"
                style={{ color: color }}
            >
                <span className="text-lg">{icon}</span>
            </div>

            {/* Title Text */}
            <h3 className="text-[var(--text-main)] text-sm font-bold leading-tight m-0 p-0 tracking-wide">
                {title}
            </h3>
        </div>

      </Link>
    </motion.div>
  );
}

export default Feature;