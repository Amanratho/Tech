import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./redux/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
    <ToastContainer position="top-right" autoClose={3000} />
      <App />
      
    </Provider>
  </StrictMode>
);

if ('serviceWorker' in navigator) {
  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/serviceWorker.js');
      console.log("Service Worker Registered with scope:", registration.scope);
    } catch (err) {
      console.error("Service Worker Registration Failed", err);
    }
  };
  registerServiceWorker();
}