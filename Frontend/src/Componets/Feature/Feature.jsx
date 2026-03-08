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


import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { assets } from "../../assets/image/assest";
import { useTranslation } from "react-i18next";
import { FaPlus, FaFileInvoice, FaHistory, FaTools } from "react-icons/fa";

function Feature() {
  const { t } = useTranslation();

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    // Reduced padding (py-4) to remove extra space
    <div className="bg-[#121212] py-4">
      
      {/* 1. SECTION LABEL (Very Small & Clean) */}
      <div className="px-5 mb-2">
        <h2 className="text-gray-500 text-xs font-bold uppercase tracking-widest">
          {t('techDiaryFeatures') || "FEATURES"}
        </h2>
      </div>

      {/* 2. COMPACT GRID */}
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-2 gap-3 px-4"
      >
        
        <FeatureCard
          title={t('addMachinery')}
          bgImage={assets.AddMachinery}
          link="/add-machinery"
          icon={<FaPlus />}
          color="#FEC111"
          variants={item}
        />

        <FeatureCard
          title={t('paymentTracking')}
          bgImage={assets.PaymentTracking}
          link="/payment-tracking"
          icon={<FaFileInvoice />}
          color="#4ade80"
          variants={item}
        />

        <FeatureCard
          title={t('billsHistory')}
          bgImage={assets.BillHistory}
          link="/bill-history"
          icon={<FaHistory />}
          color="#60a5fa"
          variants={item}
        />

        <FeatureCard
          title={t('machineStatus')}
          bgImage={assets.MachineMaintenance}
          link="/machine-maintenance"
          icon={<FaTools />}
          color="#f97316"
          variants={item}
        />

      </motion.div>
    </div>
  );
}

// 3. CARD COMPONENT (Tight & Efficient)
function FeatureCard({ title, bgImage, link, icon, color, variants }) {
  return (
    <motion.div variants={variants}>
      <Link to={link} className="block relative group h-28 rounded-xl overflow-hidden active:scale-95 transition-transform duration-200 border border-[#222]">
        
        {/* Background Image */}
        <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bgImage})` }}
        />
        <div className="absolute inset-0 bg-black/70" /> {/* Stronger dark overlay for better text contrast */}

        {/* Content */}
        <div className="relative h-full p-3 flex flex-col justify-between">
            
            {/* Tiny Icon */}
            <div 
                className="w-7 h-7 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm text-xs border border-white/5"
                style={{ color: color }}
            >
                {icon}
            </div>

            {/* Title Text (Small) */}
            <h3 className="text-white text-xs font-semibold leading-tight">
                {title}
            </h3>
        </div>

      </Link>
    </motion.div>
  );
}

export default Feature;