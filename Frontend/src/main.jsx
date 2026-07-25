import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./redux/store";
import GlobalAlert from "./Componets/ConfirmModal/GlobalAlert";
import { I18nextProvider } from 'react-i18next';

import i18n from './i18n';

import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <GlobalAlert />
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
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