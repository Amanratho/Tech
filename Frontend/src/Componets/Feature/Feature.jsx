import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../../assets/image/assest";
import { useTranslation } from "react-i18next";

function Feature() {
  const { t } = useTranslation();
  return (
    <div className="bg-[#4C4C4D] text-[#F5F5F5] py-10">
      <div className="text-center mb-10">
        <h1 className="text-[#FEC111] text-base sm:text-xl md:text-3xl font-extrabold mb-6">
          {t('techDiaryFeatures')}
        </h1>
      </div>

      <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 container mx-auto px-6">
        <FeatureCard
          title={t('addMachinery')}
          bgImage={assets.AddMachinery}
          link="/add-machinery"
          buttonText={t('addMachineButton')}
        />
        <FeatureCard
          title={t('paymentTracking')}
          bgImage={assets.PaymentTracking}
          link="/payment-tracking"
          buttonText={t('paymentTrackingButton')}
        />
        <FeatureCard
          title={t('billsHistory')}
          bgImage={assets.BillHistory}
          link="/bill-history"
          buttonText={t('billsHistoryButton')}
        />
        <FeatureCard
          title={t('machineStatus')}
          bgImage={assets.MachineMaintenance}
          link="/machine-maintenance"
          buttonText={t('machineStatusButton')}
        />
      </div>
    </div>
  );
}

function FeatureCard({ title, buttonText, bgImage, link }) {
  return (
    <div
      className="relative bg-[#333333] rounded-lg shadow-lg overflow-hidden hover:scale-105 transition-transform duration-300"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-[#333333] bg-opacity-50"></div>
      <div className="relative p-6 flex flex-col h-full justify-between">
        <h3 className="text-[#FEC111] text-base sm:text-lg md:text-xl font-bold mb-2">
          {title}
        </h3>
        <Link
          to={link}
          className="bg-[#F8981D] no-underline text-black px-3 py-1 sm:px-4 sm:py-2 rounded hover:bg-[#D9781A] self-start transition-colors duration-300"
        >
          <button className="w-full">{buttonText}</button>
        </Link>
      </div>
    </div>
  );
}

export default Feature;
