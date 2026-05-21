import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.6' }}>
      <h1 style={{ borderBottom: '2px solid #2563eb', paddingBottom: '10px', color: '#2563eb' }}>Privacy Policy for RentVeda</h1>
      <p><strong>Effective Date:</strong> May 21, 2026</p>

      <h2>1. Introduction</h2>
      <p>
        Welcome to RentVeda. RentVeda (operated as a Sole Proprietorship by Aman Rathod) provides a digital platform for heavy machinery owners to track their daily rental operations, manage expenses, and accept online payments. We value your privacy and are committed to protecting your personal data.
      </p>

      <h2>2. Information We Collect</h2>
      <ul>
        <li><strong>Personal Information:</strong> We collect your mobile number for OTP-based login and account verification.</li>
        <li><strong>Business Information:</strong> We collect data related to your machinery, rental logs, expenses, and customer details that you input into the app to utilize our tracking features.</li>
        <li><strong>Payment Information:</strong> For processing transactions, we use secure third-party payment gateways (like PhonePe). We do not store your UPI PIN, credit/debit card numbers, or bank passwords on our servers.</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <ul>
        <li>To provide, maintain, and improve the RentVeda platform.</li>
        <li>To securely process your wallet recharges and platform convenience fees.</li>
        <li>To send you SMS/notifications related to your account, OTPs, or payment confirmations.</li>
      </ul>

      <h2>4. Data Sharing and Security</h2>
      <p>
        We do not sell or rent your personal data to third parties. Your data is only shared with trusted service providers (like payment gateways) strictly for processing transactions. We use industry-standard security measures to protect your data from unauthorized access.
      </p>

      <h2>5. Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us at:<br />
        <strong>Email:</strong> support@rentveda.com
      </p>
    </div>
  );
};

export default PrivacyPolicy;