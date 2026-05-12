// import React from "react";
// import { Link } from "react-router-dom";
// import { assets } from "../../assets/image/assest";
// import { useTranslation } from "react-i18next";

// function Feature() {
//   const { t } = useTranslation();
//   return (
//     <div className="bg-[#4C4C4D] text-[#F5F5F5] py-10">
//       <div className="text-center mb-10">
//         <h1 className="text-[#FEC111] text-base sm:text-xl md:text-3xl font-extrabold mb-6">
//           {t('techDiaryFeatures')}
//         </h1>
//       </div>

//       <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 container mx-auto px-6">
//         <FeatureCard
//           title={t('addMachinery')}
//           bgImage={assets.AddMachinery}
//           link="/add-machinery"
//           buttonText={t('addMachineButton')}
//         />
//         <FeatureCard
//           title={t('paymentTracking')}
//           bgImage={assets.PaymentTracking}
//           link="/payment-tracking"
//           buttonText={t('paymentTrackingButton')}
//         />
//         <FeatureCard
//           title={t('billsHistory')}
//           bgImage={assets.BillHistory}
//           link="/bill-history"
//           buttonText={t('billsHistoryButton')}
//         />
//         <FeatureCard
//           title={t('machineStatus')}
//           bgImage={assets.MachineMaintenance}
//           link="/machine-maintenance"
//           buttonText={t('machineStatusButton')}
//         />
//       </div>
//     </div>
//   );
// }

// function FeatureCard({ title, buttonText, bgImage, link }) {
//   return (
//     <div
//       className="relative bg-[#333333] rounded-lg shadow-lg overflow-hidden hover:scale-105 transition-transform duration-300"
//       style={{
//         backgroundImage: `url(${bgImage})`,
//         backgroundSize: 'cover',
//         backgroundPosition: 'center',
//       }}
//     >
//       <div className="absolute inset-0 bg-[#333333] bg-opacity-50"></div>
//       <div className="relative p-6 flex flex-col h-full justify-between">
//         <h3 className="text-[#FEC111] text-base sm:text-lg md:text-xl font-bold mb-2">
//           {title}
//         </h3>
//         <Link
//           to={link}
//           className="bg-[#F8981D] no-underline text-black px-3 py-1 sm:px-4 sm:py-2 rounded hover:bg-[#D9781A] self-start transition-colors duration-300"
//         >
//           <button className="w-full">{buttonText}</button>
//         </Link>
//       </div>
//     </div>
//   );
// }

// export default Feature;


// import React from "react";
// import { Link } from "react-router-dom";
// import { motion } from "framer-motion";
// import { assets } from "../../assets/image/assest";
// import { useTranslation } from "react-i18next";
// import { FaPlus, FaFileInvoice, FaHistory, FaTools } from "react-icons/fa";

// function Feature() {
//   const { t } = useTranslation();

//   const container = {
//     hidden: { opacity: 0 },
//     show: { opacity: 1, transition: { staggerChildren: 0.1 } }
//   };

//   const item = {
//     hidden: { opacity: 0, y: 10 },
//     show: { opacity: 1, y: 0 }
//   };

//   return (
//     // Reduced padding (py-4) to remove extra space
//     <div className="bg-[#121212] py-4">
      
//       {/* 1. SECTION LABEL (Very Small & Clean) */}
//       <div className="px-5 mb-2">
//         <h2 className="text-gray-500 text-xs font-bold uppercase tracking-widest">
//           {t('techDiaryFeatures') || "FEATURES"}
//         </h2>
//       </div>

//       {/* 2. COMPACT GRID */}
//       <motion.div 
//         variants={container}
//         initial="hidden"
//         whileInView="show"
//         viewport={{ once: true }}
//         className="grid grid-cols-2 gap-3 px-4"
//       >
        
//         <FeatureCard
//           title={t('addMachinery')}
//           bgImage={assets.AddMachinery}
//           link="/add-machinery"
//           icon={<FaPlus />}
//           color="#FEC111"
//           variants={item}
//         />

//         <FeatureCard
//           title={t('paymentTracking')}
//           bgImage={assets.PaymentTracking}
//           link="/payment-tracking"
//           icon={<FaFileInvoice />}
//           color="#4ade80"
//           variants={item}
//         />

//         <FeatureCard
//           title={t('billsHistory')}
//           bgImage={assets.BillHistory}
//           link="/bill-history"
//           icon={<FaHistory />}
//           color="#60a5fa"
//           variants={item}
//         />

//         <FeatureCard
//           title={t('machineStatus')}
//           bgImage={assets.MachineMaintenance}
//           link="/machine-maintenance"
//           icon={<FaTools />}
//           color="#f97316"
//           variants={item}
//         />

//       </motion.div>
//     </div>
//   );
// }

// // 3. CARD COMPONENT (Tight & Efficient)
// function FeatureCard({ title, bgImage, link, icon, color, variants }) {
//   return (
//     <motion.div variants={variants}>
//       <Link to={link} className="block relative group h-28 rounded-xl overflow-hidden active:scale-95 transition-transform duration-200 border border-[#222]">
        
//         {/* Background Image */}
//         <div 
//             className="absolute inset-0 bg-cover bg-center"
//             style={{ backgroundImage: `url(${bgImage})` }}
//         />
//         <div className="absolute inset-0 bg-black/70" /> {/* Stronger dark overlay for better text contrast */}

//         {/* Content */}
//         <div className="relative h-full p-3 flex flex-col justify-between">
            
//             {/* Tiny Icon */}
//             <div 
//                 className="w-7 h-7 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm text-xs border border-white/5"
//                 style={{ color: color }}
//             >
//                 {icon}
//             </div>

//             {/* Title Text (Small) */}
//             <h3 className="text-white text-xs font-semibold leading-tight">
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
    <div className="bg-[#121212] py-2">
      <Tracker />
      
      {/* 1. SECTION LABEL (Updated to RentVeda) */}
      <div className="px-5 mb-3">
        <h2 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
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
      {/* no-underline aur focus:no-underline zaroori hai blue line hatane ke liye.
      */}
      <Link 
        to={link} 
        className="block relative group rounded-2xl bg-gradient-to-br from-[#1E1E1E] to-[#161616] border border-[#2C2C2C] overflow-hidden active:scale-95 transition-all duration-300 shadow-lg no-underline hover:no-underline focus:no-underline text-white"
      >
        
        {/* Background Subtle Glow based on feature color */}
        <div 
          className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity duration-300" 
          style={{ backgroundColor: color }}
        ></div>

        {/* Background Image (Made very subtle to add texture, not an ugly box) */}
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-10 grayscale mix-blend-overlay group-hover:opacity-20 transition-all duration-300"
            style={{ backgroundImage: `url(${bgImage})` }}
        />

        {/* Content */}
        <div className="relative p-4 flex flex-col h-full min-h-[110px]">
            
            {/* Sleek Icon Box */}
            <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#121212] border border-[#333] shadow-inner mb-3"
                style={{ color: color }}
            >
                <span className="text-lg">{icon}</span>
            </div>

            {/* Title Text (Clean, Bold, No Underline) */}
            <h3 className="text-white text-sm font-bold leading-tight m-0 p-0 tracking-wide">
                {title}
            </h3>
        </div>

      </Link>
    </motion.div>
  );
}

export default Feature;