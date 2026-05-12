import React from "react";
// import { Routes, Route, Outlet } from "react-router-dom";
// import Navbar from "../Navbar/Navbar";
import MyCarousel from "../Carousel/MyCarousel";
import Feature from "../Feature/Feature";
import Machinery from "../Machinery/Machinery";
// import StartEntery from "../StartEntery/StartEntery";
// import PaymentTracking from "../PaymentTracking/PaymentTracking";
import Footer from "../Footer/Footer";
// import Statement from "../Statement/Statement";
// import Tracker from "../Tracker/Tracker";

function Home() {
  
  return (
    <div>
      <MyCarousel />
    {/* <Tracker /> */}
     
         <Feature />
      <Machinery />
      <Footer/>
    </div>
  );
}

export default Home;