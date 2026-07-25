import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

/**
 * Opens the phone dialer with the given number.
 * Works on both web and Capacitor native.
 */
export const openPhoneDialer = (phoneNumber) => {
  const cleanNumber = phoneNumber.replace(/[^\d+]/g, "");
  if (Capacitor.isNativePlatform()) {
    // Capacitor's WebView delegates tel: intents to the OS dialer
    window.open(`tel:${cleanNumber}`, "_system");
  } else {
    window.location.href = `tel:${cleanNumber}`;
  }
};

/**
 * Opens a WhatsApp chat with the given phone number and pre-filled message.
 * Uses @capacitor/browser to escape the WebView and open in the real browser,
 * which then deep-links into the WhatsApp app.
 *
 * @param {string} phoneNumber — 10-digit Indian mobile number (without country code)
 * @param {string} message — Pre-filled message text
 */
export const openWhatsApp = async (phoneNumber, message = "") => {
  const cleanNumber = phoneNumber.replace(/[^\d]/g, "");
  const url = `https://api.whatsapp.com/send?phone=91${cleanNumber}&text=${encodeURIComponent(message)}`;

  if (Capacitor.isNativePlatform()) {
    // Opens in an external browser / Chrome Custom Tab
    // which then deep-links into WhatsApp app automatically
    await Browser.open({ url });
  } else {
    window.location.href = url;
  }
};

/**
 * Opens any external URL safely (escapes the WebView).
 * Use for social media links, external websites, etc.
 *
 * @param {string} url — Full URL to open
 */
export const openExternalUrl = async (url) => {
  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url });
  } else {
    window.open(url, "_blank");
  }
};
